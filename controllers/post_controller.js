const PostModel = require('../models/post');
const sharp = require('sharp');
const minioClient = require('../config/minio');

const getAll = async(req, res) => {
    try {
        const result = await PostModel.getAllPosts();

        // jadi url 
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

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Datanya nggak ada bro' });
        }

        const post = result.rows[0];
        // membuat URL gambar nya dsni
        post.gambar_url = post.gambar ? `${process.env.MINIO_DOMAIN}/${post.gambar}` : null;

        res.json(post);
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

        // format jadi format webp
        const fileName = `post-${Date.now()}-${file.originalname.split('.')[0]}.webp`;

        // ukuean gambar 
        const buffer = await sharp(file.buffer)
            .resize({ width: 800 })
            .webp({ quality: 80 })
            .toBuffer();

        // nama bucket nya pkl-project yow
        const bucketName = 'pkl-project';

        // Menambahkan metadata agar browser mengenali ini sebagai gambar, bukan file unduhan
        const metaData = {
            'Content-Type': 'image/webp',
            'Content-Disposition': 'inline' // Kurang ini kak tadi makanya langsung ke download hehe
        };
        // Menambahkan buffer.length dan metaData ke parameter putObject
        await minioClient.putObject(bucketName, fileName, buffer, buffer.length, metaData);

        // Gabung nama bucket dan file untuk di DB
        const dbGambarPath = `${bucketName}/${fileName}`;
        const result = await PostModel.createPost(judul, isi, dbGambarPath, category_id);

        const newPost = result.rows[0];
        newPost.gambar_url = `${process.env.MINIO_DOMAIN}/${newPost.gambar}`;

        res.status(201).json({
            status: "success",
            message: "Post berhasil dibuat dan gambar tersimpan di MinIO",
            data: newPost
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
        const bucketName = 'pkl-project';

        if (req.file) {
            const file = req.file;
            const fileName = `post-${Date.now()}-${file.originalname.split('.')[0]}.webp`;

            const buffer = await sharp(file.buffer)
                .resize({ width: 800 })
                .webp({ quality: 80 })
                .toBuffer();

            const metaData = {
                'Content-Type': 'image/webp'
            };
            await minioClient.putObject(bucketName, fileName, buffer, buffer.length, metaData);

            gambar = `${bucketName}/${fileName}`;
        }

        const result = await PostModel.updatePost(id, judul, isi, gambar, category_id);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Datanya nggak ada bro' });
        }

        const updatedPost = result.rows[0];
        updatedPost.gambar_url = updatedPost.gambar ? `${process.env.MINIO_DOMAIN}/${updatedPost.gambar}` : null;

        res.json({
            status: "success",
            message: "Post berhasil diedit",
            data: updatedPost
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