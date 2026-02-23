const userSwagger = require('../routes/user_swegger');
const postSwagger = require('../routes/post_swegger');

const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'API Microdata (MVC Pattern)',
        version: '1.0.0',
        description: 'Struktur API rapi menggunakan arsitektur MVC',
    },
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
        }
    },
    // Gabungkan paths user dan post di sini
    paths: {
        ...userSwagger,
        ...postSwagger
    }
};

module.exports = swaggerDocument;