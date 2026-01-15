import { io } from "socket.io-client";

class VideoCallSocket {
  socket = null;

  getSocket() {
    if (!this.socket) {
      this.socket = io("http://localhost:8000", {
        withCredentials: true,
        transports: ["websocket"],
      });
    }
    return this.socket;
  }

  setSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

const socketInstance = new VideoCallSocket();
export default socketInstance;
