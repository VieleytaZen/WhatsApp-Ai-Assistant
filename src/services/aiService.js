const Groq = require("groq-sdk");
const { Mistral } = require("@mistralai/mistralai");
const { systemPrompt } = require("../config/instruction"); // Prompt Customer
const { teamPrompt } = require("../config/instruction-team"); // Prompt Marketing (BARU)
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const mistralClient = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const chatSessions = {};

async function generateAIResponse(senderId, userInput, userRole = 'customer') {
    
    // Tentukan prompt mana yang dipakai
    const selectedPrompt = (userRole === 'marketing') ? teamPrompt : systemPrompt;

    // Jika sesi belum ada, inisialisasi dengan prompt yang sesuai
    if (!chatSessions[senderId]) {
        chatSessions[senderId] = [{ role: "system", content: selectedPrompt }];
    }
    
    chatSessions[senderId].push({ role: "user", content: userInput });

    // Memori 6 chat terakhir (agar hemat RAM di Pterodactyl)
    if (chatSessions[senderId].length > 7) chatSessions[senderId].splice(1, 2);

    try {
        console.log(`--- [LOG] Role: ${userRole.toUpperCase()} | Menggunakan Groq ---`);
        const groqCompletion = await groq.chat.completions.create({
            messages: chatSessions[senderId],
            model: "llama-3.3-70b-versatile", 
        });

        const reply = groqCompletion.choices[0]?.message?.content;
        chatSessions[senderId].push({ role: "assistant", content: reply });
        return reply;

    } catch (error) {
        // ... (Logika cadangan Mistral tetap sama seperti sebelumnya)
    }
}

module.exports = { generateAIResponse };