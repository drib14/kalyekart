import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
	secure: true,
});

/**
 * Uploads a file buffer to Cloudinary.
 * @param {object} file - The file object from multer's memory storage.
 * @param {Buffer} file.buffer - The file's buffer data.
 * @param {string} file.mimetype - The mime type of the file.
 * @param {string} [folder="kalyekart_uploads"] - The folder in Cloudinary to upload to.
 * @returns {Promise<object|null>} The Cloudinary upload response or null if failed.
 */
const uploadOnCloudinary = async (file, folder = "kalyekart_uploads") => {
	try {
		if (!file || !file.buffer) {
			console.error("Cloudinary upload failed: No file buffer provided.");
			return null;
		}

		// Convert buffer to data URI
		const b64 = Buffer.from(file.buffer).toString("base64");
		let dataURI = "data:" + file.mimetype + ";base64," + b64;

		const response = await cloudinary.uploader.upload(dataURI, {
			resource_type: "auto",
			folder: folder,
		});

		return response;
	} catch (error) {
		console.error("Cloudinary upload failed. Details:", error.message || error);
		return null;
	}
};

export { uploadOnCloudinary };
export default cloudinary;