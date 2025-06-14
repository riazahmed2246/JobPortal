import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";

import userRoute from "./routes/user.js";
import companyRoute from "./routes/company.js";
import jobRoute from "./routes/job.js";
import applicationRoute from "./routes/application.js";
import videoInterviewRoutes from "./routes/videoInterviewRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

dotenv.config({});

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
}
// const interviewToolkitRoutes = require('./routes/interviewToolkit');
// app.use('/interview', interviewToolkitRoutes);


app.use(cors(corsOptions));

const PORT = process.env.PORT || 8000;


// api's
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/video-interviews", videoInterviewRoutes);
app.use("/api/v1/blogs", blogRoutes);





app.listen(PORT, () => {
    connectDB();
    console.log(`Server running at port ${PORT}`);
})
