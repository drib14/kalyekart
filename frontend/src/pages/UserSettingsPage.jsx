import { useState } from "react";
import { Settings, User, Shield, Bell, Gift, ChevronRight } from "lucide-react";
import SettingsModal from "../components/SettingsModal";
import MyRewardsPage from "./MyRewardsPage";
import { useNavigate } from "react-router-dom";

const UserSettingsPage = () => {
	const navigate = useNavigate();
	const [activeModal, setActiveModal] = useState(null);

	const tools = [
		{
			id: "profile",
			title: "Profile Information",
			icon: User,
			description: "Update your personal details.",
			action: () => navigate("/profile/customer"),
		},
		{
			id: "security",
			title: "Security",
			icon: Shield,
			description: "Change your password.",
			// Linking to reset-password or showing a modal?
			// Since reset password page expects a token usually (for forgot flow),
            // inside app we might want a "Change Password" form.
            // For now, I'll redirect to a placeholder or reuse logic if available.
			// Let's use a modal for demonstration.
            action: () => setActiveModal("security"),
		},
		{
			id: "notifications",
			title: "Notifications",
			icon: Bell,
			description: "Manage your notification preferences.",
            action: () => setActiveModal("notifications"),
		},
		{
			id: "rewards",
			title: "My Rewards",
			icon: Gift,
			description: "View points and redeem rewards.",
			action: () => navigate("/my-rewards"), // Or open as modal? User requested "put the my rewards option as one of the settings tool". Navigating is cleaner for a full page.
		},
	];

	return (
		<div className='container mx-auto px-4 py-8 max-w-4xl'>
			<h1 className='text-3xl font-bold text-emerald-400 mb-8 flex items-center'>
				<Settings className='mr-3' /> Account Settings
			</h1>

			<div className='grid gap-6 md:grid-cols-2'>
				{tools.map((tool) => (
					<div
						key={tool.id}
						className='bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-emerald-500/50 transition-colors cursor-pointer group'
						onClick={tool.action}
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

            {/* Security Modal Placeholder */}
            <SettingsModal
                isOpen={activeModal === "security"}
                onClose={() => setActiveModal(null)}
                title="Security Settings"
                onSave={() => setActiveModal(null)}
                isSaving={false}
            >
                <div className="text-gray-300">
                    <p>To change your password, please use the <a href="/forgot-password" className="text-emerald-400 underline">Forgot Password</a> flow for now.</p>
                    <p className="mt-4 text-sm text-gray-500">In-app password change coming soon.</p>
                </div>
            </SettingsModal>

             {/* Notifications Modal Placeholder */}
             <SettingsModal
                isOpen={activeModal === "notifications"}
                onClose={() => setActiveModal(null)}
                title="Notification Preferences"
                onSave={() => setActiveModal(null)}
                isSaving={false}
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-gray-300">Email Notifications</label>
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-gray-300">Push Notifications</label>
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500" />
                    </div>
                </div>
            </SettingsModal>

		</div>
	);
};

export default UserSettingsPage;
