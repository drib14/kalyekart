import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../lib/email.js";
import { prepareUserResponse } from "../lib/prepareUserResponse.js";

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
	const isProduction = process.env.NODE_ENV === "production";
	const cookieOptions = {
		httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? "none" : "strict",
	};

	res.cookie("accessToken", accessToken, {
		...cookieOptions,
		maxAge: 15 * 60 * 1000, // 15 minutes
	});

	res.cookie("refreshToken", refreshToken, {
		...cookieOptions,
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	});
};

export const signup = async (req, res) => {
	const { email, password, name } = req.body;
	try {
		const userExists = await User.findOne({ email });

		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}
		const user = await User.create({ name, email, password });

		const { accessToken, refreshToken } = generateTokens(user._id);
		await storeRefreshToken(user._id, refreshToken);
		setCookies(res, accessToken, refreshToken);

		await sendEmail(user.email, "Welcome to KalyeKart!", "welcome", {
			NAME: user.name,
			CTA_LINK: `${process.env.CLIENT_URL}/`,
		});

		const userToReturn = prepareUserResponse(user);
		res.status(201).json(userToReturn);
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

			const userToReturn = prepareUserResponse(user);
			res.json(userToReturn);
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

export const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(200).json({ message: "If a user with that email exists, a password reset code has been sent." });
		}

		const resetCode = crypto.randomInt(100000, 999999).toString();
		user.passwordResetCode = resetCode;
		user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
		await user.save();

		await sendEmail(user.email, "Your Password Reset Code", "passwordReset", {
			NAME: user.name,
			CODE: resetCode,
		});

		res.status(200).json({ message: "A password reset code has been sent to your email." });
	} catch (error) {
		console.error("Error in forgotPassword controller:", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { email, code, password } = req.body;

		const user = await User.findOne({
			email,
			passwordResetExpires: { $gt: Date.now() },
		});

		if (!user || user.passwordResetCode !== code) {
			return res.status(400).json({ message: "Invalid code or code has expired." });
		}

		user.password = password;
		user.passwordResetCode = undefined;
		user.passwordResetExpires = undefined;
		await user.save();

		res.status(200).json({ message: "Password has been reset successfully." });
	} catch (error) {
		console.error("Error in resetPassword controller:", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

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

		const isProduction = process.env.NODE_ENV === "production";
		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: isProduction,
			sameSite: isProduction ? "none" : "strict",
			maxAge: 15 * 60 * 1000,
		});

		res.json({ message: "Token refreshed successfully" });
	} catch (error) {
		console.log("Error in refreshToken controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProfile = async (req, res) => {
	try {
		const userToReturn = prepareUserResponse(req.user);
		res.json(userToReturn);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};