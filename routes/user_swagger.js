const userPaths = {
    "/register": {
        "post": {
            "tags": ["Authentication"],
            "summary": "Registrasi user baru (Akan mengirimkan OTP ke WhatsApp)",
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "nama": { "type": "string", "example": "Dwi Ramadhan" },
                                "email": { "type": "string", "example": "dwi@microdata.com" },
                                "no_wa": { "type": "string", "example": "081234567890" },
                                "password": { "type": "string", "example": "rahasia123" }
                            },
                            "required": ["nama", "email", "no_wa", "password"]
                        }
                    }
                }
            },
            "responses": {
                "201": { "description": "User berhasil dibuat dan OTP terkirim ke WhatsApp" },
                "400": { "description": "Email sudah terdaftar atau data tidak lengkap" },
                "500": { "description": "Internal Server Error" }
            }
        }
    },
    "/verify-otp": {
        "post": {
            "tags": ["Authentication"],
            "summary": "Verifikasi akun menggunakan kode OTP WhatsApp",
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "email": { "type": "string", "example": "dwi@microdata.com" },
                                "otp": { "type": "string", "example": "123456" }
                            },
                            "required": ["email", "otp"]
                        }
                    }
                }
            },
            "responses": {
                "200": { "description": "Verifikasi berhasil, akun aktif" },
                "400": { "description": "Kode OTP salah atau akun sudah diverifikasi" },
                "500": { "description": "Internal Server Error" }
            }
        }
    },
    "/login": {
        "post": {
            "tags": ["Authentication"],
            "summary": "Login user",
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "email": { "type": "string", "example": "dwi@microdata.com" },
                                "password": { "type": "string", "example": "rahasia123" }
                            },
                            "required": ["email", "password"]
                        }
                    }
                }
            },
            "responses": {
                "200": { "description": "Login Berhasil" },
                "401": { "description": "Password salah" },
                "403": { "description": "Akun belum diverifikasi (OTP)" },
                "404": { "description": "Email tidak ditemukan" }
            }
        }
    },
    "/refresh-token": {
        "post": {
            "tags": ["Authentication"],
            "summary": "Refresh access token",
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "refreshToken": { "type": "string" }
                            }
                        }
                    }
                }
            },
            "responses": {
                "200": { "description": "Token berhasil diperbarui" },
                "401": { "description": "Refresh token kosong" },
                "403": { "description": "Refresh token tidak valid / expired" }
            }
        }
    },
    "/users": {
        "get": {
            "tags": ["Kelola Pengguna"],
            "summary": "Mengambil daftar semua pengguna (Khusus Admin)",
            "security": [{ "bearerAuth": [] }],
            "responses": {
                "200": { "description": "Berhasil mengambil data pengguna" },
                "500": { "description": "Internal Server Error" }
            }
        }
    }
};

module.exports = userPaths;