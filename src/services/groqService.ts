import Groq from "groq-sdk";

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

const groq = apiKey ? new Groq({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true
}) : null;

export const groqService = {
  async generateInsight(topic: string): Promise<string> {
    if (!groq) {
      return "Groq API key not configured. Please add VITE_GROQ_API_KEY to your environment variables.";
    }

    try {
      // Add a dynamic timestamp and random seed to ensure uniqueness in every generation
      const timestamp = new Date().toISOString();
      const randomSeed = Math.random().toString(36).substring(7);

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a senior investigative journalist for HabitXpress News, specializing in neurobiology, habit formation, and peak performance. Your task is to write a unique, comprehensive, and trending news article (approximately 500 words) about a specific, fresh breakthrough or trend in habit science. \n\nCRITICAL RULES:\n1. Use a professional, journalistic news style (Headline, Lead Paragraph, Body, Conclusion).\n2. DO NOT use any asterisks (*) or bullet points. Use full paragraphs and proper transitions.\n3. Focus on 'Latest Trending News' and 'Real-world Updates' for 2026.\n4. The tone should be informative, authoritative, and engaging.\n5. Ensure the content is approximately 500 words long.\n6. NEVER repeat the same news story structure. Every report must be a unique piece of journalism."
          },
          {
            role: "user",
            content: `Write a 500-word unique trending news report on: ${topic}. \nContext ID: ${timestamp}-${randomSeed}. \nRemember: No asterisks, no bullet points, just pure journalistic prose.`
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.8, // Slightly higher temperature for more variety
        max_tokens: 1500, // Increased to accommodate 500+ words
      });

      return chatCompletion.choices[0]?.message?.content || "No insight generated.";
    } catch (error) {
      console.error("Groq API Error:", error);
      return "Failed to generate AI insight. Please try again later.";
    }
  },
  async generateNewsletter(articles: any[]): Promise<string> {
    if (!groq) {
      return "Groq API key not configured.";
    }

    try {
      const articleSummaries = articles.map(a => `- ${a.title}: ${a.snippet || 'No snippet available.'}`).join('\n');
      
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a professional newsletter editor for HabitXpress. Your goal is to write an engaging, high-converting newsletter body in HTML format. Use a friendly, authoritative tone. Include a warm greeting, a brief introduction about the importance of habits, and then summarize the provided articles with a call to action for each. \n\nRULES:\n1. Output ONLY the HTML body content (no <html> or <body> tags).\n2. Use <h2> for article titles.\n3. Use <p> for paragraphs.\n4. Use <a style='color: #dc2626; font-weight: bold;'> for links.\n5. Keep it concise but engaging.\n6. Do NOT use markdown, use only HTML."
          },
          {
            role: "user",
            content: `Generate a newsletter body based on these articles:\n${articleSummaries}`
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 2000,
      });

      return chatCompletion.choices[0]?.message?.content || "Failed to generate newsletter.";
    } catch (error) {
      console.error("Groq Newsletter Error:", error);
      return "Failed to generate AI newsletter.";
    }
  },
  async generateHabitPlan(goal: string): Promise<any> {
    if (!groq) {
      throw new Error("Groq API key not configured.");
    }

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a world-class habit architect and high-performance coach. 
            Your goal is to create a "Premium Level" habit blueprint that is scientifically grounded and highly actionable.
            
            Provide a JSON response with the following structure:
            {
              "habitName": "string",
              "difficulty": "Easy" | "Medium" | "Hard",
              "timeCommitment": "string",
              "steps": ["string", "string", "string", "string", "string"],
              "keystoneHabit": "string",
              "reward": "string",
              "premiumAdvice": "string (A high-level, elite tip for long-term mastery)"
            }`
          },
          {
            role: "user",
            content: `Create a premium habit plan for: "${goal}"`
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const content = chatCompletion.choices[0]?.message?.content;
      return content ? JSON.parse(content) : null;
    } catch (error) {
      console.error("Groq Habit Plan Error:", error);
      throw error;
    }
  },
  async chatWithCoach(message: string, history: any[]): Promise<string> {
    if (!groq) throw new Error("Groq API key not configured.");
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a world-class habit architect and high-performance coach. Provide concise, actionable, and scientifically-grounded advice. Use a coral action tip box style in your mind (meaning provide one clear tip at the end)."
          },
          ...history,
          { role: "user", content: message }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
      });
      return chatCompletion.choices[0]?.message?.content || "No response.";
    } catch (error) {
      console.error("Groq Coach Error:", error);
      return "Failed to connect to AI Coach.";
    }
  },
  async generate30DayChallenge(goal: string, difficulty: string): Promise<any> {
    if (!groq) throw new Error("Groq API key not configured.");
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Generate a 30-day challenge plan in JSON format. Include 'title', 'difficulty', and 'weeks' (array of 4 objects, each with 'weekNumber' and 'dailyTasks' array of 7 strings)."
          },
          { role: "user", content: `Goal: ${goal}, Difficulty: ${difficulty}` }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        response_format: { type: "json_object" }
      });
      const content = chatCompletion.choices[0]?.message?.content;
      return content ? JSON.parse(content) : null;
    } catch (error) {
      console.error("Groq Challenge Error:", error);
      throw error;
    }
  }
};
