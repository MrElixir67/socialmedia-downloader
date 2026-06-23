# Social Media Downloader

Download video/audio dari berbagai platform sosial media seperti TikTok, YouTube, Instagram, Reddit, Facebook, dan lainnya.

🌐 **Live demo:** [download.elixia.my.id](https://download.elixia.my.id)

## Fitur

-   Scan link video untuk melihat info (judul, durasi, thumbnail)
-   Download video MP4 atau audio MP3
-   Progress bar real-time via SSE (Server-Sent Events)
-   Rate limiting untuk keamanan
-   Auto-cleanup file setelah didownload
-   Upload cookies.txt untuk konten terbatas/private

## Cara Pakai

1.  Install dependencies:

```bash
pip install -r backend/requirements.txt
```

2.  Jalankan server:

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

3.  Buka browser ke `http://localhost:8000`

## Penting

**Tidak ada data yang disimpan ke server.** Semua file yang didownload disimpan sementara di folder temp dan langsung dihapus setelah berhasil diunduh oleh pengguna. Tidak ada database, tidak ada log aktivitas, tidak ada tracking.

## Lisensi

MIT License - lihat file [LICENSE](LICENSE).
