import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const ResetPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const { mutate: resetPassword, isPending } = useMutation({
		mutationFn: (data) => {
			return axios.post("/auth/reset-password", data);
		},
		onSuccess: () => {
			toast.success("Password reset successfully");
			navigate("/login");
		},
		onError: (error) => {
			toast.error(error.response.data.message);
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		resetPassword({ email, code, password });
	};

	return (
		<main className='container my-10'>
			<Card className='max-w-lg mx-auto'>
				<CardHeader>
					<CardTitle>Reset Password</CardTitle>
					<CardDescription>
						Enter your email, the code you received, and your new password.
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
						<div className='grid gap-2'>
							<Label htmlFor='code'>Code</Label>
							<Input
								id='code'
								type='text'
								placeholder='123456'
								required
								value={code}
								onChange={(e) => setCode(e.target.value)}
							/>
						</div>
						<div className='grid gap-2'>
							<Label htmlFor='password'>New Password</Label>
							<Input
								id='password'
								type='password'
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>

						<Button type='submit' className='w-full' disabled={isPending}>
							{isPending ? <LoadingSpinner /> : "Reset Password"}
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

export default ResetPasswordPage;
