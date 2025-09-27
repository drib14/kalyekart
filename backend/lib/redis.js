import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.UPSTASH_REDIS_URL;
let redisInstance;

if (redisUrl) {
	redisInstance = new Redis(redisUrl);

	redisInstance.on("connect", () => {
		console.log("Connected to Redis successfully!");
	});

	redisInstance.on("error", (error) => {
		console.error("Redis connection error:", error);
	});
} else {
	console.warn(
		"UPSTASH_REDIS_URL not found. Redis functionality (caching, sessions) will be disabled."
	);
	// Mock Redis client to prevent application from crashing
	redisInstance = {
		get: async () => null,
		set: async () => "OK",
		del: async () => 1,
		on: () => {}, // ioredis instances are event emitters
	};
}

export const redis = redisInstance;