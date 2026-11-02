const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];

        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, PNG, and WEBP images are allowed"));
        }
    }
});

upload.uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "lost-found-items" },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        Readable.from(file.buffer).pipe(stream);
    });
};

module.exports = upload;