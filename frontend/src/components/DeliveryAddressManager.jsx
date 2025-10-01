import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";
import { PlusCircle, Edit, Trash, Save, X, MapPin } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

const DeliveryAddressManager = () => {
	const queryClient = useQueryClient();
	const [isAdding, setIsAdding] = useState(false);
	const [editingAddressId, setEditingAddressId] = useState(null);

	const {
		data: addresses,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["deliveryAddresses"],
		queryFn: () => axios.get("/users/addresses").then((res) => res.data),
	});

	const addMutation = useMutation({
		mutationFn: (newAddress) => axios.post("/users/addresses", newAddress),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deliveryAddresses"] });
			toast.success("Address added successfully");
			setIsAdding(false);
		},
		onError: () => toast.error("Failed to add address"),
	});

	const updateMutation = useMutation({
		mutationFn: ({ addressId, updatedAddress }) =>
			axios.put(`/users/addresses/${addressId}`, updatedAddress),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deliveryAddresses"] });
			toast.success("Address updated successfully");
			setEditingAddressId(null);
		},
		onError: () => toast.error("Failed to update address"),
	});

	const deleteMutation = useMutation({
		mutationFn: (addressId) => axios.delete(`/users/addresses/${addressId}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deliveryAddresses"] });
			toast.success("Address deleted successfully");
		},
		onError: () => toast.error("Failed to delete address"),
	});

	const setDefaultMutation = useMutation({
		mutationFn: (addressId) => axios.patch(`/users/addresses/${addressId}/set-default`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deliveryAddresses"] });
			toast.success("Default address updated");
		},
		onError: () => toast.error("Failed to set default address"),
	});

	return (
		<div className='bg-gray-800 p-6 rounded-lg'>
			<h2 className='text-xl font-semibold mb-4 flex items-center'>
				<MapPin className='mr-2' /> Manage Delivery Addresses
			</h2>

			{isLoading && (
				<div className='flex justify-center'>
					<LoadingSpinner />
				</div>
			)}

			{isError && <p className='text-red-400 text-center'>Could not load addresses.</p>}

			{!isLoading && !isError && addresses && (
				<div className='space-y-4'>
					{addresses.map((address) => (
						<Address
							key={address._id}
							address={address}
							isEditing={editingAddressId === address._id}
							onEdit={() => setEditingAddressId(address._id)}
							onCancel={() => setEditingAddressId(null)}
							onSave={(updatedAddress) =>
								updateMutation.mutate({ addressId: address._id, updatedAddress })
							}
							onDelete={() => deleteMutation.mutate(address._id)}
							onSetDefault={() => setDefaultMutation.mutate(address._id)}
							isUpdating={updateMutation.isPending}
							isDeleting={deleteMutation.isPending}
							isSettingDefault={setDefaultMutation.isPending}
						/>
					))}
				</div>
			)}

			{isAdding ? (
				<AddressForm
					onSave={(newAddress) => addMutation.mutate(newAddress)}
					onCancel={() => setIsAdding(false)}
					isSaving={addMutation.isPending}
				/>
			) : (
				<button
					onClick={() => setIsAdding(true)}
					className='mt-4 flex items-center text-emerald-400 hover:text-emerald-300'
				>
					<PlusCircle className='mr-2' /> Add New Address
				</button>
			)}
		</div>
	);
};

const Address = ({
	address,
	isEditing,
	onEdit,
	onCancel,
	onSave,
	onDelete,
	onSetDefault,
	isUpdating,
	isDeleting,
	isSettingDefault,
}) => {
	if (isEditing) {
		return <AddressForm initialData={address} onSave={onSave} onCancel={onCancel} isSaving={isUpdating} />;
	}

	return (
		<div
			className={`p-4 rounded-lg flex justify-between items-start ${
				address.isDefault ? "bg-emerald-900/50 border border-emerald-500" : "bg-gray-700"
			}`}
		>
			<div>
				<p className='font-bold'>{address.fullName}</p>
				<p>{address.contactNumber}</p>
				<p>{address.sitio}, {address.barangay}, {address.city}</p>
				<p>{address.province}, {address.postalCode}</p>
				{address.isDefault && (
					<span className='text-xs bg-emerald-500 text-white font-bold px-2 py-1 rounded-full mt-2 inline-block'>
						Default
					</span>
				)}
			</div>
			<div className='flex flex-col space-y-2'>
				<div className='flex space-x-2'>
					<button onClick={onEdit} className='text-gray-400 hover:text-white'>
						<Edit size={18} />
					</button>
					<button
						onClick={onDelete}
						disabled={isDeleting}
						className='text-gray-400 hover:text-red-500'
					>
						<Trash size={18} />
					</button>
				</div>
				{!address.isDefault && (
					<button
						onClick={onSetDefault}
						disabled={isSettingDefault}
						className='text-sm text-emerald-400 hover:text-emerald-300 disabled:opacity-50'
					>
						Set as Default
					</button>
				)}
			</div>
		</div>
	);
};

const AddressForm = ({ onSave, onCancel, initialData = {}, isSaving }) => {
	const [formData, setFormData] = useState({
		fullName: initialData.fullName || "",
		contactNumber: initialData.contactNumber || "",
		sitio: initialData.sitio || "",
		barangay: initialData.barangay || "",
		city: initialData.city || "",
		province: initialData.province || "Cebu",
		postalCode: initialData.postalCode || "",
	});
	const [locations, setLocations] = useState([]);
	const [barangays, setBarangays] = useState([]);
	const [isLocating, setIsLocating] = useState(false);

	useEffect(() => {
		const fetchLocations = async () => {
			try {
				const response = await axios.get("/locations/cities-municipalities");
				setLocations(response.data);
			} catch {
				toast.error("Failed to fetch locations.");
			}
		};
		fetchLocations();
	}, []);

	useEffect(() => {
		if (formData.city) {
			const selectedLocation = locations.find((loc) => loc.name === formData.city);
			if (selectedLocation) {
				const fetchBarangays = async () => {
					try {
						const response = await axios.get(`/locations/barangays/${selectedLocation.code}`);
						setBarangays(response.data);
						setFormData((prev) => ({ ...prev, postalCode: selectedLocation.zip_code || "" }));
					} catch {
						toast.error("Failed to fetch barangays.");
					}
				};
				fetchBarangays();
			}
		} else {
			setBarangays([]);
			setFormData((prev) => ({ ...prev, postalCode: "" }));
		}
	}, [formData.city, locations]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleUseCurrentLocation = async () => {
		if (!navigator.geolocation) {
			toast.error("Geolocation is not supported by your browser.");
			return;
		}

		setIsLocating(true);
		try {
			const position = await new Promise((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject);
			});

			const { latitude, longitude } = position.coords;
			const geocodeResponse = await axios.post("/locations/reverse-geocode", { lat: latitude, lon: longitude });
			const address = geocodeResponse.data;

			const apiCityName = address.city || address.town || address.county || "";
			const normalize = (str) => str.replace(/City of|City/g, "").replace(/-/g, " ").trim().toLowerCase();
			const normalizedApiCity = normalize(apiCityName);

			const matchedLocation = locations.find(loc => {
				const normalizedLocName = normalize(loc.name);
				return normalizedLocName.includes(normalizedApiCity) || normalizedApiCity.includes(normalizedLocName);
			});

			if (!matchedLocation) {
				toast.error("Could not match your city. Please select it manually.");
				return;
			}

			const newCity = matchedLocation.name;
			const barangayResponse = await axios.get(`/locations/barangays/${matchedLocation.code}`);
			const fetchedBarangays = barangayResponse.data;
			setBarangays(fetchedBarangays);

			const apiBarangayName = address.village || address.suburb || address.hamlet || address.quarter;
			let newBarangay = "";
			if (apiBarangayName) {
				const normalizeBarangay = (str) => str.trim().toLowerCase();
				const normalizedTarget = normalizeBarangay(apiBarangayName);
				const matchedBarangay = fetchedBarangays.find(
					(b) => normalizeBarangay(b.name).includes(normalizedTarget) || normalizedTarget.includes(normalizeBarangay(b.name))
				);
				if (matchedBarangay) {
					newBarangay = matchedBarangay.name;
				}
			}

			setFormData(prev => ({
				...prev,
				city: newCity,
				barangay: newBarangay,
				sitio: [address.road, address.house_number].filter(Boolean).join(", "),
				postalCode: matchedLocation.zip_code || ""
			}));

		} catch (error) {
			if (error.code === error.PERMISSION_DENIED) {
				toast.error("Unable to retrieve your location. Please enable location services.");
			} else {
				toast.error("Could not determine your address. Please enter it manually.");
			}
		} finally {
			setIsLocating(false);
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSave(formData);
	};

	return (
		<form onSubmit={handleSubmit} className='p-4 bg-gray-700 rounded-lg mt-4 space-y-3'>
			<div className="flex justify-end">
				<button
					type="button"
					onClick={handleUseCurrentLocation}
					className="text-sm font-medium text-emerald-400 hover:text-emerald-300 disabled:opacity-50 flex items-center"
					disabled={isLocating || locations.length === 0}
				>
					<MapPin className="w-4 h-4 mr-1" />
					{isLocating ? 'Locating...' : 'Use Current Location'}
				</button>
			</div>
			<input name='fullName' value={formData.fullName} onChange={handleChange} placeholder='Full Name' className='w-full bg-gray-600 rounded p-2' required />
			<input name='contactNumber' value={formData.contactNumber} onChange={handleChange} placeholder='Contact Number' className='w-full bg-gray-600 rounded p-2' required />
			<input name='sitio' value={formData.sitio} onChange={handleChange} placeholder='Sitio / Street / House No. (Optional)' className='w-full bg-gray-600 rounded p-2' />
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<select name='city' value={formData.city} onChange={handleChange} className='w-full bg-gray-600 rounded p-2' required>
					<option value=''>Select a city</option>
					{locations.map((loc) => (
						<option key={loc.code} value={loc.name}>{loc.name}</option>
					))}
				</select>
				<select name='barangay' value={formData.barangay} onChange={handleChange} className='w-full bg-gray-600 rounded p-2' disabled={!formData.city} required>
					<option value=''>Select a barangay</option>
					{barangays.map((b) => (
						<option key={b.code} value={b.name}>{b.name}</option>
					))}
				</select>
			</div>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<input name='province' value={formData.province} onChange={handleChange} className='w-full bg-gray-600 rounded p-2' disabled />
				<input name='postalCode' value={formData.postalCode} readOnly placeholder='Postal Code' className='w-full bg-gray-600 rounded p-2' />
			</div>
			<div className='flex justify-end space-x-2'>
				<button type='button' onClick={onCancel} className='p-2 text-gray-400 hover:text-white'>
					<X size={20} />
				</button>
				<button type='submit' disabled={isSaving} className='p-2 text-emerald-400 hover:text-white'>
					<Save size={20} />
				</button>
			</div>
		</form>
	);
};

export default DeliveryAddressManager;