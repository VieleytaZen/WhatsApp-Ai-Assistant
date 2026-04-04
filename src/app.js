const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config();
const { generateAIResponse } = require('./services/aiService');

// Penyimpanan sementara untuk melacak chat manual (dalam RAM)
// Format: { 'nomor_hp': timestamp }
const lastUserInteraction = {}; 
const COOLDOWN_AI = 5 * 60 * 1000; // 5 menit (dalam milidetik)

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
            '--single-process', '--disable-gpu', '--no-zygote'
        ],
    }
});

// --- BAGIAN BARU: PANTAU CHAT MANUAL KAMU ---
client.on('message_create', async (msg) => {
    // Jika pesan dikirim oleh KAMU sendiri (dari HP)
    if (msg.fromMe) {
        // Catat waktu terakhir kamu membalas chat ke nomor tujuan
        lastUserInteraction[msg.to] = Date.now();
        // console.log(`[System] Kamu sedang chat manual dengan ${msg.to}. AI diistirahatkan.`);
    }
});

client.on('message', async (msg) => {
    if (msg.isStatus || msg.type !== 'chat') return;

    const chat = await msg.getChat();
    const pesanUser = msg.body ? msg.body.toLowerCase().trim() : '';

    if (!chat.isGroup) {
        
        // --- LOGIKA CEK APAKAH KAMU LAGI DI TEMPAT (LAGI CHAT) ---
        const lastManualChat = lastUserInteraction[msg.from] || 0;
        const waktuBerlalu = Date.now() - lastManualChat;

        if (waktuBerlalu < COOLDOWN_AI) {
            // Jika kamu baru chat kurang dari 5 menit lalu, AI tidak menyahut
            console.log(`[Silent] AI diam karena kamu sedang aktif chat dengan ${msg.from}`);
            return; 
        }

        if (pesanUser.length < 2) return;
        if (pesanUser === 'ping') return msg.reply('Pong! Viel Service Bot aktif.');

        try {
            console.log(`[AI Response] Membalas ${msg.from}`);
            await chat.sendSeen(); 
            await chat.sendStateTyping();
            
            const aiResponse = await generateAIResponse(msg.from, msg.body);
            
            await msg.reply(aiResponse);
            await chat.clearState();
            
        } catch (error) {
            console.error("Error:", error.message);
            await chat.clearState();
        }
    }
});

client.initialize();