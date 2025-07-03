// middlewares/upload.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dacnobglx',
  api_key: '191261562874239',
  api_secret: '1r7YYnis7mW3Ufn4aAiMK8ibUHg'
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'food1',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

const upload = multer({ storage });

module.exports = upload;
