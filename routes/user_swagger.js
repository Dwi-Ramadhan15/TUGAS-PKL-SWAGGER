const userPaths = {
    "/register": {
        "post": {
            "tags": ["Authentication"],
            "summary": "Registrasi user baru",
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "email": { "type": "string", "example": "user@gmail.com" },
                                "password": { "type": "string", "example": "12345678" }
                            }
                        }
                    }
                }
            },
            "responses": { "201": { "description": "User berhasil dibuat" } }
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
                                "email": { "type": "string", "example": "user@gmail.com" },
                                "password": { "type": "string", "example": "12345678" }
                            }
                        }
                    }
                }
            },
            "responses": { "200": { "description": "Login Berhasil" } }
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
            "responses": { "200": { "description": "Token berhasil diperbarui" } }
        }
    }
};

module.exports = userPaths;