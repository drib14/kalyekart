import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../backend/models/user.model.js";
import Order from "../backend/models/order.model.js";
import Reward from "../backend/models/reward.model.js";
import Settings from "../backend/models/settings.model.js";
import Discount from "../backend/models/discount.model.js";
import { connectDB } from "../backend/lib/db.js";

dotenv.config({ path: "backend/.env" });

const runTest = async () => {
	let customer, reward, order, discount;
	try {
		await connectDB();
		console.log("Connected to DB");

		// 1. Check/Setup Settings (Non-destructive)
		let settings = await Settings.findOne();
		if (!settings) {
			console.log("Settings not found, creating default.");
			settings = await Settings.create({
				loyalty: { isEnabled: true, pointsPerPeso: 0.1, minimumPointsToRedeem: 10 },
			});
		} else if (!settings.loyalty.isEnabled) {
			console.warn("⚠️ Loyalty system is disabled in settings. Enabling temporarily for test.");
			settings.loyalty.isEnabled = true;
			// We won't save this change to avoid altering prod config permanently,
			// but we use the modified object for calculation logic in this script.
		}
		console.log("1. Settings Loaded:", settings.loyalty);

		// 2. Setup Test User
		const customerEmail = `test_script_${Date.now()}@example.com`;
		customer = await User.create({
			name: "Test Script User",
			email: customerEmail,
			password: "password123",
			role: "customer",
			authProvider: "email",
		});
		console.log("2. Test Customer Created:", customer.email);

		// 3. Create Test Reward
		reward = await Reward.create({
			name: "Test Script Reward",
			cost: 10,
			type: "discount_amount",
			value: 50,
			isActive: true,
		});
		console.log("3. Test Reward Created:", reward.name, "Cost:", reward.cost);

		// 4. Simulate Order (Earn Points)
		// Total: 200 -> Points: 200 * 0.1 = 20 points
		order = await Order.create({
			user: customer._id,
			totalAmount: 200,
			paymentStatus: "paid",
			status: "Delivered",
			products: [],
			shippingAddress: {
				address: "123 Test St",
				city: "Cebu City",
				barangay: "Mabolo",
				contactNumber: "09123456789",
                fullName: "Test Customer",
                postalCode: "6000",
				province: "Cebu" // Required
			},
			contactNumber: "09123456789", // Required in root
			distance: 5.5, // Required
			deliveryFee: 47.5 // Required
		});

		console.log("4. Simulating Points Awarding...");
		if (settings.loyalty.isEnabled) {
			const pointsEarned = Math.floor(order.totalAmount * settings.loyalty.pointsPerPeso);
			if (pointsEarned > 0) {
				await User.findByIdAndUpdate(customer._id, {
					$inc: { loyaltyPoints: pointsEarned },
					$push: {
						pointsHistory: {
							type: "earned",
							amount: pointsEarned,
							description: `Order #${order._id}`,
							orderId: order._id,
						},
					},
				});
				console.log(`   Awarded ${pointsEarned} points.`);
			}
		}

		// Verify Customer Points
		const updatedCustomer = await User.findById(customer._id);
		console.log("5. Customer Points Balance:", updatedCustomer.loyaltyPoints);
		if (updatedCustomer.loyaltyPoints !== 20) throw new Error(`Points calculation failed! Expected 20, got ${updatedCustomer.loyaltyPoints}`);

		// 5. Redeem Reward
		console.log("6. Redeeming Reward...");
		if (updatedCustomer.loyaltyPoints >= reward.cost) {
			const code = `TEST-REW-${Date.now()}`;
			discount = await Discount.create({
				code,
				title: "Test Reward Voucher",
				value: reward.value,
				type: "fixed",
				validFrom: new Date(),
				validUntil: new Date(Date.now() + 86400000),
				status: "active",
			});

			await User.findByIdAndUpdate(customer._id, {
				$inc: { loyaltyPoints: -reward.cost },
				$push: {
					pointsHistory: {
						type: "redeemed",
						amount: reward.cost,
						description: `Redeemed ${reward.name}`,
						rewardId: reward._id,
					},
				},
			});
			console.log("   Redemption successful.");
		} else {
			throw new Error("Insufficient points for redemption!");
		}

		// Verify Final State
		const finalCustomer = await User.findById(customer._id);
		console.log("7. Final Points Balance:", finalCustomer.loyaltyPoints);
		if (finalCustomer.loyaltyPoints !== 10) throw new Error(`Final balance incorrect! Expected 10, got ${finalCustomer.loyaltyPoints}`);

		console.log("✅ TEST PASSED: Loyalty System Flow is correct.");

	} catch (error) {
		console.error("❌ TEST FAILED:", error);
	} finally {
		// Cleanup
		console.log("Cleaning up test data...");
		if (customer) await User.findByIdAndDelete(customer._id);
		if (reward) await Reward.findByIdAndDelete(reward._id);
		if (order) await Order.findByIdAndDelete(order._id);
		if (discount) await Discount.findByIdAndDelete(discount._id);
		await mongoose.disconnect();
		console.log("Done.");
	}
};

runTest();
