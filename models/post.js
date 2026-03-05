const pool = require('../config/db');

// buat atur pasang limit dan offset buat pagination, plus search
const getAllPosts = async(limit, offset, search = '') => {
    const searchParam = `%${search}%`;

    // 1. Ambil datanya dibatasi limit 
    const dataQuery = `
        SELECT posts.*, categories.nama_kategori 
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

module.exports = { getAllPosts, getPostById, getPostBySlug, createPost, updatePost, deletePost };