# Nebula – AI Powered by Gemini Flash 2.0 🚀

**Nebula** adalah platform AI berbasis web yang memanfaatkan teknologi **Gemini Flash 2.0** untuk memberikan pengalaman interaksi AI yang cepat, cerdas, dan efisien.  
Proyek ini dirancang untuk mempermudah integrasi model AI canggih ke dalam aplikasi atau layanan yang memerlukan pemrosesan bahasa alami, pembuatan konten, atau analisis data secara real-time.

---

## ✨ Fitur Utama
- **Ditenagai oleh Gemini Flash 2.0** – Kecepatan tinggi dengan latensi rendah dan kualitas respons yang presisi.
- **Antarmuka Web Interaktif** – Pengguna dapat langsung berinteraksi dengan AI melalui browser.
- **API Siap Pakai** – Mudah diintegrasikan dengan aplikasi eksternal.
- **Desain Modern & Responsif** – Menggunakan teknologi frontend terkini.
- **Dukungan Multi-Prompt** – Mendukung berbagai skenario penggunaan.

---

## 📂 Struktur Proyek
```
nebula-ai-powered-by-gemini/
├── public/           # File statis (ikon, gambar, dll)
├── src/
│   ├── components/   # Komponen UI
│   ├── pages/        # Halaman utama aplikasi
│   ├── services/     # Modul koneksi ke API Gemini Flash 2.0
│   ├── styles/       # File CSS atau Tailwind
│   └── utils/        # Helper dan fungsi pendukung
├── package.json      # Konfigurasi Node.js & dependensi
└── README.md         # Dokumentasi proyek
```

---

## 🛠️ Teknologi yang Digunakan
- **Frontend:** HTML, CSS/Tailwind, JavaScript/React
- **Backend/API:** Node.js / Express
- **Model AI:** Google Gemini Flash 2.0
- **Deploy:** Vercel / Netlify / Server Pribadi

---

## 📦 Instalasi
1. **Klon repositori ini**
   ```bash
   git clone https://github.com/Mipan-Zuzu/nebula-ai-powered-by-gemini.git
   cd nebula-ai-powered-by-gemini
   ```
2. **Install dependensi**
   ```bash
   npm install
   ```
3. **Buat file konfigurasi `.env`**
   ```env
   GEMINI_API_KEY=apikey_anda_disini
   ```
4. **Jalankan server**
   ```bash
   npm run dev
   ```
5. **Akses aplikasi** di browser:
   ```
   http://localhost:3000
   ```

---

## ⚡ Cara Menggunakan
- Ketik prompt atau pertanyaan di kolom input.
- Tekan tombol **Kirim** untuk mendapatkan respons AI.
- Gunakan mode **Multi-Prompt** untuk mencoba berbagai skenario dalam satu sesi.
- API tersedia di endpoint `/api/gemini` untuk integrasi pihak ketiga.

---

## 📜 Lisensi
Proyek ini menggunakan lisensi **MIT**.  
Silakan gunakan, modifikasi, dan distribusikan dengan tetap mempertahankan atribusi kepada pembuat.

---

## 💡 Catatan
- Pastikan Anda memiliki **API key Gemini Flash 2.0** yang valid.
- Model ini dioptimalkan untuk kecepatan tinggi, cocok untuk aplikasi real-time seperti chatbot, customer service, dan penulisan konten instan.
