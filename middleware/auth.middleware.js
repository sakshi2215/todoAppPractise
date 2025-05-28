import ApiError from "../utils/apiError.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js"


const verifyJWT = asyncHandler(async(req, res, next)=>{

    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if(!token) throw new ApiError(403, "Unauthorized Access");

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    //console.log(decodedToken);


    const user = await User.findById(decodedToken?._id).select("_id username email");

    if(!user) throw new ApiError(404, "User does not exists");

    req.user = user;
    next();
    }
    catch(error){
        throw new ApiError(401, error?.message || "Something went wrong")
    }


})
export default verifyJWT;
