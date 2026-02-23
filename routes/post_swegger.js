module.exports = {
    '/posts': {
        get: { tags: ['Kelola Postingan'], summary: 'Nampilin semua postingan', responses: { '200': { description: 'Berhasil' } } },
        post: {
            tags: ['Kelola Postingan'],
            summary: 'Nambah postingan baru',
            security: [{ bearerAuth: [] }],
            requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { judul: { type: 'string' }, isi: { type: 'string' }, gambar: { type: 'string', format: 'binary' } } } } } },
            responses: { '201': { description: 'Berhasil dibuat' } }
        }
    },
    '/posts/{id}': {
        put: {
            tags: ['Kelola Postingan'],
            summary: 'Ngedit postingan',
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
            requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { judul: { type: 'string' }, isi: { type: 'string' } } } } } },
            responses: { '200': { description: 'Berhasil diedit' } }
        },
        delete: {
            tags: ['Kelola Postingan'],
            summary: 'Ngapus postingan',
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
            responses: { '200': { description: 'Berhasil dihapus' } }
        }
    }
};