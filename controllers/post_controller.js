const PostModel = require('../models/post');
const sharp = require('sharp');
const minioClient = require('../config/minio');
const slugify = require('slugify');

const getAll = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 7;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const { rows, totalItems } = await PostModel.getAllPosts(limit, offset, search);

        const formattedData = rows.map(post => {
            return {
                ...post,
                gambar_url: post.gambar ? `${process.env.MINIO_DOMAIN}/${post.gambar}` : null
            }
        });

        const totalPages = Math.ceil(totalItems / limit);

        res.json({
            data: formattedData,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                limit
            }
        });
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
        const slug = slugify(judul, { lower: true, strict: true });
        const fileName = `post-${Date.now()}-${file.originalname.split('.')[0]}.webp`;
        const buffer = await sharp(file.buffer).resize({ width: 800 }).webp({ quality: 80 }).toBuffer();
        const bucketName = 'pkl-project';
        const metaData = { 'Content-Type': 'image/webp', 'Content-Disposition': 'inline' };
        await minioClient.putObject(bucketName, fileName, buffer, buffer.length, metaData);
        const dbGambarPath = `${bucketName}/${fileName}`;
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

// tanggal 6 maret 2026 suruh tambahin fitur komentar
const getPostComments = async(req, res) => {
    try {
        const { id } = req.params;

        // LOGIKA BARU: Hanya jadikan "Sudah Dibaca" kalau yang buka adalah ADMIN
        if (req.query.source === 'admin') {
            await PostModel.markCommentsAsRead(id);
        }

        const result = await PostModel.getComments(id);
        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createPostComment = async(req, res) => {
    try {
        const { id } = req.params;
        const { komentar, rating } = req.body;
        const userId = req.user.userId;
        if (!komentar || !rating) {
            return res.status(400).json({ message: "Komentar dan Rating wajib diisi dong!" });
        }
        const result = await PostModel.addComment(id, userId, komentar, rating);
        res.status(201).json({ status: "success", message: "Komentar berhasil ditambahkan", data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: `Database Error: ${err.message}` });
    }
};

const removeComment = async(req, res) => {
    try {
        const { id } = req.params;
        const result = await PostModel.deleteComment(id);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Komentar tidak ditemukan' });
        res.json({ message: 'Komentar berhasil dihapus', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAll, getById, getBySlug, create, update, remove, getPostComments, createPostComment, removeComment };