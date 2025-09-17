import Coupon from "../models/coupon.model.js";
import { stripe } from "../lib/stripe.js";

// This is a placeholder for the Stripe checkout session creation.
// The actual implementation will be done in a separate task.
export const createCheckoutSession = async (req, res) => {
	res.status(501).json({ message: "Stripe checkout is not yet implemented." });
};

// This is a placeholder for the Stripe webhook handler.
// The actual implementation will be done in a separate task.
export const stripeWebhook = async (req, res) => {
	res.status(501).json({ message: "Stripe webhook is not yet implemented." });
};

// These functions are related to Stripe and will be moved to a separate
// Stripe service in a future task.
export async function createStripeCoupon(discountPercentage) {
	const coupon = await stripe.coupons.create({
		percent_off: discountPercentage,
		duration: "once",
	});

	return coupon.id;
}

export async function createNewCoupon(userId) {
	await Coupon.findOneAndDelete({ userId });

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		userId: userId,
	});

	await newCoupon.save();

	return newCoupon;
}
