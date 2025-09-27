import Redis from "ioredis";

function createMockRedis() {
	console.warn("Switching to mock Redis client. Redis operations will be no-ops.");
	return {
		get: async () => null,
		set: async () => "OK",
		del: async () => 1,
		on: () => {},
		status: "mock",
	};
}

let activeRedisClient;

if (process.env.UPSTASH_REDIS_URL) {
	const realRedisClient = new Redis(process.env.UPSTASH_REDIS_URL, {
		connectTimeout: 10000, // 10 seconds
		maxRetriesPerRequest: 1,
		retryStrategy: () => null,
	});

	activeRedisClient = realRedisClient;

	realRedisClient.on("error", (error) => {
		console.error("Redis connection error:", error.message);
		console.log("Switching to mock Redis client.");
		activeRedisClient = createMockRedis();
		realRedisClient.disconnect();
	});

	realRedisClient.on("connect", () => {
		console.log("Connected to Redis successfully!");
	});
} else {
	console.warn("UPSTASH_REDIS_URL not found. Redis functionality will be disabled.");
	activeRedisClient = createMockRedis();
}

export const redis = new Proxy(
	{},
	{
		get(target, prop) {
			const clientProp = activeRedisClient[prop];
			if (typeof clientProp === "function") {
				return clientProp.bind(activeRedisClient);
			}
			return clientProp;
		},
	}
);