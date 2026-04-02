const Groq = require("groq-sdk");
const { Mistral } = require("@mistralai/mistralai");
const { systemPrompt } = require("../config/instruction");
require('dotenv').config();

// Inisialisasi AI
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const mistralClient = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const chatSessions = {};

async function generateAIResponse(senderId, userInput) {
    if (!chatSessions[senderId]) {
        chatSessions[senderId] = [{ role: "system", content: systemPrompt }];
    }
    chatSessions[senderId].push({ role: "user", content: userInput });

    // Memori 10 chat terakhir
    if (chatSessions[senderId].length > 11) chatSessions[senderId].splice(1, 2);

    try {
        // --- COBA GROQ VERSATILE (UTAMA) ---
        console.log("--- Mencoba Groq Versatile ---");
        const groqCompletion = await groq.chat.completions.create({
            messages: chatSessions[senderId],
            model: "llama-3.3-70b-versatile", 
        });

        const reply = groqCompletion.choices[0]?.message?.content;
        chatSessions[senderId].push({ role: "assistant", content: reply });
        return reply;

    } catch (error) {
        // Cek apakah error karena limit (429)
        console.log("--- Groq Versatile Limit! Dialihkan ke Mistral ---");

        try {
            // --- COBA MISTRAL (CADANGAN GRATIS) ---
            const mistralResponse = await mistralClient.chat.complete({
                model: "mistral-small-latest", // Pinter dan gratis
                messages: chatSessions[senderId],
            });

            const replyMistral = mistralResponse.choices[0].message.content;
            chatSessions[senderId].push({ role: "assistant", content: replyMistral });
            return replyMistral;

        } catch (mistralError) {
            console.error("Dua-duanya Tepar:", mistralError.message);
            return "Halo Kak! Admin Viel Service sedang sangat sibuk. Mohon tunggu 1-2 menit ya! 🙏";
        }
    }
}

module.exports = { generateAIResponse };