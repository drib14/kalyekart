import React from "react";

const LegalPage = () => {
	return (
		<div className='max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-gray-300'>
			<h1 className='text-4xl font-bold text-center text-emerald-400 mb-8'>Legal Information</h1>

			{/* Terms & Conditions Section */}
			<div className='mb-12'>
				<h2 className='text-3xl font-semibold text-white mb-4'>Terms & Conditions</h2>
				<div className='prose prose-invert max-w-none bg-gray-800 p-6 rounded-lg'>
					<p>Welcome to KalyeKart! These terms and conditions outline the rules and regulations for the use of our platform.</p>
					<p>By accessing this app, we assume you accept these terms and conditions. Do not continue to use KalyeKart if you do not agree to all of the terms and conditions stated on this page.</p>

					<h3 className='text-xl font-semibold mt-6'>1. Accounts</h3>
					<p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>

					<h3 className='text-xl font-semibold mt-6'>2. Orders and Payments</h3>
					<p>By placing an order through our platform, you warrant that you are legally capable of entering into binding contracts. All payments are processed through secure third-party payment gateways. We do not store your full credit card information.</p>

					<h3 className='text-xl font-semibold mt-6'>3. Intellectual Property</h3>
					<p>The Service and its original content, features, and functionality are and will remain the exclusive property of KalyeKart and its licensors. The Service is protected by copyright, trademark, and other laws of both the Philippines and foreign countries.</p>
				</div>
			</div>

			{/* Privacy Policy Section */}
			<div>
				<h2 className='text-3xl font-semibold text-white mb-4'>Privacy Policy</h2>
				<div className='prose prose-invert max-w-none bg-gray-800 p-6 rounded-lg'>
					<p>Your privacy is important to us. It is KalyeKart's policy to respect your privacy regarding any information we may collect from you across our platform.</p>
					<p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>

					<h3 className='text-xl font-semibold mt-6'>Information We Collect</h3>
					<p>To provide you with our food delivery services, we need to collect the following data:</p>
					<ul>
						<li>
							<strong>User Account Details:</strong> When you register, we collect your name, email address, and a hashed version of your password. This is necessary to create and secure your account.
						</li>
						<li>
							<strong>Delivery and Location Data:</strong> To deliver your orders, we require access to your delivery addresses. We may request access to your device's location to make it easier to find nearby vendors and set your delivery location.
						</li>
						<li>
							<strong>Order History:</strong> We maintain a history of your orders to provide you with features like "re-order" and to help us improve our service.
						</li>
						<li>
							<strong>Contact Information:</strong> We use your email and phone number to send order confirmations, updates, and other important service-related notifications.
						</li>
					</ul>

					<h3 className='text-xl font-semibold mt-6'>How We Use Your Data</h3>
					<p>The data we collect is used solely for the purpose of operating and improving the KalyeKart platform. We do not sell your personal data to third parties. We may share location and order details with our vendors and delivery partners for the sole purpose of fulfilling your order.</p>

					<h3 className='text-xl font-semibold mt-6'>Data Security</h3>
					<p>We are committed to protecting your data. We use industry-standard security measures to protect against the loss, misuse, and alteration of data used by our system.</p>
				</div>
			</div>
		</div>
	);
};

export default LegalPage;