const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

// IMPORT: Mengambil konfigurasi dan layanan AI
const CONFIG = require('./config/config');
const { generateAIResponse } = require('./services/aiService');

// Penyimpanan RAM sementara
const lastUserInteraction = {}; 
const aiDisabledStatus = {}; // Menyimpan status ON/OFF per nomor

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage',
            '--single-process', // Hemat RAM untuk Pterodactyl
            '--disable-gpu', 
            '--no-cache'
        ],
    }
});

// EVENT: Generate QR Code
client.on('qr', (qr) => {
    console.log('\n--- SCAN QR CODE ---');
    qrcode.generate(qr, { small: true });
});

// EVENT: Bot Siap
client.on('ready', () => {
    console.log('-------------------------------------------');
    console.log('✓ VIEL SERVICE BOT AKTIF & SIAP MELAYANI!');
    console.log('-------------------------------------------');
});

// EVENT: Pantau chat manual kamu (untuk fitur Cooldown)
client.on('message_create', async (msg) => {
    if (msg.fromMe) {
        lastUserInteraction[msg.to] = Date.now();
    }
});

// EVENT: Menangani Pesan Masuk
client.on('message', async (msg) => {
    if (msg.isStatus || msg.type !== 'chat') return;

    const pesanUser = msg.body ? msg.body.toLowerCase().trim() : '';

    // --- 1. FITUR COMMANDS (CEK ID & SWITCH) ---
    
    // Command untuk cek ID (LID/JID)
    if (pesanUser === '.myid') {
        return msg.reply(`*ID WhatsApp Kamu:*\n\n\`${msg.from}\``);
    }

    // Command mematikan AI di chat tertentu
    if (pesanUser === '.aioff') {
        aiDisabledStatus[msg.from] = true;
        return msg.reply('📴 *AI Dinonaktifkan.* Chat ini sekarang dalam mode manual.');
    }

    // Command mengaktifkan kembali AI
    if (pesanUser === '.aion') {
        delete aiDisabledStatus[msg.from];
        return msg.reply('✅ *AI Diaktifkan.* Viel Service Bot kembali asistenmu!');
    }

    // --- 2. LOGIKA FILTER & ROLE ---

    const chat = await msg.getChat();

    if (!chat.isGroup) {
        // Cek apakah AI sedang dimatikan manual
        if (aiDisabledStatus[msg.from]) return;

        // Cek apakah kamu sedang aktif chat manual (Cooldown)
        const lastManualChat = lastUserInteraction[msg.from] || 0;
        const waktuBerlalu = Date.now() - lastManualChat;
        if (waktuBerlalu < CONFIG.COOLDOWN_AI) {
            console.log(`[Silent] AI diam karena owner aktif di: ${msg.from}`);
            return; 
        }

        // Cek Role (Marketing vs Customer)
        const isMarketing = CONFIG.TEAM_MARKETING.includes(msg.from);
        const userRole = isMarketing ? 'marketing' : 'customer';

        if (pesanUser.length < 2) return;
        if (pesanUser === 'ping') return msg.reply('Pong! Viel Service Bot aktif.');

        try {
            console.log(`[${userRole.toUpperCase()}] Memproses pesan dari ${msg.from}`);
            
            await chat.sendSeen(); 
            await chat.sendStateTyping();
            
            // Panggil AI dengan parameter Role yang sudah dideteksi
            const aiResponse = await generateAIResponse(msg.from, msg.body, userRole);
            
            await msg.reply(aiResponse);
            await chat.clearState();
            
        } catch (error) {
            console.error("Error Logika App:", error.message);
            await chat.clearState();
        }
    }
});

client.initialize();