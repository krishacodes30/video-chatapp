
import React, { useEffect, useRef, useState } from 'react';
import socketInstance from '../socketio/VideoCallSocket.jsx';
import { FaBars, FaTimes, FaPhoneAlt, FaMicrophone, FaVideo, FaVideoSlash, FaMicrophoneSlash } from "react-icons/fa";
import Lottie from "lottie-react";
import { Howl } from "howler";
// import wavingAnimation from "../../assets/waving.json";
import { FaPhoneSlash } from "react-icons/fa6";
import { useUser } from '../../context/UserContextApi';
import { RiLogoutBoxLine } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import Peer from 'simple-peer';
import axios from 'axios';

import { v4 as uuid } from "uuid";

const Dashboard = () => {
const { user, updateUser } = useUser();

  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOnline, setUserOnline] = useState([]);
  const [stream, setStream] = useState(null);
  const [me, setMe] = useState("");
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [modalUser, setModalUser] = useState(null);
  const myVideo = useRef(null);
  const reciverVideo = useRef(null);
  const connectionRef = useRef(null);
  const hasJoined = useRef(false);

  const [reciveCall, setReciveCall] = useState(false);
  const [caller, setCaller] = useState(null);
  const [callerName, setCallerName] = useState("");
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callerWating, setCallerWating] = useState(false);

  const [callRejectedPopUp, setCallRejectedPopUp] = useState(false);
  const [rejectorData, setCallrejectorData] = useState(null);

  // mic & cam
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  // ringtone (per component instance)
  const ringtone = new Howl({
    src: ["/ringtone.mp3"],
    loop: false,
    volume: 1.0,
  });
const [chatUser, setChatUser] = useState(null);      
const [callUser, setCallUser] = useState(null);      

// ✅ Add these 3 lines here
const [showChat, setShowChat] = useState(false);
const [chatMessages, setChatMessages] = useState([]);
const [newMessage, setNewMessage] = useState("");


  const socket = socketInstance.getSocket();

  // 🔹 Attach local stream to myVideo safely after it and stream exist
  useEffect(() => {
    if (myVideo.current && stream) {
      myVideo.current.srcObject = stream;
      myVideo.current.muted = true;
      myVideo.current.volume = 0;
    }
  }, [stream]);

  useEffect(() => {
    if (user && socket && !hasJoined.current) {
      socket.emit("join", { id: user._id, name: user.username });
      hasJoined.current = true;
    }

    socket.on("me", (id) => setMe(id));

    socket.on("callToUser", (data) => {
      setReciveCall(true);
      setCaller(data);
      setCallerName(data.name);
      setCallerSignal(data.signal);
      ringtone.play();
    });

    socket.on("callRejected", (data) => {
      setCallRejectedPopUp(true);
      setCallrejectorData(data);
      ringtone.stop();
    });

    socket.on("callEnded", (data) => {
      console.log("Call ended by", data.name);
      ringtone.stop();
      endCallCleanup();
    });

    socket.on("userUnavailable", (data) => {
      alert(data.message || "User is not available.");
    });

    socket.on("userBusy", (data) => {
      alert(data.message || "User is currently in another call.");
    });

    socket.on("online-users", (onlineUsers) => {
      setUserOnline(onlineUsers);
    });

    return () => {
      socket.off("me");
      socket.off("callToUser");
      socket.off("callRejected");
      socket.off("callEnded");
      socket.off("userUnavailable");
      socket.off("userBusy");
      socket.off("online-users");
    };
  }, [user, socket]);

const startCall = async (userToCall) => {
  try {
    const currentStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: { echoCancellation: true, noiseSuppression: true }
    });

    setStream(currentStream);

    currentStream.getAudioTracks().forEach(track => (track.enabled = true));

    setCallRejectedPopUp(false);
    setIsSidebarOpen(false);
    setCallerWating(true);

    // 🚀 THIS MAKES CALL INDEPENDENT
    setCallUser(userToCall);

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: currentStream
    });

    peer.on("signal", (data) => {
      socket.emit("callToUser", {
        callToUserId: userToCall._id,   // ✔ CORRECT
        signalData: data,
        from: me,
        name: user.username,
        email: user.email,
        profilepic: user.profilepic,
      });
    });

    peer.on("stream", (remoteStream) => {
      if (reciverVideo.current) {
        reciverVideo.current.srcObject = remoteStream;
      }
    });

    socket.once("callAccepted", (data) => {
      setCallAccepted(true);
      setCallerWating(false);
      peer.signal(data.signal);
    });

    connectionRef.current = peer;
    setShowUserDetailModal(false);

  } catch (error) {
    console.error("Error accessing media devices:", error);
  }
};


  const loadChatHistory = async (userId) => {
  try {
const res = await axios.get(`http://localhost:8000/api/v1/chat/${userId}`, {
  headers: { authorization: user.token }
});




    if (res.data.success) {
      setChatMessages(res.data.messages);
    }

  } catch (err) {
    console.log(err);
  }
};
const sendMessage = () => {
  if (!newMessage.trim()) return;

const msgObj = {
  senderId: user._id,
  receiverId: chatUser._id,
  message: newMessage,
  localId: uuid()   // ⭐ unique key for UI
};



  // show instantly
  setChatMessages(prev => [...prev, {
    ...msgObj,
    _id: "local-" + Math.random()   // temporary key
  }]);

  socket.emit("send-message", msgObj);

  setNewMessage("");
};




useEffect(() => {
socket.on("receive-message", (msg) => {

  // 🔥 Prevent duplicate own messages from backend
  if (msg.senderId === user._id && !msg.localId) {
    return;
  }

  // 🔥 JUST append; don't auto-switch chat (fixes step 4)
  setChatMessages(prev => [...prev, msg]);
});


  return () => socket.off("receive-message");
}, [socket, chatUser, users]);

// socket.on("receive-message", (msg) => {
//     if (selectedUser?._id !== msg.senderId) {
//         // open chat with that user automatically
//         const sender = users.find(u => u._id === msg.senderId);
//         setSelectedUser(sender);
//         setChatUser(sender);
//         loadChatHistory(sender._id);
//     }
//     setChatMessages(prev => [...prev, msg]);
// });



  const handelacceptCall = async () => {
    ringtone.stop();
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      setStream(currentStream);
      currentStream.getAudioTracks().forEach(track => (track.enabled = true));

      setCallAccepted(true);
      setReciveCall(true);
      setCallerWating(false);
      setIsSidebarOpen(false);

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: currentStream
      });

      peer.on("signal", (data) => {
        socket.emit("answeredCall", {
          signal: data,
          from: me,
          to: caller.from,
        });
      });

      peer.on("stream", (remoteStream) => {
        if (reciverVideo.current) {
          reciverVideo.current.srcObject = remoteStream;
          reciverVideo.current.muted = false;
          reciverVideo.current.volume = 1.0;
        }
      });

      if (callerSignal) peer.signal(callerSignal);

      connectionRef.current = peer;
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const handelrejectCall = () => {
    ringtone.stop();
    setCallerWating(false);
    setReciveCall(false);
    setCallAccepted(false);

    socket.emit("reject-call", {
      to: caller.from,
      name: user.username,
      profilepic: user.profilepic
    });
  };

  const handelendCall = () => {
    console.log("🔴 Sending call-ended event...");
    ringtone.stop();
    socket.emit("call-ended", {
      to: caller?.from || selectedUser,
      name: user.username
    });

    endCallCleanup();
  };

  const endCallCleanup = () => {
    console.log("🔴 Stopping all media streams and resetting call...");
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (reciverVideo.current) {
      console.log("🔴 Clearing receiver video");
      reciverVideo.current.srcObject = null;
    }
    if (myVideo.current) {
      console.log("🔴 Clearing my video");
      myVideo.current.srcObject = null;
    }
    connectionRef.current?.destroy();
    ringtone.stop();
    setCallerWating(false);
    setStream(null);
    setReciveCall(false);
    setCallAccepted(false);
    setSelectedUser(null);
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicOn;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleCam = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isCamOn;
        setIsCamOn(videoTrack.enabled);
      }
    }
  };

  // 🔹 ALL USERS FROM BACKEND (using axios instead of apiClient)
//   const allusers = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get("http://localhost:8000/api/v1/users",{
//   headers: { authorization: user.token }
// });
//       if (response.data.success !== false) {
//         setUsers(response.data.users);
//       }
//     } catch (error) {
//       console.error("Failed to fetch users", error);
//     } finally {
//       setLoading(false);
//     }
//   };
const allusers = async () => {
  try {
    const token = user?.token;
    if (!token) {
      console.log("User not logged in, token missing");
      return;
    }

    const res = await axios.get("http://localhost:8000/api/v1/users", {
      headers: { authorization: token }
    });

    if (res.data.success) {
      setUsers(res.data.users);
    }

  } catch (err) {
    console.error("Failed to fetch users", err);
  }
};

useEffect(() => {
  if (user?.token) {
    allusers();
  }
}, [user]);



  const isOnlineUser = (userId) => userOnline.some((u) => u.userId === userId);
const handelSelectedUser = (userId) => {
  const selected = users.find(u => u._id === userId);

  setModalUser(selected);
  setChatUser(selected);
  setShowUserDetailModal(true);

  socket.emit("join-chat", {
      senderId: user._id,
      receiverId: selected._id  // ✅ CORRECT
  });

  loadChatHistory(selected._id);
};



  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    if (callAccepted || reciveCall) {
      alert("You must end the call before logging out.");
      return;
    }
    try {
      // assuming logout endpoint at /api/v1/users/logout
      const token = user?.token;
if (!token) {
  console.log("⚠ No token yet. User not loaded.");
  return;
}
      await axios.post("http://localhost:8000/api/v1/users/logout", {
        token: user?.token,
      });
      socket.off("disconnect");
      socket.disconnect();
      socketInstance.setSocket();
      updateUser(null);
      localStorage.removeItem("userData");
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-br from-blue-900 to-purple-800 text-white w-64 h-full p-4 space-y-4 fixed z-20 transition-transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Users</h1>
          <button
            type="button"
            className="md:hidden text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search user..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 mb-2"
        />

        {/* User List */}
        <ul className="space-y-4 overflow-y-auto">
          {filteredUsers.map((u) => (
            <li
              key={u._id}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${selectedUser === u._id
                ? "bg-green-600"
                : "bg-gradient-to-r from-purple-600 to-blue-400"
                }`}
        onClick={() => {
    setChatUser(u);
    setSelectedUser(u._id);
    setModalUser(u);
    setShowUserDetailModal(true);

    socket.emit("join-chat", {
        senderId: user._id,
        receiverId: u._id
    });

    loadChatHistory(u._id);
}}


            >
              <div className="relative">
                <img
                  src={u.profilepic || "/default-avatar.png"}
                  alt={`${u.username}'s profile`}
                  className="w-10 h-10 rounded-full border border-white"
                />
                {isOnlineUser(u._id) && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full shadow-lg animate-bounce"></span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">{u.username}</span>
                <span className="text-xs text-gray-400 truncate w-32">
                  {u.email}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* Logout */}
        {user && (
          <div
            onClick={handleLogout}
            className="absolute bottom-2 left-4 right-4 flex items-center gap-2 bg-red-400 px-4 py-1 cursor-pointer rounded-lg"
          >
            <RiLogoutBoxLine />
            Logout
          </div>
        )}
      </aside>

      {/* Main Content */}
     {(callUser || reciveCall || callAccepted) ? (
        <div className="relative w-full h-screen bg-black flex items-center justify-center">
          {/* Remote Video or waiting */}
          {callerWating ? (
            <div>
              <div className="flex flex-col items-center">
                <p className='font-black text-xl mb-2'>User Details</p>
                <img
                  src={modalUser?.profilepic || "/default-avatar.png"}
                  alt="User"
                  className="w-20 h-20 rounded-full border-4 border-blue-500 animate-bounce"
                />
                <h3 className="text-lg font-bold mt-3 text-white">{modalUser?.username}</h3>
                <p className="text-sm text-gray-300">{modalUser?.email}</p>
              </div>
            </div>
          ) : (
            <video
              ref={reciverVideo}
              autoPlay
              className="absolute top-0 left-0 w-full h-full object-contain rounded-lg"
            />
          )}

          {/* Local PIP Video */}
          <div className="absolute bottom-[75px] md:bottom-0 right-1 bg-gray-900 rounded-lg overflow-hidden shadow-lg">
            <video
              ref={myVideo}
              autoPlay
              playsInline
              className="w-32 h-40 md:w-56 md:h-52 object-cover rounded-lg"
            />
          </div>

          {/* Username + Sidebar Button */}
          <div className="absolute top-4 left-4 text-white text-lg font-bold flex gap-2 items-center">
            <button
              type="button"
              className="md:hidden text-2xl text-white cursor-pointer"
              onClick={() => setIsSidebarOpen(true)}
            >
              <FaBars />
            </button>
            {callerName || "Caller"}
          </div>

          {/* Call Controls */}
          <div className="absolute bottom-4 w-full flex justify-center gap-4">
            <button
              type="button"
              className="bg-red-600 p-4 rounded-full text-white shadow-lg cursor-pointer"
              onClick={handelendCall}
            >

              <FaPhoneSlash size={24} />
            </button>
<button
  type="button"
  onClick={() => setShowChat(!showChat)}
  className="bg-purple-600 p-4 rounded-full text-white shadow-lg cursor-pointer"
>
  💬
</button>
            <button
              type="button"
              onClick={toggleMic}
              className={`p-4 rounded-full text-white shadow-lg cursor-pointer transition-colors ${isMicOn ? "bg-green-600" : "bg-red-600"
                }`}
            >
              {isMicOn ? <FaMicrophone size={24} /> : <FaMicrophoneSlash size={24} />}
            </button>

            <button
              type="button"
              onClick={toggleCam}
              className={`p-4 rounded-full text-white shadow-lg cursor-pointer transition-colors ${isCamOn ? "bg-green-600" : "bg-red-600"
                }`}
            >
              {isCamOn ? <FaVideo size={24} /> : <FaVideoSlash size={24} />}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-6 md:ml-72 text-white">
          {/* Mobile Sidebar Toggle */}
          <button
            type="button"
            className="md:hidden text-2xl text-black mb-4"
            onClick={() => setIsSidebarOpen(true)}
          >
            <FaBars />
          </button>

          {/* Welcome */}
          <div className="flex items-center gap-5 mb-6 bg-gray-800 p-5 rounded-xl shadow-md">
            <div className="w-20 h-20">
              {/* <Lottie animationData={wavingAnimation} loop autoplay /> */}
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                Hey {user?.username || "Guest"}! 👋
              </h1>
              <p className="text-lg text-gray-300 mt-2">
                Ready to <strong>connect with friends instantly?</strong>
                Just <strong>select a user</strong> and start your video call! 🎥✨
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-sm">
            <h2 className="text-lg font-semibold mb-2">💡 How to Start a Video Call?</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li>📌 Open the sidebar to see users.</li>
              <li>🔍 Use the search bar to find a specific person.</li>
              <li>🎥 Click on a user and press “Call” to start a video call!</li>
            </ul>
          </div>
        </div>
      )}

    

      {/* Call rejection popup */}
      {callRejectedPopUp && (
        <div className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex flex-col items-center">
              <p className="font-black text-xl mb-2">Call Rejected From...</p>
              <img
                src={rejectorData?.profilepic || "/default-avatar.png"}
                alt="Caller"
                className="w-20 h-20 rounded-full border-4 border-green-500"
              />
              <h3 className="text-lg font-bold mt-3">{rejectorData?.name}</h3>
              <div className="flex gap-4 mt-5">
                <button
                  type="button"
                 onClick={() => startCall(modalUser)}

                  className="bg-green-500 text-white px-4 py-1 rounded-lg w-28 flex gap-2 justify-center items-center"
                >
                  Call Again <FaPhoneAlt />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    endCallCleanup();
                    setCallRejectedPopUp(false);
                    setShowUserDetailModal(false);
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg w-28 flex gap-2 justify-center items-center"
                >
                  Back <FaPhoneSlash />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHAT PANEL */}
{showChat && (
  <div className="absolute right-0 top-0 h-full w-80 bg-gray-900 text-white p-4 flex flex-col z-50 shadow-xl border-l border-gray-700">

    {/* Header */}
    <div className="flex justify-between items-center mb-3">
      <h2 className="text-xl font-bold">
     Chat with {chatUser?.username}

      </h2>

      <button
        onClick={() => setShowChat(false)}
        className="text-red-400 text-xl font-bold"
      >
        ✖
      </button>
    </div>

    {/* Messages */}
    <div className="flex-1 overflow-y-auto space-y-3 mb-3">
      {chatMessages.map((m) => (
        <div
   key={m.localId || m._id}


          className={`p-2 rounded-lg max-w-[70%] ${
            m.senderId === user._id
              ? "bg-blue-600 ml-auto text-right"
              : "bg-gray-700"
          }`}
        >
          <p>{m.message}</p>
        </div>
      ))}
    </div>

    {/* Input */}
    <div className="flex gap-2">
      <input
        type="text"
        className="flex-1 p-2 rounded bg-gray-800 outline-none"
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button
        className="bg-green-500 px-4 py-2 rounded"
        onClick={sendMessage}
      >
        Send
      </button>
    </div>

  </div>
)}


      {/* Incoming Call Modal */}
      {reciveCall && !callAccepted && (
        <div className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex flex-col items-center">
              <p className="font-black text-xl mb-2">Call From...</p>
              <img
                src={caller?.profilepic || "/default-avatar.png"}
                alt="Caller"
                className="w-20 h-20 rounded-full border-4 border-green-500"
              />
              <h3 className="text-lg font-bold mt-3">{callerName}</h3>
              <p className="text-sm text-gray-500">{caller?.email}</p>
              <div className="flex gap-4 mt-5">
                <button
                  type="button"
                  onClick={handelacceptCall}
                  className="bg-green-500 text-white px-4 py-1 rounded-lg w-28 flex gap-2 justify-center items-center"
                >
                  Accept <FaPhoneAlt />
                </button>
                <button
                  type="button"
                  onClick={handelrejectCall}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg w-28 flex gap-2 justify-center items-center"
                >
                  Reject <FaPhoneSlash />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showUserDetailModal && modalUser && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg w-80 text-black">

      <h2 className="text-xl font-bold mb-3">User Profile</h2>

      <div className="flex flex-col items-center">
        <img
          src={modalUser.profilepic || "/default-avatar.png"}
          className="w-24 h-24 rounded-full mb-3 border-2 border-purple-500"
        />

        <p className="text-lg font-semibold">{modalUser.username}</p>
        <p className="text-sm text-gray-600">{modalUser.email}</p>
      </div>

      {/* BUTTONS */}
      <div className="mt-5 flex flex-col gap-3">

        {/* CALL BUTTON */}
        <button
          className="bg-green-600 text-white py-2 rounded-md"
          onClick={() => {
            setCallUser(modalUser);
            startCall(modalUser);
            setShowUserDetailModal(false);
          }}
        >
          📞 Start Call
        </button>

        {/* CHAT BUTTON */}
        <button
          className="bg-blue-600 text-white py-2 rounded-md"
          onClick={() => {
            setChatUser(modalUser);
            setSelectedUser(modalUser._id);
            loadChatHistory(modalUser._id);
            setShowChat(true);
            setShowUserDetailModal(false);
          }}
        >
          💬 Open Chat
        </button>

        {/* CLOSE BUTTON */}
        <button
          className="bg-gray-500 text-white py-2 rounded-md"
          onClick={() => setShowUserDetailModal(false)}
        >
          ❌ Close
        </button>

      </div>

    </div>
  </div>
)}


      


    </div>
  );
};

export default Dashboard;



