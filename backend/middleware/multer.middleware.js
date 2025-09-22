import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = "./public/temp";

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		// Use a unique filename to avoid conflicts
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
	},
});

const upload = multer({ storage });

export default upload;
