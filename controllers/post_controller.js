const PostModel = require('../models/post');
const sharp = require('sharp');
const minioClient = require('../config/minio');

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
        if (!req.body || !req.body.judul || !req.body.isi || !req.file || !req.body.category_id) {
            return res.status(400).json({
                status: "error",
                message: "Judul, isi, gambar, dan kategori wajib diisi"
            });
        }

        const { judul, isi, category_id } = req.body;
        const file = req.file;

        // Buat nama file yang unik dengan ekstensi .webp
        const fileName = `post-${Date.now()}-${file.originalname.split('.')[0]}.webp`;

        // Olah gambar menggunakan Sharp (Resize & ubah ke format WebP agar ringan)
        const buffer = await sharp(file.buffer)
            .resize({ width: 800 })
            .webp({ quality: 80 })
            .toBuffer();

        // Upload gambar hasil kompresi ke MinIO 
        const bucketName = 'pkl-project';
        await minioClient.putObject(bucketName, fileName, buffer);

        // Simpan nama file ke Database PostgreSQL
        const result = await PostModel.createPost(judul, isi, fileName, category_id);

        res.status(201).json({
            status: "success",
            message: "Post berhasil dibuat dan gambar tersimpan di MinIO",
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async(req, res) => {
    try {
        const { id } = req.params;

        if (!req.body || !req.body.judul || !req.body.isi || !req.body.category_id) {
            return res.status(400).json({
                status: "error",
                message: "Judul, isi, dan kategori tidak boleh kosong"
            });
        }

        const { judul, isi, category_id } = req.body;
        let gambar = null;

        // Jika user mengupload gambar baru saat update
        if (req.file) {
            const file = req.file;
            gambar = `post-${Date.now()}-${file.originalname.split('.')[0]}.webp`;

            const buffer = await sharp(file.buffer)
                .resize({ width: 800 })
                .webp({ quality: 80 })
                .toBuffer();

            const bucketName = 'pkl-project';
            await minioClient.putObject(bucketName, gambar, buffer);
        }

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