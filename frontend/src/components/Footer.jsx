import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const Footer = () => {
	const siteUrl = window.location.origin;

	return (
		<footer className='bg-gray-800 text-white mt-auto py-12'>
			<div className='container mx-auto px-6'>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
					{/* Brand Section (col-span-2 on sm screens) */}
					<div className='flex flex-col items-center text-center sm:text-left sm:items-start sm:col-span-2 lg:col-span-1'>
						<div className='flex items-center mb-4'>
							<img src='/logo.jpg' alt='KalyeKart Logo' className='h-12 w-12 rounded-full mr-3' />
							<span className='text-2xl font-bold text-emerald-400'>KalyeKart</span>
						</div>
						<p className='text-gray-400'>Your favorite online marketplace.</p>
					</div>

					{/* Quick Links Section */}
					<div className='flex flex-col items-center sm:items-start'>
						<h3 className='text-xl font-semibold mb-4 text-emerald-400'>Quick Links</h3>
						<ul className='space-y-2 text-center sm:text-left'>
							<li>
								<Link to='/' className='hover:text-emerald-300 transition-colors'>
									Home
								</Link>
							</li>
							<li>
								<Link to='/my-orders' className='hover:text-emerald-300 transition-colors'>
									My Orders
								</Link>
							</li>
							<li>
								<Link to='/profile/customer' className='hover:text-emerald-300 transition-colors'>
									Profile
								</Link>
							</li>
						</ul>
					</div>

					{/* Contact Info & QR Code Wrapper */}
					<div className='sm:col-span-2 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8'>
						{/* Contact Info Section */}
						<div className='flex flex-col items-center sm:items-start'>
							<h3 className='text-xl font-semibold mb-4 text-emerald-400'>Contact Us</h3>
							<ul className='space-y-3 text-gray-300 text-center sm:text-left'>
								<li className='flex items-start'>
									<Phone className='h-5 w-5 mr-3 mt-1 text-emerald-400 flex-shrink-0' />
									<span>09622146172</span>
								</li>
								<li className='flex items-start'>
									<Mail className='h-5 w-5 mr-3 mt-1 text-emerald-400 flex-shrink-0' />
									<a href='mailto:kalyekart@gmail.com' className='hover:text-emerald-300 transition-colors'>
										kalyekart@gmail.com
									</a>
								</li>
								<li className='flex items-start'>
									<MapPin className='h-5 w-5 mr-3 mt-1 text-emerald-400 flex-shrink-0' />
									<span>Tres de Abril Ext. Brgy. Labangon Cebu City Philippines</span>
								</li>
							</ul>
						</div>

						{/* QR Code Section */}
						<div className='flex flex-col items-center sm:items-start'>
							<h3 className='text-xl font-semibold mb-4 text-emerald-400'>Scan to Visit</h3>
							<div className='bg-white p-2 rounded-lg inline-block shadow-lg'>
								<QRCodeCanvas
									value={siteUrl}
									size={128}
									bgColor={"#ffffff"}
									fgColor={"#000000"}
									level={"H"}
									imageSettings={{
										src: "/logo.jpg",
										height: 24,
										width: 24,
										excavate: true,
									}}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className='border-t border-gray-700 mt-10 pt-6 text-center text-gray-500'>
					<p>&copy; {new Date().getFullYear()} KalyeKart. All Rights Reserved.</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;