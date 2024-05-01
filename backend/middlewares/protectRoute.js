import User from "../models/userModel.js";
import jwt  from 'jsonwebtoken';

const protectRoute = async(req,res,next)=>{
    // first run this function and then run next means followUnfollowUser function
    try {
        const token = req.cookies.jwt;

        if(!token){
            return res.status(401).json({message : "Unauthorized"})
        }

        //eslint-disable-next-line
        const decoded = jwt.verify(token , process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("-password");

        req.user = user;

        next();

    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Error in protectRoute: ", error.message);
    }
}

export default protectRoute;