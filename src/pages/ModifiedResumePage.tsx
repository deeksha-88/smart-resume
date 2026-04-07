import { useResume } from "@/lib/resume-context";
import { useNavigate } from "react-router-dom";
import { FileText, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ModifiedResumePage = () => {
  const { analysisData } = useResume();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(analysisData.modifiedResume);
    toast({ title: "Copied!", description: "Modified resume copied to clipboard." });
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
          <FileText className="h-6 w-6" /> Modified Resume
        </h1>
        <button onClick={copyToClipboard} className="gradient-button px-4 py-2 text-sm flex items-center gap-2">
          <Copy className="h-4 w-4" /> Copy
        </button>
      </div>

      <div className="glass-card p-8">
        <div className="prose prose-invert max-w-none">
          {analysisData.modifiedResume.split("\n").map((line, i) => {
            if (line.startsWith("# ")) return <h1 key={i} className="text-2xl font-bold gradient-text mt-4 mb-2">{line.slice(2)}</h1>;
            if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-semibold text-foreground mt-4 mb-2">{line.slice(3)}</h2>;
            if (line.startsWith("### ")) return <h3 key={i} className="text-lg font-medium text-foreground mt-3 mb-1">{line.slice(4)}</h3>;
            if (line.startsWith("- ")) return <li key={i} className="text-muted-foreground ml-4 list-disc">{line.slice(2)}</li>;
            if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-foreground">{line.slice(2, -2)}</p>;
            if (line.trim() === "") return <br key={i} />;
            return <p key={i} className="text-muted-foreground">{line}</p>;
          })}
        </div>
      </div>
    </div>
  );
};

export default ModifiedResumePage;
