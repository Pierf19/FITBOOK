# FitBook — Fitness Trainer Booking App
> Prototipe sistem booking trainer fitness dengan React + Convex (Waterfall Model)

## 🚀 Cara Menjalankan

### 1. Install dependencies
```bash
npm install
```

### 2. Setup Convex (database real-time)
```bash
npx convex dev
```
Ikuti instruksi login. Convex akan otomatis membuat file `.env.local` berisi `VITE_CONVEX_URL`.

### 3. Jalankan aplikasi
```bash
npm run dev
```
Buka http://localhost:5173

---

## 📁 Struktur Proyek
```
fitbook/
├── convex/                  ← Backend (database & API)
│   ├── schema.ts            ← Definisi tabel: users, trainers, bookings
│   ├── auth.ts              ← Fungsi login & register
│   ├── trainers.ts          ← Query & seed data trainer
│   └── bookings.ts          ← CRUD booking
├── src/
│   ├── App.jsx              ← Root app + AuthContext
│   ├── index.css            ← Global styles
│   ├── components/
│   │   └── Layout.jsx       ← Navbar & layout wrapper
│   └── pages/
│       ├── LoginPage.jsx    ← Halaman login
│       ├── RegisterPage.jsx ← Halaman registrasi
│       ├── HomePage.jsx     ← Dashboard + daftar trainer
│       ├── BookingPage.jsx  ← Booking 4 langkah
│       └── JadwalPage.jsx   ← Jadwal & riwayat booking
└── .env.example             ← Template environment variable
```

## 🗄️ Database Schema (Convex)
| Tabel      | Kolom Utama                                          |
|------------|------------------------------------------------------|
| `users`    | name, email, password, role, createdAt               |
| `trainers` | name, specialization, tags, experience, rating, price |
| `bookings` | userId, trainerId, day, time, status, totalPrice      |

## 🛠️ Process Model: Waterfall
1. **Requirements** — Analisis kebutuhan booking trainer
2. **Design** — Skema DB, alur UI, komponen React
3. **Implementation** — Koding halaman & Convex functions
4. **Testing** — Validasi form, cek slot, konflik jadwal
5. **Maintenance** — Fitur cancel, riwayat, update status
