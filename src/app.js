const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config();
const { generateAIResponse } = require('./services/aiService');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
        headless: true, // Set ke false kalau mau lihat browsernya terbuka
        // Jalur khusus untuk Chrome Dev kamu
        executablePath: 'C:\\Program Files\\Google\\Chrome Dev\\Application\\chrome.exe',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    }
});

console.log('Sedang memulai Viel Service Bot di Laptop...');

// Pakai QR Code Terminal saja biar simpel di laptop
client.on('qr', (qr) => {
    console.log('--- SCAN QR CODE DI BAWAH INI ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('---------------------------------');
    console.log('✓ VIEL SERVICE BOT AKTIF DI LAPTOP!');
    console.log('---------------------------------');
});

client.on('message', async (msg) => {
    // 1. Abaikan status/story biar nggak SKSD
    if (msg.isStatus) return;

    const chat = await msg.getChat();
    const pesanUser = msg.body.toLowerCase().trim();

    // 2. Hanya balas Chat Pribadi (Bukan Grup)
    if (!chat.isGroup) {
        
        // --- FILTER LOGIKA MULAI ---
        
        // A. Abaikan kalau cuma kirim Stiker/Media tanpa teks
        if (msg.type === 'sticker' || msg.type === 'image' || msg.type === 'video') {
            return; // Bot diam saja, atau bisa kamu kasih balasan manual "Maaf Kak, aku belum bisa baca gambar/stiker."
        }

        // B. Filter Pesan Terlalu Singkat (Contoh: "P", "Tes", ".", "Oi")
        if (pesanUser.length < 2) {
            return; // Nggak usah dibalas kalau cuma "P" atau titik
        }

        // C. Balasan Instan (Tanpa AI) untuk kata kunci tertentu (Hemat Token)
        if (pesanUser === 'ping') {
            return msg.reply('Pong! Viel Service aktif Kak. Ada yang bisa dibantu?');
        }

        // --- FILTER LOGIKA SELESAI ---

        try {
            console.log(`[PC] ${msg.from}: ${msg.body}`);
            
            // Tandai sudah dibaca (Centang Biru)
            await chat.sendSeen(); 
            
            // Efek sedang mengetik
            await chat.sendStateTyping();
            
            // Panggil Groq AI dengan Memori
            const aiResponse = await generateAIResponse(msg.from, msg.body);
            
            await msg.reply(aiResponse);
            await chat.clearState();
            
        } catch (error) {
            console.error("Error Logika:", error.message);
        }
    }
});

client.initialize();