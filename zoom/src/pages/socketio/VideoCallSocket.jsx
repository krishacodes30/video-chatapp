// import { io } from "socket.io-client";

// class VideoCallSocket {
//   socket = null;

//   getSocket() {
//     if (!this.socket) {
//       this.socket = io("http://localhost:8000", {
//         withCredentials: true,
//         transports: ["websocket"],
//       });
//     }
//     return this.socket;
//   }

//   setSocket() {
//     if (this.socket) {
//       this.socket.disconnect();
//       this.socket = null;
//     }
//   }
// }

// const socketInstance = new VideoCallSocket();
// export default socketInstance;
import { io } from "socket.io-client";

class VideoCallSocket {
  socket = null;

  getSocket() {
    if (!this.socket) {
      this.socket = io(import.meta.env.VITE_BACKEND_URL, {
        transports: ["websocket"],
        withCredentials: true,

        // ✅ AUTO-RECONNECT OPTIONS (ADD HERE)
        reconnection: true,
        reconnectionAttempts: 5,        // try 5 times
        reconnectionDelay: 1000,        // wait 1s between tries
        reconnectionDelayMax: 5000,     // max wait 5s
        timeout: 20000,                 // wait 20s for connection
      });

      // (optional but useful logs)
      this.socket.on("connect", () => {
        console.log("🟢 Socket connected:", this.socket.id);
      });

      this.socket.on("reconnect_attempt", (attempt) => {
        console.log("🔄 Reconnect attempt:", attempt);
      });

      this.socket.on("reconnect_failed", () => {
        console.log("❌ Reconnect failed");
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
