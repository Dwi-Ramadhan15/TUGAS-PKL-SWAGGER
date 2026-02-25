const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin', // Ambil dari MinIO Console
    secretKey: 'minioadmin'
});

module.exports = minioClient;