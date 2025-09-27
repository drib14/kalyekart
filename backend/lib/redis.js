import Redis from "ioredis";

const createMockRedis = () => {
	console.warn("Using mock Redis client. All Redis operations will be no-ops.");
	return {
		get: async () => null,
		set: async () => "OK",
		del: async () => 1,
		on: () => {},
		status: "mock",
	};
};

const initializeRedis = () => {
	return new Promise((resolve) => {
		if (!process.env.UPSTASH_REDIS_URL) {
			console.warn("UPSTASH_REDIS_URL not found. Redis functionality will be disabled.");
			resolve(createMockRedis());
			return;
		}

		const redisClient = new Redis(process.env.UPSTASH_REDIS_URL, {
			connectTimeout: 10000,
			maxRetriesPerRequest: 1,
			retryStrategy: () => null,
		});

		redisClient.on("connect", () => {
			console.log("Connected to Redis successfully!");
			resolve(redisClient);
		});

		redisClient.on("error", (err) => {
			console.error("Failed to connect to Redis:", err.message);
			redisClient.disconnect();
			resolve(createMockRedis());
		});
	});
};

export const redisPromise = initializeRedis();