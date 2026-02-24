require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const userRoutes = require('./routes/user_route');
const swaggerDocument = require('./utils/swagger');
const postRoutes = require('./routes/post_route');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const uploadDir = 'public/images';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

app.use('/images', express.static('public/images'));

app.use('/', userRoutes);
app.use('/', postRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
    console.log(`Server berjalan di: http://localhost:${PORT}`);
    console.log(`Anda dapat mengakses Swagger: http://localhost:${PORT}/api-docs`);
});