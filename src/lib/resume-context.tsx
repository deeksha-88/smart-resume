import React, { createContext, useContext, useState, ReactNode } from "react";

export interface AnalysisData {
  overallScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  skillScores: { skill: string; current: number; required: number }[];
  categoryScores: { category: string; score: number }[];
  jobRecommendations: { title: string; company: string; matchPercent: number; location: string; description: string }[];
  salaryInsights: { minSalary: number; maxSalary: number; avgSalary: number; currency: string; roleBreakdown: { level: string; salary: string }[] };
  aiSummary: string;
  learningRoadmap: { title: string; source: string; url: string; duration: string; skillCovered: string }[];
  modifiedResume: string;
  interviewQuestions: { question: string; sampleAnswer: string; difficulty: string }[];
}

interface ResumeContextType {
  resumeText: string;
  setResumeText: (t: string) => void;
  targetRole: string;
  setTargetRole: (r: string) => void;
  analysisData: AnalysisData | null;
  setAnalysisData: (d: AnalysisData | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (b: boolean) => void;
  fileName: string;
  setFileName: (n: string) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider = ({ children }: { children: ReactNode }) => {
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileName, setFileName] = useState("");

  return (
    <ResumeContext.Provider value={{ resumeText, setResumeText, targetRole, setTargetRole, analysisData, setAnalysisData, isAnalyzing, setIsAnalyzing, fileName, setFileName }}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error("useResume must be used within ResumeProvider");
  return ctx;
};
