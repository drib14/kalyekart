const LoadingSpinner = ({ size = "md", fullScreen = false }) => {
	const sizeClasses = {
		sm: "w-5 h-5",
		md: "w-10 h-10",
		lg: "w-20 h-20",
	};

	const borderClasses = {
		sm: "border-2",
		md: "border-2",
		lg: "border-2",
	};

	const spinner = (
		<div className='relative'>
			<div className={`${sizeClasses[size]} ${borderClasses[size]} border-emerald-200 rounded-full`} />
			<div
				className={`${sizeClasses[size]} border-emerald-500 border-t-2 animate-spin rounded-full absolute left-0 top-0`}
			/>
			<div className='sr-only'>Loading...</div>
		</div>
	);

	if (fullScreen) {
		return (
			<div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75'>
				{spinner}
			</div>
		);
	}

	return spinner;
};

export default LoadingSpinner;