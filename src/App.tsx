import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ResumeProvider } from "@/lib/resume-context";
import { Menu } from "lucide-react";
import DashboardPage from "./pages/DashboardPage";
import UploadPage from "./pages/UploadPage";
import AnalysisPage from "./pages/AnalysisPage";
import SkillGapsPage from "./pages/SkillGapsPage";
import JobsPage from "./pages/JobsPage";
import SalaryPage from "./pages/SalaryPage";
import RoadmapPage from "./pages/RoadmapPage";
import ModifiedResumePage from "./pages/ModifiedResumePage";
import InterviewPage from "./pages/InterviewPage";
import ChatbotPage from "./pages/ChatbotPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ResumeProvider>
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                <header className="h-12 flex items-center border-b border-border/50 px-4 shrink-0">
                  <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                </header>
                <main className="flex-1 overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/analysis" element={<AnalysisPage />} />
                    <Route path="/skill-gaps" element={<SkillGapsPage />} />
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route path="/salary" element={<SalaryPage />} />
                    <Route path="/roadmap" element={<RoadmapPage />} />
                    <Route path="/resume" element={<ModifiedResumePage />} />
                    <Route path="/interview" element={<InterviewPage />} />
                    <Route path="/chatbot" element={<ChatbotPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </ResumeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
