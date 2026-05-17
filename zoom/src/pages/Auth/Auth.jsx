
import.meta.env.VITE_BACKEND_URL

import { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContextApi";

const Auth = ({ type }) => {
  const navigate = useNavigate();
  const { updateUser, user } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // FIXED LOGOUT
  // const handleLogout = async () => {
  //   const token = user?.token;
  //   if (!token) return;

  //   try {
  //     // await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/logout`, { token }, {
  //      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/logout`, { token }, {
  //   headers: {
  //     authorization: user.token,
  //   },
  // });

  //     updateUser(null);                 // clear context
  //     localStorage.removeItem("userData"); // clear storage
  //     toast.success("Logged out!");
  //     navigate("/login");

  //   } catch (error) {
  //     toast.error("Logout failed");
  //   }
  // };

  const handleLogout = () => {
    try {
      if (socket) {
        socket.off();        // remove all listeners
        socket.disconnect(); // close connection
      }

      updateUser(null);
      localStorage.removeItem("userData");
      navigate("/login");

    } catch (e) {
      console.error("Logout error:", e);
    }
  };




  // FIXED LOGIN / SIGNUP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = type === "signup" ? "/register" : "/login";

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users${endpoint}`,
        formData
      );


      toast.success("Success!");

      if (type === "signup") {
        navigate("/login");
      } else {
        // SAVE FULL USER DATA
        updateUser({
          token: res.data.token,
          _id: res.data.user._id,
          username: res.data.user.username,
          name: res.data.user.name
        });

        navigate("/");
      }

    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-800 text-white">
      <div className="bg-white text-gray-900 p-8 rounded-lg shadow-xl w-full max-w-md">

        <h2 className="text-3xl font-bold text-center mb-6">
          {type === "signup" ? "Create Account" : "Login"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NAME FIELD FOR SIGNUP ONLY */}
          {type === "signup" && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full border p-2 rounded"
              onChange={handleChange}
            />
          )}

          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-full border p-2 rounded"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border p-2 rounded"
            onChange={handleChange}
          />

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
          >
            {loading ? "Please wait..." : type === "signup" ? "Sign Up" : "Login"}
          </button>

        </form>

        <p className="text-center mt-4">
          {type === "signup" ? (
            <>
              Already have an account?{" "}
              <Link to="/login" className="text-purple-600 underline">
                Login
              </Link>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <Link to="/signup" className="text-purple-600 underline">
                Create Account
              </Link>
            </>
          )}
        </p>

      </div>

      <Toaster position="top-center" />
    </div>
  );
};

export default Auth;
