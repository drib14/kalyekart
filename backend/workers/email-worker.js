import "dotenv/config";
import { Worker } from "bullmq";
import { redis } from "../lib/redis.js";
import { _sendEmail } from "../lib/email.js";

const worker = new Worker(
	"email-queue",
	async (job) => {
		console.log(`[EMAIL_WORKER] Processing job ${job.id}...`);
		const { to, subject, templateName, data, replyTo } = job.data;
		await _sendEmail(to, subject, templateName, data, replyTo);
	},
	{
		connection: redis,
		limiter: {
			max: 100, // Max 100 jobs
			duration: 60000, // per 60 seconds
		},
	}
);

worker.on("completed", (job) => {
	console.log(`[EMAIL_WORKER] Job ${job.id} has completed! Sent to: ${job.data.to}`);
});

worker.on("failed", (job, err) => {
	console.error("==========================================================");
	console.error(`[EMAIL_WORKER] Job ${job.id} has failed!`);
	console.error(`Recipient: ${job.data.to}`);
	console.error(`Subject: ${job.data.subject}`);
	console.error("Error Details:", err);
	console.error("==========================================================");
});

console.log("Email worker started.");