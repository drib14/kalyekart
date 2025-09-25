import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [6, "Password must be at least 6 characters long"],
		},
		profilePicture: {
			type: String,
			default: "",
		},
		phoneNumber: {
			type: String,
		},
		// Admin-specific fields
		storeName: {
			type: String,
		},
		storeAddress: {
			type: String,
		},
		operatingHours: {
			type: String,
		},
		cartItems: [
			{
				quantity: {
					type: Number,
					default: 1,
				},
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
				},
			},
		],
		role: {
			type: String,
			enum: ["customer", "admin"],
			default: "customer",
		},
		hasSetSecurityQuestions: {
			type: Boolean,
			default: false,
		},
		securityQuestions: [
			{
				question: {
					type: String,
				},
				answer: {
					type: String,
				},
			},
		],
		passwordResetCode: {
			type: String,
		},
		passwordResetExpires: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

// Pre-save hook to hash password and security answers before saving to database
userSchema.pre("save", async function (next) {
	if (this.isModified("password")) {
		try {
			const salt = await bcrypt.genSalt(10);
			this.password = await bcrypt.hash(this.password, salt);
		} catch (error) {
			return next(error);
		}
	}

	if (this.isModified("securityQuestions")) {
		try {
			for (let i = 0; i < this.securityQuestions.length; i++) {
				const salt = await bcrypt.genSalt(10);
				this.securityQuestions[i].answer = await bcrypt.hash(this.securityQuestions[i].answer, salt);
			}
		} catch (error) {
			return next(error);
		}
	}

	next();
});

userSchema.methods.comparePassword = async function (password) {
	return bcrypt.compare(password, this.password);
};

userSchema.methods.compareSecurityAnswer = async function (answer, index) {
	return bcrypt.compare(answer, this.securityQuestions[index].answer);
};

const User = mongoose.model("User", userSchema);

export default User;
