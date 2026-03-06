const pool = require('../config/db');

// buat atur pasang limit dan offset buat pagination, plus search
const getAllPosts = async(limit, offset, search = '') => {
    const searchParam = `%${search}%`;

    // 1. Ambil datanya dibatasi limit 
    // Di dalam getAllPosts, ubah bagian COUNT-nya jadi seperti ini:
    const dataQuery = `
            SELECT posts.*, categories.nama_kategori, 
                (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id AND comments.is_read = FALSE)::INTEGER AS comment_count,
                (SELECT COALESCE(ROUND(AVG(rating), 1), 0) FROM comments WHERE comments.post_id = posts.id) AS avg_rating
            FROM posts 
            LEFT JOIN categories ON posts.category_id = categories.id 
            WHERE posts.judul ILIKE $1 OR categories.nama_kategori ILIKE $1
            ORDER BY posts.id DESC
            LIMIT $2 OFFSET $3
        `;
    const { rows } = await pool.query(dataQuery, [searchParam, limit, offset]);

    // 2. Hitung total KESELURUHAN data untuk bikin angka pagination
    const countQuery = `
        SELECT COUNT(*) 
        FROM posts 
        LEFT JOIN categories ON posts.category_id = categories.id 
        WHERE posts.judul ILIKE $1 OR categories.nama_kategori ILIKE $1
    `;
    const { rows: countRows } = await pool.query(countQuery, [searchParam]);
    const totalItems = parseInt(countRows[0].count, 10);

    return { rows, totalItems };
};

const getPostById = async(id) => {
    return await pool.query(`
        SELECT posts.*, categories.nama_kategori 
        FROM posts 
        LEFT JOIN categories ON posts.category_id = categories.id 
        WHERE posts.id = $1
    `, [id]);
};

const getPostBySlug = async(slug) => {
    return await pool.query(`
        SELECT posts.*, categories.nama_kategori 
        FROM posts 
        LEFT JOIN categories ON posts.category_id = categories.id 
        WHERE posts.slug = $1
    `, [slug]);
};

const createPost = async(judul, isi, gambar, category_id, slug) => {
    return await pool.query(
        'INSERT INTO posts (judul, isi, gambar, category_id, slug) VALUES ($1, $2, $3, $4, $5) RETURNING *', [judul, isi, gambar, category_id, slug]
    );
};

const updatePost = async(id, judul, isi, gambar, category_id, slug) => {
    const query = `
        UPDATE posts 
        SET judul = $2, 
            isi = $3, 
            gambar = COALESCE(NULLIF($4, ''), gambar), 
            category_id = $5,
            slug = $6
        WHERE id = $1 
        RETURNING *`;
    const values = [id, judul, isi, gambar, category_id, slug];
    return await pool.query(query, values);
};

const deletePost = async(id) => {
    return await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);
};

const getComments = async(postId) => {
    return await pool.query(`
        SELECT comments.*, users.email AS nama 
        FROM comments 
        JOIN users ON comments.user_id = users.id 
        WHERE comments.post_id = $1 
        ORDER BY comments.created_at DESC
    `, [postId]);
};

const addComment = async(postId, userId, komentar, rating) => {
    // INI YANG DIUBAH: Menambahkan is_read dan FALSE
    return await pool.query(
        'INSERT INTO comments (post_id, user_id, komentar, rating, is_read) VALUES ($1, $2, $3, $4, FALSE) RETURNING *', [postId, userId, komentar, rating]
    );
};

const deleteComment = async(id) => {
    return await pool.query('DELETE FROM comments WHERE id = $1 RETURNING *', [id]);
};

// Fungsi untuk menandai komentar sudah dibaca
const markCommentsAsRead = async(postId) => {
    return await pool.query(
        'UPDATE comments SET is_read = TRUE WHERE post_id = $1', [postId]
    );
};

module.exports = { getAllPosts, getPostById, getPostBySlug, createPost, updatePost, deletePost, getComments, addComment, deleteComment, markCommentsAsRead };