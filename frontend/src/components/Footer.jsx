import React from "react";
import QRCode from "qrcode.react";

const Footer = () => {
	const homepageUrl = window.location.origin;

	return (
		<footer className='bg-gray-800 text-white py-8 px-4 sm:px-6 lg:px-8 mt-10'>
			<div className='max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center'>
				<div className='text-center md:text-left mb-4 md:mb-0'>
					<h2 className='text-2xl font-bold text-emerald-400'>KalyeKart</h2>
					<p className='text-gray-400 mt-2'>Your favorite street food, delivered.</p>
					<p className='text-gray-500 text-sm mt-4'>
						&copy; {new Date().getFullYear()} KalyeKart. All rights reserved.
					</p>
				</div>
				<div className='flex flex-col items-center'>
					<p className='text-gray-400 mb-2'>Scan to visit our homepage</p>
					<div className='bg-white p-2 rounded-lg'>
						<QRCode value={homepageUrl} size={128} bgColor='#ffffff' fgColor='#000000' level='Q' />
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;