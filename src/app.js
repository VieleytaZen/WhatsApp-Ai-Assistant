const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config();
const { generateAIResponse } = require('./services/aiService');

// Inisialisasi Client WhatsApp
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth' // Folder penyimpanan sesi di server
    }),
    puppeteer: {
        headless: true, // Wajib true untuk Cloud/Panel
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

console.log('--- SEDANG MEMULAI VIEL SERVICE BOT (CLOUD MODE) ---');

// EVENT: Memunculkan QR Code di Console Hosting
client.on('qr', (qr) => {
    console.log('\n--- SCAN QR CODE DI BAWAH INI ---');
    // small: true agar muat di terminal panel yang sempit
    qrcode.generate(qr, { small: true });
    console.log('Tips: Jika QR berantakan, kecilkan zoom browser kamu (Ctrl + -)\n');
});

// EVENT: Bot Berhasil Login
client.on('ready', () => {
    console.log('-------------------------------------------');
    console.log('✓ VIEL SERVICE BOT AKTIF & SIAP MELAYANI!');
    console.log('-------------------------------------------');
});

// EVENT: Menangani Pesan Masuk
client.on('message', async (msg) => {
    // 1. Abaikan update status/story
    if (msg.isStatus) return;

    const chat = await msg.getChat();
    const pesanUser = msg.body ? msg.body.toLowerCase().trim() : '';

    // 2. Filter: Hanya balas Chat Pribadi (Bukan Grup)
    if (!chat.isGroup) {
        
        // --- LOGIKA FILTER MULAI ---
        
        // A. Abaikan Media (Stiker, Gambar, Video) tanpa teks
        if (msg.type !== 'chat') {
            return; 
        }

        // B. Filter Pesan Terlalu Singkat (Contoh: "P", "Tes", ".", "Oi")
        if (pesanUser.length < 2) {
            return;
        }

        // C. Command Instan (Hemat Token AI)
        if (pesanUser === 'ping') {
            return msg.reply('Pong! Viel Service Bot aktif Kak. Ada yang bisa dibantu?');
        }

        // --- LOGIKA FILTER SELESAI ---

        try {
            console.log(`[Pesan Masuk] ${msg.from}: ${msg.body}`);
            
            // Centang Biru otomatis
            await chat.sendSeen(); 
            
            // Status: Sedang mengetik...
            await chat.sendStateTyping();
            
            // Kirim ke AI (Groq/Mistral) dengan ID pengirim untuk Memori
            const aiResponse = await generateAIResponse(msg.from, msg.body);
            
            // Balas Pesan
            await msg.reply(aiResponse);
            
            // Hentikan status mengetik
            await chat.clearState();
            
        } catch (error) {
            console.error("Error Logika App:", error.message);
        }
    }
});

// Jalankan Client
client.initialize();
