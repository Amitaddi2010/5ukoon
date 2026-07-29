import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { AttendanceRequest } from "@workspace/api-client-react";
import { Users, Building2, CheckCircle2, Clock, HelpCircle, AlertCircle } from "lucide-react";

interface AnalyticsChartsProps {
  requests: AttendanceRequest[];
}

const COLORS = [
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#64748b", // Slate
];

const POSSIBILTY_COLORS: Record<string, string> = {
  "Definitely (100%)": "#10b981", // Emerald
  "Likely (75%)": "#f59e0b", // Amber
  "50-50 / Unsure": "#3b82f6", // Blue
  "Unlikely": "#ef4444", // Red
};

export function AnalyticsCharts({ requests }: AnalyticsChartsProps) {
  // Department Breakdown Data
  const departmentData = useMemo(() => {
    const counts: Record<string, number> = {};
    requests.forEach((r) => {
      const dept = r.department || "Unspecified";
      counts[dept] = (counts[dept] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [requests]);

  // Attendance Possibility Breakdown Data
  const possibilityData = useMemo(() => {
    const counts: Record<string, number> = {};
    requests.forEach((r) => {
      const pos = r.attendancePossibility || "Unspecified";
      counts[pos] = (counts[pos] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [requests]);

  // Status Breakdown Metrics
  const statusSummary = useMemo(() => {
    const total = requests.length;
    const approved = requests.filter((r) => r.status === "approved").length;
    const pending = requests.filter((r) => r.status === "pending").length;
    const waitlisted = requests.filter((r) => r.status === "waitlisted").length;
    const declined = requests.filter((r) => r.status === "declined").length;
    const definitelyAttending = requests.filter(
      (r) => r.attendancePossibility === "Definitely (100%)"
    ).length;

    return { total, approved, pending, waitlisted, declined, definitelyAttending };
  }, [requests]);

  if (!requests || requests.length === 0) {
    return (
      <div className="p-12 text-center border border-white/10 rounded-2xl bg-zinc-950/50">
        <p className="text-white/40 text-[14px]">No registration data available yet to display analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/40 text-[11px] uppercase tracking-wider font-medium">
            <span>Total Registrations</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-white mt-3">{statusSummary.total}</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/40 text-[11px] uppercase tracking-wider font-medium">
            <span>Definitely Attending</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-emerald-400 mt-3">{statusSummary.definitelyAttending}</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/40 text-[11px] uppercase tracking-wider font-medium">
            <span>Departments Represented</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-400 mt-3">{departmentData.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/40 text-[11px] uppercase tracking-wider font-medium">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-300" />
          </div>
          <p className="text-3xl font-bold text-amber-300 mt-3">{statusSummary.pending}</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Demographics Bar Chart */}
        <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10 space-y-4">
          <div>
            <h3 className="text-lg font-serif text-white">Department Demographics</h3>
            <p className="text-[12px] text-white/40 font-light">
              Registration count grouped by PGIMER department
            </p>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#ffffff40" tick={{ fill: "#ffffff60", fontSize: 11 }} />
                <YAxis dataKey="name" type="category" stroke="#ffffff40" tick={{ fill: "#ffffff90", fontSize: 11 }} width={110} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#ffffff20", borderRadius: 8, color: "#fff" }}
                  cursor={{ fill: "#ffffff0a" }}
                />
                <Bar dataKey="value" name="Applicants" radius={[0, 4, 4, 0]}>
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Possibility Donut Pie Chart */}
        <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10 space-y-4">
          <div>
            <h3 className="text-lg font-serif text-white">Attendance Likelihood</h3>
            <p className="text-[12px] text-white/40 font-light">
              Self-reported possibility of attending the rooftop session
            </p>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={possibilityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {possibilityData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={POSSIBILTY_COLORS[entry.name] || "#64748b"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#ffffff20", borderRadius: 8, color: "#fff" }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-[12px] text-white/70">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
