import { io } from "socket.io-client";

class VideoCallSocket {
  socket = null;


  getSocket() {
    const token = JSON.parse(localStorage.getItem("userData"))?.token ?? null;

    if (this.socket && !this.socket.auth?.token && token) {
      console.log("🔁 Replacing unauthenticated socket with authenticated one");
      this.socket.disconnect();
      this.socket = null;
    }

    if (!this.socket) {
      if (!token) {
        console.warn("⚠️ getSocket() called before login — token is missing");
      }

      this.socket = io(import.meta.env.VITE_BACKEND_URL, {

        auth: { token },


        extraHeaders: {
          Authorization: token ? `Bearer ${token}` : "",
        },

        withCredentials: true,


        transports: ["polling", "websocket"],


        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      this.socket.on("connect", () => {
        console.log("🟢 Socket connected:", this.socket.id);
        console.log("🔐 Transport:", this.socket.io.engine.transport.name);
      });

      this.socket.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err.message);
      });

      this.socket.on("reconnect_attempt", (attempt) => {
        console.log("🔄 Reconnect attempt:", attempt);
      });

      this.socket.on("reconnect_failed", () => {
        console.error("❌ Reconnect failed after max attempts");
      });
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

const socketInstance = new VideoCallSocket();
export default socketInstance;

