const pool = require('../config/db');

const createUser = async(nama, email, hashedPassword, no_wa, otp) => {
    return await pool.query(
        'INSERT INTO users (nama, email, password, no_wa, otp, is_verified) VALUES ($1, $2, $3, $4, $5, false) RETURNING id, nama, email', [nama, email, hashedPassword, no_wa, otp]
    );
};

const getUserByEmail = async(email) => {
    return await pool.query(
        'SELECT id, nama, email, password, role, is_verified, is_blocked, no_wa FROM users WHERE email = $1', [email]
    );
};

const updateRefreshToken = async(refreshToken, userId) => {
    return await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, userId]);
};

// Untuk cek OTP dan ubah is_verified jadi true
const verifyUserOTP = async(email, otp) => {
    return await pool.query(
        'UPDATE users SET is_verified = true, otp = NULL WHERE email = $1 AND otp = $2 RETURNING id', [email, otp]
    );
};

const setOTP = async(email, otp) => {
    return await pool.query(
        'UPDATE users SET otp = $1 WHERE email = $2', [otp, email]
    );
};

const resetPassword = async(email, otp, newHashedPassword) => {
    return await pool.query(
        'UPDATE users SET password = $1, otp = NULL WHERE email = $2 AND otp = $3 RETURNING id', [newHashedPassword, email, otp]
    );
};

module.exports = { createUser, getUserByEmail, updateRefreshToken, verifyUserOTP, setOTP, resetPassword };