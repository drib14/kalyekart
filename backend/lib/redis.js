import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.UPSTASH_REDIS_URL;
let redisInstance;

if (redisUrl) {
	const redisOptions = {
		maxRetriesPerRequest: 1, // Don't retry commands
		retryStrategy: (times) => {
			// Don't reconnect
			return null;
		},
	};

	redisInstance = new Redis(redisUrl, redisOptions);

	redisInstance.on("connect", () => {
		console.log("Connected to Redis successfully!");
	});

	redisInstance.on("error", (error) => {
		console.error("Redis connection error:", error.message);
		// Switch to mock client on connection failure to prevent crashes
		redisInstance = createMockRedis();
	});
} else {
	console.warn(
		"UPSTASH_REDIS_URL not found. Redis functionality (caching, sessions) will be disabled."
	);
	redisInstance = createMockRedis();
}

function createMockRedis() {
	return {
		get: async () => null,
		set: async () => "OK",
		del: async () => 1,
		on: () => {}, // ioredis instances are event emitters
	};
}

export const redis = redisInstance;