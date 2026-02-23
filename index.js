const express = require('express');
const cors = require('cors');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const userRoute = require('./routes/user_route');
const postRoute = require('./routes/post_route');
const swaggerDocument = require('./utils/swagger');

const app = express();
app.use(cors());
app.use(express.json());

// Bikin folder uploads otomatis
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}
app.use('/uploads', express.static('uploads'));

// Pasang Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Pasang Router (Arahkan jalan)
app.use('/', userRoute);
app.use('/', postRoute);

// Nyalain Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log('=========================================');
    console.log(`Server MVC Berjalan di port ${PORT}!`);
    console.log(`Buka: http://localhost:${PORT}/api-docs`);
    console.log('=========================================');
});