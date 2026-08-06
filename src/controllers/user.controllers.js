import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
//import { emit } from "cluster";
import { ApiResponse } from  "../utils/ApiResponse.js"


const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()


        // Saving refresh Token in database
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}


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
    const {fullName, email, username, password} = req.body;
    //console.log("Body:", req.body);

    // console.log({
    //     fullName,
    //     email,
    //     username,
    //     password,
    // });

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

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser) {
        throw new ApiError(409, "User with emil or username already exists")
    }

    console.log(req.files);


    // Step 4 :
    const avatarLocalPath = req.files?.avatar[0]?.path

    
    //const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage)
        && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path
    }


    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // Step 5 :

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if( !avatar) {
        throw new ApiError(400, "Avatar file is required")
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

   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
);

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the User")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )


}  )

const loginUser = asyncHandler(async (req, res) =>{
    // we need data from req body
    // username or email
    // find the user  -> if it exist or not
    // if exist -> password check
    // if password verified -> access and refersh token
    // send in cookies and send a res that we are succesfully login

    const {email, username, password} = req.body
    console.log(email);

    if(!(username || email)) {
        throw new ApiError(400, "username or password is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user) {
        throw new ApiError(404, "user does not exist")
    }

    const isPasswordValid =  await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await user.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken,
                refreshToken
            },
            "User logged in Successfully"
        )
    )
})


const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"))
})

export {
    registerUser,
    loginUser,
    logoutUser
}