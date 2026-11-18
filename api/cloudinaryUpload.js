const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Tárhely beállítása a Cloudinary-hoz
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'milegyenavacsora_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });
module.exports = upload;