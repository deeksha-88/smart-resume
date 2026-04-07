import { useResume } from "@/lib/resume-context";
import { useNavigate } from "react-router-dom";
import { IndianRupee, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const formatINR = (n: number) => "₹" + n.toLocaleString("en-IN");

const SalaryPage = () => {
  const { analysisData, targetRole } = useResume();
  const navigate = useNavigate();

  if (!analysisData) {
    return (
      <div className="p-8 text-center animate-fade-in">
        <div className="glass-card p-12 max-w-md mx-auto">
          <p className="text-muted-foreground mb-4">No analysis data yet.</p>
          <button onClick={() => navigate("/upload")} className="gradient-button px-6 py-2">Upload Resume</button>
        </div>
      </div>
    );
  }

  const { salaryInsights } = analysisData;
  const chartData = salaryInsights.roleBreakdown.map(r => ({
    level: r.level,
    salary: parseInt(r.salary.replace(/[^\d]/g, "")) || 0,
  }));

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold gradient-text">Salary Insights — {targetRole}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 text-center">
          <p className="text-muted-foreground text-sm">Minimum</p>
          <p className="text-2xl font-bold text-foreground mt-1">{formatINR(salaryInsights.minSalary)}</p>
        </div>
        <div className="glass-card p-6 text-center glow-border">
          <p className="text-muted-foreground text-sm">Average</p>
          <p className="text-2xl font-bold gradient-text mt-1">{formatINR(salaryInsights.avgSalary)}</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-muted-foreground text-sm">Maximum</p>
          <p className="text-2xl font-bold text-foreground mt-1">{formatINR(salaryInsights.maxSalary)}</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> Salary by Experience Level
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
            <XAxis dataKey="level" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} />
            <YAxis tick={{ fill: "hsl(215, 20%, 55%)" }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(222, 47%, 9%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: "8px", color: "hsl(210, 40%, 96%)" }} formatter={(v: number) => formatINR(v)} />
            <Bar dataKey="salary" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Breakdown by Level</h2>
        <div className="space-y-3">
          {salaryInsights.roleBreakdown.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/30">
              <span className="text-foreground font-medium">{r.level}</span>
              <span className="text-primary font-semibold flex items-center gap-1"><IndianRupee className="h-3 w-3" /> {r.salary}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalaryPage;
