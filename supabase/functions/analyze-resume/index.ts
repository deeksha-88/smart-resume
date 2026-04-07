import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeText, targetRole, action, messages, interviewContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "analyze") {
      systemPrompt = `You are an expert resume analyzer and career advisor. Analyze the resume against the target role and return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "overallScore": number (0-100),
  "matchedSkills": ["skill1", "skill2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "skillScores": [{"skill": "name", "current": number 0-100, "required": number 0-100}],
  "categoryScores": [{"category": "name", "score": number 0-100}],
  "jobRecommendations": [{"title": "string", "company": "string", "matchPercent": number, "location": "string", "description": "string"}],
  "salaryInsights": {"minSalary": number, "maxSalary": number, "avgSalary": number, "currency": "INR", "roleBreakdown": [{"level": "string", "salary": "string"}]},
  "aiSummary": "string (2-3 paragraph profile evaluation)",
  "learningRoadmap": [{"title": "string", "source": "Coursera|W3Schools|MDN|FreeCodeCamp|Khan Academy", "url": "string (valid URL)", "duration": "string", "skillCovered": "string"}],
  "modifiedResume": "string (enhanced resume in markdown format)",
  "interviewQuestions": [{"question": "string", "sampleAnswer": "string", "difficulty": "Easy|Medium|Hard"}]
}
Ensure salary is in INR. Learning resources must be from Coursera, W3Schools, MDN, FreeCodeCamp, or Khan Academy only. Provide at least 5 job recommendations, 6 learning resources, 8 skill scores, 5 category scores, and 10 interview questions.`;
      userPrompt = `Resume:\n${resumeText}\n\nTarget Role: ${targetRole}`;
    } else if (action === "chat") {
      systemPrompt = `You are a career advisor chatbot. You help users with resume improvement, job search strategies, interview preparation, and career guidance. Be concise and actionable. If the user has shared resume context, use it to personalize advice.`;
      // For chat, we pass messages directly
    } else if (action === "interview") {
      systemPrompt = `You are a mock interviewer for the role of ${targetRole || "Software Engineer"}. Ask one interview question at a time. After the user responds, provide brief feedback and then ask the next question. Be encouraging but honest. Focus on both technical and behavioral questions relevant to the role.`;
    }

    const aiMessages = action === "chat" || action === "interview"
      ? [{ role: "system", content: systemPrompt }, ...(messages || [])]
      : [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        stream: action === "chat" || action === "interview",
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    if (action === "chat" || action === "interview") {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response, handling potential markdown fences
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse analysis results");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
