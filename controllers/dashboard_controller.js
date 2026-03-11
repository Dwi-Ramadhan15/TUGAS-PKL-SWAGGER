const pool = require('../config/db');

const getAnalytics = async(req, res) => {
    try {
        // Tambahkan tangkapan parameter 'limit'
        const { filter, sort, limit } = req.query;

        const orderDirection = sort === 'tersedikit' ? 'ASC' : 'DESC';
        // JIKA limit=all (untuk export), hilangkan LIMIT. Jika tidak, batasi 7 untuk grafik.
        const limitClause = limit === 'all' ? '' : 'LIMIT 7';

        if (filter === 'semua' || !filter) {
            const query = `
                SELECT judul as name, views 
                FROM posts 
                ORDER BY views ${orderDirection} 
                ${limitClause};
            `;
            const result = await pool.query(query);
            return res.json({ status: "success", data: result.rows });
        }

        let dateCondition = "";
        if (filter === 'hari') dateCondition = "WHERE v.viewed_at >= NOW() - INTERVAL '1 day'";
        else if (filter === 'minggu') dateCondition = "WHERE v.viewed_at >= NOW() - INTERVAL '1 week'";
        else if (filter === 'bulan') dateCondition = "WHERE v.viewed_at >= NOW() - INTERVAL '1 month'";

        const query = `
            SELECT p.judul as name, COUNT(v.id) as views
            FROM posts p
            LEFT JOIN post_views v ON p.id = v.post_id
            ${dateCondition}
            GROUP BY p.id
            ORDER BY views ${orderDirection}
            ${limitClause};
        `;
        const result = await pool.query(query);
        res.json({ status: "success", data: result.rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getNotifications = async(req, res) => {
    try {
        const result = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10');
        res.json({ status: "success", data: result.rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const markReadNotifications = async(req, res) => {
    try {
        await pool.query('UPDATE notifications SET is_read = true WHERE is_read = false');
        res.json({ status: "success", message: "Semua notifikasi ditandai dibaca" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getAnalytics, getNotifications, markReadNotifications };