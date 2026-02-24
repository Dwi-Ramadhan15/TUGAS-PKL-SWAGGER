const pool = require('../config/db');

// Gunakan JOIN agar saat GET POST, nama kategorinya ikut muncul
const getAllPosts = async() => {
    return await pool.query(`
        SELECT posts.*, categories.nama_kategori 
        FROM posts 
        LEFT JOIN categories ON posts.category_id = categories.id 
        ORDER BY posts.id ASC
    `);
};

const getPostById = async(id) => {
    return await pool.query(`
        SELECT posts.*, categories.nama_kategori 
        FROM posts 
        LEFT JOIN categories ON posts.category_id = categories.id 
        WHERE posts.id = $1
    `, [id]);
};

const createPost = async(judul, isi, gambar, category_id) => {
    return await pool.query(
        'INSERT INTO posts (judul, isi, gambar, category_id) VALUES ($1, $2, $3, $4) RETURNING *', [judul, isi, gambar, category_id]
    );
};

const updatePost = async(id, judul, isi, gambar, category_id) => {
    return await pool.query(
        'UPDATE posts SET judul = $1, isi = $2, gambar = $3, category_id = $4 WHERE id = $5 RETURNING *', [judul, isi, gambar, category_id, id]
    );
};

const deletePost = async(id) => {
    return await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);
};

module.exports = { getAllPosts, getPostById, createPost, updatePost, deletePost };