
const { GoogleGenAI, Type } = require("@google/genai");
const db = require('./db');

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are CalmConnect, a specialized AI-based Psychologist and empathetic mental health companion. 

**STRICT SCOPE & LIMITATIONS**:
1. **ONLY answer questions related to mental health, psychology, emotional well-being, and CBT (Cognitive Behavioral Therapy).**
2. **REFUSE all requests unrelated to your field.** This includes but is not limited to:
   - Writing or debugging code.
   - Providing weather updates.
   - General knowledge/facts (e.g., "Who won the World Cup?").
   - Mathematical calculations or logical puzzles.
   - Travel advice or product recommendations.
3. If a user asks an off-topic question, politely but firmly explain: "I am your AI mental health companion, specialized in psychology and emotional support. I cannot assist with [topic], but I am here to help you navigate your thoughts, feelings, or mental wellness."

**CORE PERSONA & PRINCIPLES**:
- Your goal is to provide supportive, non-judgmental conversations based on CBT principles.
- Always be kind, patient, and understanding. Use a calm and reassuring tone.
- Personalize your responses by referring to the user's recent messages and provided context (like logged moods).
- When a user expresses distress, validate their feelings and offer gentle guidance.
- Suggest actionable techniques like deep breathing, mindfulness, or thought reframing.
- Do not provide medical diagnoses or treatment plans. You are a supportive tool, not a replacement for a human doctor. **If you feel the user's concerns are beyond your capabilities as an AI, or if they require clinical intervention, you MUST explicitly recommend that they schedule an appointment with a qualified psychiatrist.**

**IMPORTANT CONTEXT**: The user's country/region is **Pakistan**. 
- All emergency references and resource suggestions MUST be relevant to Pakistan.
- **CRISIS PROTOCOL**: If the user expresses thoughts of self-harm or is in a crisis, guide them to seek immediate professional help in Pakistan.
  - Local emergency numbers: **1122** (Rescue) or **15** (Police).
  - Mental health helplines: **Umang (0311-7786264)** or **Taskeen**.
  - **Clinical Recommendation**: Always encourage users to consult with a psychiatrist for medications or complex diagnostic needs.

Keep your responses concise, focused on psychology, and easy to understand.`;

const convertMessagesToHistory = (messages) => {
  return messages
    .map(msg => {
      let text = msg.text;
      if (msg.sender === 'ai' && msg.feedback) {
        const feedbackText = msg.feedback === 'like' ? 'liked' : 'disliked';
        text += `\n[System note: The user ${feedbackText} this response.]`;
      }
      return {
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text }],
      };
    });
};

const getAIResponse = async (newMessage, history, currentUser) => {
    const { rows: moodHistory } = await db.query(
        'SELECT mood FROM mood_entries WHERE user_id = $1 ORDER BY date DESC LIMIT 1',
        [currentUser.id]
    );
    const recentMood = moodHistory.length > 0 ? moodHistory[0] : null;

    let dynamicContext = '';
    if (recentMood) {
        const moodLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
        const moodLabel = moodLabels[recentMood.mood - 1];
        dynamicContext = `\n\n**User's Current Context:** The user's most recently logged mood was '${moodLabel}' (${recentMood.mood}/5).`;
    }
  
    const fullSystemInstruction = systemInstruction + dynamicContext;
    const chatHistory = convertMessagesToHistory(history);

    const chat = ai.chats.create({
        model: 'gemini-3.1-flash-lite',
        config: {
            systemInstruction: fullSystemInstruction,
        },
        history: chatHistory,
    });

    try {
        const result = await chat.sendMessage({ message: newMessage });
        return result.text;
    } catch (error) {
        console.error("Error getting AI response:", error);
        return "I'm sorry, I'm having a little trouble connecting right now. Please try again in a moment.";
    }
};

const getChatTitle = async (history) => {
    const conversation = history.slice(0, 4)
        .map(msg => `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}`)
        .join('\n');

    const prompt = `Based on the following psychology-focused conversation, create a very short, concise title (5 words or less). Only return the title itself.\n\nConversation:\n${conversation}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: prompt,
        });
        return response.text.trim().replace(/^"|"$/g, '');
    } catch (error) {
        console.error("Error generating chat title:", error);
        return "New Conversation";
    }
};

const getJournalingPrompt = async (moodHistory, chatHistory, theme = 'General') => {
  const recentMoods = moodHistory.map(m => `On ${new Date(m.date).toLocaleDateString()}, my mood was ${m.mood} out of 5.`);
  const recentMessages = chatHistory.map(m => `${m.sender === 'user' ? 'I said' : 'The AI said'}: "${m.text}"`);

  const themeInstruction = {
    'General': 'The prompt should be encouraging and help the user reflect on their recent experiences or feelings.',
    'Gratitude': 'The prompt should focus on gratitude, helping the user to identify and appreciate positive aspects of their life, no matter how small.',
    'Self-Reflection': 'The prompt should encourage deep self-reflection, helping the user explore their thoughts, feelings, and behaviors to gain self-awareness.',
    'Processing Difficulties': 'The prompt should be gentle and supportive, helping the user to process recent challenges or difficult emotions in a constructive way.',
  }[theme];

  const prompt = `
    As an AI Psychologist, based on the following recent user data, generate a single, thoughtful journaling prompt. ${themeInstruction} Do not be conversational, just return the prompt itself.

    Recent Moods:
    ${recentMoods.join('\n') || 'No recent mood entries.'}

    Recent Conversation Snippets:
    ${recentMessages.join('\n') || 'No recent chat messages.'}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating journal prompt:", error);
    return "What is one thing you're grateful for today, no matter how small?";
  }
};

module.exports = { getAIResponse, getChatTitle, getJournalingPrompt };
