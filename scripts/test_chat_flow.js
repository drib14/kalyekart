import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../backend/models/user.model.js";
import Order from "../backend/models/order.model.js";
import Message from "../backend/models/message.model.js";
import { connectDB } from "../backend/lib/db.js";

dotenv.config({ path: "backend/.env" });

const runTest = async () => {
    let customer, driver, order;
    try {
        await connectDB();
        console.log("Connected to DB");

        // 1. Setup Users
        const timestamp = Date.now();
        customer = await User.create({
            name: "Chat Customer",
            email: `chat_cust_${timestamp}@test.com`,
            password: "password123",
            role: "customer",
            authProvider: "email",
        });
        driver = await User.create({
            name: "Chat Driver",
            email: `chat_driver_${timestamp}@test.com`,
            password: "password123",
            role: "driver",
            authProvider: "email",
        });
        console.log("1. Users Created");

        // 2. Create Order
        order = await Order.create({
            user: customer._id,
            driver: driver._id,
            totalAmount: 100,
            status: "Picked Up",
            products: [],
            shippingAddress: {
                address: "123 Test St",
                city: "Cebu City",
                barangay: "Mabolo",
                contactNumber: "09123456789",
                fullName: "Test Customer",
                postalCode: "6000",
                province: "Cebu"
            },
            contactNumber: "09123456789",
            distance: 5,
            deliveryFee: 45
        });
        console.log("2. Order Created:", order._id);

        // 3. Simulate Chat
        // Customer sends message
        const msg1 = await Message.create({
            orderId: order._id,
            sender: customer._id,
            content: "Where are you?",
        });
        console.log("3. Customer sent message");

        // Driver sends message
        const msg2 = await Message.create({
            orderId: order._id,
            sender: driver._id,
            content: "I'm near.",
        });
        console.log("4. Driver sent message");

        // 4. Retrieve Messages
        const messages = await Message.find({ orderId: order._id }).sort({ createdAt: 1 });
        if (messages.length !== 2) throw new Error("Message count mismatch");
        if (messages[0].content !== "Where are you?") throw new Error("Msg 1 content mismatch");
        if (messages[1].content !== "I'm near.") throw new Error("Msg 2 content mismatch");

        console.log("✅ TEST PASSED: Chat Flow is correct.");

    } catch (error) {
        console.error("❌ TEST FAILED:", error);
    } finally {
        // Cleanup
        if (customer) await User.findByIdAndDelete(customer._id);
        if (driver) await User.findByIdAndDelete(driver._id);
        if (order) await Order.findByIdAndDelete(order._id);
        await Message.deleteMany({ orderId: order?._id });
        await mongoose.disconnect();
    }
};

runTest();
