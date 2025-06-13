import axios from 'axios';

export async function getGeminiCompletion(prompt) {
 try {
   const response = await axios.post(
     `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
     {
       contents: [{ parts: [{ text: prompt }] }]
     },
     {
       headers: { 'Content-Type': 'application/json' }
     }
   );
   const data = response.data;
   console.log('Gemini API response:', data);
   return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
 } catch (error) {
  if (error.response && error.response.status === 503) {
      throw new Error('Gemini API is temporarily unavailable. Please try again later.');
    }
   console.error('Error fetching Gemini completion:', error);
   throw new Error('Failed to fetch completion from Gemini API');
  
 }
}
