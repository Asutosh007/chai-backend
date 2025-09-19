import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const rejisterUser = asyncHandler(async (req, res) => {
    //  res.status(200).json({
    //         message: "ok"
    //     })
        // get user detail from frotend
        // validate- not empty
        // check if user is already exist: username, email
        // check fro images and avatar
        // upload them to cloudinary
        // create user object - create entry in db
        // remove password and refresh token from user response
        // check for user creation 
        // return resposne
        const {username, email,fullName, password} = req.body;
        console.log(username, email,fullName, password);


        if([fullName,username,email,password].some((field) => field?.trim()) === ""){
            throw new ApiError(400, "All fields are required");
        }


       const existingUser = User.findOne({
           $or: [{ username }, { email}]
       })

       console.log(existingUser);
       

       if(existingUser){
            throw new ApiError(409, "User already exist with this username or email");
       }
       const avatarLocalPath = req.field?.avatar[0]?.path;
       const coverImageLocalPath = req.field?.coverImage[0]?.path;

       if(!avatarLocalPath){
          throw new ApiError(400, "Avatar is required");
       }

       const  avatar = await uploadOnCloudinary(avatarLocalPath);
       const coverImage = await uploadOnCloudinary(coverImageLocalPath);

       if(!avatar){
          throw new ApiError(400, "Avatar is required");
       }
       

       const user = await User.create({
            fullName,
            avatar:avatar.url,
            coverImage:coverImage?.url || "",
            email,
            password,
            username:username.toLowerCase()
       })

       const createdUser = await User.findById(user._id).select(
                "-password -refreshToken"
       )

       if(!createdUser){
            throw new ApiError(500 , "Something went wrong while creating the user")
       }

       return res.status(201).json(
            new ApiResponse(200, "User registered successfully")
       )

})


export {rejisterUser
};