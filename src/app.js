import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// It means we are accepting json data from the request body and we are limiting the size of the request body to 16kb. If the request body exceeds this limit, it will throw an error.
app.use(express.json({limit: "16kb"}))

// It means we are accepting urlencoded data from the request body 
// extended:true means that we are allowing nested objects in the request body.
app.use(express.urlencoded({extended: true, limit: "16kb"}))

// express.static() is Express middleware that serves static files (such as HTML, CSS, JavaScript, images, and fonts) from a specified folder without needing to create separate routes.
app.use(express.static("public"))

// it is used to parse the cookies attached to the client request object.
app.use(cookieParser());


// routes import
import userRouter from "./routes/user.routes.js"


// routes declaration
app.use("/api/v1/users", userRouter)   // This is a middleware

// http://localhost:8000/api/v1/users/register

export { app };
