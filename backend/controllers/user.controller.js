import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";


// // import pdfMake from 'pdfmake/build/pdfmake';
// import pdfMake from 'pdfmake/build/pdfmake.js';
// import pdfFonts from 'pdfmake/build/vfs_fonts.js';
// import { GoogleGenerativeAI } from "@google/generative-ai";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;
         
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        const file = req.file;
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exist with this email.',
                success: false,
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile:{
                profilePhoto:cloudResponse.secure_url,
            }
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        };
        // check role is correct or not
        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false
            })
        };

        const tokenData = {
            userId: user._id
        }
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpsOnly: true, sameSite: 'strict' }).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
// export const updateProfile = async (req, res) => {
//     try {
//         const { fullname, email, phoneNumber, bio, skills } = req.body;
        
//         const file = req.file;
//         // cloudinary ayega idhar
//         const fileUri = getDataUri(file);
//         const cloudResponse = await cloudinary.uploader.upload(fileUri.content);



//         let skillsArray;
//         if(skills){
//             skillsArray = skills.split(",");
//         }
//         const userId = req.id; // middleware authentication
//         let user = await User.findById(userId);

//         if (!user) {
//             return res.status(400).json({
//                 message: "User not found.",
//                 success: false
//             })
//         }
//         // updating data
//         if(fullname) user.fullname = fullname
//         if(email) user.email = email
//         if(phoneNumber)  user.phoneNumber = phoneNumber
//         if(bio) user.profile.bio = bio
//         if(skills) user.profile.skills = skillsArray
      
//         // resume comes later here...
//         if(cloudResponse){
//             user.profile.resume = cloudResponse.secure_url // save the cloudinary url
//             user.profile.resumeOriginalName = file.originalname // Save the original file name
//         }


//         await user.save();

//         user = {
//             _id: user._id,
//             fullname: user.fullname,
//             email: user.email,
//             phoneNumber: user.phoneNumber,
//             role: user.role,
//             profile: user.profile
//         }

//         return res.status(200).json({
//             message:"Profile updated successfully.",
//             user,
//             success:true
//         })
//     } catch (error) {
//         console.log(error);
//     }
// }

export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;

        const file = req.file;
        let cloudResponse = null; // Initialize cloudResponse

        if (file) {
            // cloudinary ayega idhar
            const fileUri = getDataUri(file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        }

        let skillsArray;
        if(skills){
            skillsArray = skills.split(",");
        }
        const userId = req.id; // middleware authentication
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            })
        }
        // updating data
        if(fullname) user.fullname = fullname
        if(email) user.email = email
        if(phoneNumber)  user.phoneNumber = phoneNumber
        if(bio) user.profile.bio = bio
        if(skills) user.profile.skills = skillsArray

        // resume comes later here...
        if(cloudResponse){
            user.profile.resume = cloudResponse.secure_url // save the cloudinary url
            user.profile.resumeOriginalName = file.originalname // Save the original file name
        }

        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).json({
            message:"Profile updated successfully.",
            user,
            success:true
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to update profile.", error: error.message, success: false });
    }
}










// // Configure Gemini API (replace with your API key)
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// // Function to generate PDF resume from user data
// const generateResumePDF = (userData) => {
//     pdfMake.vfs = pdfFonts.pdfMake.vfs;

//     const documentDefinition = {
//         content: [
//             { text: userData.fullname, style: 'header' },
//             { text: userData.email, style: 'subheader' },
//             { text: userData.phoneNumber, style: 'subheader' },
//             { text: 'Bio', style: 'sectionHeader' },
//             { text: userData.profile?.bio || 'N/A' },
//             { text: '\nSkills', style: 'sectionHeader' },
//             { ul: (userData.profile?.skills || []).map(skill => skill) },
//             // Add more sections from your user data as needed (e.g., experience, education)
//         ],
//         styles: {
//             header: {
//                 fontSize: 22,
//                 bold: true,
//                 margin: [0, 0, 0, 10]
//             },
//             subheader: {
//                 fontSize: 14,
//                 margin: [0, 0, 0, 6]
//             },
//             sectionHeader: {
//                 fontSize: 16,
//                 bold: true,
//                 margin: [0, 10, 0, 5]
//             }
//         }
//     };

//     return new Promise((resolve, reject) => {
//         const pdfDoc = pdfMake.createPdfKitDocument(documentDefinition);
//         const chunks = [];
//         pdfDoc.on('data', (chunk) => {
//             chunks.push(chunk);
//         });
//         pdfDoc.on('end', () => {
//             resolve(Buffer.concat(chunks));
//         });
//         pdfDoc.on('error', reject);
//         pdfDoc.end();
//     });
// };

// // Controller function to create and upload resume
// export const createAndUploadResume = async (req, res) => {
//     try {
//         const userId = req.id; // Assuming you have user ID in the request
//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).json({ message: "User not found.", success: false });
//         }

//         const pdfBuffer = await generateResumePDF(user);

//         // Upload to Cloudinary
//         const uploadResult = await new Promise((resolve, reject) => {
//             cloudinary.uploader.upload_stream({
//                 resource_type: 'raw',
//                 public_id: `resume_${user._id}`, // Optional: customize public ID
//                 folder: 'resumes', // Optional: put in a folder
//             }, (error, result) => {
//                 if (error) {
//                     reject(error);
//                 } else {
//                     resolve(result);
//                 }
//             }).end(pdfBuffer);
//         });

//         // Save Cloudinary URL to user profile
//         user.profile.resume = uploadResult.secure_url;
//         user.profile.resumeOriginalName = 'generated_resume.pdf'; // You can set a default name
//         await user.save();

//         return res.status(200).json({
//             message: "Resume generated and uploaded successfully.",
//             resumeUrl: user.profile.resume,
//             success: true
//         });

//     } catch (error) {
//         console.error("Error creating and uploading resume:", error);
//         res.status(500).json({ message: "Failed to create and upload resume.", error: error.message, success: false });
//     }
// };

// // Function to initiate mock interview with Gemini
// export const startMockInterview = async (req, res) => {
//     try {
//         const userId = req.id;
//         const user = await User.findById(userId);

//         if (!user || !user.profile?.resume) {
//             return res.status(404).json({ message: "User or resume not found.", success: false });
//         }

//         const resumeContent = await fetch(user.profile.resume)
//             .then(res => res.blob())
//             .then(blob => new Promise((resolve, reject) => {
//                 const reader = new FileReader();
//                 reader.onloadend = () => resolve(reader.result);
//                 reader.onerror = reject;
//                 reader.readAsText(blob); // Or readAsArrayBuffer depending on PDF content
//             }))
//             .catch(err => {
//                 console.error("Error fetching resume content:", err);
//                 return null;
//             });

//         if (!resumeContent) {
//             return res.status(500).json({ message: "Failed to fetch resume content.", success: false });
//         }

//         const prompt = `You are a mock interview panelist. Conduct a technical interview based on the following resume:\n\n${resumeContent}\n\nAsk relevant questions to assess the candidate's skills and experience. Wait for the user's response after each question. Your first action is to greet the candidate and ask their first interview question.`;

//         const result = await model.generateContent(prompt);
//         const response = await result.response;
//         const text = response.candidates[0].content.parts[0].text;

//         return res.status(200).json({ message: text, success: true });

//     } catch (error) {
//         console.error("Error starting mock interview:", error);
//         res.status(500).json({ message: "Failed to start mock interview.", error: error.message, success: false });
//     }
// };

// // Controller function to send user's response to Gemini
// export const processInterviewResponse = async (req, res) => {
//     try {
//         const { message } = req.body;
//         const userId = req.id;
//         const user = await User.findById(userId);

//         if (!user || !user.profile?.resume) {
//             return res.status(404).json({ message: "User or resume not found.", success: false });
//         }

//         const resumeContent = await fetch(user.profile.resume)
//             .then(res => res.blob())
//             .then(blob => new Promise((resolve, reject) => {
//                 const reader = new FileReader();
//                 reader.onloadend = () => resolve(reader.result);
//                 reader.onerror = reject;
//                 reader.readAsText(blob); // Or readAsArrayBuffer depending on PDF content
//             }))
//             .catch(err => {
//                 console.error("Error fetching resume content:", err);
//                 return null;
//             });

//         if (!resumeContent) {
//             return res.status(500).json({ message: "Failed to fetch resume content.", success: false });
//         }

//         const history = req.session.interviewHistory || [];
//         history.push({ role: "user", parts: message });

//         const prompt = `Continue the mock interview based on this resume:\n\n${resumeContent}\n\nPrevious conversation:\n${history.map(item => `${item.role}: ${item.parts}`).join('\n')}\n\nRespond as the interviewer.`;

//         const result = await model.generateContent([prompt, ...history]);
//         const response = await result.response;
//         const text = response.candidates[0].content.parts[0].text;

//         history.push({ role: "model", parts: text });
//         req.session.interviewHistory = history; // Store interview history in session

//         return res.status(200).json({ message: text, success: true });

//     } catch (error) {
//         console.error("Error processing interview response:", error);
//         res.status(500).json({ message: "Failed to process interview response.", error: error.message, success: false });
//     }
// };