import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.UPSTASH_REDIS_URL;
let activeRedisClient;

function createMockRedis() {
	console.warn("Switching to mock Redis client. All Redis operations will be no-ops.");
	return {
		get: async () => null,
		set: async () => "OK",
		del: async () => 1,
		on: () => {},
		status: "mock",
	};
}

if (redisUrl) {
	const realRedisClient = new Redis(redisUrl, {
		maxRetriesPerRequest: 1,
		retryStrategy: () => null, // Don't automatically reconnect
	});

	activeRedisClient = realRedisClient; // Start with the real client

	realRedisClient.on("error", (error) => {
		console.error("Redis connection error:", error.message);
		console.log("The real Redis client has failed. Future calls will be handled by the mock client.");
		// The connection has failed, switch to the mock client
		activeRedisClient = createMockRedis();
		realRedisClient.disconnect(); // Prevent any further attempts
	});

	realRedisClient.on("connect", () => {
		console.log("Connected to Redis successfully!");
	});
} else {
	console.warn("UPSTASH_REDIS_URL not found. Redis functionality will be disabled.");
	activeRedisClient = createMockRedis();
}

// Create a proxy to seamlessly switch between real and mock clients
const redisProxy = new Proxy(
	{},
	{
		get: (target, prop) => {
			// Forward all property access and method calls to the currently active client
			return activeRedisClient[prop];
		},
	}
);

export const redis = redisProxy;