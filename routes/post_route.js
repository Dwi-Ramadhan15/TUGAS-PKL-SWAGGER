const express = require('express');
const router = express.Router();
const multer = require('multer');
const postController = require('../controllers/post_controller');
const verifyToken = require('../middlewares/auth');

// Setup Multer di dalam rute postingan
const storage = multer.diskStorage({
    destination: function(req, file, cb) { cb(null, './uploads/'); },
    filename: function(req, file, cb) { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

router.get('/posts', postController.getPosts);
router.post('/posts', verifyToken, upload.single('gambar'), postController.createPost);
router.put('/posts/:id', verifyToken, postController.updatePost);
router.delete('/posts/:id', verifyToken, postController.deletePost);

module.exports = router;