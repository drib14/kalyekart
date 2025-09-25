import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Helper function to parse cookies from header in case cookie-parser fails
const parseCookies = (cookieHeader) => {
	const list = {};
	if (!cookieHeader) return list;

	cookieHeader.split(`;`).forEach(function(cookie) {
		let [ name, ...rest] = cookie.split(`=`);
		name = name?.trim();
		if (!name) return;
		const value = rest.join(`=`).trim();
		if (!value) return;
		list[name] = decodeURIComponent(value);
	});

	return list;
}

export const protectRoute = async (req, res, next) => {
	try {
		let accessToken = req.cookies?.accessToken;

		// Fallback for cases where cookie-parser might not work (e.g., with multipart/form-data)
		if (!accessToken && req.headers.cookie) {
			const cookies = parseCookies(req.headers.cookie);
			accessToken = cookies.accessToken;
		}

		if (!accessToken) {
			return res.status(401).json({ message: "Unauthorized - No access token provided" });
		}

		try {
			const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
			const user = await User.findById(decoded.userId).select("-password");

			if (!user) {
				return res.status(401).json({ message: "User not found" });
			}

			req.user = user;

			next();
		} catch (error) {
			if (error.name === "TokenExpiredError") {
				// The frontend interceptor should handle this by refreshing the token
				return res.status(401).json({ message: "Unauthorized - Access token expired" });
			}
			// For other JWT errors (e.g., malformed token)
			return res.status(401).json({ message: "Unauthorized - Invalid token" });
		}
	} catch (error) {
		console.log("Error in protectRoute middleware", error.message);
		return res.status(500).json({ message: "Server error during authentication" });
	}
};

export const adminRoute = (req, res, next) => {
	if (req.user && req.user.role === "admin") {
		next();
	} else {
		return res.status(403).json({ message: "Access denied - Admin only" });
	}
};