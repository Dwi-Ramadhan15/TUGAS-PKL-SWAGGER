const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Akses Ditolak! Mana ID Card (Token) kamu?' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token Expired / Tidak Valid! Silakan Login ulang.' });
        req.user = user;
        next();
    });
};

module.exports = verifyToken;