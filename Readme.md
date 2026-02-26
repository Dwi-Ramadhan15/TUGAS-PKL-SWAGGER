# API PKL - Swagger Documentation

Proyek Back-end menggunakan Node.js, Express, dan PostgreSQL.

## A. Persiapan (Setup)

    1. Clone repository ini ke komputer lokal.
    2. Buka terminal di folder proyek dan jalankan perintah `npm install` untuk mengunduh semua dependencies.
    3. Pastikan server database PostgreSQL dan server MinIO sudah berjalan di komputer Anda. 
       - Perintah untuk Install MinIo: `Invoke-WebRequest -Uri "https://dl.min.io/server/minio/release/windows-amd64/minio.exe" -OutFile "minio.exe"`
       - Perintah menjalankan MinIO lokal: `.\minio.exe server .\minio-data --console-address ":9001"`
    4. Buat file `.env` di direktori utama (bisa melihat contoh dari `.env.example`). Pastikan untuk menambahkan konfigurasi domain MinIO:
        ```env
        MINIO_DOMAIN=[http://127.0.0.1:9000](http://127.0.0.1:9000)
    5. Jalankan server dengan `node index.js`.

## B. Fitur

    - Authentication: Register, Login, dan manajemen Refresh Token berbasis JWT.
    - Manajemen Postingan: CRUD (Create, Read, Update, Delete) postingan dan kategori.
    - Image Processing: Otomatis mengubah ukuran gambar (maks 800px) dan mengonversi format ke .webp menggunakan library Sharp untuk optimasi performa.
    - Object Storage: Upload gambar langsung diarahkan ke server MinIO (menggunakan Multer memoryStorage), menjadikan arsitektur server stateless dan hemat penyimpanan lokal.
    - API Documentation: Dokumentasi interaktif yang bisa langsung diuji coba menggunakan Swagger UI melalui endpoint /api-docs.

## C. Teknologi Yang digunakan

    - Node.js & Express.js (Framework Backend)
    - PostgreSQL (Relational Database)
    - MinIO (S3-Compatible Object Storage)
    - Sharp (High-performance Node.js Image Processing)
    - Multer (Middleware handling multipart/form-data)
    - Swagger / OpenAPI (API Documentation)