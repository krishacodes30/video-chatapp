
// export default App
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth/Auth";
import "./App.css";
import IsLogin from "./pages/Auth/isLogin";
import Dashboard from "./pages/Dashboard/Dashboard";
import { UserProvider } from "./context/UserContextApi";


function App() {
  return (
    <>
      <UserProvider>
      <BrowserRouter>
        <Routes>
            <Route 
          path="/" 
          element={
            <IsLogin>
            <Dashboard/>{/* Only logged in users can see this */}
            </IsLogin>
          }
        />
          {/* <Route path="/" element={<h1>Home Page</h1>} /> */}

          <Route path="/signup" element={<Auth type="signup" />} />
          <Route path="/login" element={<Auth type="login" />} />
             {/* Protected Route */}
      
        </Routes>
      </BrowserRouter>
      </UserProvider>
    </>
  );
}

export default App;
