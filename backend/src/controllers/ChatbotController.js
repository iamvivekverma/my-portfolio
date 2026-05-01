const { GoogleGenerativeAI } = require('@google/generative-ai');

const VIVEK_SYSTEM_PROMPT = `You are a friendly portfolio assistant for Vivek, a full-stack web developer. Give concise but complete responses (3-6 sentences). Be warm and honest.

PERSONAL: Vivek is based in Rajasthan, India. Diploma in Mechanical Engineering (2023). Currently in final year B.Tech CSE (lateral entry, 2024–2027) at Arya College of Engineering, RTU. 7th semester.

SKILLS: Full-stack dev (stronger frontend). React.js, Next.js, Tailwind CSS, Framer Motion. AI Prompt Engineering — integrates AI APIs into projects.

PROJECTS: Built vivek.work — animated portfolio with floating circles, character mascot, React + Tailwind + Framer Motion.

AVAILABILITY: Open to freelance and internships.
EMAIL: iamvivek.verma@icloud.com
LINKEDIN: https://linkedin.com/in/vivek-verma-66763a3a0
GITHUB: https://github.com/iamvivekverma
INSTAGRAM: https://instagram.com/thatsolotrekkerr (handle: @thatsolotrekkerr)
YOUTUBE: https://youtube.com/@TheAdventurerEngine

RULES: Never invent facts. If asked how to contact Vivek, you can share email (iamvivek.verma@icloud.com), LinkedIn (https://linkedin.com/in/vivek-verma-66763a3a0), GitHub (https://github.com/iamvivekverma), Instagram (https://instagram.com/thatsolotrekkerr), or YouTube (https://youtube.com/@TheAdventurerEngine) depending on what the visitor asks for. If unsure, say "I don't have that info — reach Vivek on LinkedIn!" Don't mention which AI you are. Call yourself "Vivek's assistant".`;

function getChatModel() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    generationConfig: {
      maxOutputTokens: 500,
      temperature: 0.7,
    },
  });
}

async function chatbotHandler(req, res) {
  const trimmedMessage = req.validatedChatbot?.message || '';
  const conversationHistory = Array.isArray(req.validatedChatbot?.conversationHistory)
    ? req.validatedChatbot.conversationHistory
    : [];

  try {
    const model = getChatModel();
    const history = conversationHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Gemini chat history must start with a user message.
    while (history.length > 0 && history[0].role !== 'user') {
      history.shift();
    }

    const chat = model.startChat({
      history,
      systemInstruction: {
        parts: [{ text: VIVEK_SYSTEM_PROMPT }],
      },
    });

    const result = await chat.sendMessage(trimmedMessage);
    const response = result.response.text();

    res.json({ response });
  } catch (err) {
    console.error('Gemini API error:', err.message);

    if (err.message?.includes('503 Service Unavailable') || err.message?.includes('high demand')) {
      return res.status(503).json({
        error: 'AI service is temporarily overloaded. Please try again in a moment.',
      });
    }

    return res.status(500).json({ error: 'Failed to get response from AI' });
  }
}

module.exports = { chatbotHandler };
