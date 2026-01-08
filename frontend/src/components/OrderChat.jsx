import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";
import { Send, Paperclip, X, Image as ImageIcon, Video } from "lucide-react";
import useSocket from "../hooks/useSocket";
import { useUserStore } from "../stores/useUserStore";

const OrderChat = ({ orderId }) => {
	const { user } = useUserStore();
	const socket = useSocket();
	const queryClient = useQueryClient();
	const [newMessage, setNewMessage] = useState("");
	const [mediaFile, setMediaFile] = useState(null);
	const [mediaPreview, setMediaPreview] = useState(null);
	const scrollRef = useRef(null);
	const fileInputRef = useRef(null);

	const { data: messages = [] } = useQuery({
		queryKey: ["chat", orderId],
		queryFn: () => axios.get(`/chat/${orderId}`).then((res) => res.data),
	});

	useEffect(() => {
		if (socket) {
			socket.emit("join_order", orderId);
			socket.on("new_message", (message) => {
				queryClient.setQueryData(["chat", orderId], (old) => [...(old || []), message]);
				scrollToBottom();
			});
			return () => socket.off("new_message");
		}
	}, [socket, orderId, queryClient]);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const scrollToBottom = () => {
		if (scrollRef.current) {
			scrollRef.current.scrollIntoView({ behavior: "smooth" });
		}
	};

	const { mutate: sendMessage, isPending } = useMutation({
		mutationFn: (formData) => {
			return axios.post(`/chat/${orderId}`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
		},
		onSuccess: () => {
			setNewMessage("");
			setMediaFile(null);
			setMediaPreview(null);
		},
		onError: () => toast.error("Failed to send message"),
	});

	const handleSend = (e) => {
		e.preventDefault();
		if (!newMessage.trim() && !mediaFile) return;

		const formData = new FormData();
		formData.append("content", newMessage);
		if (mediaFile) {
			formData.append("media", mediaFile);
		}
		sendMessage(formData);
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setMediaFile(file);
			setMediaPreview(URL.createObjectURL(file));
		}
	};

	return (
		<div className='flex flex-col h-[500px] bg-gray-800 rounded-lg border border-gray-700 overflow-hidden'>
			<div className='bg-gray-900 p-4 border-b border-gray-700 font-bold text-white flex justify-between items-center'>
				<span>Order Chat</span>
			</div>

			<div className='flex-1 overflow-y-auto p-4 space-y-4'>
				{messages.map((msg) => {
					const isMe = msg.sender?._id === user?._id;
					return (
						<div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
							<div
								className={`max-w-[70%] rounded-lg p-3 ${
									isMe ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-200"
								}`}
							>
								{msg.mediaUrl && (
									<div className='mb-2'>
										{msg.mediaType === "video" ? (
											<video src={msg.mediaUrl} controls className='rounded-lg max-h-48 w-full' />
										) : (
											<img src={msg.mediaUrl} alt='Attachment' className='rounded-lg max-h-48 w-full object-cover' />
										)}
									</div>
								)}
								{msg.content && <p>{msg.content}</p>}
								<div className={`text-xs mt-1 ${isMe ? "text-emerald-200" : "text-gray-400"}`}>
									{msg.sender?.name} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
								</div>
							</div>
						</div>
					);
				})}
				<div ref={scrollRef} />
			</div>

			<div className='p-4 bg-gray-900 border-t border-gray-700'>
				{mediaPreview && (
					<div className='mb-2 relative inline-block'>
						{mediaFile?.type.startsWith("video") ? (
							<video src={mediaPreview} className='h-20 rounded border border-gray-600' />
						) : (
							<img src={mediaPreview} alt='Preview' className='h-20 rounded border border-gray-600' />
						)}
						<button
							onClick={() => {
								setMediaFile(null);
								setMediaPreview(null);
							}}
							className='absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600'
						>
							<X size={12} />
						</button>
					</div>
				)}
				<form onSubmit={handleSend} className='flex items-center gap-2'>
					<button
						type='button'
						onClick={() => fileInputRef.current?.click()}
						className='text-gray-400 hover:text-emerald-400 transition-colors'
					>
						<Paperclip size={20} />
					</button>
					<input
						type='file'
						ref={fileInputRef}
						onChange={handleFileChange}
						className='hidden'
						accept='image/*,video/*'
					/>
					<input
						type='text'
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						placeholder='Type a message...'
						className='flex-1 bg-gray-800 text-white rounded-full px-4 py-2 border border-gray-600 focus:outline-none focus:border-emerald-500'
					/>
					<button
						type='submit'
						disabled={isPending || (!newMessage.trim() && !mediaFile)}
						className='bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
					>
						{isPending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send size={20} />}
					</button>
				</form>
			</div>
		</div>
	);
};

export default OrderChat;
