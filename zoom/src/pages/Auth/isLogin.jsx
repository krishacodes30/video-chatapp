// import { Navigate } from "react-router-dom";

// const IsLogin = ({ children }) => {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// export default IsLogin;
import { useUser } from "../../context/UserContextApi";
import { Navigate } from "react-router-dom";

export default function IsLogin({ children }) {
  const { user } = useUser();

  if (!user?.token) {
    return <Navigate to="/login" />;
  }
  return children;
}
