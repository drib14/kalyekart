import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { axios } from "../lib/axios";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
	const { cart, clearCart } = useCartStore();
	const { user } = useUserStore();
	const navigate = useNavigate();

	const [paymentMethod, setPaymentMethod] = useState("card");
	const [billing, setBilling] = useState({
		name: user?.name || "",
		email: user?.email || "",
		phone: "",
		address: {
			line1: "",
			city: "",
			state: "Cebu",
			postal_code: "",
		},
	});

	const { mutate: createCheckout, isPending } = useMutation({
		mutationFn: (data) => {
			return axios.post("/payment/checkout", data);
		},
		onSuccess: (data) => {
			if (data.checkout_url) {
				window.location.href = data.checkout_url;
			} else {
				toast.success("Order placed successfully");
				clearCart();
				navigate("/purchase-success");
			}
		},
		onError: (error) => {
			toast.error(error.response.data.message);
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		const products = cart.map((item) => ({
			_id: item.product._id,
			name: item.product.name,
			price: item.product.price,
			quantity: item.quantity,
			image: item.product.image,
		}));
		createCheckout({ products, paymentMethod, billing });
	};

	const handleBillingChange = (e) => {
		const { name, value } = e.target;
		if (name.includes(".")) {
			const [parent, child] = name.split(".");
			setBilling((prev) => ({
				...prev,
				[parent]: {
					...prev[parent],
					[child]: value,
				},
			}));
		} else {
			setBilling((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	return (
		<main className='container my-10'>
			<Card className='max-w-2xl mx-auto'>
				<CardHeader>
					<CardTitle>Checkout</CardTitle>
					<CardDescription>
						Please fill in your details to complete the purchase.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='grid gap-6'>
						<div>
							<h3 className='text-lg font-medium mb-4'>Billing Information</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='grid gap-2'>
									<Label htmlFor='name'>Full Name</Label>
									<Input
										id='name'
										name='name'
										required
										value={billing.name}
										onChange={handleBillingChange}
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='email'>Email</Label>
									<Input
										id='email'
										name='email'
										type='email'
										required
										value={billing.email}
										onChange={handleBillingChange}
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='phone'>Phone Number</Label>
									<Input
										id='phone'
										name='phone'
										required
										value={billing.phone}
										onChange={handleBillingChange}
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='line1'>Address Line 1</Label>
									<Input
										id='line1'
										name='address.line1'
										required
										value={billing.address.line1}
										onChange={handleBillingChange}
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='city'>City</Label>
									<Input
										id='city'
										name='address.city'
										required
										value={billing.address.city}
										onChange={handleBillingChange}
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='postal_code'>Postal Code</Label>
									<Input
										id='postal_code'
										name='address.postal_code'
										required
										value={billing.address.postal_code}
										onChange={handleBillingChange}
									/>
								</div>
							</div>
						</div>

						<div>
							<h3 className='text-lg font-medium mb-4'>Payment Method</h3>
							<div className='flex gap-4'>
								<Label
									htmlFor='card'
									className={`p-4 border rounded-lg cursor-pointer ${
										paymentMethod === "card" ? "border-emerald-500" : ""
									}`}
								>
									<Input
										id='card'
										type='radio'
										name='paymentMethod'
										value='card'
										checked={paymentMethod === "card"}
										onChange={(e) => setPaymentMethod(e.target.value)}
										className='hidden'
									/>
									Pay with Card/GCash
								</Label>
								<Label
									htmlFor='cod'
									className={`p-4 border rounded-lg cursor-pointer ${
										paymentMethod === "cod" ? "border-emerald-500" : ""
									}`}
								>
									<Input
										id='cod'
										type='radio'
										name='paymentMethod'
										value='cod'
										checked={paymentMethod === "cod"}
										onChange={(e) => setPaymentMethod(e.target.value)}
										className='hidden'
									/>
									Cash on Delivery
								</Label>
							</div>
						</div>

						<Button type='submit' className='w-full' disabled={isPending}>
							{isPending ? <LoadingSpinner /> : "Place Order"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</main>
	);
};

export default CheckoutPage;
