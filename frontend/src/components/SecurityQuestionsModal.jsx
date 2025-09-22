import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "../lib/axios";
import LoadingSpinner from "./LoadingSpinner";
import { useUserStore } from "../stores/useUserStore";

const securityQuestionsList = [
	"What was your first pet's name?",
	"What is your mother's maiden name?",
	"What was the name of your elementary school?",
	"In what city were you born?",
	"What is your favorite book?",
];

const SecurityQuestionsModal = () => {
	const { user, checkAuth } = useUserStore();
	const [questions, setQuestions] = useState([
		{ question: "", answer: "" },
		{ question: "", answer: "" },
		{ question: "", answer: "" },
	]);

	const { mutate: setSecurityQuestions, isPending } = useMutation({
		mutationFn: (data) => {
			return axios.post("/auth/set-security-questions", data);
		},
		onSuccess: () => {
			toast.success("Security questions set successfully");
			// Refetch user to update the hasSetSecurityQuestions flag
			checkAuth();
		},
		onError: (error) => {
			toast.error(error.response.data.message);
		},
	});

	const handleQuestionChange = (index, value) => {
		const newQuestions = [...questions];
		newQuestions[index].question = value;
		setQuestions(newQuestions);
	};

	const handleAnswerChange = (index, value) => {
		const newQuestions = [...questions];
		newQuestions[index].answer = value;
		setQuestions(newQuestions);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		setSecurityQuestions({ securityQuestions: questions });
	};

	if (!user || user.hasSetSecurityQuestions) {
		return null;
	}

	return (
		<div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'>
			<div className='bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto'>
				<h2 className='text-xl sm:text-2xl font-bold text-emerald-400 mb-2'>
					Set Up Your Security Questions
				</h2>
				<p className='text-gray-400 text-sm mb-2'>
					This is a required step to ensure you can recover your account if you forget your password.
				</p>
				<p className='text-xs sm:text-sm text-yellow-400 mb-4'>
					Warning: Please remember your answers. You will need them to recover your password.
				</p>
				<form onSubmit={handleSubmit} className='space-y-3'>
					{questions.map((q, index) => (
						<div key={index} className='space-y-1'>
							<label className='block text-xs sm:text-sm font-medium text-gray-300'>
								Question {index + 1}
							</label>
							<select
								value={q.question}
								onChange={(e) => handleQuestionChange(index, e.target.value)}
								required
								className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-sm'
							>
								<option value='' disabled>
									Select a question
								</option>
								{securityQuestionsList.map((sq) => (
									<option key={sq} value={sq}>
										{sq}
									</option>
								))}
							</select>
							<label className='block text-xs sm:text-sm font-medium text-gray-300'>Answer</label>
							<input
								type='text'
								value={q.answer}
								onChange={(e) => handleAnswerChange(index, e.target.value)}
								required
								className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-sm'
							/>
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
						{isPending ? <LoadingSpinner /> : "Save Security Questions"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default SecurityQuestionsModal;
