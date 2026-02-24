const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');
require('dotenv').config();

const register = async(req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await argon2.hash(password);
        const result = await UserModel.createUser(email, hashedPassword);
        res.status(201).json({ message: 'User berhasil dibuat nih!', user: result.rows[0] });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        const result = await UserModel.getUserByEmail(email);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Email nggak ketemu cuy!' });

        const user = result.rows[0];
        const isMatch = await argon2.verify(user.password, password);
        if (!isMatch) return res.status(401).json({ message: 'Passwordnya salah tuh!' });

        // UBAH DUA BARIS INI:
        const accessToken = jwt.sign({ userId: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        await UserModel.updateRefreshToken(refreshToken, user.id);
        res.json({ message: 'Login Berhasil!', accessToken, refreshToken });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
const refreshToken = async(req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token tidak boleh kosong!' });
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Refresh token tidak valid atau sudah expired!' });

            const accessToken = jwt.sign({ userId: decoded.userId, email: decoded.email },
                process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' }
            );

            res.json({
                message: 'Access Token baru berhasil dibuat!',
                accessToken
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { register, login, refreshToken };