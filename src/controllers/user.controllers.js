import { asyncHandler } from "../utils/asyncHandler.js";


const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: 'Manchester United Are the Biggest Club In the World'
    })
})



export {
    registerUser,
}