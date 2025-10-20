import Discount from "../models/discount.model.js";
import UserDiscount from "../models/userDiscount.model.js";

// @desc    Create a new discount
// @route   POST /api/discounts
// @access  Admin
export const createDiscount = async (req, res) => {
	try {
		const {
			code,
			title,
			description,
			type,
			value,
			minimumOrderValue,
			validFrom,
			validUntil,
			usageLimit,
		} = req.body;

		// Basic validation
		if (
			!code ||
			!title ||
			!type ||
			!value ||
			!validFrom ||
			!validUntil
		) {
			return res.status(400).json({ message: "Please fill in all required fields." });
		}

		const newDiscount = new Discount({
			code,
			title,
			description,
			type,
			value,
			minimumOrderValue,
			validFrom,
			validUntil,
			usageLimit,
		});

		await newDiscount.save();

		res.status(201).json(newDiscount);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// @desc    Get all discounts for a user
// @route   GET /api/discounts/my-discounts
// @access  Private
export const getMyDiscounts = async (req, res) => {
	try {
		const discounts = await Discount.find({
			status: "active",
			validUntil: { $gte: new Date() },
		});
		res.json(discounts);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// @desc    Get all discounts
// @route   GET /api/discounts
// @access  Admin
export const getDiscounts = async (req, res) => {
	try {
		const discounts = await Discount.find({});
		res.json(discounts);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// @desc    Get a single discount by ID
// @route   GET /api/discounts/:id
// @access  Admin
export const getDiscountById = async (req, res) => {
	try {
		const discount = await Discount.findById(req.params.id);

		if (discount) {
			res.json(discount);
		} else {
			res.status(404).json({ message: "Discount not found" });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// @desc    Update a discount
// @route   PUT /api/discounts/:id
// @access  Admin
export const updateDiscount = async (req, res) => {
	try {
		const discount = await Discount.findById(req.params.id);

		if (discount) {
			discount.code = req.body.code || discount.code;
			discount.title = req.body.title || discount.title;
			discount.description = req.body.description || discount.description;
			discount.type = req.body.type || discount.type;
			discount.value = req.body.value || discount.value;
			discount.minimumOrderValue =
				req.body.minimumOrderValue || discount.minimumOrderValue;
			discount.validFrom = req.body.validFrom || discount.validFrom;
			discount.validUntil = req.body.validUntil || discount.validUntil;
			discount.usageLimit = req.body.usageLimit || discount.usageLimit;
			discount.status = req.body.status || discount.status;

			const updatedDiscount = await discount.save();
			res.json(updatedDiscount);
		} else {
			res.status(404).json({ message: "Discount not found" });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// @desc    Delete a discount
// @route   DELETE /api/discounts/:id
// @access  Admin
export const deleteDiscount = async (req, res) => {
	try {
		const discount = await Discount.findById(req.params.id);

		if (discount) {
			await discount.deleteOne();
			res.json({ message: "Discount removed" });
		} else {
			res.status(404).json({ message: "Discount not found" });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// @desc    Apply a discount to a cart
// @route   POST /api/discounts/apply
// @access  Private
export const applyDiscount = async (req, res) => {
	try {
		const { code, subtotal } = req.body;
		const userId = req.user._id;

		const discount = await Discount.findOne({ code });

		if (!discount) {
			return res.status(404).json({ message: "Discount not found" });
		}

		if (discount.status !== "active") {
			return res.status(400).json({ message: "Discount is not active" });
		}

		const now = new Date();
		if (now < discount.validFrom || now > discount.validUntil) {
			return res.status(400).json({ message: "Discount has expired" });
		}

		if (discount.usageLimit && discount.timesUsed >= discount.usageLimit) {
			return res.status(400).json({ message: "Discount has reached its usage limit" });
		}

		if (subtotal < discount.minimumOrderValue) {
			return res
				.status(400)
				.json({
					message: `Minimum order value of ${discount.minimumOrderValue} is required`,
				});
		}

		let discountAmount = 0;
		if (discount.type === "percentage") {
			discountAmount = (subtotal * discount.value) / 100;
		} else {
			discountAmount = discount.value;
		}

		res.json({
			discountId: discount._id,
			code: discount.code,
			discountAmount,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};
