import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../backend/models/user.model.js";
import { connectDB } from "../backend/lib/db.js";

dotenv.config({ path: "backend/.env" });

const runTest = async () => {
    let user;
    try {
        await connectDB();
        console.log("Connected to DB");

        // 1. Create User
        user = await User.create({
            name: "Settings Tester",
            email: `settings_${Date.now()}@test.com`,
            password: "password123",
            role: "customer",
            authProvider: "email",
            notificationPreferences: { email: true, push: true }
        });
        console.log("1. User Created with defaults:", user.notificationPreferences);

        // 2. Simulate Settings Update
        const newPrefs = { email: false, push: true };
        // Logic similar to user.controller.js
        user.notificationPreferences = { ...user.notificationPreferences, ...newPrefs };
        await user.save();

        // 3. Verify
        const updatedUser = await User.findById(user._id);
        console.log("2. Updated Prefs:", updatedUser.notificationPreferences);

        if (updatedUser.notificationPreferences.email === true) throw new Error("Email pref not updated");
        if (updatedUser.notificationPreferences.push !== true) throw new Error("Push pref mismatch");

        console.log("✅ TEST PASSED: Settings Persistence verified.");

    } catch (error) {
        console.error("❌ TEST FAILED:", error);
    } finally {
        if (user) await User.findByIdAndDelete(user._id);
        await mongoose.disconnect();
    }
};

runTest();
