const pool = require('../config/db');

const createUser = async(email, hashedPassword) => {
    return await pool.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email', [email, hashedPassword]);
};

const getUserByEmail = async(email) => {
    return await pool.query('SELECT * FROM users WHERE email = $1', [email]);
};

const updateRefreshToken = async(refreshToken, userId) => {
    return await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, userId]);
};

module.exports = { createUser, getUserByEmail, updateRefreshToken };