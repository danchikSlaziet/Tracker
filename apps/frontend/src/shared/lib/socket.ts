import { io } from 'socket.io-client'
const socketUrl = (import.meta.env.VITE_API_URL).replace('/api', '')
export const socket = io(socketUrl, { withCredentials: true })