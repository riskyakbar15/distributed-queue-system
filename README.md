# Sistem Antrean Layanan Kampus Terdistribusi

Aplikasi web antrean layanan kampus yang menerapkan konsep sistem terdistribusi:
multi-instance backend, load balancing, database bersama, koordinasi antar-instance
melalui Redis, request logging, dan fault tolerance.

> Dokumen rancangan lengkap ada di
> [README_Rancangan_Sistem_Antrean_Terdistribusi.md](README_Rancangan_Sistem_Antrean_Terdistribusi.md).

## Teknologi

- Backend: Node.js + Express
- Database: PostgreSQL (`pg`)
- Cache / koordinasi: Redis (`ioredis`) — `INCR` nomor antrean, session, Pub/Sub
- Realtime: Socket.IO + `@socket.io/redis-adapter`
- Session admin: `express-session` + `connect-redis` (bcryptjs untuk password)
- Process manager: PM2
- Load balancer: Nginx

## Prasyarat

- Node.js 18+ (diuji pada Node 24)
- PostgreSQL berjalan dan dapat diakses
- Redis berjalan
- PM2 dan Nginx (untuk multi-instance + load balancing)

## Instalasi

```bash
npm install
cp .env.example .env   # sesuaikan kredensial DB & Redis
```

Buat database lalu inisialisasi skema + akun admin:

```bash
# buat database (contoh)
createdb queue_db

# jalankan skema + seed admin (admin / admin123)
npm run db:init
```

## Menjalankan

### Satu instance (pengembangan)

```bash
npm start          # PORT dan INSTANCE_NAME dari .env
```

Akses: [http://localhost:3001]

### Tiga instance via PM2 (produksi/demo)

```bash
npm run pm2:start  # menjalankan app1:3001, app2:3002, app3:3003
pm2 list
npm run pm2:logs
```

### Load balancer Nginx

Gunakan konfigurasi [nginx/queue.conf](nginx/queue.conf) (round-robin +
`max_fails`/`fail_timeout` + dukungan WebSocket). Setelah aktif, akses melalui
port 80 dan request akan dibagi ke ketiga instance.

## Menjalankan dengan Docker Compose

Alternatif tercepat: seluruh sistem (PostgreSQL + Redis + 3 instance + Caddy
sebagai reverse proxy/load balancer) dijalankan dengan satu perintah. Tidak
perlu memasang Node, PostgreSQL, Redis, atau proxy secara manual.

```bash
docker compose up --build
```

Akses [http://localhost](http://localhost). Skema database dan akun admin
(`admin` / `admin123`) di-seed otomatis saat pertama kali dijalankan.

```bash
# instance bergantian
curl http://localhost/api/server-info

# fault tolerance
docker compose stop app2
docker compose start app2

# hentikan & bersihkan (termasuk data)
docker compose down -v
```

### HTTPS otomatis (produksi)

Caddy dapat menerbitkan sertifikat Let's Encrypt secara otomatis. Arahkan sebuah
domain ke IP server, lalu set `SITE_ADDRESS` (dan `ACME_EMAIL` opsional) sebelum
menjalankan. Cara termudah: buat berkas `.env` di folder proyek.

```bash
# .env
SITE_ADDRESS=namamu.duckdns.org
ACME_EMAIL=email@anda.com
```

```bash
docker compose up -d --build   # Caddy otomatis mengaktifkan HTTPS + redirect 80->443
```

Tanpa `SITE_ADDRESS`, Caddy berjalan HTTP biasa di `:80` (cocok untuk lokal).
Pastikan port 80 dan 443 terbuka di firewall server.


## Struktur

```text
server.js               # entry point tiap instance
schema.sql              # skema database + seed layanan
ecosystem.config.js     # definisi 3 instance PM2
nginx/queue.conf        # konfigurasi load balancer
scripts/initDb.js       # inisialisasi DB + admin
scripts/loadtest.js     # uji race condition penomoran antrean
src/
  app.js                # setup Express (middleware, session, routes)
  config/               # koneksi database & redis
  middleware/           # servedBy, requestLogger, auth
  controllers/          # queue, admin, system
  routes/               # queue, admin, system
  services/             # queueService, redisService
  realtime/socket.js    # Socket.IO + Redis adapter
public/                 # frontend (HTML/CSS/JS)
```

## Endpoint Utama

| Method | Endpoint                                       | Fungsi                                    |
| ------ | ---------------------------------------------- | ----------------------------------------- |
| GET    | `/api/services`                                | Daftar layanan                            |
| POST   | `/api/queues`                                  | Ambil nomor antrean                       |
| GET    | `/api/queues/:number`                          | Status antrean                            |
| DELETE | `/api/queues/:number`                          | Batalkan antrean                          |
| GET    | `/api/current-queue`                           | Nomor yang sedang dipanggil               |
| GET    | `/api/statistics`                              | Statistik antrean                         |
| POST   | `/api/admin/login`                             | Login admin                               |
| GET    | `/api/admin/queues`                            | Semua antrean (admin)                     |
| PATCH  | `/api/admin/queues/:id/{call\|finish\|cancel}` | Aksi admin                                |
| GET    | `/api/health`                                  | Status DB & Redis                         |
| GET    | `/api/server-info`                             | Identitas instance (bukti load balancing) |
| GET    | `/api/logs`                                    | Log request instance                      |

Setiap respons menyertakan field `servedBy` dan header `X-Served-By` yang
menunjukkan instance yang memproses request.

## Pengujian Terdistribusi

```bash
# Bukti load balancing: instance bergantian
curl http://localhost/api/server-info

# Uji race condition penomoran (butuh Nginx + 3 instance aktif)
node scripts/loadtest.js 100 http://localhost

# Fault tolerance
pm2 stop app2      # web tetap berjalan via app1 & app3
pm2 restart app2
```

## Halaman

- `/` — beranda (nomor dipanggil, statistik, layanan)
- `/queue.html` — ambil antrean
- `/status.html` — cek status antrean
- `/admin.html` — login + dashboard petugas
- `/monitoring.html` — monitoring instance & log realtime
