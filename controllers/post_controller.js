const PostModel = require('../models/post');

const getAll = async(req, res) => {
    try {
        const result = await PostModel.getAllPosts();
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getById = async(req, res) => {
    try {
        const { id } = req.params;
        const result = await PostModel.getPostById(id);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Datanya nggak ada bro' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async(req, res) => {
    try {
        // Pengecekan ditambah category_id
        if (!req.body || !req.body.judul || !req.body.isi || !req.file || !req.body.category_id) {
            return res.status(400).json({
                status: "error",
                message: "Judul, isi, gambar, dan kategori wajib diisi"
            });
        }

        const { judul, isi, category_id } = req.body;
        const gambar = req.file.filename;
        const result = await PostModel.createPost(judul, isi, gambar, category_id);

        res.status(201).json({
            status: "success",
            message: "Post berhasil dibuat",
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async(req, res) => {
    try {
        const { id } = req.params;

        // Pengecekan ditambah category_id
        if (!req.body || !req.body.judul || !req.body.isi || !req.body.category_id) {
            return res.status(400).json({
                status: "error",
                message: "Judul, isi, dan kategori tidak boleh kosong"
            });
        }

        const { judul, isi, category_id } = req.body;
        const gambar = req.file ? req.file.filename : null;
        const result = await PostModel.updatePost(id, judul, isi, gambar, category_id);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Datanya nggak ada bro' });
        }

        res.json({
            status: "success",
            message: "Post berhasil diedit",
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async(req, res) => {
    try {
        const { id } = req.params;
        const result = await PostModel.deletePost(id);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Datanya nggak ada bro' });
        }

        res.json({
            message: 'Postingan berhasil dihapus ya',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAll, getById, create, update, remove };