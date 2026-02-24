const categoryPaths = {
    "/categories": {
        "get": {
            "tags": ["Kelola Kategori"],
            "summary": "Melihat semua kategori",
            "responses": {
                "200": { "description": "Berhasil mengambil data kategori" }
            }
        },
        "post": {
            "tags": ["Kelola Kategori"],
            "summary": "Membuat kategori baru",
            "security": [{ "bearerAuth": [] }],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "nama_kategori": {
                                    "type": "string",
                                    "example": "Pengumuman Akademik"
                                }
                            }
                        }
                    }
                }
            },
            "responses": {
                "201": { "description": "Kategori berhasil dibuat" },
                "400": { "description": "Validasi error (nama_kategori kosong/kurang panjang)" }
            }
        }
    },
    "/categories/{id}": {
        "get": {
            "tags": ["Kelola Kategori"],
            "summary": "Melihat kategori berdasarkan ID",
            "parameters": [
                { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
            ],
            "responses": {
                "200": { "description": "Data kategori ditemukan" },
                "404": { "description": "Kategori tidak ditemukan" }
            }
        },
        "put": {
            "tags": ["Kelola Kategori"],
            "summary": "Mengedit kategori",
            "security": [{ "bearerAuth": [] }],
            "parameters": [
                { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
            ],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "nama_kategori": {
                                    "type": "string",
                                    "example": "Kegiatan Mahasiswa"
                                }
                            }
                        }
                    }
                }
            },
            "responses": {
                "200": { "description": "Kategori berhasil diedit" }
            }
        },
        "delete": {
            "tags": ["Kelola Kategori"],
            "summary": "Menghapus kategori",
            "security": [{ "bearerAuth": [] }],
            "parameters": [
                { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
            ],
            "responses": {
                "200": { "description": "Kategori berhasil dihapus" }
            }
        }
    }
};

module.exports = categoryPaths;