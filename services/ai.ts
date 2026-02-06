import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, StudyTask, ExamQuestion } from "../types";

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStudyPlan = async (profile: UserProfile): Promise<StudyTask[]> => {
  const modelId = "gemini-3-flash-preview";
  
  const prompt = `
    Student Info:
    Grade: ${profile.grade}
    Subjects: ${profile.subjects.join(", ")}
    Weak Subjects: ${profile.weakSubjects.join(", ")}
    Daily Study Time Available: ${profile.dailyHours} hours

    Generate a daily study schedule. 
    Rules:
    - Balance workload based on subjects.
    - Add short breaks (5-10 mins) every 50 minutes of study.
    - Include at least one revision slot.
    - Prioritize weak subjects with slightly more time or earlier slots.
    - Total duration of tasks (study + breaks) should roughly equal ${profile.dailyHours * 60} minutes.
    
    Return a list of tasks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert academic planner. You create balanced, realistic study schedules for students.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING, description: "The subject name or 'Break' or 'Revision'" },
              topic: { type: Type.STRING, description: "Specific topic to cover" },
              type: { type: Type.STRING, enum: ["study", "break", "revision"] },
              durationMinutes: { type: Type.INTEGER, description: "Duration in minutes" },
              notes: { type: Type.STRING, description: "Short tip or focus area" }
            },
            required: ["subject", "topic", "type", "durationMinutes"]
          }
        }
      }
    });

    const tasksRaw = JSON.parse(response.text || "[]");
    
    // Add IDs and completed status
    return tasksRaw.map((task: any) => ({
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      completed: false
    }));
  } catch (error) {
    console.error("Error generating plan:", error);
    throw new Error("Failed to generate study plan. Please try again.");
  }
};

export const generateExamQuestions = async (subjects: string[], grade: string): Promise<ExamQuestion[]> => {
  const modelId = "gemini-3-flash-preview";
  
  const prompt = `
    Generate 10 multiple-choice questions (MCQs) for a ${grade} student covering the following subjects: ${subjects.join(", ")}.
    
    Requirements:
    - 4 options per question.
    - One correct answer.
    - Mixed difficulty levels (Easy, Medium, Hard).
    - Provide a short explanation for the correct answer.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: "You are a strict examiner. Generate high-quality academic questions.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Exactly 4 options"
              },
              correctAnswerIndex: { 
                type: Type.INTEGER, 
                description: "Index of the correct option (0-3)" 
              },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswerIndex"]
          }
        }
      }
    });

    const questionsRaw = JSON.parse(response.text || "[]");
    
    return questionsRaw.map((q: any) => ({
      ...q,
      id: Math.random().toString(36).substr(2, 9)
    }));

  } catch (error) {
    console.error("Error generating exam:", error);
    throw new Error("Failed to generate exam questions.");
  }
};

export const chatWithTutor = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
  try {
    // We use a fresh chat session for simplicity in this stateless service, 
    // but in a real app, you might persist the chat object.
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      history: history,
      config: {
        systemInstruction: `You are a friendly, encouraging, and knowledgeable student tutor. 
        - Explain concepts simply and clearly.
        - Give practical examples.
        - Keep answers concise but helpful.
        - If the student seems stressed, offer motivation.`,
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I'm having trouble thinking right now. Can you ask again?";
  } catch (error) {
    console.error("Chat error:", error);
    return "Sorry, I lost connection to the library! Please check your internet and try again.";
  }
};