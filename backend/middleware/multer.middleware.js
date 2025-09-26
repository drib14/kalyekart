import multer from "multer";

// Configure multer to store files in memory as buffers
const storage = multer.memoryStorage();

const upload = multer({
	storage,
	limits: {
		fileSize: 1024 * 1024 * 5, // 5MB file size limit
	},
});

export default upload;