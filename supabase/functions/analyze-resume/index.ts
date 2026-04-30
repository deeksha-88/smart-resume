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
      systemPrompt = `You are an expert resume analyzer and career advisor. Analyze the ACTUAL resume text against the ACTUAL target role and return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "overallScore": number (0-100),
  "matchedSkills": ["skill1", "skill2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "skillScores": [{"skill": "name", "current": number 0-100, "required": number 0-100}],
  "categoryScores": [{"category": "name", "score": number 0-100}],
  "jobRecommendations": [{"title": "string", "company": "string", "matchPercent": number, "location": "string", "description": "string"}],
  "salaryInsights": {"minSalary": number, "maxSalary": number, "avgSalary": number, "currency": "INR", "roleBreakdown": [{"level": "string", "salary": "string"}]},
  "aiSummary": "string (2-3 paragraph profile evaluation)",
  "learningRoadmap": [{"title": "string", "source": "W3Schools|FreeCodeCamp|MDN", "url": "string (valid URL)", "duration": "string", "skillCovered": "string"}],
  "modifiedResume": "string (enhanced resume in markdown format)",
  "interviewQuestions": [{"question": "string", "sampleAnswer": "string", "difficulty": "Easy|Medium|Hard"}]
}

STRICT DYNAMIC RULES — every value MUST be derived from the provided resume text and target role:
1. matchedSkills = skills that BOTH appear in the resume AND are required for the target role.
2. missingSkills = skills required for the target role that DO NOT appear in the resume. If overallScore < 100, missingSkills MUST contain at least 3 entries. Never return an empty missingSkills unless overallScore is exactly 100.
3. overallScore = round(matchedSkills.length / (matchedSkills.length + missingSkills.length) * 100). Different resumes/roles MUST produce different scores.
4. Provide at least 5 job recommendations relevant to the target role and the candidate's actual skill set, with realistic matchPercent values that vary per job.
5. Salary in INR only (numeric rupees, e.g. 1200000 for ₹12 LPA). Salary range MUST scale with overallScore (higher score => higher range).
6. learningRoadmap: ONLY use links from these three trusted domains — w3schools.com, freecodecamp.org, developer.mozilla.org. Each "url" must be a real, valid, clickable HTTPS link on one of these domains. ABSOLUTELY NO YouTube, Udemy, Coursera, Khan Academy, blog, or other domains. Provide at least 6 resources, each targeting a specific missingSkill.
7. interviewQuestions: at least 10, tailored to the target role.
8. skillScores: at least 8 entries covering both matched and missing skills.
9. categoryScores: at least 5 categories (e.g. Technical, Communication, Problem Solving, Domain Knowledge, Tools).
10. modifiedResume: take the original resume content and enhance it — keep original sections, merge missing skills into the Skills section, strengthen bullet points. Do NOT fabricate experience the candidate doesn't have.

Return ONLY the JSON object, nothing else.`;
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
    
    // Parse JSON from response - extract JSON object from any surrounding text
    let parsed;
    try {
      // Try direct parse first
      parsed = JSON.parse(content.trim());
    } catch {
      try {
        // Remove markdown fences and try again
        const cleaned = content.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();
        parsed = JSON.parse(cleaned);
      } catch {
        // Last resort: find the first { and last } to extract JSON
        const start = content.indexOf("{");
        const end = content.lastIndexOf("}");
        if (start !== -1 && end !== -1 && end > start) {
          try {
            parsed = JSON.parse(content.slice(start, end + 1));
          } catch {
            console.error("Failed to parse AI response (all methods):", content.substring(0, 500));
            throw new Error("Failed to parse analysis results");
          }
        } else {
          console.error("No JSON found in AI response:", content.substring(0, 500));
          throw new Error("Failed to parse analysis results");
        }
      }
    }

    // Post-process: enforce trusted-only roadmap links
    if (parsed && Array.isArray(parsed.learningRoadmap)) {
      const trusted = ["w3schools.com", "freecodecamp.org", "developer.mozilla.org"];
      const skillToFallback = (skill: string): { url: string; source: string } => {
        const s = (skill || "").toLowerCase();
        if (s.includes("html")) return { url: "https://www.w3schools.com/html/", source: "W3Schools" };
        if (s.includes("css")) return { url: "https://www.w3schools.com/css/", source: "W3Schools" };
        if (s.includes("react")) return { url: "https://www.freecodecamp.org/learn/front-end-development-libraries/", source: "FreeCodeCamp" };
        if (s.includes("node")) return { url: "https://www.freecodecamp.org/learn/back-end-development-and-apis/", source: "FreeCodeCamp" };
        if (s.includes("python")) return { url: "https://www.freecodecamp.org/learn/scientific-computing-with-python/", source: "FreeCodeCamp" };
        if (s.includes("sql") || s.includes("database")) return { url: "https://www.w3schools.com/sql/", source: "W3Schools" };
        if (s.includes("typescript") || s.includes("javascript") || s.includes("js")) return { url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", source: "MDN" };
        if (s.includes("api") || s.includes("rest")) return { url: "https://developer.mozilla.org/en-US/docs/Web/HTTP", source: "MDN" };
        return { url: "https://www.freecodecamp.org/learn/", source: "FreeCodeCamp" };
      };
      parsed.learningRoadmap = parsed.learningRoadmap.map((r: any) => {
        const url: string = typeof r?.url === "string" ? r.url : "";
        const ok = trusted.some((d) => url.includes(d));
        if (ok) return r;
        const fb = skillToFallback(r?.skillCovered || r?.title || "");
        return { ...r, url: fb.url, source: fb.source };
      });
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
