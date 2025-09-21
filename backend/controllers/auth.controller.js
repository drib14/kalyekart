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
	const { email, password, name } = req.body;
	try {
		const userExists = await User.findOne({ email });

		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}
		const user = await User.create({ name, email, password });

		// authenticate
		const { accessToken, refreshToken } = generateTokens(user._id);
		await storeRefreshToken(user._id, refreshToken);

		setCookies(res, accessToken, refreshToken);

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			hasSetSecurityQuestions: user.hasSetSecurityQuestions,
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
				hasSetSecurityQuestions: user.hasSetSecurityQuestions,
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

export const setSecurityQuestions = async (req, res) => {
	try {
		const { securityQuestions } = req.body;
		const userId = req.user._id;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.securityQuestions = securityQuestions;
		user.hasSetSecurityQuestions = true;
		await user.save();

		res.json({ message: "Security questions set successfully" });
	} catch (error) {
		console.error("Error setting security questions:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getSecurityQuestions = async (req, res) => {
	try {
		const { email } = req.params;
		const user = await User.findOne({ email });

		if (!user || !user.hasSetSecurityQuestions) {
			return res.status(404).json({ message: "User not found or security questions not set" });
		}

		const questions = user.securityQuestions.map((q) => q.question);
		res.json({ questions });
	} catch (error) {
		console.error("Error getting security questions:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const verifySecurityAnswers = async (req, res) => {
	try {
		const { email, answers } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		if (answers.length !== user.securityQuestions.length) {
			return res.status(400).json({ message: "Incorrect number of answers" });
		}

		for (let i = 0; i < answers.length; i++) {
			const isMatch = await user.compareSecurityAnswer(answers[i], i);
			if (!isMatch) {
				return res.status(400).json({ message: "One or more answers are incorrect" });
			}
		}

		const resetToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10m" });
		res.json({ message: "Answers verified successfully", resetToken });
	} catch (error) {
		console.error("Error verifying security answers:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const resetPasswordWithToken = async (req, res) => {
	try {
		const { resetToken, password } = req.body;
		if (!resetToken) {
			return res.status(400).json({ message: "Reset token is required" });
		}

		const decoded = jwt.verify(resetToken, process.env.ACCESS_TOKEN_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.password = password;
		await user.save();

		res.json({ message: "Password has been reset successfully" });
	} catch (error) {
		console.error("Error resetting password with token:", error);
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

export const getProfile = async (req, res) => {
	try {
		res.json(req.user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
