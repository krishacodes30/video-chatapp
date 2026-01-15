import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt, { hash } from "bcrypt"

import crypto from "crypto"
// import { Meeting } from "../models/meeting.model.js";
const login = async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please Provide" })
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found" })
        }


        let isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (isPasswordCorrect) {
            let token = crypto.randomBytes(20).toString("hex");//login->token should be stored in it will affect local storage 

            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({
  success: true,
  token: token,
  user: {
    _id: user._id,
    username: user.username,
    name: user.name
  } })
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid Username or password" })
        }

    } catch (e) {
        return res.status(500).json({ message: `Something went wrong ${e}` })
    }
}


const register = async (req, res) => {
    const { name, username, password } = req.body;


    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword
        });

        await newUser.save();

        res.status(httpStatus.CREATED).json({ message: "User Registered" })

    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }

}
const logout = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Token required" });
    }

    try {
        const user = await User.findOne({ token });

        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "Invalid token" });
        }

        user.token = null; // or ""
        await user.save();

        return res.status(httpStatus.OK).json({ message: "Logged out successfully" });
    } catch (e) {
        return res.status(500).json({ message: `Something went wrong ${e}` });
    }
};



// ------------------------------------------------
// GET ALL USERS (except logged-in user)
// ------------------------------------------------

 const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({_id:{$ne:req.user._id}}, "username name ");

    return res.status(200).json({
      success: true,
      users,
    });

  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

 const searchUser = async (req, res) => {

    const { query } = req.query;
    try{
      if (!query) {
        return res.status(400).json({ success: false, message: "Search text required" });
    }
    const user=await User.findOne({username:query},"name username");
    if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }

};

 const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id, "name username");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Invalid user ID." });
    }
};


 export { login,searchUser, register,logout,getAllUsers,getUserById}
// const getUserHistory = async (req, res) => {
//     const { token } = req.query;

//     try {
//         const user = await User.findOne({ token: token });
//         const meetings = await Meeting.find({ user_id: user.username })
//         res.json(meetings)
//     } catch (e) {
//         res.json({ message: `Something went wrong ${e}` })
//     }
// }

// const addToHistory = async (req, res) => {
//     const { token, meeting_code } = req.body;

//     try {
//         const user = await User.findOne({ token: token });

//         const newMeeting = new Meeting({
//             user_id: user.username,
//             meetingCode: meeting_code
//         })

//         await newMeeting.save();

//         res.status(httpStatus.CREATED).json({ message: "Added code to history" })
//     } catch (e) {
//         res.json({ message: `Something went wrong ${e}` })
//     }
// }


// export { login, register, getUserHistory, addToHistory }