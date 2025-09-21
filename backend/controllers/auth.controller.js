import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateTokens = (userId) => {
	const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});

	const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	});

	return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
	await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7days
};

const setCookies = (res, accessToken, refreshToken) => {
	res.cookie("accessToken", accessToken, {
		httpOnly: true, // prevent XSS attacks, cross site scripting attack
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
		maxAge: 15 * 60 * 1000, // 15 minutes
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true, // prevent XSS attacks, cross site scripting attack
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	});
};

export const signup = async (req, res) => {
	const { email, password, name, phoneNumber } = req.body;
	try {
		const userExists = await User.findOne({ email });
		if (userExists) {
			return res.status(400).json({ message: "User with this email already exists" });
		}

		const phoneExists = await User.findOne({ phoneNumber });
		if (phoneExists) {
			return res.status(400).json({ message: "User with this phone number already exists" });
		}

		const user = await User.create({ name, email, password, phoneNumber });

		// authenticate
		const { accessToken, refreshToken } = generateTokens(user._id);
		await storeRefreshToken(user._id, refreshToken);

		setCookies(res, accessToken, refreshToken);

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
		});
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (user && (await user.comparePassword(password))) {
			const { accessToken, refreshToken } = generateTokens(user._id);
			await storeRefreshToken(user._id, refreshToken);
			setCookies(res, accessToken, refreshToken);

			res.json({
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			});
		} else {
			res.status(400).json({ message: "Invalid email or password" });
		}
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const logout = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;
		if (refreshToken) {
			const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
			await redis.del(`refresh_token:${decoded.userId}`);
		}

		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
		res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// this will refresh the access token
export const refreshToken = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			return res.status(401).json({ message: "No refresh token provided" });
		}

		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

		if (storedToken !== refreshToken) {
			return res.status(401).json({ message: "Invalid refresh token" });
		}

		const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 15 * 60 * 1000,
		});

		res.json({ message: "Token refreshed successfully" });
	} catch (error) {
		console.log("Error in refreshToken controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

import crypto from "crypto";
import { twilioClient } from "../lib/twilio.js";

export const getProfile = async (req, res) => {
	try {
		res.json(req.user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const forgotPassword = async (req, res) => {
	try {
		const { phoneNumber } = req.body;
		const user = await User.findOne({ phoneNumber });

		if (!user) {
			return res.status(404).json({ message: "User with this phone number not found" });
		}

		const code = crypto.randomInt(100000, 999999).toString();
		await redis.set(`reset_code:${phoneNumber}`, code, "EX", 10 * 60); // 10 minutes

		let toPhoneNumber = user.phoneNumber;
		if (toPhoneNumber.startsWith("0")) {
			toPhoneNumber = `+63${toPhoneNumber.substring(1)}`;
		}

		await twilioClient.messages.create({
			body: `Your KalyeKart password reset code is: ${code}`,
			from: process.env.TWILIO_PHONE_NUMBER,
			to: toPhoneNumber,
		});

		res.json({ message: "Password reset code sent to your phone number" });
	} catch (error) {
		console.error("Error in forgotPassword controller", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { phoneNumber, code, password } = req.body;
		const storedCode = await redis.get(`reset_code:${phoneNumber}`);

		if (!storedCode || storedCode !== code) {
			return res.status(400).json({ message: "Invalid or expired code" });
		}

		const user = await User.findOne({ phoneNumber });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.password = password;
		await user.save();

		await redis.del(`reset_code:${phoneNumber}`);

		res.json({ message: "Password reset successfully" });
	} catch (error) {
		console.error("Error in resetPassword controller", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
