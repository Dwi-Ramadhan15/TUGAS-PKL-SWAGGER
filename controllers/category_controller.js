const CategoryModel = require('../models/category');
const { validationResult } = require('express-validator');

const getAll = async(req, res) => {
    try {
        const result = await CategoryModel.getAllCategories();
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getById = async(req, res) => {
    try {
        const result = await CategoryModel.getCategoryById(req.params.id);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Kategori tidak ditemukan' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const create = async(req, res) => {
    // Cek apakah ada error dari express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", errors: errors.array() });
    }

    try {
        const result = await CategoryModel.createCategory(req.body.nama_kategori);
        res.status(201).json({ status: "success", message: "Kategori berhasil dibuat", data: result.rows[0] });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const update = async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", errors: errors.array() });
    }

    try {
        const result = await CategoryModel.updateCategory(req.params.id, req.body.nama_kategori);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Kategori tidak ditemukan' });
        res.json({ status: "success", message: "Kategori berhasil diedit", data: result.rows[0] });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const remove = async(req, res) => {
    try {
        const result = await CategoryModel.deleteCategory(req.params.id);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Kategori tidak ditemukan' });
        res.json({ message: 'Kategori berhasil dihapus', data: result.rows[0] });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getAll, getById, create, update, remove };