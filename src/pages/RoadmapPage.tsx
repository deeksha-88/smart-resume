import { useResume } from "@/lib/resume-context";
import { useNavigate } from "react-router-dom";
import { GraduationCap, ExternalLink, Clock } from "lucide-react";

const RoadmapPage = () => {
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

  const sourceColors: Record<string, string> = {
    Coursera: "bg-primary/20 text-primary",
    W3Schools: "bg-accent/20 text-accent",
    MDN: "bg-secondary/20 text-secondary",
    FreeCodeCamp: "bg-accent/20 text-accent",
    "Khan Academy": "bg-secondary/20 text-secondary",
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold gradient-text">Learning Roadmap</h1>
      <p className="text-muted-foreground">Curated resources from trusted platforms to close your skill gaps.</p>

      <div className="space-y-4">
        {analysisData.learningRoadmap.map((item, i) => (
          <div key={i} className="glass-card p-6 hover:glow-border transition-all duration-300">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${sourceColors[item.source] || "bg-muted text-muted-foreground"}`}>{item.source}</span>
                  <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {item.duration}</span>
                </div>
                <p className="text-sm text-muted-foreground">Covers: {item.skillCovered}</p>
              </div>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="gradient-button px-3 py-1.5 text-sm flex items-center gap-1 shrink-0">
                Visit <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadmapPage;
