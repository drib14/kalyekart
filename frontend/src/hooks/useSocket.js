import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace("/api", "")
    : "http://localhost:5080";

const useSocket = () => {
	const socketRef = useRef();

	useEffect(() => {
		socketRef.current = io(SOCKET_URL, {
			withCredentials: true,
		});

		return () => {
			if (socketRef.current) {
				socketRef.current.disconnect();
			}
		};
	}, []);

	return socketRef.current;
};

export default useSocket;
