const express = require('express');
const router = express.Router();
const multer = require('multer');
const postController = require('../controllers/post_controller');
const authenticateToken = require('../middlewares/auth');

const storage = multer.diskStorage({
    destination: 'public/images',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

router.get('/posts', postController.getAll);
router.get('/posts/:id', postController.getById);
router.post('/posts', authenticateToken, upload.single('gambar'), postController.create);
router.put('/posts/:id', authenticateToken, upload.single('gambar'), postController.update);
router.delete('/posts/:id', authenticateToken, postController.remove);

module.exports = router;