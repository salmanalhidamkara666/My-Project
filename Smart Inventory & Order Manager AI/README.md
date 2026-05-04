🚀 Smart Inventory & Order Manager AI

Aplikasi manajemen inventaris & transaksi berbasis AI yang berjalan di atas Google Apps Script + Google Sheets (tanpa server).

---

📌 Overview

Smart Inventory adalah sistem all-in-one untuk:

- Manajemen produk
- Tracking stok real-time
- Pencatatan transaksi
- Dashboard analytics
- AI Forecasting (prediksi restock otomatis)

---

⚙️ Tech Stack

- Google Apps Script (Backend)
- Google Sheets (Database)
- HTML, CSS, JavaScript (Frontend)
- OpenAI API (AI Forecasting)

---

🧩 Instalasi Lengkap

Ikuti langkah-langkah berikut dengan teliti.

---

🥇 Langkah 1: Setup Database (Google Sheets)

1. Buka Google Sheets
2. Buat spreadsheet baru dengan nama:

SmartInventoryDB

3. Ambil Spreadsheet ID dari URL:

https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit

4. Buat 4 Sheet (tab):

- Users
- Products
- Transactions
- ForecastingResults

---

📄 Struktur Header

Users

id | username | password_hash | role | created_at

Products

id | kode | nama | stok | stok_minimal | harga_beli | harga_jual | gambar_url | created_at | updated_at

Transactions

id | product_id | product_name | qty | type | user | timestamp

ForecastingResults

id | product_id | product_name | stok_saat_ini | prediksi_30hari | rekomendasi_restok | alasan | timestamp

---

🔐 User Default (WAJIB)

Tambahkan data berikut di sheet Users:

id: U-1
username: admin
password_hash: 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
role: owner
created_at: (tanggal hari ini)

Password asli:

admin123

---

🥈 Langkah 2: Setup Backend & Frontend

1. Dari Google Sheets → klik:

Extensions → Apps Script

2. Akan muncul file:

Code.gs

3. Hapus semua isi → paste code backend

4. Ganti:

YOUR_SHEET_ID_HERE

dengan Spreadsheet ID kamu

---

➕ Tambahkan Frontend

1. Klik tombol:

+ → HTML

2. Beri nama:

Index

3. Paste code frontend ke "Index.html"

4. Save (Ctrl + S)

---

🥉 Langkah 3: Setup OpenAI API Key

1. Masuk ke:

Project Settings

2. Scroll ke:

Script Properties

3. Tambahkan:

Key| Value
OPENAI_API_KEY| API Key kamu

Contoh:

sk-proj-xxxxxxxx

---

🚀 Langkah 4: Deploy Web App

1. Klik:

Deploy → New Deployment

2. Pilih:

Web App

3. Isi konfigurasi:

Setting| Value
Description| V1
Execute as| Me
Who has access| Anyone

⚠️ Penting:

- Execute as: Me
- Access: Anyone

---

4. Klik Deploy

5. Authorize akses:

- Klik Allow
- Jika warning → Advanced → Continue

---

6. Copy URL Web App:

https://script.google.com/.../exec

---

🧪 Langkah 5: Testing

🔑 Login

Username: admin
Password: admin123

---

📦 Test Fitur

- Tambahkan produk
- Update stok
- Lihat dashboard
- Scan QR produk (public page)
- Buat transaksi (sale/restock)

---

🤖 AI Forecasting

1. Masuk menu:

AI Forecasting

2. Klik:

Jalankan Analisis AI

3. Tunggu beberapa detik

4. Sistem akan:

- Analisis penjualan 90 hari
- Prediksi kebutuhan 30 hari
- Rekomendasi restock otomatis

---

🌐 Deployment Result

Setelah deploy:

- Aplikasi bisa diakses via URL
- Bisa digunakan sebagai SaaS sederhana
- Bisa dibuka di HP & desktop

---

💡 Catatan Penting

- Tidak membutuhkan server
- Gratis (menggunakan ekosistem Google)
- Data tersimpan di Google Sheets
- API Key harus dirahasiakan

---

🔥 Use Case

- UMKM
- Toko online
- Warehouse kecil
- Dropshipper
- Freelance inventory system

---

📸 Saran Portfolio

Tambahkan di GitHub:

- Screenshot dashboard
- Demo link (Web App URL)
- Deskripsi bisnis (bukan hanya teknis)

---

🧠 Insight

Project ini bisa dikembangkan menjadi:

- SaaS berbayar
- Multi-user system
- Integrasi WhatsApp / Telegram
- Mobile App

---

📄 License

MIT License (bebas digunakan & dimodifikasi)

---

✨ Author

Developed by Salman 🚀
