import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";

import Navbar from "./components/Navbar";
import { Toaster, toast } from "sonner";
import { useUserStore } from "./stores/useUserStore";
import { useEffect, useState } from "react";
import { messaging } from "./firebase";
import { getToken } from "firebase/messaging";
import axiosInstance from "./lib/axios";
import FloatingFeedbackButton from "./components/FloatingFeedbackButton";
import FeedbackModal from "./components/FeedbackModal";
import LoadingSpinner from "./components/LoadingSpinner";
import CartPage from "./pages/CartPage";
import { useCartStore } from "./stores/useCartStore";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CheckoutPage from "./pages/CheckoutPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import MyReviewsPage from "./pages/MyReviewsPage";
import MyFavoritesPage from "./pages/MyFavoritesPage";
import AdminProfilePage from "./pages/AdminProfilePage";
import CustomerProfilePage from "./pages/CustomerProfilePage";
import OrderDetailPage from "./pages/OrderDetailPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFoundPage from "./pages/NotFoundPage";
import useOfflineStatus from "./hooks/useOfflineStatus";
import OfflinePage from "./pages/OfflinePage";
import Footer from "./components/Footer";

function App() {
	const { user, checkAuth, checkingAuth } = useUserStore();
	const { getCartItems } = useCartStore();
	const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
	const isOffline = useOfflineStatus();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	useEffect(() => {
		if (!user) return;

		getCartItems();
	}, [getCartItems, user]);

	useEffect(() => {
		if (isOffline) {
			toast.error("You are currently offline. Some features may be unavailable.", {
				duration: Infinity,
				id: "offline-toast",
			});
		} else {
			toast.success("You are back online!", {
				id: "offline-toast",
			});
		}
	}, [isOffline]);

	useEffect(() => {
		const requestPermission = async () => {
			if (!user) return;
			try {
				const permission = await Notification.requestPermission();
				if (permission === "granted") {
					const token = await getToken(messaging, {
						vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
					});

					if (token) {
						await axiosInstance.post("/users/save-fcm-token", { token });
						console.log("FCM token sent to server successfully.");
					}
				}
			} catch (error) {
				console.error("An error occurred while retrieving token. ", error);
			}
		};

		requestPermission();
	}, [user]);

	if (checkingAuth) return <LoadingSpinner fullScreen={true} />;

	if (isOffline) {
		return <OfflinePage />;
	}

	return (
		<div className='min-h-screen bg-gray-900 text-white relative overflow-hidden'>
			{/* Background gradient */}
			<div className='absolute inset-0 overflow-hidden'>
				<div className='absolute inset-0'>
					<div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]' />
				</div>
			</div>

			<div className='relative z-10 pt-20 pb-20 sm:pb-0'>
				<Navbar />
				<Routes>
					<Route path='/' element={<HomePage />} />
					<Route path='/signup' element={!user ? <SignUpPage /> : <Navigate to='/' />} />
					<Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/' />} />
					<Route
						path='/secret-dashboard'
						element={user?.role === "admin" ? <AdminPage /> : <Navigate to='/login' />}
					/>
					<Route path='/category/:category' element={<CategoryPage />} />
					<Route path='/search' element={<SearchPage />} />
					<Route path='/cart' element={user ? <CartPage /> : <Navigate to='/login' />} />
					<Route
						path='/purchase-success'
						element={user ? <PurchaseSuccessPage /> : <Navigate to='/login' />}
					/>
					<Route path='/purchase-cancel' element={user ? <PurchaseCancelPage /> : <Navigate to='/login' />} />
					<Route path='/forgot-password' element={!user ? <ForgotPasswordPage /> : <Navigate to='/' />} />
					<Route path='/reset-password' element={!user ? <ResetPasswordPage /> : <Navigate to='/' />} />
					<Route path='/checkout' element={user ? <CheckoutPage /> : <Navigate to='/login' />} />
					<Route path='/my-orders' element={user ? <MyOrdersPage /> : <Navigate to='/login' />} />
					<Route path='/my-reviews' element={user ? <MyReviewsPage /> : <Navigate to='/login' />} />
					<Route path='/my-favorites' element={user ? <MyFavoritesPage /> : <Navigate to='/login' />} />
					<Route
						path='/notifications'
						element={user ? <NotificationsPage /> : <Navigate to='/login' />}
					/>
					<Route
						path='/profile/admin'
						element={user?.role === "admin" ? <AdminProfilePage /> : <Navigate to='/login' />}
					/>
					<Route
						path='/profile/customer'
						element={user?.role === "customer" ? <CustomerProfilePage /> : <Navigate to='/login' />}
					/>
					<Route path='/order/:orderId' element={user ? <OrderDetailPage /> : <Navigate to='/login' />} />
					<Route path='/product/:productId' element={<ProductDetailPage />} />
					<Route path='*' element={<NotFoundPage />} />
				</Routes>
				<Footer />
			</div>
			<Toaster theme='dark' />
			{user && <FloatingFeedbackButton onClick={() => setIsFeedbackModalOpen(true)} />}
			<FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
		</div>
	);
}

export default App;