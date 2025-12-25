
import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async getStateDetails(stateName: string) {
    const prompt = `Provide interesting details about the Indian state/territory of ${stateName}. 
    Include a brief summary, 3 fun/interesting facts, a famous local dish, and the capital city.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "A 2-sentence summary of the state." },
        capital: { type: Type.STRING, description: "The capital city." },
        facts: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "3 interesting facts about the state."
        },
        famousDish: { type: Type.STRING, description: "One famous food item from this state." },
        cultureEmoji: { type: Type.STRING, description: "A single emoji representing the vibe of the state." }
      },
      required: ["summary", "capital", "facts", "famousDish", "cultureEmoji"],
    };

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          systemInstruction: "You are a knowledgeable guide for India. Keep descriptions concise and engaging."
        }
      });

      const text = response.text;
      if (!text) return null;
      return JSON.parse(text);
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }
}
