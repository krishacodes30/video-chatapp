import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt, { hash } from "bcrypt"
import jwt from "jsonwebtoken";

// import crypto from "crypto"
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
            let token = jwt.sign(
                { id: user._id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            // Token is no longer saved to DB, frontend will handle it via localStorage
            return res.status(httpStatus.OK).json({
                success: true,
                token: token,
                user: {
                    _id: user._id,
                    username: user.username,
                    name: user.name
                }
            });
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
    // For stateless JWT, we don't need to invalidate the token in the DB.
    // The frontend removes it from local storage.
    return res.status(httpStatus.OK).json({ message: "Logged out successfully" });
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