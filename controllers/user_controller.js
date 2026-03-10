const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');
const pool = require('../config/db');
const axios = require('axios');
require('dotenv').config();

const register = async(req, res) => {
    try {
        const { nama, email, password, no_wa } = req.body;

        const cekUser = await UserModel.getUserByEmail(email);
        if (cekUser.rows.length > 0) return res.status(400).json({ message: "Email sudah terdaftar!" });

        const hashedPassword = await argon2.hash(password);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await UserModel.createUser(nama, email, hashedPassword, no_wa, otp);

        const waToken = process.env.FONNTE_TOKEN;
        if (waToken && no_wa) {
            let targetWa = no_wa;
            if (targetWa.startsWith('0')) targetWa = '62' + targetWa.substring(1);

            axios.post('https://api.fonnte.com/send', {
                target: targetWa,
                message: `*Verifikasi D'NEWS*\n\nHalo ${nama},\nKode OTP rahasia Anda adalah: *${otp}*\n\nSilakan masukkan kode ini di halaman website untuk mengaktifkan akun.`,
            }, {
                headers: { Authorization: waToken }
            }).catch(err => console.error("Gagal kirim OTP WA:", err.message));
        }

        res.status(201).json({
            message: 'Akun dibuat. Silakan cek WhatsApp untuk kode OTP!',
            email: email
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const verifyOTP = async(req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: "Email dan OTP wajib diisi!" });

        const result = await UserModel.verifyUserOTP(email, otp);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Kode OTP salah atau akun sudah aktif!" });
        }

        res.json({ message: "Verifikasi berhasil! Silakan login sekarang." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Kirim OTP lupa passworddd
const forgotPassword = async(req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email wajib diisi!" });

        const cekUser = await UserModel.getUserByEmail(email);
        if (cekUser.rows.length === 0) return res.status(404).json({ message: "Email tidak terdaftar!" });

        const user = cekUser.rows[0];
        if (!user.no_wa) return res.status(400).json({ message: "Akun ini tidak memiliki nomor WA. Silakan hubungi Admin." });

        // Buat OTP baru dan simpan ke DB
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await UserModel.setOTP(email, otp);

        // Kirim WA
        const waToken = process.env.FONNTE_TOKEN;
        if (waToken && user.no_wa) {
            let targetWa = user.no_wa;
            if (targetWa.startsWith('0')) targetWa = '62' + targetWa.substring(1);

            axios.post('https://api.fonnte.com/send', {
                target: targetWa,
                message: `*Reset Password D'NEWS*\n\nHalo ${user.nama},\nKode OTP Anda untuk mereset password adalah: *${otp}*\n\nJangan berikan kode ini kepada siapa pun!`,
            }, {
                headers: { Authorization: waToken }
            }).catch(err => console.error("Gagal kirim OTP Reset WA:", err.message));
        }

        res.json({ message: "Kode OTP untuk reset password telah dikirim ke WhatsApp Anda." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const resetPassword = async(req, res) => {
    try {
        const { email, otp, new_password } = req.body;
        if (!email || !otp || !new_password) return res.status(400).json({ message: "Data tidak lengkap!" });

        const hashedPassword = await argon2.hash(new_password);
        const result = await UserModel.resetPassword(email, otp, hashedPassword);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Kode OTP salah atau sudah kadaluarsa!" });
        }

        res.json({ message: "Password berhasil diubah! Silakan login dengan password baru." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        const result = await UserModel.getUserByEmail(email);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Email nggak ketemu cuy!' });

        const user = result.rows[0];
        if (user.is_blocked) {
            return res.status(403).json({ message: 'Sayang sekali, akun Anda telah diblokir oleh Admin! Hubungi admin untuk info lebih lanjut.' });
        }

        if (!user.is_verified) {
            return res.status(403).json({ message: 'Akun belum aktif! Silakan verifikasi OTP WhatsApp terlebih dahulu.' });
        }

        const isMatch = await argon2.verify(user.password, password);
        if (!isMatch) return res.status(401).json({ message: 'Passwordnya salah tuh!' });

        const accessToken = jwt.sign({ userId: user.id, email: user.email, role: user.role },
            process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' }
        );
        const refreshToken = jwt.sign({ userId: user.id, role: user.role },
            process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' }
        );

        await UserModel.updateRefreshToken(refreshToken, user.id);

        res.json({ message: 'Login Berhasil!', accessToken, refreshToken, role: user.role, userId: user.id });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const refreshToken = async(req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ message: 'Refresh token tidak boleh kosong!' });

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Refresh token tidak valid atau sudah expired!' });

            const accessToken = jwt.sign({ userId: decoded.userId, email: decoded.email, role: decoded.role },
                process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' }
            );
            res.json({ message: 'Access Token baru berhasil dibuat!', accessToken });
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getAllUsers = async(req, res) => {
    try {
        const result = await pool.query('SELECT id, nama, email, no_wa, role, is_blocked FROM users ORDER BY role ASC, id DESC');
        res.json({ status: "success", data: result.rows });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data pengguna." });
    }
};

const deleteUser = async(req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'User berhasil dihapus' });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

const blockUser = async(req, res) => {
    try {
        const { id } = req.params;
        const { is_blocked } = req.body;
        await pool.query('UPDATE users SET is_blocked = $1 WHERE id = $2', [is_blocked, id]);
        res.json({ message: 'Status blokir berhasil diubah' });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

module.exports = { register, verifyOTP, login, refreshToken, getAllUsers, deleteUser, blockUser, forgotPassword, resetPassword };