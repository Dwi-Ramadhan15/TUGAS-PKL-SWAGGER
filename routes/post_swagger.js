const postPaths = {
    "/posts": {
        "get": {
            "tags": ["Kelola Postingan"],
            "summary": "Pagination buat atur limit",
            "parameters": [{
                    "name": "page",
                    "in": "query",
                    "required": false,
                    "schema": { "type": "integer", "default": 1 },
                    "description": "halaman yang mau dibuka)"
                },
                {
                    "name": "limit",
                    "in": "query",
                    "required": false,
                    "schema": { "type": "integer", "default": 6 },
                    "description": "Batas jumlah data yang ditampilkan per halaman"
                },
                {
                    "name": "search",
                    "in": "query",
                    "required": false,
                    "schema": { "type": "string" },
                    "description": "Kata kunci pencarian judul atau kategori"
                }
            ],
            "responses": {
                "200": { "description": "Berhasil mengambil data" },
                "500": { "description": "Internal Server Error" }
            }
        },
        "post": {
            "tags": ["Kelola Postingan"],
            "summary": "Membuat postingan baru",
            "security": [{ "bearerAuth": [] }],
            "requestBody": {
                "required": true,
                "content": {
                    "multipart/form-data": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "judul": { "type": "string" },
                                "isi": { "type": "string" },
                                "category_id": { "type": "integer", "description": "ID Kategori (Contoh: 1)" },
                                "gambar": { "type": "string", "format": "binary" }
                            },
                            "required": ["judul", "isi", "category_id", "gambar"]
                        }
                    }
                }
            },
            "responses": {
                "201": { "description": "Postingan berhasil dibuat" },
                "400": { "description": "Data tidak lengkap" },
                "500": { "description": "Internal Server Error" }
            }
        }
    },
    // INI ENDPOINT BARU UNTUK FITUR SLUG
    "/posts/slug/{slug}": {
        "get": {
            "tags": ["Kelola Postingan"],
            "summary": "Melihat detail postingan berdasarkan Slug (URL Judul)",
            "parameters": [{
                "name": "slug",
                "in": "path",
                "required": true,
                "schema": { "type": "string" },
                "description": "Slug/URL dari postingan (Contoh: juara-1-lomba)"
            }],
            "responses": {
                "200": { "description": "Data ditemukan" },
                "404": { "description": "Data tidak ditemukan" },
                "500": { "description": "Internal Server Error" }
            }
        }
    },
    "/posts/{id}": {
        "get": {
            "tags": ["Kelola Postingan"],
            "summary": "Melihat postingan berdasarkan ID",
            "parameters": [
                { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
            ],
            "responses": {
                "200": { "description": "Data ditemukan" },
                "404": { "description": "Data tidak ditemukan" },
                "500": { "description": "Internal Server Error" }
            }
        },
        "put": {
            "tags": ["Kelola Postingan"],
            "summary": "Mengedit postingan",
            "security": [{ "bearerAuth": [] }],
            "parameters": [
                { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
            ],
            "requestBody": {
                "required": true,
                "content": {
                    "multipart/form-data": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "judul": { "type": "string" },
                                "isi": { "type": "string" },
                                "category_id": { "type": "integer", "description": "ID Kategori (Contoh: 1)" },
                                "gambar": { "type": "string", "format": "binary" }
                            },
                            "required": ["judul", "isi", "category_id"]
                        }
                    }
                }
            },
            "responses": {
                "200": { "description": "Postingan berhasil diedit" },
                "400": { "description": "Data tidak lengkap" },
                "404": { "description": "Data tidak ditemukan" },
                "500": { "description": "Internal Server Error" }
            }
        },
        "delete": {
            "tags": ["Kelola Postingan"],
            "summary": "Menghapus postingan",
            "security": [{ "bearerAuth": [] }],
            "parameters": [
                { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
            ],
            "responses": {
                "200": { "description": "Postingan berhasil dihapus" },
                "404": { "description": "Data tidak ditemukan" },
                "500": { "description": "Internal Server Error" }
            }
        }
    }
};

module.exports = postPaths;