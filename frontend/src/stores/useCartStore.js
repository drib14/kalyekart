import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "sonner";
import { useUserStore } from "./useUserStore";

export const useCartStore = create((set, get) => ({
	cart: [],
	appliedDiscount: null,
	discountAmount: 0,
	total: 0,
	subtotal: 0,

	applyDiscount: async (code, deliveryFee) => {
		if (get().appliedDiscount?.code === code) {
			return; // Don't re-apply the same discount
		}
		try {
			const { subtotal } = get();
			const response = await axios.post("/discounts/apply", { code, subtotal, deliveryFee });
			set({
				appliedDiscount: { code: response.data.code },
				discountAmount: response.data.discountAmount,
			});
			get().calculateTotals();
			toast.success("Discount applied successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to apply discount");
		}
	},

	removeDiscount: () => {
		set({ appliedDiscount: null, discountAmount: 0 });
		get().calculateTotals();
		toast.success("Discount removed");
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
			await axios.delete("/cart/all/clear");
			set({ cart: [], appliedDiscount: null, discountAmount: 0, total: 0, subtotal: 0 });
		} catch (error) {
			console.error("Failed to clear cart:", error);
		}
	},
	addToCart: async (product) => {
		const user = useUserStore.getState().user;
		if (user && user.role !== "customer") {
			toast.error("Only customers can place orders.");
			return;
		}
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
			const res = await axios.delete(`/cart/${productId}`);
			set({ cart: res.data });
			get().calculateTotals();
			toast.success("Product removed from cart");
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
		const { cart, discountAmount } = get();
		const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
		let total = subtotal - discountAmount;

		set({ subtotal, total });
	},
}));
