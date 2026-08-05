import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError, APIError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { emit } from "cluster";
import { ApiResponse } from  "../utils/ApiResponse.js"


const registerUser = asyncHandler(async (req, res) => {
    // Get User details fron Frontend -> we can use POSTMAN here
    // Validation -> not empty
    // check if user already exist: username, email .  If not then start making one:
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object -> create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    // step 1:
    const {fullName, email, username, password} = req.body
    console.log("email:", email);

    // Step 2:
    // if(fullName === "") {
    //     throw new APIError(400, "fullName is required")
    // }   we can do this for each fields but it will take lot of times
    if (
        [fullName, email, username, password].some((field) => 
        field.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // Step 3:

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser) {
        throw new ApiError(409, "User with emil or username already exists")
    }


    // Step 4 :
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(avatarLocalPath) {
        throw new APIError(400, "Avatar file is required")
    }

    // Step 5 :

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if( !avatar) {
        throw new APIError(400, "Avatar file is required")
    }

    // Step6:

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",   // if coverImage exists then extract the url otherwise return empty
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id)/Selection(
        "-password -refreshToken"   
    )

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the User")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )


}  )



export {
    registerUser,
}