const express = require('express');
const router = express.Router();
const multer = require('multer');
const postController = require('../controllers/post_controller');
const authenticateToken = require('../middlewares/auth');
const verifyToken = require('../middlewares/auth');
const dashboardController = require('../controllers/dashboard_controller');

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Melihat semua postingan (mendukung Pagination & Search)
 *     tags: [Kelola Postingan]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman yang ingin dibuka (contoh: 2)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Batas jumlah data yang ditampilkan per halaman (contoh: 20)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Kata kunci untuk mencari judul atau kategori berita
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 *       500:
 *         description: Internal Server Error
 */
router.get('/posts', postController.getAll);
router.get('/posts/slug/:slug', postController.getBySlug);
router.get('/posts/:id', postController.getById);
router.post('/posts', authenticateToken, upload.single('gambar'), postController.create);
router.put('/posts/:id', authenticateToken, upload.single('gambar'), postController.update);
router.delete('/posts/:id', authenticateToken, postController.remove);
// untuk Komentar
router.get('/posts/:id/comments', postController.getPostComments);
router.post('/posts/:id/comments', verifyToken, postController.createPostComment);
router.get('/all-comments', authenticateToken, postController.getAllCommentsAdmin);
router.get('/analytics', dashboardController.getAnalytics);
router.get('/notifications', dashboardController.getNotifications);
router.patch('/notifications/read', dashboardController.markReadNotifications);
//admmin bisa hapus komentar netizen 
router.delete('/comments/:id', authenticateToken, postController.removeComment);

module.exports = router;