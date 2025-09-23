export const calculateETA = (status, order) => {
	let newETA = null;
	switch (status) {
		case "Preparing":
			const prepTime = order.products.length * 5 * 60 * 1000; // 5 minutes per product
			newETA = new Date(Date.now() + prepTime);
			break;
		case "Out for Delivery":
			const deliveryTime = order.distance * 3 * 60 * 1000 + 5 * 60 * 1000; // 3 mins per km + 5 mins buffer
			newETA = new Date(Date.now() + deliveryTime);
			break;
		case "Delivered":
		case "Cancelled":
			newETA = null;
			break;
	}
	return newETA;
};
