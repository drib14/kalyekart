import multer from "multer";
import path from "path";
import fs from "fs";

const tempDir = "./public/temp";

// Ensure the temporary directory for uploads exists.
if (!fs.existsSync(tempDir)) {
	fs.mkdirSync(tempDir, { recursive: true });
}

// Configure storage to save files to a temporary disk location
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, tempDir);
	},
	filename: function (req, file, cb) {
		// Use a unique filename to avoid conflicts
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
	},
});

const upload = multer({
	storage,
	limits: {
		fileSize: 1024 * 1024 * 5, // 5MB file size limit
	},
});

export default upload;