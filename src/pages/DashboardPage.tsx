import { Sparkles, Upload, BarChart3, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useResume } from "@/lib/resume-context";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { analysisData } = useResume();

  const features = [
    { icon: Upload, title: "Upload Resume", desc: "Upload PDF/DOCX and set target role", path: "/upload" },
    { icon: BarChart3, title: "AI Analysis", desc: "Get detailed skill match scores", path: "/analysis" },
    { icon: Briefcase, title: "Job Matches", desc: "Personalized job recommendations", path: "/jobs" },
    { icon: Sparkles, title: "AI Chatbot", desc: "Get career guidance instantly", path: "/chatbot" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="glass-card p-8 md:p-12 mb-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ background: "var(--gradient-primary)" }} />
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">AI Resume Analyzer</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload your resume, set a target role, and get AI-powered analysis with skill gaps, job recommendations, salary insights, and a personalized learning roadmap.
          </p>
          <button onClick={() => navigate("/upload")} className="gradient-button px-8 py-3 mt-6 text-lg">
            Get Started
          </button>
        </div>
      </div>

      {analysisData && (
        <div className="glass-card p-6 mb-8 glow-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Overall Match Score</p>
              <p className="text-4xl font-bold gradient-text">{analysisData.overallScore}%</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-sm">Skills Matched</p>
              <p className="text-2xl font-semibold text-accent">{analysisData.matchedSkills.length}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-sm">Gaps Found</p>
              <p className="text-2xl font-semibold text-destructive">{analysisData.missingSkills.length}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((f) => (
          <button key={f.title} onClick={() => navigate(f.path)} className="glass-card p-6 text-left hover:glow-border transition-all duration-300 group">
            <f.icon className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-foreground mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
