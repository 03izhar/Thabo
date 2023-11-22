const cloudinary = require("cloudinary");

cloudinary.config({
    cloud_name: 'dxbatrtqt',
    api_key: '579961924976349',
    api_secret: 'KykC-s8jUA_cKQPv-FekXaNp2AA'
});

const cloudinaryUploadImage = async(fileToUpload)=> {
    return new Promise((resolve) => {
        cloudinary.uploader.upload(fileToUpload, (result) => {
            resolve(
                { url: result.secure_url },
                { resource_type: "auto" }
            )
        })
    })
}

module.exports = { cloudinaryUploadImage };