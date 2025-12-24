const dotenv = require('dotenv')
dotenv.config();


const env = {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/campushb',
    JWT_SECRET: process.env.JWT_SECRET,
    ADMIN_KEY : process.env.ADMIN_KEY,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
}

module.exports = env;