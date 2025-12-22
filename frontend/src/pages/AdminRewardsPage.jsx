import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Gift } from "lucide-react";
import SettingsModal from "../components/SettingsModal";
import LoadingSpinner from "../components/LoadingSpinner";

const AdminRewardsPage = () => {
	const queryClient = useQueryClient();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingReward, setEditingReward] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		cost: 100,
		type: "discount_amount",
		value: 50,
		isActive: true,
	});

	const { data: rewards, isLoading } = useQuery({
		queryKey: ["rewards"],
		queryFn: () => axios.get("/rewards").then((res) => res.data),
	});

	const { mutate: createReward, isPending: isCreating } = useMutation({
		mutationFn: (data) => axios.post("/rewards", data),
		onSuccess: () => {
			queryClient.invalidateQueries(["rewards"]);
			toast.success("Reward created successfully");
			handleCloseModal();
		},
		onError: (error) => toast.error(error.response?.data?.message || "Failed to create reward"),
	});

	const { mutate: updateReward, isPending: isUpdating } = useMutation({
		mutationFn: ({ id, data }) => axios.put(`/rewards/${id}`, data),
		onSuccess: () => {
			queryClient.invalidateQueries(["rewards"]);
			toast.success("Reward updated successfully");
			handleCloseModal();
		},
		onError: (error) => toast.error(error.response?.data?.message || "Failed to update reward"),
	});

	const { mutate: deleteReward } = useMutation({
		mutationFn: (id) => axios.delete(`/rewards/${id}`),
		onSuccess: () => {
			queryClient.invalidateQueries(["rewards"]);
			toast.success("Reward deleted successfully");
		},
		onError: (error) => toast.error(error.response?.data?.message || "Failed to delete reward"),
	});

	const handleOpenModal = (reward = null) => {
		if (reward) {
			setEditingReward(reward);
			setFormData(reward);
		} else {
			setEditingReward(null);
			setFormData({
				name: "",
				description: "",
				cost: 100,
				type: "discount_amount",
				value: 50,
				isActive: true,
			});
		}
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingReward(null);
	};

	const handleSubmit = () => {
		if (editingReward) {
			updateReward({ id: editingReward._id, data: formData });
		} else {
			createReward(formData);
		}
	};

	if (isLoading) return <LoadingSpinner />;

	return (
		<div className='container mx-auto px-4 py-8'>
			<div className='flex justify-between items-center mb-8'>
				<h1 className='text-3xl font-bold text-emerald-400 flex items-center'>
					<Gift className='mr-3' /> Rewards Management
				</h1>
				<button
					onClick={() => handleOpenModal()}
					className='bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors'
				>
					<Plus className='w-5 h-5 mr-2' /> Create Reward
				</button>
			</div>

			<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
				{rewards?.map((reward) => (
					<div key={reward._id} className='bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg relative'>
						<div className='absolute top-4 right-4 flex space-x-2'>
							<button
								onClick={() => handleOpenModal(reward)}
								className='p-2 text-gray-400 hover:text-emerald-400 transition-colors'
							>
								<Edit2 size={18} />
							</button>
							<button
								onClick={() => deleteReward(reward._id)}
								className='p-2 text-gray-400 hover:text-red-400 transition-colors'
							>
								<Trash2 size={18} />
							</button>
						</div>
						<h3 className='text-xl font-bold text-white mb-2'>{reward.name}</h3>
						<p className='text-gray-400 mb-4 text-sm h-12 overflow-hidden'>{reward.description}</p>
						<div className='flex justify-between items-center text-sm font-medium'>
							<span className='text-emerald-400'>{reward.cost} Points</span>
							<span className='bg-gray-700 px-3 py-1 rounded-full text-gray-300 capitalize'>
								{reward.type.replace("_", " ")}
							</span>
						</div>
						<div className='mt-4 pt-4 border-t border-gray-700 flex justify-between items-center'>
							<span className={`px-2 py-1 text-xs rounded ${reward.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
								{reward.isActive ? "Active" : "Inactive"}
							</span>
							<span className='text-white font-bold'>
								{reward.type === 'free_delivery' ? 'Free Shipping' :
								 reward.type === 'discount_percentage' ? `${reward.value}% OFF` : `₱${reward.value} OFF`}
							</span>
						</div>
					</div>
				))}
			</div>

			<SettingsModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={editingReward ? "Edit Reward" : "Create Reward"}
				onSave={handleSubmit}
				isSaving={isCreating || isUpdating}
			>
				<div className='space-y-4'>
					<div>
						<label className='block text-sm font-medium text-gray-400 mb-1'>Name</label>
						<input
							type='text'
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-400 mb-1'>Description</label>
						<textarea
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white'
						/>
					</div>
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-400 mb-1'>Cost (Points)</label>
							<input
								type='number'
								value={formData.cost}
								onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) })}
								className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white'
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-400 mb-1'>Value</label>
							<input
								type='number'
								value={formData.value}
								onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) })}
								className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white'
							/>
						</div>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-400 mb-1'>Type</label>
						<select
							value={formData.type}
							onChange={(e) => setFormData({ ...formData, type: e.target.value })}
							className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white'
						>
							<option value='discount_amount'>Flat Discount (₱)</option>
							<option value='discount_percentage'>Percentage Discount (%)</option>
							<option value='free_delivery'>Free Delivery</option>
						</select>
					</div>
					<div className='flex items-center'>
						<input
							type='checkbox'
							id='isActive'
							checked={formData.isActive}
							onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
							className='w-5 h-5 accent-emerald-500 mr-2'
						/>
						<label htmlFor='isActive' className='text-sm font-medium text-gray-400'>Active</label>
					</div>
				</div>
			</SettingsModal>
		</div>
	);
};

export default AdminRewardsPage;
