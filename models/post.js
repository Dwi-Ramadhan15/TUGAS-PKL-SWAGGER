const pool = require('../config/db');

const getAllPosts = async() => await pool.query('SELECT * FROM posts ORDER BY id ASC');

const getPostById = async(id) => {
    return await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
};

const createPost = async(judul, isi, gambar) => {
    return await pool.query('INSERT INTO posts (judul, isi, gambar) VALUES ($1, $2, $3) RETURNING *', [judul, isi, gambar]);
};

const updatePost = async(id, judul, isi, gambar) => {
    return await pool.query('UPDATE posts SET judul = $1, isi = $2, gambar = $3 WHERE id = $4 RETURNING *', [judul, isi, gambar, id]);
};

const deletePost = async(id) => {
    return await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);
};

module.exports = { getAllPosts, getPostById, createPost, updatePost, deletePost };