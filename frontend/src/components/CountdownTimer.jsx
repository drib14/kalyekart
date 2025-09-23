import { useState, useEffect } from "react";

const CountdownTimer = ({ eta }) => {
	const calculateTimeLeft = () => {
		const difference = new Date(eta) - new Date();
		let timeLeft = {};

		if (difference > 0) {
			timeLeft = {
				minutes: Math.floor((difference / 1000 / 60) % 60),
				seconds: Math.floor((difference / 1000) % 60),
			};
		}

		return timeLeft;
	};

	const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

	useEffect(() => {
		const timer = setTimeout(() => {
			setTimeLeft(calculateTimeLeft());
		}, 1000);

		return () => clearTimeout(timer);
	});

	const timerComponents = [];

	Object.keys(timeLeft).forEach((interval) => {
		if (!timeLeft[interval]) {
			return;
		}

		timerComponents.push(
			<span key={interval}>
				{timeLeft[interval]}
				{interval.charAt(0)}{" "}
			</span>
		);
	});

	return (
		<div>
			{timerComponents.length ? (
				<div className='text-2xl font-bold text-yellow-400'>{timerComponents}</div>
			) : (
				<span className='text-sm text-gray-400 italic'>Updating status...</span>
			)}
		</div>
	);
};

export default CountdownTimer;
