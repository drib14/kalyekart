import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
	cart: [],
	availableCoupon: null,
	appliedCoupon: null,
	total: 0,
	subtotal: 0,

	getMyCoupon: async () => {
		try {
			const response = await axios.get("/coupons");
			set({ availableCoupon: response.data });
		} catch (error) {
			console.error("Error fetching coupon:", error);
		}
	},
	applyCoupon: async (code) => {
		try {
			const response = await axios.post("/coupons/validate", { code });
			set({ appliedCoupon: response.data });
			get().calculateTotals();
			toast.success("Coupon applied successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to apply coupon");
		}
	},
	removeCoupon: () => {
		set({ appliedCoupon: null });
		get().calculateTotals();
		toast.success("Coupon removed");
	},

	getCartItems: async () => {
		try {
			const res = await axios.get("/cart");
			set({ cart: res.data });
			get().calculateTotals();
		} catch (error) {
			set({ cart: [] });
			toast.error(error.response?.data?.message || "An error occurred");
		}
	},
	clearCart: async () => {
		try {
			const res = await axios.delete("/cart");
			set({ cart: res.data, appliedCoupon: null, availableCoupon: null, total: 0, subtotal: 0 });
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to clear cart");
		}
	},
	addToCart: async (product) => {
		try {
			const res = await axios.post("/cart", { productId: product._id });
			set({ cart: res.data });
			get().calculateTotals();
			toast.success("Product added to cart");
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred");
		}
	},
	removeFromCart: async (productId) => {
		try {
			const res = await axios.delete(`/cart`, { data: { productId } });
			set({ cart: res.data });
			get().calculateTotals();
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred");
		}
	},
	updateQuantity: async (productId, quantity) => {
		try {
			if (quantity === 0) {
				get().removeFromCart(productId);
				return;
			}
			const res = await axios.put(`/cart/${productId}`, { quantity });
			set({ cart: res.data });
			get().calculateTotals();
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred");
		}
	},
	calculateTotals: () => {
		const { cart, appliedCoupon } = get();
		const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
		let total = subtotal;

		if (appliedCoupon) {
			const discount = subtotal * (appliedCoupon.discountPercentage / 100);
			total = subtotal - discount;
		}

		set({ subtotal, total });
	},
}));
