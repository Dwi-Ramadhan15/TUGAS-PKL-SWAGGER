module.exports = {
    '/register': {
        post: {
            tags: ['Bagian Authentication'],
            summary: 'Daftar User Baru',
            requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } } },
            responses: { '201': { description: 'User berhasil dibuat' } }
        }
    },
    '/login': {
        post: {
            tags: ['Bagian Authentication'],
            summary: 'Login User',
            requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } } },
            responses: { '200': { description: 'Login berhasil, dapet token' } }
        }
    }
};