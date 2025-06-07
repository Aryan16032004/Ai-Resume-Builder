import axios from "axios";
import { toast } from "sonner";
export class GeminiService {
  async getGeminiResponse(prompt) {
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
            {
            contents: [{ parts: [{ text: prompt }] }]
            },
            {
            headers: { 'Content-Type': 'application/json' }
            }
        );
        const data = response.data;
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.error('Error fetching Gemini response:', error);
      toast.error('Something went wrong while fetching the Gemini response.');
    }
  }
}

const geminiService =  new GeminiService()
export default geminiService;