import mongoose from 'mongoose';
import User from '../models/user.models.js';
import jwt from "jsonwebtoken"
import ApiError from '../utils/apiError.utils.js'
import APIResponse from '../utils/apiResponse.utils.js'
import asyncHandler from '../utils/asyncHandler.utils.js'
import  ApiResponse from '../utils/apiResponse.utils.js';


///Register user

const registerUser = asyncHandler(async(req, res)=>{
    //LOGIC:-

   const {username, email, password} = req.body;
   
   //validate the user details
   if(
    [username, email, password].some((feild)=>{
        return feild?.trim ===""
    })
   ){
        throw new ApiError(404, "All feild are compulsory")
   }

   if(username?.trim().length < 5) throw new ApiError (400, "Usernme must have minimum of 5 characters");

   //check if user exists or not
   const existedUser = await User.findOne({
        $or: [{username}, {email}]
   })

   if(existedUser) throw new ApiError(404, "User Already Exists with same username or email");

   const createdUser = await User.create({
     username,
     email :email.toLowerCase(),
     password,

   })

   if(!createdUser) throw new ApiError(500, "Something went wrong!!");


   const userData = {
     email : createdUser.email,
     username : createdUser.username,
     _id: createdUser._id
   } 

   if(!userData) throw new ApiError(500, "Something went wrong while registering the user Data");

   return res.
   status(200).json(
    new APIResponse(
        200, "Successfully created the user"
    )
   )


});


const loginUser = asyncHandler(async(req, res)=>{
    const {email, username, password} = req.body;

    if(!(username || email)) throw new ApiError(404, "Username or password is required");

    if(!password) throw new ApiError(404, "Password is required");

    const findUser = await User.findOne({
        $or: [{email}, {username}]
    })?.select(
        "-refreshAccessToken "
    )

    if(!findUser) throw new ApiError(400, "No user found")

    //check the password
    const isPasswordValid = await findUser.isPasswordCorrect(password);

    if(!isPasswordValid) throw new ApiError(400, "password is incorrect, try again!!");

    //generate access and refresh token while login
    const {accessToken, refreshToken} = await generateAcessAndRefreshToken(findUser._id);

    //user with updated refresh and accessToken
    const loggedInUser = await User.findById(findUser._id).select(
        "-password -refreshAccessToken"
    )
    if(!loggedInUser) throw new ApiError(400, "Something went wrong");

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken,options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, {  //Sometimes mobile app does not have access to the Cookies.
                loggedUser: loggedInUser, accessToken, refreshToken
            }, "Successfully logged In")
    )
});

const generateAcessAndRefreshToken = async(userId)=>{
    try{
        const user = await User.findById(userId).select(
        "-password"
    )

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshAccessToken = refreshToken;
    await user.save({ validateBeforesave: false })
    
    return { accessToken, refreshToken }
    }
    catch(error){
       throw new ApiError(500, "Something went wrong while Generating Access and Refresh Tokens")
    }

};


const logoutUser = asyncHandler(async(req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshAccessToken : 1,
            }
        },
        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    };

    res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "Successfully logged Out")
    );
})


const getCurrentUser =  asyncHandler(async(req, res)=>{
    const user = req.user;
    //console.log(user);
    res.status(200).json(
        new ApiResponse(
            200,
            {
                _id: user._id,
                username: user.username,
                email: user.email
            },
            "Current user fetched successfully"
        )
    );
})
const  changeCurrentPassword= asyncHandler(async(req, res)=>{
    //get the user
    //check the password
    //update the password
    //send response
    const {oldPassword, newPassword}= req.body
    //console.log(oldPassword)

    const user = await User.findById(req.user._id)

    if(!user){
        throw new ApiError(404, "User does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid Current Password")
    }

    user.password = newPassword //set the new password

    await user.save({ validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(200, 
            {}, 
            "Password Changed Successfully"
        )
    )
})

//to do
const refreshAccessToken = asyncHandler(async(req, res)=>{
    try{
        const incomingRefreshToken = await req.cookies.refreshToken || req.body.refreshToken
        if(!incomingRefreshToken){
            throw new ApiError(401, "Unauthorized Request")
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        //get refreshToken from database
        const user = await User.findById(decodedToken?._id).select("_id refreshAccessToken");

        if(!user) throw new ApiError(500, "Unauthorized user");

        if(incomingRefreshToken !== user?.refreshAccessToken){
            throw new ApiError(401, "Refresh token is expired or Used")
        }

        const options = {
            httpOnly: true,
            secure: true,
        }
        const {accessToken, newRefreshToken} = await generateAcessAndRefreshToken(user?._id);
        
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new APIResponse(200, {accessToken, refreshToken: newRefreshToken}, "Sucess")
        );

       
    }
    catch(error){
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
});


export{
    changeCurrentPassword,
    registerUser,
    loginUser,
    logoutUser,
    generateAcessAndRefreshToken,
    getCurrentUser,
    refreshAccessToken
}