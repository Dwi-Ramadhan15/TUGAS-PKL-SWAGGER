const pool = require('../config/db');

const getAllCategories = async() => await pool.query('SELECT * FROM categories ORDER BY id ASC');

const getCategoryById = async(id) => {
    return await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
};

const createCategory = async(nama_kategori) => {
    return await pool.query('INSERT INTO categories (nama_kategori) VALUES ($1) RETURNING *', [nama_kategori]);
};

const updateCategory = async(id, nama_kategori) => {
    return await pool.query('UPDATE categories SET nama_kategori = $1 WHERE id = $2 RETURNING *', [nama_kategori, id]);
};

const deleteCategory = async(id) => {
    return await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };