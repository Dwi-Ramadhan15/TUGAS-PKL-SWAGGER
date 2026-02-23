const express = require('express');
const router = express.Router();
const multer = require('multer');
const postController = require('../controllers/post_controller');
const authenticateToken = require('../middlewares/auth');

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

router.get('/posts', postController.getPosts);


router.post('/posts', authenticateToken, upload.single('gambar'), postController.createPost);
router.put('/posts/:id', authenticateToken, upload.single('gambar'), postController.updatePost);
router.delete('/posts/:id', authenticateToken, postController.deletePost);

module.exports = router;
