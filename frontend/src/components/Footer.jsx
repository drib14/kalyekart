import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { Home, User, ShoppingBag, Phone, Mail, MapPin, ShieldCheck } from "lucide-react";

const Footer = () => {
	const { user } = useUserStore();
	const homepageUrl = window.location.origin;

	const getProfileLink = () => {
		if (!user) return "/login";
		return user.role === "admin" ? "/profile/admin" : "/profile/customer";
	};

	const qrCodeOptions = {
		value: homepageUrl,
		size: 128,
		bgColor: "#ffffff",
		fgColor: "#000000",
		level: "H",
		imageSettings: {
			src: "/logo.jpg",
			x: undefined,
			y: undefined,
			height: 32,
			width: 32,
			excavate: true,
		},
	};

	return (
		<footer className='bg-gray-800 text-white mt-auto relative z-10'>
			<div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
					{/* Section 1: Logo and Description */}
					<div className='md:col-span-2 lg:col-span-1'>
						<div className='flex items-center mb-4'>
							<img src='/logo.jpg' alt='KalyeKart Logo' className='h-10 w-10 mr-3 rounded-full' />
							<h2 className='text-2xl font-bold text-emerald-400'>KalyeKart</h2>
						</div>
						<p className='text-gray-400'>Your favorite street food, delivered right to your doorstep.</p>
					</div>

					{/* Section 2: Quick Links */}
					<div>
						<h3 className='text-lg font-semibold text-emerald-400 mb-4'>Quick Links</h3>
						<ul className='space-y-2'>
							<li>
								<Link to='/' className='flex items-center text-gray-300 hover:text-white'>
									<Home className='h-5 w-5 mr-2' /> Home
								</Link>
							</li>
							<li>
								<Link to={getProfileLink()} className='flex items-center text-gray-300 hover:text-white'>
									<User className='h-5 w-5 mr-2' /> Profile
								</Link>
							</li>
							{user && (
								<li>
									<Link to='/my-orders' className='flex items-center text-gray-300 hover:text-white'>
										<ShoppingBag className='h-5 w-5 mr-2' /> My Orders
									</Link>
								</li>
							)}
							<li>
								<Link to='/legal' className='flex items-center text-gray-300 hover:text-white'>
									<ShieldCheck className='h-5 w-5 mr-2' /> Legal
								</Link>
							</li>
						</ul>
					</div>

					{/* Section 3: Contacts */}
					<div>
						<h3 className='text-lg font-semibold text-emerald-400 mb-4'>Contact Us</h3>
						<ul className='space-y-3 text-gray-300'>
							<li className='flex items-center'>
								<Phone className='h-5 w-5 mr-3 text-emerald-400' />
								<span>09622146172</span>
							</li>
							<li className='flex items-center'>
								<Mail className='h-5 w-5 mr-3 text-emerald-400' />
								<span>kalyekart@gmail.com</span>
							</li>
							<li className='flex items-start'>
								<MapPin className='h-5 w-5 mr-3 text-emerald-400 mt-1' />
								<span>Tres de Abril Brgy. Labangon, Cebu City, Philippines, 6000</span>
							</li>
						</ul>
					</div>

					{/* Section 4: QR Code */}
					<div className='flex flex-col items-center lg:items-end'>
						<p className='text-gray-400 mb-2'>Scan for Homepage</p>
						<div className='bg-white p-2 rounded-lg shadow-lg'>
							<QRCodeCanvas {...qrCodeOptions} />
						</div>
					</div>
				</div>
			</div>
			<div className='mt-8 border-t border-gray-700 pt-6'>
				<p className='text-center text-gray-500 text-sm'>
					&copy; {new Date().getFullYear()} KalyeKart. All rights reserved.
				</p>
			</div>
		</footer>
	);
};

export default Footer;