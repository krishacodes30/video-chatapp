import { Router } from "express";
// import { addToHistory, getUserHistory, login, register } from "../controllers/user.controller.js";
import {login, register,logout,getAllUsers,searchUser,
  getUserById } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";


const router = Router();

router.route("/login").post(login)
router.route("/register").post(register)
// router.post('/logout',isLogin,LogOut) fix it 
router.post('/logout',logout)
router.get("/",authMiddleware,getAllUsers);

// Optional search route
router.get("/search", authMiddleware,searchUser);

// Optional get user by ID
router.get("/:id", authMiddleware,getUserById);
// router.route("/add_to_activity").post(addToHistory)
// router.route("/get_all_activity").get(getUserHistory)
// router.get("/allusers", authMiddleware, getAllUsers); 
// //axios.get("/allusers", {
//    headers: { authorization: localStorage.getItem("token") }
// });

export default router;