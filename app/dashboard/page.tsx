"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { TrendingUp, LogOut, Zap, Flame, Plus, Minus } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import {
  runEngine,
  DEFAULT_ENGINE_PARAMS,
  DEFAULT_IMPACT_PROFILES,
  type CharityImpactProfile,
  type EngineParams,
  type EngineResult,
} from "@/lib/compoundingEngine";
import { KCLogo } from "@/components/KCLogo";
import { TealButton, Card, PageShell } from "@/components/ui/shared";

const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const AreaChart = dynamic(
  () => import("recharts").then((m) => m.AreaChart),
  { ssr: false }
);
const Area = dynamic(
  () => import("recharts").then((m) => m.Area),
  { ssr: false }
);
const LineChart = dynamic(
  () => import("recharts").then((m) => m.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import("recharts").then((m) => m.Line),
  { ssr: false }
);
const XAxis = dynamic(
  () => import("recharts").then((m) => m.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import("recharts").then((m) => m.YAxis),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("recharts").then((m) => m.Tooltip),
  { ssr: false }
);

export default function DashboardPage() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [whatIfExtra, setWhatIfExtra] = useState(0);
  const [whatIfOpen, setWhatIfOpen] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserEmail(user.email || "");

    const { data: portfolios } = await supabase
      .from("portfolios")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1);

    if (portfolios && portfolios.length > 0) {
      setPortfolio(portfolios[0]);

      const { data: allocs } = await supabase
        .from("portfolio_allocations")
        .select("id, allocation_pct, charities(id, name, url, geo)")
        .eq("portfolio_id", portfolios[0].id);

      if (allocs) {
        setAllocations(allocs as any);
      }
    }

    setLoading(false);
  };

  // Build charity profiles for the engine
  const charityProfiles: CharityImpactProfile[] = useMemo(
    () =>
      allocations.map((a: any) => {
        const name = a.charities?.name || "Unknown";
        const defaults = DEFAULT_IMPACT_PROFILES[name];
        return {
          charity_id: a.charities?.id || a.id,
          name,
          allocation_pct: a.allocation_pct,
          impact_per_pound: defaults?.impact_per_pound || 0.1,
          impact_unit: defaults?.impact_unit || "impact units",
        };
      }),
    [allocations]
  );

  // Run the engine — current amount
  const engineResult: EngineResult | null = useMemo(() => {
    if (!portfolio || charityProfiles.length === 0) return null;
    const params: EngineParams = {
      ...DEFAULT_ENGINE_PARAMS,
      monthly_amount: Number(portfolio.monthly_amount),
      duration_months: 120,
    };
    return runEngine(params, charityProfiles);
  }, [portfolio, charityProfiles]);

  // Run the engine — "what if" amount
  const whatIfResult: EngineResult | null = useMemo(() => {
    if (!portfolio || charityProfiles.length === 0 || whatIfExtra === 0)
      return null;
    const params: EngineParams = {
      ...DEFAULT_ENGINE_PARAMS,
      monthly_amount: Number(portfolio.monthly_amount) + whatIfExtra,
      duration_months: 120,
    };
    return runEngine(params, charityProfiles);
  }, [portfolio, charityProfiles, whatIfExtra]);

  // "What if" comparison chart — yearly impact
  const whatIfChartData = useMemo(() => {
    if (!engineResult) return [];
    return engineResult.yearly_summaries.map((ys, i) => {
      const row: any = {
        year: `Yr ${ys.year}`,
        current: Math.round(ys.impact),
      };
      if (whatIfResult) {
        row.whatIf = Math.round(whatIfResult.yearly_summaries[i]?.impact || 0);
      }
      return row;
    });
  }, [engineResult, whatIfResult]);

  // Impact deltas per charity
  const impactDeltas = useMemo(() => {
    if (!engineResult || !whatIfResult) return [];
    return engineResult.charity_totals
      .map((ct) => {
        const whatIfTotal =
          whatIfResult.charity_totals.find(
            (w) => w.charity_id === ct.charity_id
          )?.total_impact || 0;
        return {
          ...ct,
          delta: whatIfTotal - ct.total_impact,
          whatIfTotal,
        };
      })
      .sort((a, b) => b.delta - a.delta);
  }, [engineResult, whatIfResult]);

  // Sparkline: first 12 months cumulative impact
  const sparkData = useMemo(() => {
    if (!engineResult) return [];
    return engineResult.months
      .filter((m) => m.month <= 12)
      .map((m) => ({
        month: m.month,
        value: Math.round(m.cumulative_impact * 100) / 100,
      }));
  }, [engineResult]);

  // Months since portfolio creation
  const monthsSinceCreation = useMemo(() => {
    if (!portfolio) return 0;
    const created = new Date(portfolio.created_at);
    const now = new Date();
    return (
      (now.getFullYear() - created.getFullYear()) * 12 +
      (now.getMonth() - created.getMonth()) +
      1
    );
  }, [portfolio]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleNewCurve = () => {
    router.push("/onboarding/q1");
  };

  const adjustWhatIf = useCallback(
    (delta: number) => {
      setWhatIfExtra((prev) => Math.max(0, prev + delta));
    },
    []
  );

  if (loading) {
    return (
      <PageShell>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400 dark:text-gray-500">
            Loading your dashboard…
          </p>
        </div>
      </PageShell>
    );
  }

  if (!portfolio) {
    return (
      <PageShell>
        <div className="min-h-screen flex flex-col items-center justify-center text-center">
          <KCLogo size={60} className="mb-6" />
          <h1 className="text-xl font-semibold mb-3">No portfolio yet</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Create your first Kind Curve to see your dashboard.
          </p>
          <TealButton onClick={handleNewCurve}>
            Build your Kind Curve
          </TealButton>
        </div>
      </PageShell>
    );
  }

  const monthlyAmount = Number(portfolio.monthly_amount);
  const currentIEM = engineResult
    ? engineResult.months[
        Math.min(monthsSinceCreation, engineResult.months.length) - 1
      ]?.iem || 0
    : 0;
  const fiveYearIEM = engineResult?.yearly_summaries[4]?.iem || 0;

  return (
    <PageShell>
      <div className="flex items-center justify-between pt-3 pb-1">
        <KCLogo size={36} />
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>

      <h1 className="text-2xl font-bold mt-4 mb-1">Your impact dashboard</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
        {userEmail}
      </p>

      {/* Key stats grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="!p-5 !bg-gradient-to-br !from-kc-teal/[0.08] !to-kc-cyan/[0.04] dark:!from-kc-teal/20 dark:!to-kc-cyan/10 !border-kc-teal/[0.15] dark:!border-kc-teal/30">
            <div className="text-[28px] font-bold text-kc-teal dark:text-kc-cyan">
              £{monthlyAmount}
            </div>
            <div className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
              Monthly commitment
            </div>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="!p-5">
            <div className="text-[28px] font-bold">{allocations.length}</div>
            <div className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
              Charities
            </div>
          </Card>
        </motion.div>

        {/* IEM */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="!p-5 !border-kc-purple/20 dark:!border-kc-purple/30">
            <div className="flex items-center gap-1.5">
              <Zap size={16} className="text-kc-purple" />
              <div className="text-[28px] font-bold text-kc-purple">
                {currentIEM > 0 ? `${currentIEM.toFixed(2)}×` : "—"}
              </div>
            </div>
            <div className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
              Impact per £1
            </div>
          </Card>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="!p-5 !border-kc-coral/20 dark:!border-kc-coral/30">
            <div className="flex items-center gap-1.5">
              <Flame size={16} className="text-kc-coral" />
              <div className="text-[28px] font-bold text-kc-coral">
                {monthsSinceCreation}
              </div>
            </div>
            <div className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
              Month streak
            </div>
          </Card>
        </motion.div>
      </div>

      {/* IEM explanation */}
      {currentIEM > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="mb-4 !p-4 !bg-kc-purple/[0.04] dark:!bg-kc-purple/10 !border-kc-purple/10 dark:!border-kc-purple/20">
            <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">
              For every <span className="font-semibold">£1</span> you give
              consistently, your Kind Curve generates{" "}
              <span className="font-bold text-kc-purple">
                £{currentIEM.toFixed(2)}
              </span>{" "}
              of impact. By year 5, that&apos;s projected to reach{" "}
              <span className="font-semibold text-kc-purple">
                £{fiveYearIEM.toFixed(2)}
              </span>
              .
            </p>
          </Card>
        </motion.div>
      )}

      {/* Your Kind Curve sparkline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="mb-4 !p-5">
          <div className="flex justify-between items-center mb-2.5">
            <h3 className="text-[15px] font-semibold">Your Kind Curve</h3>
            <TrendingUp size={18} className="text-kc-green" />
          </div>
          {sparkData.length > 0 && (
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={sparkData}>
                <defs>
                  <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop
                      offset="100%"
                      stopColor="#22d3ee"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fill="url(#sparkGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            £{(monthlyAmount * 12).toFixed(0)} projected in year 1 · £
            {engineResult
              ? Math.round(engineResult.total_donated).toLocaleString()
              : (monthlyAmount * 120).toFixed(0)}{" "}
            over 10 years
          </p>
        </Card>
      </motion.div>

      {/* ============================================================ */}
      {/* "WHAT IF" SLIDER                                             */}
      {/* ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <Card className="mb-4 !p-5 !border-kc-green/20 dark:!border-kc-green/30">
          <button
            onClick={() => {
              setWhatIfOpen(!whatIfOpen);
              if (!whatIfOpen && whatIfExtra === 0) setWhatIfExtra(5);
            }}
            className="w-full flex justify-between items-center"
          >
            <h3 className="text-[15px] font-semibold">
              What if you gave a little more?
            </h3>
            <span className="text-kc-green text-sm font-medium">
              {whatIfOpen ? "Close" : "Explore"}
            </span>
          </button>

          {whatIfOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.25 }}
              className="mt-4"
            >
              {/* Amount control */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  onClick={() => adjustWhatIf(-5)}
                  disabled={whatIfExtra <= 0}
                  className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30"
                >
                  <Minus size={16} />
                </button>
                <div className="text-center min-w-[120px]">
                  <div className="text-[13px] text-gray-400 dark:text-gray-500">
                    Extra per month
                  </div>
                  <div className="text-[32px] font-bold text-kc-green leading-tight">
                    +£{whatIfExtra}
                  </div>
                  <div className="text-[13px] text-gray-400 dark:text-gray-500">
                    £{monthlyAmount + whatIfExtra}/month total
                  </div>
                </div>
                <button
                  onClick={() => adjustWhatIf(5)}
                  className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={whatIfExtra}
                onChange={(e) => setWhatIfExtra(Number(e.target.value))}
                className="w-full mb-4"
              />

              {/* Comparison chart */}
              {whatIfExtra > 0 && whatIfChartData.length > 0 && (
                <>
                  <div className="flex gap-4 mb-2">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-kc-cyan inline-block" />
                      Current (£{monthlyAmount}/mo)
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-kc-green inline-block" />
                      +£{whatIfExtra} (£{monthlyAmount + whatIfExtra}/mo)
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={whatIfChartData}>
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        stroke="#9ca3af"
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        stroke="#9ca3af"
                        width={40}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          fontSize: 12,
                          backgroundColor: "rgba(255,255,255,0.95)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="current"
                        stroke="#22d3ee"
                        strokeWidth={2}
                        dot={false}
                        name={`£${monthlyAmount}/mo`}
                      />
                      <Line
                        type="monotone"
                        dataKey="whatIf"
                        stroke="#4BB78F"
                        strokeWidth={2.5}
                        dot={false}
                        name={`£${monthlyAmount + whatIfExtra}/mo`}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  {/* Concrete deltas per charity */}
                  {impactDeltas.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#f0ebe0] dark:border-kc-border">
                      <p className="text-[13px] font-semibold mb-2.5 text-kc-green">
                        +£{whatIfExtra}/month would add over 10 years:
                      </p>
                      <div className="space-y-1.5">
                        {impactDeltas
                          .filter((d) => d.delta > 0)
                          .slice(0, 4)
                          .map((d) => (
                            <div
                              key={d.charity_id}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-gray-500 dark:text-gray-400 truncate mr-3">
                                {d.name}
                              </span>
                              <span className="font-semibold text-kc-green whitespace-nowrap">
                                +{Math.round(d.delta)} {d.impact_unit}
                              </span>
                            </div>
                          ))}
                      </div>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2.5">
                        That&apos;s £{(whatIfExtra * 12).toFixed(0)} more per
                        year — about £{(whatIfExtra / 4.33).toFixed(2)} per
                        week.
                      </p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* Concrete impact counters */}
      {engineResult && engineResult.charity_totals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="mb-4 !p-5">
            <h3 className="text-[15px] font-semibold mb-3">
              Projected impact (10 years)
            </h3>
            <div className="space-y-2">
              {engineResult.charity_totals
                .sort((a, b) => b.total_impact - a.total_impact)
                .map((ct) => (
                  <div
                    key={ct.charity_id}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate mr-3">
                      {ct.name}
                    </span>
                    <span className="text-sm font-semibold text-kc-teal dark:text-kc-cyan whitespace-nowrap">
                      ~{Math.round(ct.total_impact)} {ct.impact_unit}
                    </span>
                  </div>
                ))}
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3 border-t border-[#f0ebe0] dark:border-kc-border pt-2">
              Estimates based on published charity data. Not a guarantee of
              outcomes.
            </p>
          </Card>
        </motion.div>
      )}

      {/* Charities list */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
      >
        <Card className="mb-4">
          <h3 className="text-[15px] font-semibold mb-3.5">Your charities</h3>
          {allocations.map((a: any, i: number) => (
            <div
              key={a.id}
              className={`flex items-center justify-between py-2.5 ${
                i < allocations.length - 1
                  ? "border-b border-[#f0ebe0] dark:border-kc-border"
                  : ""
              }`}
            >
              <div>
                <p className="text-sm font-medium">
                  {a.charities?.name || "Unknown"}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {a.allocation_pct}% · £
                  {((a.allocation_pct / 100) * monthlyAmount).toFixed(2)}/month
                </p>
              </div>
              {a.charities?.url && (
                <a
                  href={a.charities.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-kc-teal dark:text-kc-cyan hover:underline"
                >
                  Visit
                </a>
              )}
            </div>
          ))}
        </Card>
      </motion.div>

      {/* Stability bonus explainer */}
      {monthsSinceCreation > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="mb-4 !p-4">
            <div className="flex items-start gap-3">
              <Flame
                size={20}
                className="text-kc-coral mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="text-[13px] font-semibold mb-1">
                  Your {monthsSinceCreation}-month streak
                </p>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Charities operate more efficiently with predictable income.
                  Your streak means your donations are estimated to generate{" "}
                  <span className="font-semibold text-kc-coral">
                    {Math.round(
                      DEFAULT_ENGINE_PARAMS.stability_bonus_per_month *
                        Math.max(0, monthsSinceCreation - 1) *
                        100
                    )}
                    %
                  </span>{" "}
                  more impact than equivalent one-off gifts.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <TealButton onClick={handleNewCurve} className="mb-4">
        Build a new Kind Curve
      </TealButton>
    </PageShell>
  );
}
