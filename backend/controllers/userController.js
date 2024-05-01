import User from "../models/userModel.js";
import bcrypt from "bcryptjs"
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import Post from "../models/postModel.js";

const getUserProfile = async (req, res) => {
    // We will fetch user profile either with username or userId
    // query is either username or userId
    const { query } = req.params;

    try {
        let user;
        // query is userId
        if (mongoose.Types.ObjectId.isValid(query)) {
            user = await User.findOne({ _id: query }).select("-password").select("-updatedAt");
        } else {
            // query is username
            user = await User.findOne({ username: query }).select("-password").select("-updatedAt");
        }

        if (!user) return res.status(404).json({ error: "User not found" });

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in getUserProfile: ", err.message);
    }
};

const signupUser = async (req, res) => {
    try {
        const { name, email, username, password } = req.body;
        const user = await User.findOne({ $or: [{ email }, { username }] });

        if (user) {
            return res.status(400).json({ error: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            username,
            password: hashedPassword,
        });
        await newUser.save();

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                bio: newUser.bio,
                profilePic: newUser.profilePic,
                message: "Signup Successfully !"
            });
        } else {
            res.status(400).json({ error: "Invalid user data" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in signupUser: ", err.message);
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            bio: user.bio,
            profilePic: user.profilePic,
            message: "Login Successfully !"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in loginUser: ", error.message);
    }
};

const logoutUser = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 1 });
        res.status(200).json({ message: "Logout Successfully !" });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in logoutUser: ", error.message);
    }
}

const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: "You can not follow/unfollow yourself" });
        }

        if (!userToModify || !currentUser) {
            return res.status(400).json({ error: "User not found" });
        }

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // Unfollow user
            // Modify current user's following, remove the user from followers of the user to unfollow
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            res.status(200).json({ message: "User unfollowed successfully !" });
        } else {
            // Follow user
            // Modify current user's following, add the user to followers of the user to follow
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            res.status(200).json({ message: "User followed successfully !" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in followUnfollowUser: ", error.message);
    }
}

const updateUser = async (req, res) => {
    const { name, email, username, password, bio } = req.body;
    let { profilePic } = req.body;
    const userId = req.user._id;
    try {
        let user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        if (req.params.id !== userId.toString()) {
            return res.status(400).json({ error: "You can't update other user's profile!" })
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        if (profilePic) {
            //delete the old image
            if (user.profilePic) {
                await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
            }
            //upload the new image
            const uploadedResponse = await cloudinary.uploader.upload(profilePic);
            profilePic = uploadedResponse.secure_url;
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;
        user.profilePic = profilePic || user.profilePic;
        user.bio = bio || user.bio;

        user = await user.save();

        //Find all posts that this user replied and update username and userProfilePic fields
        await Post.updateMany(
            { "replies.userId": userId },
            {
                $set: {
                    "replies.$[reply].username": user.username,
                    "replies.$[reply].userProfilePic": user.profilePic
                }
            },
            { arrayFilters: [{ "reply.userId": userId }] }
        )

        //password should be null in response
        user.password = null;

        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in updateUser: ", error.message);
    }
}

const getFollowers = async (req, res) => {
    try {
        const { id } = req.params;

        // Assuming you're using a database library like Mongoose for MongoDB
        // Replace this with your actual database query to retrieve followers
        const user = await User.findById(id); // Assuming "User" is your Mongoose model

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Extract followers' profilePic, username, and name from the followers array
        const followers = await User.find({ _id: { $in: user.followers } }, 'profilePic username name');

        res.status(200).json(followers);
    } catch (error) {
        console.error("Error fetching followers:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const getFollowing = async (req, res) => {
    try {
        const { id } = req.params;

        // Assuming you're using a database library like Mongoose for MongoDB
        // Replace this with your actual database query to retrieve following
        const user = await User.findById(id); // Assuming "User" is your Mongoose model

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Extract following's profilePic, username, and name from the following array
        const following = await User.find({ _id: { $in: user.following } }, 'profilePic username name');

        res.status(200).json(following);
    } catch (error) {
        console.error("Error fetching following:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export { signupUser, loginUser, logoutUser, followUnfollowUser, updateUser, getUserProfile, getFollowers ,getFollowing};