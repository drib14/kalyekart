import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";
import { User, Shield, AlertTriangle, CheckCircle, Search } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import SettingsModal from "../components/SettingsModal";

const UserManagementPage = () => {
	const queryClient = useQueryClient();
	const [searchTerm, setSearchTerm] = useState("");
	const [editingUser, setEditingUser] = useState(null);
	const [newStatus, setNewStatus] = useState("active");
	const [statusReason, setStatusReason] = useState("");

	const { data: users, isLoading } = useQuery({
		queryKey: ["users"],
		queryFn: () => axios.get("/users").then((res) => res.data),
	});

	const { mutate: updateStatus, isPending } = useMutation({
		mutationFn: ({ userId, status, statusReason }) =>
			axios.put(`/users/${userId}/status`, { status, statusReason }),
		onSuccess: () => {
			queryClient.invalidateQueries(["users"]);
			toast.success("User status updated successfully");
			setEditingUser(null);
		},
		onError: (error) => toast.error(error.response?.data?.message || "Failed to update status"),
	});

	const filteredUsers = users?.filter(
		(user) =>
			user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleStatusClick = (user) => {
		setEditingUser(user);
		setNewStatus(user.status);
		setStatusReason(user.statusReason || "");
	};

	const handleSaveStatus = () => {
		if (editingUser) {
			updateStatus({ userId: editingUser._id, status: newStatus, statusReason });
		}
	};

	if (isLoading) return <LoadingSpinner />;

	return (
		<div className='container mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold text-emerald-400 mb-8 flex items-center'>
				<User className='mr-3' /> User Management
			</h1>

			<div className='mb-6 relative'>
				<input
					type='text'
					placeholder='Search users...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500'
				/>
				<Search className='absolute left-3 top-2.5 text-gray-400 w-5 h-5' />
			</div>

			<div className='bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg overflow-x-auto'>
				<table className='w-full text-left text-gray-300'>
					<thead className='bg-gray-900 text-gray-400 uppercase text-xs'>
						<tr>
							<th className='px-6 py-3'>User</th>
							<th className='px-6 py-3'>Role</th>
							<th className='px-6 py-3'>Status</th>
							<th className='px-6 py-3'>Actions</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-gray-700'>
						{filteredUsers?.map((user) => (
							<tr key={user._id} className='hover:bg-gray-750 transition-colors'>
								<td className='px-6 py-4'>
									<div className='flex items-center'>
										{user.profilePicture ? (
											<img
												src={user.profilePicture}
												alt=''
												className='w-8 h-8 rounded-full mr-3 object-cover'
											/>
										) : (
											<div className='w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-3'>
												<User className='w-4 h-4 text-gray-300' />
											</div>
										)}
										<div>
											<div className='font-medium text-white'>{user.name}</div>
											<div className='text-sm text-gray-500'>{user.email}</div>
										</div>
									</div>
								</td>
								<td className='px-6 py-4 capitalize'>
									<span
										className={`px-2 py-1 rounded text-xs font-bold ${
											user.role === "admin"
												? "bg-purple-500/20 text-purple-400"
												: user.role === "driver"
												? "bg-yellow-500/20 text-yellow-400"
												: "bg-blue-500/20 text-blue-400"
										}`}
									>
										{user.role}
									</span>
								</td>
								<td className='px-6 py-4 capitalize'>
									<span
										className={`px-2 py-1 rounded text-xs font-bold ${
											user.status === "active"
												? "bg-emerald-500/20 text-emerald-400"
												: "bg-red-500/20 text-red-400"
										}`}
									>
										{user.status || "active"}
									</span>
								</td>
								<td className='px-6 py-4'>
									<button
										onClick={() => handleStatusClick(user)}
										className='text-emerald-400 hover:text-emerald-300 text-sm font-medium'
									>
										Manage
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{filteredUsers?.length === 0 && (
					<div className='p-8 text-center text-gray-500'>No users found.</div>
				)}
			</div>

			<SettingsModal
				isOpen={!!editingUser}
				onClose={() => setEditingUser(null)}
				title={`Manage User: ${editingUser?.name}`}
				onSave={handleSaveStatus}
				isSaving={isPending}
			>
				<div className='space-y-4'>
					<div>
						<label className='block text-sm font-medium text-gray-400 mb-1'>Status</label>
						<select
							value={newStatus}
							onChange={(e) => setNewStatus(e.target.value)}
							className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white'
						>
							<option value='active'>Active</option>
							<option value='suspended'>Suspended</option>
							<option value='banned'>Banned</option>
						</select>
					</div>
					{(newStatus === "suspended" || newStatus === "banned") && (
						<div>
							<label className='block text-sm font-medium text-gray-400 mb-1'>Reason</label>
							<textarea
								value={statusReason}
								onChange={(e) => setStatusReason(e.target.value)}
								className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white'
								placeholder='Reason for suspension/ban...'
							/>
						</div>
					)}
				</div>
			</SettingsModal>
		</div>
	);
};

export default UserManagementPage;
