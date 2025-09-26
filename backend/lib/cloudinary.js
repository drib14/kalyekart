import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
	secure: true,
});

const uploadOnCloudinary = async (localFilePath) => {
	try {
		if (!localFilePath) {
			console.error("Cloudinary upload failed: No local file path provided.");
			return null;
		}

		console.log(`Uploading file to Cloudinary: ${localFilePath}`);
		const response = await cloudinary.uploader.upload(localFilePath, {
			resource_type: "auto",
			folder: "kalyekart_profiles",
		});
		console.log("Cloudinary upload successful:", response.secure_url);

		// Clean up the locally saved temporary file
		fs.unlink(localFilePath, (err) => {
			if (err) console.error(`Failed to delete temporary file: ${localFilePath}`, err);
		});

		return response;
	} catch (error) {
		console.error("Cloudinary upload failed. Details:", error.message || error);

		// Attempt to clean up the temporary file even if upload fails
		if (fs.existsSync(localFilePath)) {
			fs.unlink(localFilePath, (err) => {
				if (err) console.error(`Failed to delete temporary file after error: ${localFilePath}`, err);
			});
		}

		return null;
	}
};

export { uploadOnCloudinary };
export default cloudinary;