import { useState, useRef } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useResume } from "@/lib/resume-context";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import mammoth from "mammoth";

const UploadPage = () => {
  const { setResumeText, targetRole, setTargetRole, setAnalysisData, setIsAnalyzing, setFileName } = useResume();
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const extractText = async (file: File): Promise<string> => {
    const name = file.name.toLowerCase();

    if (name.endsWith(".docx")) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    // For .txt and other text files, read as text
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleAnalyze = async () => {
    if (!localFile || !targetRole.trim()) {
      toast({ title: "Missing info", description: "Please upload a resume and enter a target role.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setIsAnalyzing(true);

    try {
      const text = await extractText(localFile);
      setResumeText(text);

      const { data, error } = await supabase.functions.invoke("analyze-resume", {
        body: { resumeText: text, targetRole: targetRole.trim(), action: "analyze" },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAnalysisData(data);
      toast({ title: "Analysis Complete!", description: "Your resume has been analyzed successfully." });
      navigate("/analysis");
    } catch (e: any) {
      toast({ title: "Analysis Failed", description: e.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold gradient-text mb-6">Upload Your Resume</h1>

      <div className="glass-card p-8 mb-6">
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) { setLocalFile(f); setFileName(f.name); }
        }} />

        <button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-12 transition-all group">
          {localFile ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-left">
                <p className="text-foreground font-medium">{localFile.name}</p>
                <p className="text-muted-foreground text-sm">{(localFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
              <p className="text-foreground font-medium">Click to upload resume</p>
              <p className="text-muted-foreground text-sm mt-1">PDF, DOC, DOCX, or TXT</p>
            </div>
          )}
        </button>
      </div>

      <div className="glass-card p-6 mb-6">
        <label className="text-sm font-medium text-foreground mb-2 block">Target Job Role</label>
        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g., Senior Frontend Developer"
          className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>

      <button onClick={handleAnalyze} disabled={loading || !localFile || !targetRole.trim()} className="gradient-button w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing...</> : "🚀 Get Analysis"}
      </button>
    </div>
  );
};

export default UploadPage;
