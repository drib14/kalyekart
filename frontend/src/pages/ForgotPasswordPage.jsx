import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { axios } from "../lib/axios";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import LoadingSpinner from "../components/LoadingSpinner";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");

	const { mutate: forgotPassword, isPending } = useMutation({
		mutationFn: (email) => {
			return axios.post("/auth/forgot-password", { email });
		},
		onSuccess: () => {
			toast.success("Password reset code sent to your email");
		},
		onError: (error) => {
			toast.error(error.response.data.message);
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		forgotPassword(email);
	};

	return (
		<main className='container my-10'>
			<Card className='max-w-lg mx-auto'>
				<CardHeader>
					<CardTitle>Forgot Password</CardTitle>
					<CardDescription>
						Enter your email address and we will send you a code to reset your password.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='grid gap-4'>
						<div className='grid gap-2'>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								type='email'
								placeholder='m@example.com'
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>

						<Button type='submit' className='w-full' disabled={isPending}>
							{isPending ? <LoadingSpinner /> : "Send Code"}
						</Button>
					</form>
				</CardContent>
				<CardFooter className='text-sm'>
					<p>
						Remember your password?{" "}
						<Link to='/login' className='underline'>
							Login
						</Link>
					</p>
				</CardFooter>
			</Card>
		</main>
	);
};

export default ForgotPasswordPage;
