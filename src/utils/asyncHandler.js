// This is a Promise based function that will handle the async await and try catch for us. 

const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error))
    }
}

export {asyncHandler}


/*

//  It is the start of a higher-order function. Its purpose is to wrap asynchronous route handlers so we don't have to write try...catch in every controller.
// (fn) -> Accepts another function (your controller).
// async () => {} → Returns a new async function that Express will execute when a request arrives.

// Simply this is a wrapper function that we will be using everywhere.
// This is try catch :

const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}
*/