const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (buffer, folder = "resumes") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
};

module.exports = {
  uploadToCloudinary
};
