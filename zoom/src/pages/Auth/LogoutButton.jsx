import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Not logged in");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/v1/users/logout", { token });

      // remove token from storage
      localStorage.removeItem("token");

      toast.success("Logged out");

      navigate("/login");

    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded mt-4"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
