// src/config/config.js

const CONFIG = {
    // Daftar nomor tim marketing (Gunakan format: nomor@c.us)
    TEAM_MARKETING: [
        '628123456789@c.us',
        '628987654321@c.us',
        '628555444333@c.us' // Tambahkan nomor lainnya di sini
    ],

    // Durasi AI "diam" saat kamu chat manual (dalam milidetik)
    // 5 * 60 * 1000 = 5 Menit
    COOLDOWN_AI: 5 * 60 * 1000,

    // Batas maksimal memori chat yang disimpan (agar hemat RAM Pterodactyl)
    MAX_CHAT_MEMORY: 7
};

module.exports = CONFIG;