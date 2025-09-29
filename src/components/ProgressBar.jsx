const ProgressBar = ({ status }) => {
	const statuses = ["Pending", "Preparing", "Out for Delivery", "Delivered"];
	const currentStatusIndex = statuses.indexOf(status);

	return (
		<div className='w-full bg-gray-700 rounded-full h-2.5'>
			<div
				className='bg-emerald-400 h-2.5 rounded-full'
				style={{ width: `${((currentStatusIndex + 1) / statuses.length) * 100}%` }}
			></div>
		</div>
	);
};

export default ProgressBar;
