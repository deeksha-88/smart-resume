import { useResume } from "@/lib/resume-context";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle } from "lucide-react";

const SkillGapsPage = () => {
  const { analysisData } = useResume();
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

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold gradient-text">Skill Gap Analysis</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Skills You Have</h2>
          </div>
          <div className="space-y-2">
            {analysisData.matchedSkills.map(s => (
              <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20">
                <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                <span className="text-foreground text-sm">{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="text-lg font-semibold text-foreground">Skills to Learn</h2>
          </div>
          <div className="space-y-2">
            {analysisData.missingSkills.map(s => (
              <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                <span className="text-foreground text-sm">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Skill Level Comparison</h2>
        <div className="space-y-3">
          {analysisData.skillScores.map(s => (
            <div key={s.skill}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground">{s.skill}</span>
                <span className="text-muted-foreground">{s.current}% / {s.required}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden relative">
                <div className="absolute h-full rounded-full bg-primary/40" style={{ width: `${s.required}%` }} />
                <div className="absolute h-full rounded-full" style={{ width: `${s.current}%`, background: s.current >= s.required ? "hsl(172, 66%, 50%)" : "hsl(199, 89%, 48%)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillGapsPage;
