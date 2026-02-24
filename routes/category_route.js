const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const categoryController = require('../controllers/category_controller');
const authenticateToken = require('../middlewares/auth');

// Aturan validasi: nama_kategori tidak boleh kosong dan minimal 3 karakter
const validateCategory = [
    body('nama_kategori').notEmpty().withMessage('Nama kategori wajib diisi').isLength({ min: 3 }).withMessage('Nama kategori minimal 3 karakter')
];

router.get('/categories', categoryController.getAll);
router.get('/categories/:id', categoryController.getById);
router.post('/categories', authenticateToken, validateCategory, categoryController.create);
router.put('/categories/:id', authenticateToken, validateCategory, categoryController.update);
router.delete('/categories/:id', authenticateToken, categoryController.remove);

module.exports = router;