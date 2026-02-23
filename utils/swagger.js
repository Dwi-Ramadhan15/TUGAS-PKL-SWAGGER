const userSwagger = require('../routes/user_swagger');
const postSwagger = require('../routes/post_swagger');

module.exports = {
    openapi: '3.0.0',
    info: {
        title: 'API PKL',
        version: '1.0.0'
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    security: [{ bearerAuth: [] }],
    paths: {
        ...userSwagger.paths,
        ...postSwagger
    }
};
