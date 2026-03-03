const PostModel = require('../models/post');
const sharp = require('sharp');
const minioClient = require('../config/minio');
const slugify = require('slugify'); // <-- Wajib ada

const getAll = async(req, res) => {
    try {
        const result = await PostModel.getAllPosts();
        const formattedData = result.rows.map(post => {
            return {
                ...post,
                gambar_url: post.gambar ? `${process.env.MINIO_DOMAIN}/${post.gambar}` : null
            }
        });
        res.json(formattedData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getById = async(req, res) => {
    try {
        const { id } = req.params;
        const result = await PostModel.getPostById(id);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Datanya nggak ada bro' });

        const post = result.rows[0];
        post.gambar_url = post.gambar ? `${process.env.MINIO_DOMAIN}/${post.gambar}` : null;
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// FUNGSI BARU: Controller getBySlug
const getBySlug = async(req, res) => {
    try {
        const { slug } = req.params;
        const result = await PostModel.getPostBySlug(slug);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Berita tidak ditemukan' });

        const post = result.rows[0];
        post.gambar_url = post.gambar ? `${process.env.MINIO_DOMAIN}/${post.gambar}` : null;
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async(req, res) => {
    try {
        if (!req.body || !req.body.judul || !req.body.isi || !req.file || !req.body.category_id) {
            return res.status(400).json({ status: "error", message: "Judul, isi, gambar, dan kategori wajib diisi" });
        }

        const { judul, isi, category_id } = req.body;
        const file = req.file;

        // Bikin slug dari judul
        const slug = slugify(judul, { lower: true, strict: true });

        const fileName = `post-${Date.now()}-${file.originalname.split('.')[0]}.webp`;
        const buffer = await sharp(file.buffer).resize({ width: 800 }).webp({ quality: 80 }).toBuffer();

        const bucketName = 'pkl-project';
        const metaData = { 'Content-Type': 'image/webp', 'Content-Disposition': 'inline' };

        await minioClient.putObject(bucketName, fileName, buffer, buffer.length, metaData);

        const dbGambarPath = `${bucketName}/${fileName}`;
        // Lempar slug ke model
        const result = await PostModel.createPost(judul, isi, dbGambarPath, category_id, slug);

        const newPost = result.rows[0];
        newPost.gambar_url = `${process.env.MINIO_DOMAIN}/${newPost.gambar}`;

        res.status(201).json({ status: "success", message: "Post berhasil dibuat", data: newPost });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async(req, res) => {
    try {
        const { id } = req.params;
        const { judul, isi, category_id } = req.body;

        // Update slug jika judul diubah
        const slug = slugify(judul, { lower: true, strict: true });

        let gambarPath = null;

        if (req.file) {
            const file = req.file;
            const fileName = `post-${Date.now()}-${file.originalname.split('.')[0]}.webp`;
            const buffer = await sharp(file.buffer).resize({ width: 800 }).webp({ quality: 80 }).toBuffer();
            const bucketName = 'pkl-project';

            await minioClient.putObject(bucketName, fileName, buffer, buffer.length, {
                'Content-Type': 'image/webp',
                'Content-Disposition': 'inline'
            });

            gambarPath = `${bucketName}/${fileName}`;
        }

        // Lempar slug ke model
        const result = await PostModel.updatePost(id, judul, isi, gambarPath, category_id, slug);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });

        const updatedPost = result.rows[0];
        updatedPost.gambar_url = updatedPost.gambar ? `${process.env.MINIO_DOMAIN}/${updatedPost.gambar}` : null;

        res.json({ status: "success", message: "Post berhasil diperbarui", data: updatedPost });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async(req, res) => {
    try {
        const { id } = req.params;
        const result = await PostModel.deletePost(id);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Datanya nggak ada bro' });
        res.json({ message: 'Postingan dihapus', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAll, getById, getBySlug, create, update, remove };