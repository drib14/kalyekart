const Hero = () => {
	return (
		<div
			className='relative h-[60vh] bg-cover bg-center text-white'
			style={{ backgroundImage: "url(/sample.jpg)" }}>
			<div className='absolute inset-0 bg-black opacity-50'></div>
			<div className='relative z-10 flex flex-col items-center justify-center h-full text-center'>
				<h1 className='text-5xl font-bold'>Pungko-Pungko at your Doorstep</h1>
				<p className='text-xl mt-4'>The best street food in town, now available for delivery.</p>
			</div>
		</div>
	);
};

export default Hero;