import { useResume } from "@/lib/resume-context";
import { useNavigate } from "react-router-dom";
import { Briefcase, MapPin, TrendingUp } from "lucide-react";

const JobsPage = () => {
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
      <h1 className="text-2xl font-bold gradient-text">Job Recommendations</h1>
      <div className="space-y-4">
        {analysisData.jobRecommendations.map((job, i) => (
          <div key={i} className="glass-card p-6 hover:glow-border transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                </div>
                <p className="text-secondary font-medium text-sm">{job.company}</p>
                <div className="flex items-center gap-1 mt-1 text-muted-foreground text-sm">
                  <MapPin className="h-3 w-3" /> {job.location}
                </div>
                <p className="text-muted-foreground text-sm mt-2">{job.description}</p>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold shrink-0 ml-4">
                <TrendingUp className="h-3 w-3" />
                {job.matchPercent}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobsPage;
