const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Hello World',
            version: '1.0.0',
        },
        servers: [
            {
                url: 'http//:127.0.0.1:5000/'
            }
        ]
    },
    apis: ['../routes/userRoute.js']
};

const openapiSpecification = swaggerJsdoc(options);

module.exports = {openapiSpecification}
