import { useState } from "react";
import axios from "axios";
import { MapPin } from "lucide-react";

const AddressAutocomplete = ({ onAddressSelect }) => {
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState([]);
	const [isOpen, setIsOpen] = useState(false);

	const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;

	const handleInputChange = async (e) => {
		const value = e.target.value;
		setQuery(value);

		if (value.length > 2) {
			try {
				const response = await axios.get(
					`https://api.opencagedata.com/geocode/v1/json?q=${value}&key=${OPENCAGE_API_KEY}&limit=5`
				);
				setSuggestions(response.data.results);
				setIsOpen(true);
			} catch (error) {
				console.error("Error fetching address suggestions:", error);
			}
		} else {
			setSuggestions([]);
			setIsOpen(false);
		}
	};

	const handleSelect = (suggestion) => {
		const formattedAddress = suggestion.formatted;
		setQuery(formattedAddress);
		setSuggestions([]);
		setIsOpen(false);
		onAddressSelect(formattedAddress);
	};

	return (
		<div className='relative w-full'>
			<div className='relative'>
				<input
					type='text'
					value={query}
					onChange={handleInputChange}
					placeholder='Start typing your address...'
					className='w-full pl-10 pr-4 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
				/>
				<MapPin className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
			</div>

			{isOpen && suggestions.length > 0 && (
				<ul className='absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto'>
					{suggestions.map((suggestion, index) => (
						<li
							key={index}
							onClick={() => handleSelect(suggestion)}
							className='px-4 py-2 hover:bg-gray-600 cursor-pointer text-sm text-gray-200 border-b border-gray-600 last:border-none'
						>
							{suggestion.formatted}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default AddressAutocomplete;
