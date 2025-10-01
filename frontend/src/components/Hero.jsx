import { TypeAnimation } from "react-type-animation";

const Hero = () => {
	return (
		<div
			className='relative h-[60vh] bg-cover bg-center text-white'
			style={{ backgroundImage: "url(/sample.jpg)" }}>
			<div className='absolute inset-0 bg-black opacity-50'></div>
			<div className='relative z-10 flex flex-col items-center justify-center h-full text-center px-4'>
				<TypeAnimation
					sequence={[
						"Pungko-Pungko at your Doorstep",
						2000,
						"The best street food in town...",
						2000,
						"Now available for delivery.",
						2000,
					]}
					wrapper='h1'
					speed={50}
					className='text-5xl font-bold'
					repeat={Infinity}
				/>
			</div>
		</div>
	);
};

export default Hero;