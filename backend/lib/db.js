import mongoose from "mongoose";

export const connectDB = async () => {
	const mongoUri = process.env.MONGO_URI;

	if (!mongoUri) {
		console.warn("MONGO_URI not found. Database functionality will be disabled.");
		return;
	}

	try {
		const conn = await mongoose.connect(mongoUri);
		console.log(`MongoDB connected: ${conn.connection.host}`);
	} catch (error) {
		console.error("Error connecting to MongoDB:", error.message);
		process.exit(1); // Exit if connection fails with a valid URI
	}
};