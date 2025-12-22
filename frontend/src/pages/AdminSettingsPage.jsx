import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";
import { Settings, Truck, Award, Bell, Globe, ChevronRight } from "lucide-react";
import SettingsModal from "../components/SettingsModal";
import LoadingSpinner from "../components/LoadingSpinner";

const AdminSettingsPage = () => {
	const queryClient = useQueryClient();
	const [activeModal, setActiveModal] = useState(null);
	const [formData, setFormData] = useState({});

	const { data: settings, isLoading } = useQuery({
		queryKey: ["settings"],
		queryFn: () => axios.get("/settings").then((res) => res.data),
	});

	useEffect(() => {
		if (settings) {
			setFormData(settings);
		}
	}, [settings]);

	const { mutate: updateSettings, isPending } = useMutation({
		mutationFn: (newSettings) => axios.put("/settings", newSettings),
		onSuccess: () => {
			queryClient.invalidateQueries(["settings"]);
			toast.success("Settings updated successfully");
			setActiveModal(null);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to update settings");
		},
	});

	const handleSave = () => {
		updateSettings(formData);
	};

	const handleChange = (section, field, value) => {
		setFormData((prev) => ({
			...prev,
			[section]: {
				...prev[section],
				[field]: value,
			},
		}));
	};

	if (isLoading) return <LoadingSpinner />;

	const tools = [
		{
			id: "general",
			title: "General Settings",
			icon: Globe,
			description: "Configure site name, support email, and currency.",
		},
		{
			id: "delivery",
			title: "Delivery Settings",
			icon: Truck,
			description: "Manage delivery fees and free delivery thresholds.",
		},
		{
			id: "loyalty",
			title: "Loyalty & Rewards",
			icon: Award,
			description: "Set points earning rate and redemption rules.",
		},
		{
			id: "notifications",
			title: "Notifications",
			icon: Bell,
			description: "Toggle email and push notifications.",
		},
	];

	return (
		<div className='container mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold text-emerald-400 mb-8 flex items-center'>
				<Settings className='mr-3' /> Settings
			</h1>

			<div className='grid gap-6 md:grid-cols-2'>
				{tools.map((tool) => (
					<div
						key={tool.id}
						className='bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-emerald-500/50 transition-colors cursor-pointer group'
						onClick={() => setActiveModal(tool.id)}
					>
						<div className='flex items-center justify-between mb-4'>
							<div className='p-3 bg-gray-700 rounded-lg group-hover:bg-gray-600 transition-colors'>
								<tool.icon className='w-6 h-6 text-emerald-400' />
							</div>
							<ChevronRight className='text-gray-500 group-hover:text-emerald-400 transition-colors' />
						</div>
						<h3 className='text-xl font-semibold text-white mb-2'>{tool.title}</h3>
						<p className='text-gray-400'>{tool.description}</p>
					</div>
				))}
			</div>

			{/* General Modal */}
			<SettingsModal
				isOpen={activeModal === "general"}
				onClose={() => setActiveModal(null)}
				title='General Settings'
				onSave={handleSave}
				isSaving={isPending}
			>
				<div className='space-y-4'>
					<div>
						<label className='block text-sm font-medium text-gray-400 mb-1'>Site Name</label>
						<input
							type='text'
							value={formData.general?.siteName || ""}
							onChange={(e) => handleChange("general", "siteName", e.target.value)}
							className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-400 mb-1'>Support Email</label>
						<input
							type='email'
							value={formData.general?.supportEmail || ""}
							onChange={(e) => handleChange("general", "supportEmail", e.target.value)}
							className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-400 mb-1'>Currency</label>
						<input
							type='text'
							value={formData.general?.currency || ""}
							onChange={(e) => handleChange("general", "currency", e.target.value)}
							className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500'
						/>
					</div>
				</div>
			</SettingsModal>

			{/* Delivery Modal */}
			<SettingsModal
				isOpen={activeModal === "delivery"}
				onClose={() => setActiveModal(null)}
				title='Delivery Settings'
				onSave={handleSave}
				isSaving={isPending}
			>
				<div className='space-y-4'>
					<div>
						<label className='block text-sm font-medium text-gray-400 mb-1'>Base Fee (₱)</label>
						<input
							type='number'
							value={formData.delivery?.baseFee || 0}
							onChange={(e) => handleChange("delivery", "baseFee", parseFloat(e.target.value))}
							className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-400 mb-1'>Fee Per Km (₱)</label>
						<input
							type='number'
							value={formData.delivery?.feePerKm || 0}
							onChange={(e) => handleChange("delivery", "feePerKm", parseFloat(e.target.value))}
							className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-400 mb-1'>Free Delivery Threshold (₱)</label>
						<input
							type='number'
							value={formData.delivery?.freeDeliveryThreshold || 0}
							onChange={(e) => handleChange("delivery", "freeDeliveryThreshold", parseFloat(e.target.value))}
							className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500'
						/>
					</div>
				</div>
			</SettingsModal>

			{/* Loyalty Modal */}
			<SettingsModal
				isOpen={activeModal === "loyalty"}
				onClose={() => setActiveModal(null)}
				title='Loyalty Settings'
				onSave={handleSave}
				isSaving={isPending}
			>
				<div className='space-y-4'>
					<div className='flex items-center justify-between'>
						<label className='text-sm font-medium text-gray-400'>Enable Loyalty Program</label>
						<input
							type='checkbox'
							checked={formData.loyalty?.isEnabled || false}
							onChange={(e) => handleChange("loyalty", "isEnabled", e.target.checked)}
							className='w-5 h-5 accent-emerald-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-400 mb-1'>Points Per Peso</label>
						<p className='text-xs text-gray-500 mb-2'>e.g., 0.1 means 10 points for ₱100 spend.</p>
						<input
							type='number'
							step='0.01'
							value={formData.loyalty?.pointsPerPeso || 0}
							onChange={(e) => handleChange("loyalty", "pointsPerPeso", parseFloat(e.target.value))}
							className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-400 mb-1'>Min Points to Redeem</label>
						<input
							type='number'
							value={formData.loyalty?.minimumPointsToRedeem || 0}
							onChange={(e) => handleChange("loyalty", "minimumPointsToRedeem", parseFloat(e.target.value))}
							className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500'
						/>
					</div>
				</div>
			</SettingsModal>

			{/* Notifications Modal */}
			<SettingsModal
				isOpen={activeModal === "notifications"}
				onClose={() => setActiveModal(null)}
				title='Notification Settings'
				onSave={handleSave}
				isSaving={isPending}
			>
				<div className='space-y-4'>
					<div className='flex items-center justify-between'>
						<label className='text-sm font-medium text-gray-400'>Enable Email Notifications</label>
						<input
							type='checkbox'
							checked={formData.notifications?.emailEnabled || false}
							onChange={(e) => handleChange("notifications", "emailEnabled", e.target.checked)}
							className='w-5 h-5 accent-emerald-500'
						/>
					</div>
					<div className='flex items-center justify-between'>
						<label className='text-sm font-medium text-gray-400'>Enable Push Notifications</label>
						<input
							type='checkbox'
							checked={formData.notifications?.pushEnabled || false}
							onChange={(e) => handleChange("notifications", "pushEnabled", e.target.checked)}
							className='w-5 h-5 accent-emerald-500'
						/>
					</div>
				</div>
			</SettingsModal>
		</div>
	);
};

export default AdminSettingsPage;
