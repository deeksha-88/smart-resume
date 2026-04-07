import { useResume } from "@/lib/resume-context";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";

const COLORS = ["#0ea5e9", "#8b5cf6", "#2dd4bf", "#f43f5e", "#f59e0b", "#22c55e", "#ec4899", "#6366f1"];

const AnalysisPage = () => {
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

  const barData = analysisData.skillScores.map(s => ({ name: s.skill, Current: s.current, Required: s.required }));
  const pieData = analysisData.categoryScores.map(c => ({ name: c.category, value: c.score }));
  const radarData = analysisData.skillScores.slice(0, 8).map(s => ({ skill: s.skill, score: s.current, fullMark: 100 }));

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold gradient-text">Analysis Score — {targetRole}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 text-center glow-border">
          <p className="text-muted-foreground text-sm">Overall Score</p>
          <p className="text-5xl font-bold gradient-text mt-2">{analysisData.overallScore}%</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-muted-foreground text-sm">Matched Skills</p>
          <p className="text-3xl font-bold text-accent mt-2">{analysisData.matchedSkills.length}</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-muted-foreground text-sm">Missing Skills</p>
          <p className="text-3xl font-bold text-destructive mt-2">{analysisData.missingSkills.length}</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Matched Skills</h2>
        <div className="flex flex-wrap gap-2">
          {analysisData.matchedSkills.map(s => (
            <span key={s} className="px-3 py-1 rounded-full text-sm bg-accent/20 text-accent border border-accent/30">{s}</span>
          ))}
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">AI Summary</h2>
        <p className="text-muted-foreground whitespace-pre-line">{analysisData.aiSummary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Skills Comparison (Bar)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis dataKey="name" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fill: "hsl(215, 20%, 55%)" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 47%, 9%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: "8px", color: "hsl(210, 40%, 96%)" }} />
              <Bar dataKey="Current" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Required" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Category Scores (Pie)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 47%, 9%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: "8px", color: "hsl(210, 40%, 96%)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Skills Radar</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(222, 30%, 18%)" />
            <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(215, 20%, 55%)" }} />
            <Radar name="Score" dataKey="score" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalysisPage;
