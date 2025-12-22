import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
	{
		general: {
			siteName: { type: String, default: "KalyeKart" },
			supportEmail: { type: String, default: "support@kalyekart.app" },
			currency: { type: String, default: "PHP" },
		},
		delivery: {
			baseFee: { type: Number, default: 20 },
			feePerKm: { type: Number, default: 5 },
			freeDeliveryThreshold: { type: Number, default: 1000 },
		},
		loyalty: {
			isEnabled: { type: Boolean, default: true },
			pointsPerPeso: { type: Number, default: 0.1 }, // 100 pesos = 10 points
			minimumPointsToRedeem: { type: Number, default: 50 },
		},
		notifications: {
			emailEnabled: { type: Boolean, default: true },
			pushEnabled: { type: Boolean, default: true },
		},
	},
	{ timestamps: true }
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
