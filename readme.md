# 🤖 Viel Service Bot - WhatsApp AI Assistant

Bot WhatsApp Bisnis otomatis berbasis Kecerdasan Buatan (AI) yang dirancang khusus untuk mengelola layanan digital dan jasa kebersihan di area **Bantul, Yogyakarta**. Dibangun dengan arsitektur **Failover Dual-AI** untuk memastikan bot tetap aktif 24/7 meskipun terkena *rate limit*.

---

## ✨ Fitur Unggulan

* **🧠 Smart Dual-AI Engine:** * **Utama:** Groq (Llama 3.3 70B Versatile) untuk respon super cepat dan cerdas.
    * **Cadangan:** Mistral AI (Small Latest) yang otomatis aktif jika Groq mencapai batas limit.
* **💬 Contextual Memory:** Bot mampu mengingat alur percakapan terakhir per pelanggan, sehingga obrolan terasa lebih manusiawi dan nyambung.
* **🛡️ Smart Filter:** * Mengabaikan Update Status (Story) agar tidak "SKSD".
    * Filter pesan singkat (seperti "P", "Tes", atau titik) untuk menghemat kuota API.
    * Abaikan stiker dan media tanpa teks.
* **⚡ Auto-Read & Typing:** Memberikan efek centang biru dan status "sedang mengetik" untuk pengalaman pengguna yang lebih baik.

---

## 🛠️ Persyaratan Sistem

* **Node.js:** Versi 18 atau lebih tinggi.
* **Google Chrome:** Versi terbaru (disarankan Chrome Dev/Stable).
* **OS:** Windows/Linux/MacOS (Tested on Windows 10).

---

## 📦 Instalasi & Penggunaan

1.  **Clone Repository:**
    ```bash
    git clone [https://github.com/VieleytaZen/scai.git](https://github.com/VieleytaZen/scai.git)
    cd scai
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment:**
    Buat file `.env` di folder root dan isi dengan API Key Anda:
    ```env
    GROQ_API_KEY=gsk_xxxxxxxxxxxx
    MISTRAL_API_KEY=your_mistral_key_here
    ```

4.  **Jalankan Bot:**
    ```bash
    npm start
    ```

5.  **Scan QR:** Gunakan WhatsApp di HP Anda untuk memindai kode QR yang muncul di terminal.

---

## 📂 Struktur Proyek

```text
scai/
├── src/
│   ├── config/
│   │   └── instruction.js  # System Prompt & Data Bisnis
│   ├── services/
│   │   └── aiService.js    # Logika Dual-AI (Groq + Mistral)
│   └── app.js              # Logika Utama WhatsApp Web JS
├── .env                    # Konfigurasi Rahasia (API Keys)
├── .gitignore              # Daftar file yang diabaikan Git
└── README.md               # Dokumentasi Proyek