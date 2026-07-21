# Sistem Antrean Layanan Kampus Terdistribusi

## 1. Deskripsi Proyek

Sistem Antrean Layanan Kampus Terdistribusi adalah aplikasi web yang digunakan untuk membantu mahasiswa mengambil nomor antrean layanan kampus secara daring. Sistem menyediakan halaman pengguna untuk mengambil dan memantau antrean serta halaman admin untuk mengelola proses pelayanan.

Aplikasi dirancang menggunakan beberapa instance backend Node.js yang dijalankan melalui PM2 dan dihubungkan dengan Nginx sebagai load balancer. Seluruh instance menggunakan database bersama sehingga data tetap konsisten meskipun request diproses oleh server yang berbeda.

## 2. Tujuan Proyek

Tujuan dari proyek ini adalah:

- Membuat aplikasi web antrean layanan kampus.
- Menerapkan multi-instance backend.
- Mendistribusikan request menggunakan load balancing.
- Menggunakan database bersama untuk menjaga konsistensi data.
- Menguji fault tolerance ketika salah satu instance berhenti.
- Menampilkan log request dari setiap instance.
- Mengimplementasikan Redis sebagai fitur tambahan untuk cache, session, atau sinkronisasi realtime.

## 3. Judul Proyek

**Rancang Bangun Sistem Antrean Layanan Kampus Terdistribusi Menggunakan Node.js, Nginx, PM2, dan Database Terpusat**

## 4. Teknologi yang Digunakan

| Bagian             | Teknologi                   |
| ------------------ | --------------------------- |
| Frontend           | HTML, CSS, JavaScript       |
| Backend            | Node.js dan Express.js      |
| Database           | MySQL atau PostgreSQL       |
| Process Manager    | PM2                         |
| Load Balancer      | Nginx                       |
| Cache dan Realtime | Redis                       |
| Server             | Ubuntu pada Oracle Cloud VM |
| Pengujian API      | Postman                     |
| Version Control    | Git dan GitHub              |

## 5. Arsitektur Sistem

```text
Pengguna / Admin
       |
       v
Web Browser
       |
       v
Nginx Reverse Proxy dan Load Balancer
       |
       +-------------------+-------------------+
       |                   |                   |
       v                   v                   v
 app1 : 3001          app2 : 3002          app3 : 3003
       |                   |                   |
       +-------------------+-------------------+
                           |
                           v
                  MySQL / PostgreSQL
                           |
                           v
                         Redis
```

### Penjelasan Arsitektur

- Pengguna mengakses aplikasi melalui alamat IP atau domain server.
- Nginx menerima seluruh request dari pengguna.
- Nginx membagi request ke `app1`, `app2`, dan `app3`.
- Ketiga instance menggunakan source code backend yang sama.
- Semua instance terhubung ke database yang sama.
- Redis dapat digunakan untuk cache, session, nomor antrean aktif, dan notifikasi realtime.
- Jika salah satu instance berhenti, instance lain tetap dapat melayani pengguna.

## 6. Konsep Sistem Terdistribusi

Sistem ini menunjukkan konsep sistem terdistribusi melalui:

1. **Multi-instance**  
   Aplikasi backend dijalankan pada beberapa proses berbeda.

2. **Load balancing**  
   Request pengguna dibagikan ke beberapa instance backend.

3. **Shared data**  
   Semua instance membaca dan menyimpan data pada database yang sama.

4. **Fault tolerance**  
   Sistem tetap berjalan ketika salah satu instance dihentikan.

5. **Logging**  
   Setiap instance mencatat request yang diproses.

6. **Scalability**  
   Instance baru dapat ditambahkan ketika jumlah pengguna meningkat.

## 7. Rancangan Pengguna

Terdapat dua jenis pengguna:

### 7.1 Mahasiswa

Mahasiswa dapat:

- Melihat jenis layanan.
- Mengambil nomor antrean.
- Melihat nomor antrean miliknya.
- Melihat nomor antrean yang sedang dipanggil.
- Melihat jumlah antrean yang tersisa.
- Membatalkan antrean.
- Melihat status antrean.

### 7.2 Admin atau Petugas

Admin dapat:

- Login ke sistem.
- Melihat seluruh daftar antrean.
- Memanggil antrean berikutnya.
- Menyelesaikan antrean.
- Membatalkan antrean.
- Melihat statistik antrean.
- Melihat instance server yang memproses request.

## 8. Rancangan Halaman Web

## 8.1 Halaman Beranda

Halaman beranda menjadi tampilan pertama pengguna.

Komponen:

- Logo atau nama aplikasi.
- Judul sistem antrean.
- Deskripsi singkat layanan.
- Tombol `Ambil Antrean`.
- Tombol `Cek Status`.
- Informasi jumlah antrean hari ini.
- Informasi nomor yang sedang dipanggil.

Contoh susunan:

```text
+--------------------------------------------------+
| KAMPUSQUEUE                                      |
| Sistem Antrean Layanan Kampus                    |
+--------------------------------------------------+
| Nomor Dipanggil: A012                            |
| Jumlah Menunggu: 8                               |
+--------------------------------------------------+
| [ Ambil Antrean ]  [ Cek Status ]                |
+--------------------------------------------------+
| Administrasi | Akademik | Pengambilan Dokumen    |
+--------------------------------------------------+
```

## 8.2 Halaman Ambil Antrean

Form yang disediakan:

- Nama mahasiswa.
- NIM.
- Program studi.
- Jenis layanan.
- Tombol `Ambil Nomor`.

Setelah berhasil, sistem menampilkan:

- Nomor antrean.
- Nama layanan.
- Waktu pengambilan.
- Status antrean.
- Perkiraan jumlah antrean sebelumnya.

Contoh:

```text
Nomor Antrean Anda

A015

Layanan       : Administrasi
Status        : Menunggu
Antrean di depan: 5
```

## 8.3 Halaman Status Antrean

Pengguna dapat memasukkan:

- Nomor antrean.
- NIM.

Informasi yang ditampilkan:

- Nomor antrean.
- Status.
- Nomor yang sedang dipanggil.
- Jumlah antrean sebelum pengguna.
- Waktu pengambilan.

## 8.4 Halaman Login Admin

Form:

- Username.
- Password.
- Tombol login.

## 8.5 Dashboard Admin

Dashboard menampilkan:

- Jumlah antrean menunggu.
- Jumlah antrean dipanggil.
- Jumlah antrean selesai.
- Nomor antrean aktif.
- Daftar antrean.
- Tombol panggil.
- Tombol selesai.
- Tombol batal.
- Informasi server yang menangani request.

Contoh tabel:

| Nomor | Nama  | Layanan      | Status   | Aksi    |
| ----- | ----- | ------------ | -------- | ------- |
| A013  | Ahmad | Administrasi | Menunggu | Panggil |
| A014  | Siti  | Akademik     | Menunggu | Panggil |
| A015  | Fiqri | Administrasi | Menunggu | Panggil |

## 8.6 Halaman Monitoring Sistem

Halaman ini digunakan untuk menunjukkan bahwa sistem menggunakan beberapa instance.

Informasi yang ditampilkan:

- Nama instance.
- Port.
- Hostname.
- Process ID.
- Status.
- Waktu request.
- Jumlah request yang diproses.

Contoh:

```text
Instance : app2
Port     : 3002
Hostname : server-penjagamalam
PID      : 24180
Status   : Online
```

## 9. Rancangan Desain Antarmuka

Tema yang disarankan adalah modern, sederhana, dan mudah dibaca.

### Warna

- Warna utama: biru tua.
- Warna sekunder: biru muda.
- Warna latar belakang: putih atau abu-abu terang.
- Warna berhasil: hijau.
- Warna peringatan: kuning.
- Warna gagal atau batal: merah.

### Tipografi

- Judul: font tebal.
- Isi: font sederhana dan mudah dibaca.
- Nomor antrean: ukuran besar dan menonjol.

### Komponen UI

- Navbar.
- Card informasi.
- Form input.
- Tombol utama.
- Tabel antrean.
- Badge status.
- Modal konfirmasi.
- Toast notifikasi.
- Footer.

### Status Antrean

| Status     | Warna  |
| ---------- | ------ |
| Menunggu   | Kuning |
| Dipanggil  | Biru   |
| Selesai    | Hijau  |
| Dibatalkan | Merah  |

## 10. Rancangan Database

## 10.1 Tabel Users

| Kolom         | Tipe      | Keterangan            |
| ------------- | --------- | --------------------- |
| id            | Integer   | Primary key           |
| name          | Varchar   | Nama pengguna         |
| nim           | Varchar   | Nomor induk mahasiswa |
| study_program | Varchar   | Program studi         |
| created_at    | Timestamp | Waktu dibuat          |

## 10.2 Tabel Services

| Kolom        | Tipe    | Keterangan     |
| ------------ | ------- | -------------- |
| id           | Integer | Primary key    |
| service_code | Varchar | Kode layanan   |
| service_name | Varchar | Nama layanan   |
| prefix       | Varchar | Prefix antrean |
| is_active    | Boolean | Status layanan |

## 10.3 Tabel Queues

| Kolom        | Tipe      | Keterangan           |
| ------------ | --------- | -------------------- |
| id           | Integer   | Primary key          |
| user_id      | Integer   | Relasi pengguna      |
| service_id   | Integer   | Relasi layanan       |
| queue_number | Varchar   | Nomor antrean        |
| status       | Varchar   | Status antrean       |
| called_at    | Timestamp | Waktu dipanggil      |
| completed_at | Timestamp | Waktu selesai        |
| created_at   | Timestamp | Waktu antrean dibuat |

## 10.4 Tabel Admins

| Kolom         | Tipe    | Keterangan           |
| ------------- | ------- | -------------------- |
| id            | Integer | Primary key          |
| username      | Varchar | Username admin       |
| password_hash | Varchar | Password terenkripsi |
| role          | Varchar | Peran admin          |

## 11. Rancangan REST API

### Public API

| Method | Endpoint              | Fungsi                    |
| ------ | --------------------- | ------------------------- |
| GET    | `/api/services`       | Menampilkan jenis layanan |
| POST   | `/api/queues`         | Mengambil nomor antrean   |
| GET    | `/api/queues/:number` | Melihat status antrean    |
| DELETE | `/api/queues/:number` | Membatalkan antrean       |
| GET    | `/api/current-queue`  | Melihat nomor aktif       |
| GET    | `/api/statistics`     | Melihat statistik antrean |

### Admin API

| Method | Endpoint                       | Fungsi                |
| ------ | ------------------------------ | --------------------- |
| POST   | `/api/admin/login`             | Login admin           |
| GET    | `/api/admin/queues`            | Melihat semua antrean |
| PATCH  | `/api/admin/queues/:id/call`   | Memanggil antrean     |
| PATCH  | `/api/admin/queues/:id/finish` | Menyelesaikan antrean |
| PATCH  | `/api/admin/queues/:id/cancel` | Membatalkan antrean   |

### System API

| Method | Endpoint           | Fungsi                         |
| ------ | ------------------ | ------------------------------ |
| GET    | `/api/health`      | Mengecek status server         |
| GET    | `/api/server-info` | Menampilkan informasi instance |
| GET    | `/api/logs`        | Menampilkan log sederhana      |

## 12. Contoh Respons Server Info

```json
{
  "status": "online",
  "instance": "app2",
  "port": 3002,
  "hostname": "server-penjagamalam",
  "pid": 24180,
  "timestamp": "2026-07-22T01:20:00.000Z"
}
```

Endpoint ini digunakan untuk membuktikan bahwa request diproses oleh instance berbeda.

## 13. Konfigurasi Instance PM2

Contoh rancangan `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "app1",
      script: "./server.js",
      env: {
        PORT: 3001,
        INSTANCE_NAME: "app1",
      },
    },
    {
      name: "app2",
      script: "./server.js",
      env: {
        PORT: 3002,
        INSTANCE_NAME: "app2",
      },
    },
    {
      name: "app3",
      script: "./server.js",
      env: {
        PORT: 3003,
        INSTANCE_NAME: "app3",
      },
    },
  ],
};
```

## 14. Konfigurasi Load Balancer Nginx

```nginx
upstream queue_backend {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://queue_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 15. Fungsi Redis

Redis dapat digunakan untuk:

- Menyimpan cache nomor antrean aktif.
- Menyimpan session login admin.
- Menyimpan penghitung antrean.
- Mengirim notifikasi melalui Pub/Sub.
- Menyinkronkan pembaruan antar-instance.
- Mengurangi akses berulang ke database utama.

Pada rancangan final, Redis diposisikan sebagai komponen inti koordinasi antar-instance (lihat Bagian 24), namun tetap tidak menggantikan database utama sebagai sumber kebenaran yang persisten.

## 16. Rancangan Struktur Folder

```text
distributed-queue-system/
|
+-- public/
|   +-- css/
|   |   +-- style.css
|   +-- js/
|   |   +-- app.js
|   +-- images/
|   +-- index.html
|   +-- queue.html
|   +-- status.html
|   +-- admin.html
|
+-- src/
|   +-- config/
|   |   +-- database.js
|   |   +-- redis.js
|   +-- controllers/
|   |   +-- queueController.js
|   |   +-- adminController.js
|   |   +-- systemController.js
|   +-- middleware/
|   |   +-- authMiddleware.js
|   |   +-- requestLogger.js
|   +-- models/
|   |   +-- Queue.js
|   |   +-- User.js
|   |   +-- Service.js
|   +-- routes/
|   |   +-- queueRoutes.js
|   |   +-- adminRoutes.js
|   |   +-- systemRoutes.js
|   +-- services/
|       +-- queueService.js
|       +-- redisService.js
|
+-- logs/
+-- .env
+-- .gitignore
+-- ecosystem.config.js
+-- server.js
+-- package.json
+-- README.md
```

## 17. Tahapan Implementasi

### Tahap 1: Persiapan Proyek

- Membuat repository GitHub.
- Membuat project Node.js.
- Menginstal Express.js.
- Membuat struktur folder.
- Menyiapkan environment variable.

### Tahap 2: Database

- Membuat database.
- Membuat tabel users, services, queues, dan admins.
- Membuat koneksi backend ke database.
- Menguji operasi CRUD.

### Tahap 3: Backend

- Membuat endpoint layanan.
- Membuat endpoint antrean.
- Membuat endpoint admin.
- Membuat endpoint health.
- Membuat endpoint server-info.
- Menambahkan request logger.

### Tahap 4: Frontend

- Membuat halaman beranda.
- Membuat halaman pengambilan antrean.
- Membuat halaman status antrean.
- Membuat halaman login admin.
- Membuat dashboard admin.
- Membuat halaman monitoring.

### Tahap 5: Multi-instance

- Membuat `ecosystem.config.js`.
- Menjalankan app1, app2, dan app3.
- Mengecek status menggunakan PM2.

### Tahap 6: Load Balancing

- Membuat konfigurasi Nginx.
- Menguji pembagian request.
- Mengakses endpoint server-info berulang kali.

### Tahap 7: Fault Tolerance

- Menghentikan salah satu instance.
- Memastikan web tetap berjalan.
- Mengaktifkan kembali instance.

### Tahap 8: Redis

- Menginstal Redis.
- Membuat koneksi Redis.
- Menambahkan cache atau Pub/Sub.
- Menguji sinkronisasi antar-instance.

## 18. Skenario Pengujian

## 18.1 Pengujian Fungsional

- Pengguna dapat mengambil antrean.
- Nomor antrean tersimpan di database.
- Admin dapat memanggil antrean.
- Status antrean berubah.
- Pengguna dapat melihat status terbaru.

## 18.2 Pengujian Load Balancing

Akses endpoint berikut berulang kali:

```text
/api/server-info
```

Hasil yang diharapkan:

```text
Request 1 -> app1
Request 2 -> app2
Request 3 -> app3
Request 4 -> app1
```

## 18.3 Pengujian Shared Data

1. Membuat antrean melalui `app1`.
2. Membaca antrean melalui `app2`.
3. Mengubah status melalui `app3`.
4. Memastikan seluruh instance menampilkan data yang sama.

## 18.4 Pengujian Fault Tolerance

Hentikan salah satu aplikasi:

```bash
pm2 stop app2
```

Kemudian akses web kembali. Sistem harus tetap berjalan melalui `app1` dan `app3`.

Aktifkan kembali:

```bash
pm2 restart app2
```

## 18.5 Pengujian Log

Jalankan:

```bash
pm2 logs
```

Contoh hasil:

```text
app1 | GET /api/services
app2 | POST /api/queues
app3 | GET /api/server-info
```

## 19. Bukti yang Ditampilkan Saat Asistensi

Saat asistensi, tampilkan:

1. Web antrean berjalan.
2. Diagram arsitektur.
3. Hasil `pm2 list`.
4. Tiga instance berstatus online.
5. Endpoint `/api/server-info`.
6. Pergantian app1, app2, dan app3.
7. Data yang sama dapat diakses dari instance berbeda.
8. Salah satu instance dihentikan.
9. Web tetap berjalan.
10. Hasil `pm2 logs`.
11. Konfigurasi Nginx.
12. Struktur database.
13. Redis apabila sudah diterapkan.

## 20. Skenario Demo Asistensi

Urutan demonstrasi:

1. Buka halaman web.
2. Ambil satu nomor antrean.
3. Tampilkan data antrean pada dashboard admin.
4. Tampilkan `pm2 list`.
5. Refresh halaman monitoring beberapa kali.
6. Tunjukkan request berpindah antar-instance.
7. Matikan `app2`.
8. Refresh web dan buktikan tetap berjalan.
9. Aktifkan kembali `app2`.
10. Tampilkan `pm2 logs`.

## 21. Target Versi Minimum

Versi minimum proyek harus memiliki:

- Web pengguna.
- Dashboard admin.
- CRUD antrean.
- Database bersama.
- Tiga instance Node.js.
- PM2.
- Nginx load balancing.
- Endpoint health.
- Endpoint server-info.
- Request logging.
- Demonstrasi fault tolerance.

## 22. Fitur Pengembangan

Fitur tambahan yang dapat dikembangkan:

- Redis cache.
- Redis Pub/Sub.
- Notifikasi realtime.
- QR Code antrean.
- Prediksi waktu tunggu.
- Grafik statistik.
- Riwayat antrean.
- Export CSV.
- Role petugas.
- Integrasi email atau WhatsApp.
- Deployment pada beberapa VM berbeda.

## 23. Konsistensi Data dan Penanganan Race Condition

Karena tiga instance backend (`app1`, `app2`, `app3`) menulis ke satu database yang sama secara bersamaan, sistem menghadapi persoalan konsistensi data yang khas pada sistem terdistribusi. Bagian ini menjelaskan risiko tersebut dan strategi penanganannya.

### 23.1 Masalah: Race Condition pada Nomor Antrean

Ketika dua pengguna mengambil antrean pada layanan yang sama dalam waktu hampir bersamaan, dua instance yang berbeda dapat membaca nilai nomor terakhir yang sama, lalu menuliskan nomor berikutnya yang sama pula. Akibatnya muncul **nomor antrean ganda**.

Ilustrasi race condition:

```text
Waktu   app1                        app3
t0      Baca MAX(number) = 15
t1                                  Baca MAX(number) = 15
t2      Tulis number = 16
t3                                  Tulis number = 16   <-- duplikat
```

### 23.2 Strategi Penanganan

Sistem menerapkan pertahanan berlapis (defense in depth):

1. **Atomic counter pada Redis**  
   Nomor antrean tidak dihitung dengan `MAX(number) + 1`, melainkan menggunakan operasi atomik Redis `INCR`. Redis menjamin setiap pemanggilan menghasilkan nilai unik meskipun dipanggil oleh instance berbeda secara paralel.

   ```text
   INCR queue:counter:administrasi  -> 16
   INCR queue:counter:administrasi  -> 17
   ```

2. **Transaksi database dengan penguncian baris**  
   Ketika Redis tidak tersedia (mode fallback), pembuatan antrean dibungkus transaksi dan menggunakan `SELECT ... FOR UPDATE` agar hanya satu instance yang memproses penomoran pada satu waktu.

3. **Unique constraint sebagai jaring pengaman**  
   Tabel `queues` diberi batasan unik pada kombinasi `(service_id, queue_number)` sehingga penyimpanan nomor ganda ditolak di level database.

### 23.3 Trade-off Konsistensi (CAP Theorem)

Mengacu pada CAP theorem, sebuah sistem terdistribusi tidak dapat menjamin Consistency, Availability, dan Partition tolerance secara bersamaan. Sistem ini secara sadar memilih prioritas berikut:

| Prioritas           | Pilihan    | Alasan                                             |
| ------------------- | ---------- | -------------------------------------------------- |
| Consistency         | Diutamakan | Nomor antrean harus unik dan berurutan             |
| Availability        | Sedang     | Layanan tetap jalan selama sebagian instance hidup |
| Partition tolerance | Terbatas   | Database dan Redis bersifat terpusat               |

Dengan kata lain, sistem ini mengarah ke karakteristik **CP (Consistency + Partition tolerance pada layer aplikasi)** dengan mengorbankan ketersediaan penuh pada layer data. Pilihan ini sesuai untuk domain antrean, di mana kebenaran data lebih penting daripada ketersediaan mutlak.

## 24. Redis sebagai Komponen Inti

Berbeda dari posisi awal yang menempatkan Redis sebagai fitur tambahan, pada rancangan final Redis dinaikkan menjadi **komponen inti koordinasi antar-instance**. Redis-lah yang membedakan sistem ini dari sekadar replikasi aplikasi biasa menjadi sistem dengan koordinasi state bersama yang nyata.

### 24.1 Peran Inti Redis

| Peran                           | Mekanisme Redis      | Manfaat Terdistribusi                    |
| ------------------------------- | -------------------- | ---------------------------------------- |
| Penomoran antrean atomik        | `INCR`               | Mencegah nomor ganda antar-instance      |
| Session admin bersama           | Key-value dengan TTL | Login tetap valid di instance mana pun   |
| Cache nomor aktif dan statistik | `GET`/`SET`          | Mengurangi beban database terpusat       |
| Sinkronisasi realtime           | Pub/Sub              | Semua instance menerima pembaruan status |

### 24.2 Session Bersama (Mengatasi Sticky Session)

Jika session admin disimpan di memori masing-masing instance, pengguna yang login melalui `app1` akan dianggap belum login saat request berikutnya diarahkan ke `app2`. Dengan menyimpan session di Redis, seluruh instance berbagi state autentikasi yang sama sehingga load balancer tidak perlu mengikat pengguna ke satu instance tertentu.

```text
Login di app1  -> simpan session ke Redis (key: sess:<token>)
Request di app2 -> baca session dari Redis -> terautentikasi
```

### 24.3 Sinkronisasi Realtime dengan Pub/Sub

Ketika admin memanggil antrean melalui salah satu instance, instance tersebut mempublikasikan pesan ke channel Redis. Seluruh instance yang berlangganan channel tersebut menerima pembaruan dan meneruskannya ke klien (misalnya melalui WebSocket atau Server-Sent Events), sehingga papan "nomor dipanggil" ter-update serentak.

```text
app3  --PUBLISH queue:called {A016}-->  Redis
Redis --broadcast--> app1, app2, app3  --> klien
```

### 24.4 Catatan

Redis tetap tidak menggantikan database utama sebagai sumber kebenaran (source of truth) yang persisten. Redis berperan sebagai lapisan koordinasi dan percepatan; data permanen tetap disimpan di MySQL/PostgreSQL.

## 25. Limitasi Sistem dan Single Point of Failure

Sebagai bentuk kesadaran terhadap trade-off rekayasa, bagian ini memaparkan keterbatasan sistem secara jujur. Menyebutkan limitasi tidak mengurangi nilai proyek, melainkan menunjukkan pemahaman terhadap karakteristik sistem terdistribusi.

### 25.1 Titik Kegagalan Tunggal (SPOF)

| Komponen              | Status                    | Dampak jika Gagal                | Mitigasi yang Mungkin              |
| --------------------- | ------------------------- | -------------------------------- | ---------------------------------- |
| Database terpusat     | SPOF                      | Seluruh layanan berhenti         | Replikasi master–replica, failover |
| Nginx (load balancer) | SPOF                      | Semua request gagal masuk        | Nginx ganda + keepalived/VIP       |
| Redis                 | SPOF (jika untuk session) | Login dan sinkronisasi terganggu | Redis Sentinel atau cluster        |
| Instance backend      | Bukan SPOF                | Ditangani instance lain          | Sudah teratasi oleh multi-instance |

### 25.2 Batasan Cakupan

- Fault tolerance yang dibuktikan berada pada **layer aplikasi** (mematikan satu instance backend), bukan pada layer data.
- Load balancing default menggunakan metode `round-robin`; distribusi belum mempertimbangkan beban aktual tiap instance.
- Nginx open-source tidak otomatis mengeluarkan instance yang mati kecuali dikonfigurasi dengan `max_fails` dan `fail_timeout`.
- Sistem berjalan pada satu VM; klaim "terdistribusi" berada pada level proses, bukan level geografis multi-node.

### 25.3 Arah Peningkatan

Limitasi di atas dapat dikurangi secara bertahap melalui: replikasi database, penggandaan Nginx, Redis Sentinel, health check aktif pada endpoint `/api/health`, serta penyebaran instance ke beberapa VM yang berbeda.

## 26. Kesimpulan

Sistem Antrean Layanan Kampus Terdistribusi merupakan aplikasi web yang menggabungkan fungsi antrean digital dengan implementasi konsep sistem terdistribusi. Sistem menggunakan beberapa instance backend, load balancing, database bersama, koordinasi state melalui Redis, logging, dan pengujian fault tolerance.

Produk utama proyek adalah web antrean, sedangkan bukti bahwa sistem menerapkan konsep terdistribusi ditunjukkan melalui:

```text
Multi-instance
+ Load balancing
+ Shared data
+ Koordinasi antar-instance (Redis)
+ Konsistensi data dan penanganan race condition
+ Fault tolerance
+ Request logging
```

Dengan memperhitungkan konsistensi data, koordinasi antar-instance, serta kesadaran terhadap limitasi dan titik kegagalan tunggal, rancangan ini tidak hanya mendemonstrasikan penskalaan horizontal, tetapi juga menunjukkan pemahaman menyeluruh terhadap trade-off dalam perancangan sistem terdistribusi.
