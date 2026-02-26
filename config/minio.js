const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: '127.0.0.1',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin'
});

// ini Fungsi untuk atur si Bucket jadi Public secara otomatis
const setupMinioBucket = async() => {
    const bucketName = 'pkl-project';

    try {
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            await minioClient.makeBucket(bucketName);
            console.log(`[MinIO] Bucket '${bucketName}' berhasil dibuat.`);
        }

        const publicPolicy = {
            Version: '2012-10-17',
            Statement: [{
                Sid: 'PublicRead',
                Effect: 'Allow',
                Principal: '*',
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${bucketName}/*`]
            }]
        };

        // Terapkan aturan tersebut ke bucket
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(publicPolicy));
        console.log(`Sukses! Akses Bucket '${bucketName}' sekarang sudah saya buat jafi PUBLIC.`);

    } catch (err) {
        console.error('Gagal menyetel bucket:', err);
    }
};



module.exports = minioClient;