import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const geminiService = {
  async generateInsight(topic: string): Promise<string> {
    if (!ai) return "Gemini API key not configured.";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a senior investigative journalist for HabitXpress News. Write a 500-word unique trending news report on: ${topic}. 
        Use a professional, journalistic news style (Headline, Lead Paragraph, Body, Conclusion). 
        DO NOT use any asterisks (*) or bullet points. Use full paragraphs and proper transitions. 
        Focus on 'Latest Trending News' and 'Real-world Updates' for 2026.`,
      });
      return response.text || "No insight generated.";
    } catch (error) {
      console.error("Gemini Insight Error:", error);
      return "Failed to generate AI insight.";
    }
  },

  async generateNewsletter(articles: any[]): Promise<string> {
    if (!ai) return "Gemini API key not configured.";
    try {
      const articleSummaries = articles.map(a => `- ${a.title}: ${a.snippet || 'No snippet available.'}`).join('\n');
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate an engaging, high-converting newsletter body in HTML format based on these articles:\n${articleSummaries}. 
        Output ONLY the HTML body content (no <html> or <body> tags). Use <h2> for titles, <p> for paragraphs, and <a style='color: #dc2626; font-weight: bold;'> for links.`,
      });
      return response.text || "Failed to generate newsletter.";
    } catch (error) {
      console.error("Gemini Newsletter Error:", error);
      return "Failed to generate AI newsletter.";
    }
  },

  async generateHabitPlan(goal: string): Promise<any> {
    if (!ai) throw new Error("Gemini API key not configured.");
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a premium habit plan for: "${goal}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              habitName: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
              timeCommitment: { type: Type.STRING },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              keystoneHabit: { type: Type.STRING },
              reward: { type: Type.STRING },
              premiumAdvice: { type: Type.STRING },
              scientificInsight: { type: Type.STRING },
              potentialObstacles: { type: Type.ARRAY, items: { type: Type.STRING } },
              graphicData: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.NUMBER },
                    expectedProgress: { type: Type.NUMBER }
                  }
                }
              }
            },
            required: ["habitName", "difficulty", "timeCommitment", "steps", "keystoneHabit", "reward", "premiumAdvice"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini Habit Plan Error:", error);
      throw error;
    }
  },

  async chatWithCoach(message: string, history: any[]): Promise<string> {
    if (!ai) throw new Error("Gemini API key not configured.");
    try {
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "You are a world-class habit architect and high-performance coach. Provide concise, actionable, and scientifically-grounded advice. Always include a 'Mastery Tip' at the end.",
        },
      });
      // Convert history to Gemini format if needed, but for now just send the message
      const response = await chat.sendMessage({ message });
      return response.text || "No response.";
    } catch (error) {
      console.error("Gemini Coach Error:", error);
      return "Failed to connect to AI Coach.";
    }
  },

  async generate30DayChallenge(goal: string, difficulty: string): Promise<any> {
    if (!ai) throw new Error("Gemini API key not configured.");
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a 30-day challenge plan for goal: ${goal}, Difficulty: ${difficulty}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              weeks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    weekNumber: { type: Type.NUMBER },
                    theme: { type: Type.STRING },
                    dailyTasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              }
            }
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini Challenge Error:", error);
      throw error;
    }
  },

  // Category 1: AI Coaching & Personalization Features

  async generate90DayRoadmap(goal: string, lifestyle: string): Promise<any> {
    if (!ai) throw new Error("Gemini API key not configured.");
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a 90-day custom habit roadmap for the goal: "${goal}", considering this lifestyle context: "${lifestyle}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              phases: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phaseName: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    focus: { type: Type.STRING },
                    actionItems: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              }
            }
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini 90-Day Roadmap Error:", error);
      throw error;
    }
  },

  async predictSlipUps(habitData: any): Promise<string> {
    if (!ai) throw new Error("Gemini API key not configured.");
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this habit tracking data and predict when the user is most likely to slip up. Provide a short, actionable warning and strategy. Data: ${JSON.stringify(habitData)}`,
      });
      return response.text || "Unable to predict slip-ups at this time.";
    } catch (error) {
      console.error("Gemini Slip-up Prediction Error:", error);
      throw error;
    }
  },

  async suggestHabitStack(currentHabit: string, newHabit: string): Promise<string> {
    if (!ai) throw new Error("Gemini API key not configured.");
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Suggest the best way to stack a new habit ("${newHabit}") onto an existing habit ("${currentHabit}"). Provide a clear "After I [current], I will [new]" statement and a brief explanation of why this works.`,
      });
      return response.text || "Unable to suggest habit stack.";
    } catch (error) {
      console.error("Gemini Habit Stack Error:", error);
      throw error;
    }
  },

  async generateAffirmations(goal: string): Promise<string[]> {
    if (!ai) throw new Error("Gemini API key not configured.");
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate 3 powerful, personalized daily affirmations for someone trying to achieve this goal: "${goal}". Return ONLY a JSON array of strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("Gemini Affirmations Error:", error);
      throw error;
    }
  },

  async analyzeTriggers(badHabit: string, context: string): Promise<string> {
    if (!ai) throw new Error("Gemini API key not configured.");
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the potential hidden triggers for this bad habit: "${badHabit}". Context provided by user: "${context}". Provide a brief analysis of the cues (time, location, emotion, people, preceding action) and suggest one immediate replacement behavior.`,
      });
      return response.text || "Unable to analyze triggers.";
    } catch (error) {
      console.error("Gemini Trigger Analysis Error:", error);
      throw error;
    }
  },

  async generateIdentityExercise(desiredIdentity: string): Promise<string> {
    if (!ai) throw new Error("Gemini API key not configured.");
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a short, powerful psychological exercise to help a user shift their self-image to become a "${desiredIdentity}". Include a visualization prompt and a small "proof" action they can take today.`,
      });
      return response.text || "Unable to generate identity exercise.";
    } catch (error) {
      console.error("Gemini Identity Exercise Error:", error);
      throw error;
    }
  },

  async forecastWillpower(sleepHours: number, stressLevel: string, tasks: string): Promise<any> {
    if (!ai) throw new Error("Gemini API key not configured.");
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Estimate the user's mental energy/willpower for today based on: Sleep (${sleepHours} hours), Stress Level (${stressLevel}), and Planned Tasks (${tasks}).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              willpowerPercentage: { type: Type.NUMBER },
              advice: { type: Type.STRING },
              bestTimeToTackleHardTasks: { type: Type.STRING }
            }
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini Willpower Forecast Error:", error);
      throw error;
    }
  },

  async generateMicroHabits(bigGoal: string): Promise<string[]> {
    if (!ai) throw new Error("Gemini API key not configured.");
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Break down this big goal: "${bigGoal}" into 5 tiny, 2-minute micro-habits that are impossible to fail. Return ONLY a JSON array of strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("Gemini Micro-Habit Error:", error);
      throw error;
    }
  },

  async analyzeMoodCorrelation(moodData: any, habitData: any): Promise<string> {
    if (!ai) throw new Error("Gemini API key not configured.");
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the correlation between this user's mood data and habit consistency data. Provide a short, insightful summary of how their mood affects their habits and vice versa. Mood Data: ${JSON.stringify(moodData)}. Habit Data: ${JSON.stringify(habitData)}`,
      });
      return response.text || "Unable to analyze mood correlation.";
    } catch (error) {
      console.error("Gemini Mood Correlation Error:", error);
      throw error;
    }
  }
};
