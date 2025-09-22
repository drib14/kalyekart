import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "../lib/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { motion } from "framer-motion";

const AnswerSecurityQuestionsPage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { email, questions } = location.state || { email: "", questions: [] };

	const [answers, setAnswers] = useState(Array(questions.length).fill(""));

	const { mutate: verifyAnswers, isPending } = useMutation({
		mutationFn: (data) => {
			return axios.post("/auth/verify-security-answers", data);
		},
		onSuccess: (data) => {
			toast.success("Answers verified! Redirecting to reset password...");
			navigate("/reset-password", { state: { resetToken: data.data.resetToken } });
		},
		onError: (error) => {
			toast.error(error.response.data.message);
		},
	});

	const handleAnswerChange = (index, value) => {
		const newAnswers = [...answers];
		newAnswers[index] = value;
		setAnswers(newAnswers);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		verifyAnswers({ email, answers });
	};

	if (!questions || questions.length === 0) {
		return (
			<div className='text-center py-10'>
				<p>No security questions found for this user.</p>
			</div>
		);
	}

	return (
		<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
			<motion.div
				className='sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<h2 className='mt-6 text-center text-3xl font-extrabold text-emerald-400'>
					Answer Your Security Questions
				</h2>
			</motion.div>

			<motion.div
				className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
			>
				<div className='bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10'>
					<form onSubmit={handleSubmit} className='space-y-6'>
						{questions.map((question, index) => (
							<div key={index}>
								<label htmlFor={`question-${index}`} className='block text-sm font-medium text-gray-300'>
									{question}
								</label>
								<div className='mt-1'>
									<input
										id={`question-${index}`}
										type='text'
										required
										value={answers[index]}
										onChange={(e) => handleAnswerChange(index, e.target.value)}
										className='block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm
                                         placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
									/>
								</div>
							</div>
						))}

						<button
							type='submit'
							className='w-full flex justify-center py-2 px-4 border border-transparent
							rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600
							 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
							  focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50'
							disabled={isPending}
						>
							{isPending ? <LoadingSpinner /> : "Verify Answers"}
						</button>
					</form>
				</div>
			</motion.div>
		</div>
	);
};

export default AnswerSecurityQuestionsPage;
