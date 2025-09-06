import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../lib/email.js";

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

		// Send welcome email
		const subject = "Welcome to KalyeKart!";
		const html = `
		<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
			<div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
				<div style="text-align: center; padding-bottom: 20px;">
					<h1 style="color: #10B981;">Welcome to KalyeKart!</h1>
				</div>
				<h2>Hi ${user.name},</h2>
				<p>Thank you for joining KalyeKart, your one-stop shop for the best "pungko-pungko" in town. We're thrilled to have you with us!</p>
				<p>Get ready to explore a world of delicious street food, delivered right to your doorstep. To get you started, here's a little something from us:</p>
				<div style="text-align: center; margin: 20px 0;">
					<p style="font-size: 1.2em;">Use the code <strong style="color: #10B981;">NEWBIE10</strong> for 10% off your first order!</p>
				</div>
				<p>Happy eating!</p>
				<p>Best,</p>
				<p><strong>The KalyeKart Team</strong></p>
				<div style="text-align: center; padding-top: 20px; font-size: 0.9em; color: #777;">
					<p>If you have any questions, feel free to contact us at ${process.env.EMAIL_USER}.</p>
				</div>
			</div>
		</div>
		`;
		await sendEmail(user.email, subject, html);


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

export const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const code = Math.floor(100000 + Math.random() * 900000).toString();
		await redis.set(`password_reset:${email}`, code, "EX", 15 * 60); // 15 minutes

		const subject = "Your Password Reset Code";
		const html = `<p>Your password reset code is: <strong>${code}</strong></p>
					  <p>This code will expire in 15 minutes.</p>`;

		await sendEmail(email, subject, html);

		res.json({ message: "Password reset code sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { email, code, newPassword } = req.body;
		const storedCode = await redis.get(`password_reset:${email}`);

		if (!storedCode || storedCode !== code) {
			return res.status(400).json({ message: "Invalid or expired reset code" });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.password = newPassword;
		await user.save();

		await redis.del(`password_reset:${email}`);

		res.json({ message: "Password reset successfully" });
	} catch (error) {
		console.log("Error in resetPassword controller", error.message);
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
