const PostModel = require('../models/post');

const getPosts = async(req, res) => {
    try {
        const result = await PostModel.getAllPosts();
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const createPost = async(req, res) => {
    try {
        const { judul, isi } = req.body;
        const gambar = req.file ? req.file.filename : null;
        const result = await PostModel.createPost(judul, isi, gambar);
        res.status(201).json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const updatePost = async(req, res) => {
    try {
        const { id } = req.params;
        const { judul, isi } = req.body;
        const result = await PostModel.updatePost(id, judul, isi);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Datanya nggak ada tuh bre' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const deletePost = async(req, res) => {
    try {
        const { id } = req.params;
        const result = await PostModel.deletePost(id);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Datanya nggak ada tuh bre' });
        res.json({ message: 'Postingan berhasil dihapus ya', data: result.rows[0] });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getPosts, createPost, updatePost, deletePost };
