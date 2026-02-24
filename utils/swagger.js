const userSwagger = require('../routes/user_swagger');
const postSwagger = require('../routes/post_swagger');
const categorySwagger = require('../routes/category_swagger');

const swaggerDocument = {
    openapi: "3.0.0",
    info: {
        title: "API Project PKL Swagger",
        version: "1.0.0",
        description: "Dokumentasi API untuk project PKL"
    },
    servers: [{
        url: "http://localhost:3000",
        description: "Local Server"
    }],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        }
    },
    paths: {
        ...userSwagger,
        ...categorySwagger,
        ...postSwagger
    }
};

module.exports = swaggerDocument;