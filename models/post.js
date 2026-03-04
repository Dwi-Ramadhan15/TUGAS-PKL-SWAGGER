const pool = require('../config/db');

const getAllPosts = async() => {
    return await pool.query(`
        SELECT posts.*, categories.nama_kategori 
        FROM posts 
        LEFT JOIN categories ON posts.category_id = categories.id 
        ORDER BY posts.id DESC
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