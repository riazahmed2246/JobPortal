
// import React, { useState, useEffect, useRef } from 'react';
// import Navbar from './shared/Navbar';
// import { Avatar, AvatarImage } from './ui/avatar';
// import { Button } from './ui/button';
// import { Contact, Mail, Pen, Download, MessageSquare, Send } from 'lucide-react';
// import { Badge } from './ui/badge';
// import { Label } from './ui/label';
// import { Input } from './ui/input'; // Assuming you have an Input component from shadcn/ui
// import { Textarea } from './ui/textarea'; // Assuming you have a Textarea component
// import AppliedJobTable from './AppliedJobTable';
// import UpdateProfileDialog from './UpdateProfileDialog';
// import { useSelector, useDispatch } from 'react-redux'; // Added useDispatch
// import useGetAppliedJobs from '@/hooks/useGetAppliedJobs';

// // For PDF and AI
// import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import { marked } from 'marked';

// // --- Gemini API Key ---
// // IMPORTANT: NEVER COMMIT YOUR API KEY TO A PUBLIC REPOSITORY
// // For development, you can set it here, or better, use an environment variable
// // or prompt the user. For this example, we'll use a constant.
// // REPLACE "YOUR_API_KEY" with your actual Gemini API key
// const GEMINI_API_KEY = "AIzaSyCiD8QHo0d6aGEMjHhKe99Bw9dX4A-CWFU";

// // --- Local Storage Key for User Profile ---
// const USER_PROFILE_STORAGE_KEY = 'userProfileData';

// // --- (Simulated Redux Actions - replace with your actual actions if needed) ---
// // In a real Redux setup, these would be in your slices/actions files.
// const setUserAction = (user) => ({ type: 'AUTH_SET_USER', payload: user });
// // ---

// const Profile = () => {
//   useGetAppliedJobs();
//   const [open, setOpen] = useState(false);
//   const { user } = useSelector((store) => store.auth);
//   const dispatch = useDispatch(); // For updating profile from local storage

//   // --- State for AI Features ---
//   const [isGeneratingResume, setIsGeneratingResume] = useState(false);
//   const [chatMessages, setChatMessages] = useState([]);
//   const [chatInput, setChatInput] = useState("");
//   const [isChatting, setIsChatting] = useState(false);
//   const [apiKey, setApiKey] = useState(GEMINI_API_KEY); // Allow user to set API key
//   const [apiKeyInput, setApiKeyInput] = useState(""); // Temp for API key input

//   const resumeContentRef = useRef(null); // For html2canvas

//   // --- Initialize Gemini Model ---
//   const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
//   const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }) : null;
  
//   const generationConfig = {
//     temperature: 0.7,
//     topK: 0,
//     topP: 0.95,
//     maxOutputTokens: 8192,
//   };

//   const safetySettings = [
//     { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
//     { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
//     { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
//     { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
//   ];

//   // --- Load user from local storage on mount ---
//   useEffect(() => {
//     const storedUser = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
//     if (storedUser) {
//       try {
//         const parsedUser = JSON.parse(storedUser);
//         // Dispatch an action to set this user in your Redux store
//         // This depends on how your Redux store is structured.
//         // For example, if you have an action `auth/setUser`:
//         // dispatch({ type: 'auth/setUser', payload: parsedUser });
//         // For this example, let's assume a simple action:
//         dispatch(setUserAction(parsedUser)); 
//       } catch (error) {
//         console.error("Failed to parse user from local storage:", error);
//         localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
//       }
//     }
//     const storedApiKey = localStorage.getItem("geminiApiKey");
//     if (storedApiKey) {
//         setApiKey(storedApiKey);
//     }
//   }, [dispatch]);

//   // --- Save user to local storage whenever it changes ---
//   // (This assumes `user` object from Redux store is the source of truth after profile updates)
//   useEffect(() => {
//     if (user && Object.keys(user).length > 0) { // Basic check to avoid saving empty initial state
//       localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(user));
//     }
//   }, [user]);


//   const handleSaveApiKey = () => {
//     if (apiKeyInput.trim()) {
//       setApiKey(apiKeyInput.trim());
//       localStorage.setItem("geminiApiKey", apiKeyInput.trim());
//       alert("API Key saved. You might need to refresh if it was previously invalid.");
//     } else {
//       alert("Please enter a valid API Key.");
//     }
//   };


//   // --- Resume Generation ---
//   const handleGenerateResume = async () => {
//     if (!model) {
//         alert("Gemini API Key not configured or model not initialized. Please set your API key.");
//         return;
//     }
//     if (!user) {
//       alert("User data not available.");
//       return;
//     }
//     setIsGeneratingResume(true);

//     const profileSummary = `
//       Full Name: ${user.fullname || 'N/A'}
//       Email: ${user.email || 'N/A'}
//       Phone Number: ${user.phoneNumber || 'N/A'}
//       Bio/Summary: ${user.profile?.bio || 'A highly motivated and skilled software engineer.'}
//       Skills: ${user.profile?.skills?.join(', ') || 'React, Node.js, JavaScript, Python, SQL'}
//       Existing Resume Link (if any): ${user.profile?.resume || 'N/A'}
//     `;

//     const prompt = `
//       You are an expert resume writer. Generate a professional software engineer resume in Markdown format based on the following information.
//       If some information like experience or education is missing, create plausible and industry-standard content for a software engineer with the provided skills and bio.
//       The resume should include the following sections:
//       1.  **Contact Information**: (Name, Phone, Email, LinkedIn (generate a placeholder if not provided), GitHub (generate a placeholder if not provided))
//       2.  **Summary**: An engaging professional summary based on the bio, expanded if necessary.
//       3.  **Skills**: Categorized if possible (e.g., Languages, Frameworks/Libraries, Tools, Databases).
//       4.  **Experience**: At least two relevant job experiences with responsibilities and achievements. If no specific experience is given, create typical software engineering roles. Quantify achievements where possible.
//       5.  **Education**: A relevant degree (e.g., Bachelor's in Computer Science). If not provided, create a plausible one.
//       6.  **Projects**: At least one or two personal or academic projects relevant to the skills. Describe the project and the technologies used.

//       User Information:
//       ${profileSummary}

//       Ensure the output is ONLY valid Markdown. Do not include any conversational text before or after the Markdown.
//       Example for a skill: - JavaScript (Proficient)
//       Example for experience:
//       **Software Engineer** | Tech Solutions Inc. | Jan 2022 - Present
//       - Developed and maintained web applications using React, Node.js, and Express.
//       - Collaborated with cross-functional teams to define, design, and ship new features.
//       - Improved application performance by 20% through code optimization.
//     `;

//     try {
//       const result = await model.generateContent({
//         contents: [{ role: "user", parts: [{text: prompt}] }],
//         generationConfig,
//         safetySettings,
//       });
//       const response = result.response;
//       const markdownContent = response.text();

//       // Render markdown to a hidden div for PDF conversion
//       const hiddenResumeDiv = document.createElement('div');
//       hiddenResumeDiv.innerHTML = marked(markdownContent);
//       hiddenResumeDiv.style.position = 'absolute';
//       hiddenResumeDiv.style.left = '-9999px';
//       hiddenResumeDiv.style.width = '700px'; // Typical A4 width for content
//       hiddenResumeDiv.style.padding = '20px';
//       hiddenResumeDiv.style.fontFamily = 'Arial, sans-serif';
//       document.body.appendChild(hiddenResumeDiv);

//       // Apply some basic styling for the PDF
//       // You might want to use a CSS file and link it, or use more sophisticated styling.
//       const style = document.createElement('style');
//       style.innerHTML = `
//         .resume-container h1, .resume-container h2, .resume-container h3 { margin-bottom: 0.5em; margin-top: 1em; color: #333; }
//         .resume-container h1 { font-size: 24px; text-align: center; }
//         .resume-container h2 { font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 0.3em;}
//         .resume-container h3 { font-size: 16px; }
//         .resume-container p, .resume-container ul { margin-bottom: 0.8em; line-height: 1.6; font-size: 12px; color: #555;}
//         .resume-container ul { list-style-type: disc; padding-left: 20px; }
//       `;
//       hiddenResumeDiv.appendChild(style);
//       hiddenResumeDiv.classList.add('resume-container'); // Add a class to target styles


//       // Wait for images (if any) to load, and for styles to apply
//       await new Promise(resolve => setTimeout(resolve, 500)); 

//       const canvas = await html2canvas(hiddenResumeDiv, { scale: 2 }); // Increase scale for better quality
//       const imgData = canvas.toDataURL('image/png');
      
//       const pdf = new jsPDF({
//         orientation: 'portrait',
//         unit: 'pt', // points
//         format: 'a4'
//       });

//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = pdf.internal.pageSize.getHeight();
//       const imgWidth = canvas.width;
//       const imgHeight = canvas.height;
//       const ratio = imgWidth / imgHeight;
      
//       let finalImgWidth = pdfWidth - 40; // With some margin
//       let finalImgHeight = finalImgWidth / ratio;

//       if (finalImgHeight > pdfHeight - 40) {
//         finalImgHeight = pdfHeight - 40;
//         finalImgWidth = finalImgHeight * ratio;
//       }
      
//       const x = (pdfWidth - finalImgWidth) / 2;
//       const y = 20; // Top margin

//       pdf.addImage(imgData, 'PNG', x, y, finalImgWidth, finalImgHeight);
//       pdf.save(`${user.fullname}_Resume.pdf`);

//       document.body.removeChild(hiddenResumeDiv);

//     } catch (error) {
//       console.error("Error generating resume:", error);
//       alert("Failed to generate resume. Check console for details. Is your API Key valid and does it have Gemini API enabled?");
//     } finally {
//       setIsGeneratingResume(false);
//     }
//   };

//   // --- AI Chat ---
//   const handleSendMessage = async () => {
//     if (!model) {
//         alert("Gemini API Key not configured or model not initialized. Please set your API key.");
//         return;
//     }
//     if (!chatInput.trim() || !user) return;

//     const newMessage = { sender: 'user', text: chatInput };
//     setChatMessages(prev => [...prev, newMessage]);
//     setChatInput("");
//     setIsChatting(true);

//     const userContext = `
//       You are a helpful AI assistant. You are currently chatting with ${user.fullname}.
//       Here is some information about ${user.fullname}:
//       Bio: ${user.profile?.bio || 'Not specified.'}
//       Skills: ${user.profile?.skills?.join(', ') || 'Not specified.'}
//       Please use this context when responding to ${user.fullname}'s messages. Be conversational and helpful.
//     `;

//     // Construct chat history for the API
//     const history = chatMessages.map(msg => ({
//         role: msg.sender === 'user' ? 'user' : 'model',
//         parts: [{ text: msg.text }]
//     }));

//     try {
//       const chat = model.startChat({
//         generationConfig,
//         safetySettings,
//         history: [
//           // Prime the model with context
//           { role: "user", parts: [{ text: userContext + "\nOkay, I understand the context."}] },
//           { role: "model", parts: [{ text: `Hello ${user.fullname}! How can I help you today based on your profile?` }] },
//           ...history // previous actual messages
//         ],
//       });

//       const result = await chat.sendMessage(newMessage.text); // Send only the latest user message
//       const response = result.response;
//       const aiResponse = response.text();
//       setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);

//     } catch (error) {
//       console.error("Error sending message:", error);
//       setChatMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I encountered an error. Please check the API key and console." }]);
//     } finally {
//       setIsChatting(false);
//     }
//   };
  
//   const isResume = user?.profile?.resume ? true : false; // Recalculate based on potentially updated user

//   if (!user) { // Handle case where user is not yet loaded (e.g. from local storage)
//     return (
//         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//             <p>Loading profile...</p>
//         </div>
//     );
//   }


//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />

//       {/* API Key Input - Basic version */}
//       {!apiKey && (
//         <div className="max-w-4xl mx-auto bg-yellow-100 border border-yellow-300 rounded-lg mt-6 p-4 shadow-sm">
//             <h3 className="text-md font-semibold text-yellow-800 mb-2">Configure Gemini API Key</h3>
//             <p className="text-sm text-yellow-700 mb-2">
//                 To use AI features (Resume Generation, AI Chat), please enter your Google Gemini API Key.
//                 You can get one from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>.
//                 Your key will be stored in local storage for convenience.
//             </p>
//             <div className="flex gap-2 items-center">
//                 <Input 
//                     type="password" 
//                     value={apiKeyInput} 
//                     onChange={(e) => setApiKeyInput(e.target.value)} 
//                     placeholder="Enter your Gemini API Key"
//                     className="flex-grow"
//                 />
//                 <Button onClick={handleSaveApiKey}>Save Key</Button>
//             </div>
//         </div>
//       )}


//       <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl mt-10 p-8 shadow-sm">
//         {/* Header */}
//         <div className="flex justify-between items-start">
//           <div className="flex items-center gap-6">
//             <Avatar className="h-24 w-24 shadow-md">
//               <AvatarImage
//                 src={user?.profile?.profilePhoto || "https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"}
//                 alt="profile"
//               />
//             </Avatar>
//             <div>
//               <h1 className="text-2xl font-semibold text-gray-800">{user?.fullname}</h1>
//               <p className="text-sm text-gray-600 mt-1">{user?.profile?.bio}</p>
//             </div>
//           </div>
//           <Button onClick={() => setOpen(true)} variant="outline" className="rounded-full p-2">
//             <Pen className="w-4 h-4" />
//           </Button>
//         </div>

//         {/* Contact Info */}
//         <div className="my-6 space-y-3 text-gray-700">
//           <div className="flex items-center gap-3">
//             <Mail className="text-gray-500" />
//             <span>{user?.email}</span>
//           </div>
//           <div className="flex items-center gap-3">
//             <Contact className="text-gray-500" />
//             <span>{user?.phoneNumber}</span>
//           </div>
//         </div>

//         {/* Skills */}
//         <div className="my-6">
//           <h2 className="text-md font-semibold mb-2 text-gray-800">Skills</h2>
//           <div className="flex flex-wrap gap-2">
//             {user?.profile?.skills && user.profile.skills.length > 0
//               ? user.profile.skills.map((skill, idx) => (
//                   <Badge key={idx} className="text-sm rounded-full px-3 py-1">
//                     {skill}
//                   </Badge>
//                 ))
//               : <span className="text-sm text-gray-500">NA</span>}
//           </div>
//         </div>

//         {/* Resume Section */}
//         <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
//             <div>
//                 <Label className="block text-md font-semibold text-gray-800 mb-1">My Uploaded Resume</Label>
//                 {isResume ? (
//                     <a
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     href={user?.profile?.resume}
//                     className="text-blue-600 hover:underline text-sm"
//                     >
//                     {user?.profile?.resumeOriginalName || "View Resume"}
//                     </a>
//                 ) : (
//                     <span className="text-sm text-gray-500">NA</span>
//                 )}
//             </div>
//             <div>
//                 <Label className="block text-md font-semibold text-gray-800 mb-2">AI Generated Resume</Label>
//                 <Button 
//                     onClick={handleGenerateResume} 
//                     disabled={isGeneratingResume || !apiKey}
//                     className="flex items-center gap-2"
//                 >
//                     {isGeneratingResume ? 'Generating...' : <Download className="w-4 h-4" />}
//                     {isGeneratingResume ? '' : 'Generate & Download PDF'}
//                 </Button>
//                 {!apiKey && <p className="text-xs text-red-500 mt-1">Gemini API Key required.</p>}
//             </div>
//         </div>
//         {/* Hidden div for rendering resume content for PDF generation */}
//         <div ref={resumeContentRef} style={{ position: 'absolute', left: '-9999px', width: '800px' }}></div>

//       </div>

//       {/* AI Chat Section */}
//       <div className="max-w-4xl mx-auto bg-white rounded-2xl mt-8 p-6 border border-gray-200 shadow-sm">
//         <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
//             <MessageSquare className="w-5 h-5" /> Chat with Gemini AI (Profile Aware)
//         </h2>
//         {!apiKey && <p className="text-sm text-red-500 mb-2">Gemini API Key required to use chat.</p>}
//         <div className="chat-window h-64 overflow-y-auto border rounded-md p-4 mb-4 bg-gray-50 space-y-3">
//             {chatMessages.map((msg, idx) => (
//                 <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
//                     <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
//                         <p className="text-sm">{msg.text}</p>
//                     </div>
//                 </div>
//             ))}
//             {isChatting && (
//                  <div className="flex justify-start">
//                     <div className="max-w-[70%] p-3 rounded-lg bg-gray-200 text-gray-800">
//                         <p className="text-sm italic">Gemini is typing...</p>
//                     </div>
//                 </div>
//             )}
//         </div>
//         <div className="flex gap-2">
//             <Input
//                 type="text"
//                 value={chatInput}
//                 onChange={(e) => setChatInput(e.target.value)}
//                 placeholder={apiKey ? "Ask something based on your profile..." : "Set API key to chat"}
//                 onKeyPress={(e) => e.key === 'Enter' && !isChatting && apiKey && handleSendMessage()}
//                 className="flex-grow"
//                 disabled={!apiKey || isChatting}
//             />
//             <Button onClick={handleSendMessage} disabled={isChatting || !chatInput.trim() || !apiKey}>
//                 <Send className="w-4 h-4" />
//             </Button>
//         </div>
//       </div>


//       {/* Applied Jobs Section */}
//       <div className="max-w-4xl mx-auto bg-white rounded-2xl mt-8 p-6 border border-gray-200 shadow-sm">
//         <h2 className="text-lg font-bold mb-4 text-gray-800">Applied Jobs</h2>
//         <AppliedJobTable />
//       </div>

//       {/* Profile Update Dialog */}
//       <UpdateProfileDialog open={open} setOpen={setOpen} />
//     </div>
//   );
// };

// export default Profile;




import React, { useState, useEffect, useRef } from 'react';

import Navbar from './shared/Navbar';

import { Avatar, AvatarImage } from './ui/avatar';

import { Button } from './ui/button';

import { Contact, Mail, Pen, Download, MessageSquare, Send, X } from 'lucide-react';

import { Badge } from './ui/badge';

import { Label } from './ui/label';

import { Input } from './ui/input'; // Assuming you have an Input component from shadcn/ui

import { Textarea } from './ui/textarea'; // Assuming you have a Textarea component

import AppliedJobTable from './AppliedJobTable';

import UpdateProfileDialog from './UpdateProfileDialog';

import { useSelector, useDispatch } from 'react-redux'; // Added useDispatch

import useGetAppliedJobs from '@/hooks/useGetAppliedJobs';

// For PDF and AI

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

import jsPDF from 'jspdf';

import html2canvas from 'html2canvas';

import { marked } from 'marked';

// --- Gemini API Key ---
// IMPORTANT: NEVER COMMIT YOUR API KEY TO A PUBLIC REPOSITORY
// For development, you can set it here, or better, use an environment variable
// or prompt the user. For this example, we'll use a constant.
// REPLACE "YOUR_API_KEY" with your actual Gemini API key
const GEMINI_API_KEY = "AIzaSyCiD8QHo0d6aGEMjHhKe99Bw9dX4A-CWFU";

// --- Local Storage Key for User Profile ---
const USER_PROFILE_STORAGE_KEY = 'userProfileData';

// --- (Simulated Redux Actions - replace with your actual actions if needed) ---
// In a real Redux setup, these would be in your slices/actions files.
const setUserAction = (user) => ({ type: 'AUTH_SET_USER', payload: user });
// ---

/** Utility: strip markdown link syntax [text](url) -> text, remove extraneous ** etc. */
const sanitizeInlineMarkdown = (text = '') => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, (_, inner) => inner) // bold
    .replace(/\*(.*?)\*/g, (_, inner) => inner) // italics
    .replace(/\[([^\]]+)\]\([^)]+\)/g, (_, label) => label) // links
    .replace(/`([^`]+)`/g, (_, inner) => inner) // inline code
    .trim();
};

/** Parse the resume markdown into structured JSON */
const parseResumeMarkdown = (md) => {
  const cleaned = md.replace(/\r\n/g, '\n');
  const obj = {
    contact: {
      name: '',
      email: '',
      phone: '',
      linkedin: '',
      github: '',
    },
    summary: '',
    skills: {}, // e.g., { Languages: [...], Tools: [...] }
    experience: [], // array of { title, company, location, period, bullets: [] }
    education: [], // array of { degree, school, date }
    projects: [], // array of { name, description, tech }
    raw: md,
  };

  // Extract Contact block - look for lines containing email, phone, linkedin, github
  // Attempt name from "Full Name:" or first header line
  const nameMatch = md.match(/Full Name:\s*(.+)/i);
  if (nameMatch) obj.contact.name = sanitizeInlineMarkdown(nameMatch[1]);
  else {
    const boldName = md.match(/^\s*\*\*(.+?)\*\*/m);
    if (boldName) obj.contact.name = sanitizeInlineMarkdown(boldName[1]);
  }

  const emailMatch = md.match(/Email:\s*([^\n]+)/i);
  if (emailMatch) obj.contact.email = sanitizeInlineMarkdown(emailMatch[1]);

  const phoneMatch = md.match(/Phone Number:\s*([^\n]+)/i);
  if (phoneMatch) obj.contact.phone = sanitizeInlineMarkdown(phoneMatch[1]);

  const linkedInMatch = md.match(/LinkedIn[:\s]*([^\n]+)/i);
  if (linkedInMatch) obj.contact.linkedin = sanitizeInlineMarkdown(linkedInMatch[1]);

  const githubMatch = md.match(/GitHub[:\s]*([^\n]+)/i);
  if (githubMatch) obj.contact.github = sanitizeInlineMarkdown(githubMatch[1]);

  // If contact line consolidated (like "seeker1 | email | LinkedIn | GitHub")
  const combinedLine = md
    .split('\n')
    .find((line) => line.toLowerCase().includes('@') && (line.toLowerCase().includes('linkedin') || line.toLowerCase().includes('github')));
  if (combinedLine) {
    const parts = combinedLine.split('|').map((p) => p.trim());
    parts.forEach((p) => {
      if (p.includes('@')) obj.contact.email = sanitizeInlineMarkdown(p);
      else if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(p)) obj.contact.phone = sanitizeInlineMarkdown(p);
      else if (p.toLowerCase().includes('linkedin')) obj.contact.linkedin = sanitizeInlineMarkdown(p.replace(/linkedin\.com\/?/, 'linkedin.com/'));
      else if (p.toLowerCase().includes('github')) obj.contact.github = sanitizeInlineMarkdown(p);
      else if (!obj.contact.name) obj.contact.name = sanitizeInlineMarkdown(p);
    });
  }

  // Summary
  const summaryMatch = cleaned.match(/(?:\*\*Summary\*\*|Summary)\s*\n+([\s\S]*?)(?:\n{2,}|\n\*\*Skills\*\*|\nSkills)/i);
  if (summaryMatch) obj.summary = sanitizeInlineMarkdown(summaryMatch[1].replace(/\n/g, ' '));

  // Skills: find the section and parse categories
  const skillsSectionMatch = cleaned.match(/(?:\*\*Skills\*\*|Skills)([\s\S]*?)(?:\n{2,}|\n\*\*Experience\*\*|\nExperience)/i);
  if (skillsSectionMatch) {
    const skillsBlock = skillsSectionMatch[1];
    // category lines like **Languages:** a, b
    const categoryRegex = /\*\*(.+?):\*\*\s*([^\n]+)/g;
    let m;
    while ((m = categoryRegex.exec(skillsBlock))) {
      const category = sanitizeInlineMarkdown(m[1]);
      const items = m[2]
        .split(/[,\|]/)
        .map((s) => sanitizeInlineMarkdown(s))
        .filter(Boolean);
      obj.skills[category] = items;
    }
    // fallback: lines like Languages: x,y
    if (Object.keys(obj.skills).length === 0) {
      const fallbackRegex = /(?:Languages|Frameworks\/Libraries|Tools|Databases)\s*:\s*([^\n]+)/gi;
      let match;
      while ((match = fallbackRegex.exec(skillsBlock))) {
        const key = match[0].split(':')[0].trim();
        const items = match[1]
          .split(/[,\|]/)
          .map((s) => sanitizeInlineMarkdown(s))
          .filter(Boolean);
        obj.skills[key] = items;
      }
    }
  }

  // Experience: split under Experience heading
  const experienceSectionMatch = cleaned.match(/(?:\*\*Experience\*\*|Experience)([\s\S]*?)(?:\n{2,}|\n\*\*Education\*\*|\nEducation)/i);
  if (experienceSectionMatch) {
    const expBlock = experienceSectionMatch[1];
    // Split by job entries: look for lines starting with **Title | Company | Location | Dates**
    const entryRegex = /(?:\*\*)([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^\*]+)(?:\*\*)([\s\S]*?)(?=(?:\*\*[^|]+\|\s*[^|]+\|\s*[^|]+\|\s*[^\*]+(?:\*\*)|$))/g;
    let em;
    while ((em = entryRegex.exec(expBlock))) {
      const title = sanitizeInlineMarkdown(em[1]);
      const company = sanitizeInlineMarkdown(em[2]);
      const location = sanitizeInlineMarkdown(em[3]);
      const period = sanitizeInlineMarkdown(em[4]);
      const bulletsText = em[5];
      const bullets = bulletsText
        .split('\n')
        .map((l) => sanitizeInlineMarkdown(l.replace(/^[\*\-\+]\s?/, '')))
        .filter((l) => l);
      obj.experience.push({ title, company, location, period, bullets });
    }
    // fallback: naive split by double newlines if none parsed
    if (obj.experience.length === 0) {
      const parts = expBlock.split(/\n{2,}/).filter(Boolean);
      parts.forEach((part) => {
        const headerLine = part.split('\n')[0];
        // try to extract title/company/date from header
        const headerMatch = headerLine.match(/(.+?)\|\s*([^|]+)\|\s*([^|]+)\|\s*(.+)/);
        let title = '', company = '', location = '', period = '';
        if (headerMatch) {
          title = sanitizeInlineMarkdown(headerMatch[1]);
          company = sanitizeInlineMarkdown(headerMatch[2]);
          location = sanitizeInlineMarkdown(headerMatch[3]);
          period = sanitizeInlineMarkdown(headerMatch[4]);
        }
        const bullets = part
          .split('\n')
          .slice(1)
          .map((l) => sanitizeInlineMarkdown(l.replace(/^[\*\-\+]\s?/, '')))
          .filter((l) => l);
        if (title || company || bullets.length) {
          obj.experience.push({ title, company, location, period, bullets });
        }
      });
    }
  }

  // Education
  const educationSectionMatch = cleaned.match(/(?:\*\*Education\*\*|Education)([\s\S]*?)(?:\n{2,}|\n\*\*Projects\*\*|\nProjects)/i);
  if (educationSectionMatch) {
    const eduBlock = educationSectionMatch[1];
    const entries = eduBlock.split(/\n{2,}/).filter(Boolean);
    entries.forEach((entry) => {
      const headerLine = entry.split('\n')[0];
      // e.g., **Bachelor of Science in Computer Science | University ... | May 2019**
      const edMatch = headerLine.match(/\*\*(.+?)\|\s*(.+?)\|\s*(.+?)\*\*/);
      if (edMatch) {
        const degree = sanitizeInlineMarkdown(edMatch[1]);
        const school = sanitizeInlineMarkdown(edMatch[2]);
        const date = sanitizeInlineMarkdown(edMatch[3]);
        obj.education.push({ degree, school, date });
      } else {
        // fallback: whole line as degree
        obj.education.push({ degree: sanitizeInlineMarkdown(headerLine.replace(/\*\*/g, '')), school: '', date: '' });
      }
    });
  }

  // Projects
  const projectsSectionMatch = cleaned.match(/(?:\*\*Projects\*\*|Projects)([\s\S]*)/i);
  if (projectsSectionMatch) {
    const projBlock = projectsSectionMatch[1];
    // Split by project headings: assume bolded name
    const projEntries = projBlock.split(/\n{2,}/).filter(Boolean);
    projEntries.forEach((entry) => {
      const lines = entry.split('\n').filter(Boolean);
      if (lines.length === 0) return;
      const titleLine = lines[0];
      const name = sanitizeInlineMarkdown(titleLine.replace(/\*\*/g, ''));
      const descLines = lines.slice(1).map((l) => sanitizeInlineMarkdown(l.replace(/^[\*\-\+]\s?/, '')));
      const description = descLines.join(' ');
      // Attempt to detect tech stack by looking for "Tech Stack:" or similar
      let tech = '';
      const techMatch = entry.match(/Tech Stack[:\-]\s*([^\.\n]+)/i);
      if (techMatch) tech = sanitizeInlineMarkdown(techMatch[1]);
      obj.projects.push({ name, description, tech });
    });
  }

  return obj;
};

/** Component: professional resume preview from parsed data */
const ResumePreview = React.forwardRef(({ parsed }, ref) => {
  const { contact, summary, skills, experience, education, projects } = parsed;

  return (
    <div
      ref={ref}
      className="p-6 bg-white shadow-md"
      style={{ fontFamily: 'Inter, system-ui, -apple-system', maxWidth: 800, color: '#1f2937' }}
    >
      {/* Header */}
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: 8, marginBottom: 12, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>{contact.name || ''}</h1>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, marginTop: 4 }}>
            {contact.email && <div>{contact.email}</div>}
            {contact.phone && <div>{contact.phone}</div>}
            {contact.linkedin && <div>{contact.linkedin}</div>}
            {contact.github && <div>{contact.github}</div>}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Left column */}
        <div style={{ flex: '1 1 250px', minWidth: 250 }}>
          {/* Summary */}
          {summary && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, position: 'relative' }}>
                Summary
                <div style={{ height: 3, width: 50, background: '#2563eb', borderRadius: 2, marginTop: 4 }} />
              </div>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5 }}>{summary}</p>
            </div>
          )}

          {/* Skills */}
          {skills && Object.keys(skills).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, position: 'relative' }}>
                Skills
                <div style={{ height: 3, width: 50, background: '#2563eb', borderRadius: 2, marginTop: 4 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                {Object.entries(skills).map(([category, items]) => (
                  <div key={category}>
                    <strong>{category}:</strong> {items.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ flex: '2 1 400px', minWidth: 300 }}>
          {/* Experience */}
          {experience && experience.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, position: 'relative' }}>
                Experience
                <div style={{ height: 3, width: 70, background: '#2563eb', borderRadius: 2, marginTop: 4 }} />
              </div>
              {experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{exp.title} <span style={{ fontWeight: 500, color: '#4b5563' }}>| {exp.company}</span></div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{exp.location}</div>
                    </div>
                    <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 2 }}>{exp.period}</div>
                  </div>
                  <ul style={{ margin: '6px 0 0 16px', padding: 0, fontSize: 12, lineHeight: 1.4 }}>
                    {exp.bullets.map((b, bi) => (
                      <li key={bi}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, position: 'relative' }}>
                Education
                <div style={{ height: 3, width: 70, background: '#2563eb', borderRadius: 2, marginTop: 4 }} />
              </div>
              {education.map((edu, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 600 }}>{edu.degree}</div>
                  <div style={{ fontSize: 12, color: '#4b5563' }}>{edu.school} {edu.date && `| ${edu.date}`}</div>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, position: 'relative' }}>
                Projects
                <div style={{ height: 3, width: 70, background: '#2563eb', borderRadius: 2, marginTop: 4 }} />
              </div>
              {projects.map((proj, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 600 }}>{proj.name}</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>{proj.description}</div>
                  {proj.tech && (
                    <div style={{ fontSize: 12, marginTop: 2 }}>
                      <strong>Tech Stack:</strong> {proj.tech}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const Profile = () => {
  useGetAppliedJobs();
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch(); // For updating profile from local storage

  // --- State for AI Features ---
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [apiKey, setApiKey] = useState(GEMINI_API_KEY); // Allow user to set API key
  const [apiKeyInput, setApiKeyInput] = useState(""); // Temp for API key input

  const [generatedMarkdown, setGeneratedMarkdown] = useState(""); // For preview/edit
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [resumeError, setResumeError] = useState(null);
  const [parsedResume, setParsedResume] = useState(null);

  const resumePreviewRef = useRef(null);
  const resumeContentRef = useRef(null);
  const chatWindowRef = useRef(null);

  // --- Initialize Gemini Model ---
  const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }) : null;
  const generationConfig = {
    temperature: 0.7,
    topK: 0,
    topP: 0.95,
    maxOutputTokens: 8192,
  };

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ];

  // --- Load user from local storage on mount ---
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        dispatch(setUserAction(parsedUser));
      } catch (error) {
        console.error("Failed to parse user from local storage:", error);
        localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
      }
    }
    const storedApiKey = localStorage.getItem("geminiApiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, [dispatch]);

  // --- Save user to local storage whenever it changes ---
  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(user));
    }
  }, [user]);

  // Auto scroll chat
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatMessages, isChatting]);

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim());
      localStorage.setItem("geminiApiKey", apiKeyInput.trim());
      alert("API Key saved. You might need to refresh if it was previously invalid.");
    } else {
      alert("Please enter a valid API Key.");
    }
  };

  // --- Resume Generation ---
  const handleGenerateResume = async () => {
    if (!model) {
      alert("Gemini API Key not configured or model not initialized. Please set your API key.");
      return;
    }
    if (!user) {
      alert("User data not available.");
      return;
    }
    setResumeError(null);
    setIsGeneratingResume(true);
    setShowResumePreview(false);
    try {
      const profileSummary = `
Full Name: ${user.fullname || 'N/A'}
Email: ${user.email || 'N/A'}
Phone Number: ${user.phoneNumber || 'N/A'}
Bio/Summary: ${user.profile?.bio || 'A highly motivated and skilled software engineer.'}
Skills: ${user.profile?.skills?.join(', ') || 'React, Node.js, JavaScript, Python, SQL'}
Existing Resume Link (if any): ${user.profile?.resume || 'N/A'}
`;

      const prompt = `
You are an expert resume writer. Generate a professional software engineer resume in Markdown format based on the following information.

If some information like experience or education is missing, create plausible and industry-standard content for a software engineer with the provided skills and bio.

The resume should include the following sections:

1. Contact Information: Name, Phone, Email, LinkedIn (placeholder if missing), GitHub (placeholder if missing)
2. Summary: An engaging professional summary based on the bio.
3. Skills: Categorized (Languages, Frameworks/Libraries, Tools, Databases).
4. Experience: At least two roles with responsibilities and quantified achievements.
5. Education: Relevant degree (create plausible if absent).
6. Projects: One or two relevant projects with tech stack.

User Information:

${profileSummary}

Output ONLY valid Markdown without extraneous commentary.
`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings,
      });
      const response = result.response;
      const markdownContent = response.text();

      setGeneratedMarkdown(markdownContent);
      const parsed = parseResumeMarkdown(markdownContent);
      setParsedResume(parsed);
      setShowResumePreview(true);
    } catch (error) {
      console.error("Error generating resume:", error);
      setResumeError("Failed to generate resume. Is your API Key valid and enabled for Gemini?");
    } finally {
      setIsGeneratingResume(false);
    }
  };

  const handleDownloadEditedResume = async () => {
    if (!parsedResume || !resumePreviewRef.current) return;
    try {
      // Use the rendered professional preview DOM for PDF capture
      const node = resumePreviewRef.current;
      const canvas = await html2canvas(node, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / imgHeight;
      let finalImgWidth = pdfWidth - 40;
      let finalImgHeight = finalImgWidth / ratio;
      if (finalImgHeight > pdfHeight - 40) {
        finalImgHeight = pdfHeight - 40;
        finalImgWidth = finalImgHeight * ratio;
      }
      const x = (pdfWidth - finalImgWidth) / 2;
      const y = 20;
      pdf.addImage(imgData, 'PNG', x, y, finalImgWidth, finalImgHeight);
      pdf.save(`${user?.fullname || 'resume'}_Resume.pdf`);
    } catch (e) {
      console.error("Error creating PDF:", e);
      alert("Failed to convert resume to PDF.");
    }
  };

  // --- AI Chat ---
  const handleSendMessage = async () => {
    if (!model) {
      alert("Gemini API Key not configured or model not initialized. Please set your API key.");
      return;
    }
    if (!chatInput.trim() || !user) return;

    const newMessage = {
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, newMessage]);
    setChatInput("");
    setIsChatting(true);

    const userContext = `
You are a helpful AI assistant. You are currently chatting with ${user.fullname}.
Here is some information about ${user.fullname}:
Bio: ${user.profile?.bio || 'Not specified.'}
Skills: ${user.profile?.skills?.join(', ') || 'Not specified.'}
Please use this context when responding to ${user.fullname}'s messages. Be conversational and helpful.
`;

    const history = chatMessages.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    try {
      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
          { role: "user", parts: [{ text: userContext + "\nOkay, I understand the context." }] },
          { role: "model", parts: [{ text: `Hello ${user.fullname}! How can I help you today based on your profile?` }] },
          ...history,
        ],
      });

      const result = await chat.sendMessage(newMessage.text);
      const response = result.response;
      const aiResponseText = response.text();
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiResponseText,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "Sorry, I encountered an error. Please check the API key and console.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([]);
  };

  const isResume = user?.profile?.resume ? true : false; // Recalculate based on potentially updated user

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  const formatTimestamp = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const avatarInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* API Key Input - Basic version */}
      {!apiKey && (
        <div className="max-w-4xl mx-auto bg-yellow-100 border border-yellow-300 rounded-lg mt-6 p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-md font-semibold text-yellow-800 mb-2">Configure Gemini API Key</h3>
              <p className="text-sm text-yellow-700 mb-2">
                To use AI features (Resume Generation, AI Chat), please enter your Google Gemini API Key.
                You can get one from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>.
                Your key will be stored in local storage for convenience.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setApiKeyInput('')}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2 items-center mt-2">
            <Input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Enter your Gemini API Key"
              className="flex-grow"
            />
            <Button onClick={handleSaveApiKey}>Save Key</Button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl mt-10 p-8 shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 shadow-md">
              <AvatarImage
                src={user?.profile?.profilePhoto || "https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"}
                alt="profile"
              />
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">{user?.fullname}</h1>
              <p className="text-sm text-gray-600 mt-1">{user?.profile?.bio}</p>
            </div>
          </div>
          <Button onClick={() => setOpen(true)} variant="outline" className="rounded-full p-2">
            <Pen className="w-4 h-4" />
          </Button>
        </div>

        {/* Contact Info */}
        <div className="my-6 space-y-3 text-gray-700">
          <div className="flex items-center gap-3">
            <Mail className="text-gray-500" />
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Contact className="text-gray-500" />
            <span>{user?.phoneNumber}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="my-6">
          <h2 className="text-md font-semibold mb-2 text-gray-800">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {user?.profile?.skills && user.profile.skills.length > 0
              ? user.profile.skills.map((skill, idx) => (
                <Badge key={idx} className="text-sm rounded-full px-3 py-1">
                  {skill}
                </Badge>
              ))
              : <span className="text-sm text-gray-500">NA</span>}
          </div>
        </div>

        {/* Resume Section */}
        <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <Label className="block text-md font-semibold text-gray-800 mb-1">My Uploaded Resume</Label>
            {isResume ? (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={user?.profile?.resume}
                className="text-blue-600 hover:underline text-sm"
              >
                {user?.profile?.resumeOriginalName || "View Resume"}
              </a>
            ) : (
              <span className="text-sm text-gray-500">NA</span>
            )}
          </div>
          <div>
            <Label className="block text-md font-semibold text-gray-800 mb-2">AI Generated Resume</Label>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <Button
                  onClick={handleGenerateResume}
                  disabled={isGeneratingResume || !apiKey}
                  className="flex items-center gap-2"
                >
                  {isGeneratingResume ? 'Generating...' : <Download className="w-4 h-4" />}
                  {isGeneratingResume ? '' : 'Generate & Preview'}
                </Button>
                {parsedResume && (
                  <Button onClick={handleDownloadEditedResume} disabled={isGeneratingResume || !parsedResume}>
                    Download PDF
                  </Button>
                )}
              </div>
              {!apiKey && <p className="text-xs text-red-500 mt-1">Gemini API Key required.</p>}
              {resumeError && <p className="text-xs text-red-600 mt-1">{resumeError}</p>}
              {generatedMarkdown && !showResumePreview && (
                <p className="text-xs text-gray-600 mt-1">Resume generated. Preview or edit before downloading.</p>
              )}
            </div>
          </div>
        </div>

        {/* Resume Preview */}
        {showResumePreview && parsedResume && (
          <div className="relative border rounded-lg p-4 bg-gray-50 mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-semibold">Professional Resume Preview</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setShowResumePreview(false)}>
                  Close
                </Button>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Markdown editor on left for tweaks */}
              <div className="flex-1">
                <Label className="text-sm font-medium mb-1">Markdown (editable)</Label>
                <Textarea
                  value={generatedMarkdown}
                  onChange={(e) => {
                    setGeneratedMarkdown(e.target.value);
                    const updated = parseResumeMarkdown(e.target.value);
                    setParsedResume(updated);
                  }}
                  className="h-[400px] font-mono text-xs"
                  aria-label="Edit generated resume markdown"
                />
              </div>
              {/* Rendered professional resume */}
              <div className="flex-1 overflow-auto bg-white border rounded p-3">
                <Label className="text-sm font-medium mb-1">Rendered Resume</Label>
                <div className="mt-2">
                  <ResumePreview parsed={parsedResume} ref={resumePreviewRef} />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-3 gap-2">
              <Button onClick={handleDownloadEditedResume} disabled={!parsedResume || isGeneratingResume}>
                <Download className="w-4 h-4" /> Download Final PDF
              </Button>
              <Button variant="outline" onClick={() => setShowResumePreview(false)}>Close Preview</Button>
            </div>
          </div>
        )}

        {/* Hidden div placeholder for legacy usage (kept for fallback) */}
        <div ref={resumeContentRef} style={{ position: 'absolute', left: '-9999px', width: '800px' }}></div>
      </div>

      {/* AI Chat Section */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl mt-8 p-6 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Chat with Gemini AI (Profile Aware)
          </h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleClearChat} disabled={chatMessages.length === 0}>
              Clear Chat
            </Button>
          </div>
        </div>
        {!apiKey && <p className="text-sm text-red-500 mb-2">Gemini API Key required to use chat.</p>}
        <div
          className="chat-window h-64 overflow-y-auto border rounded-md p-4 mb-4 bg-gray-50 space-y-3"
          ref={chatWindowRef}
          aria-label="Chat history"
        >
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              style={{ animation: 'fadeIn .3s ease' }}
            >
              <div className={`max-w-[70%] p-3 rounded-lg relative flex gap-2 ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <div className="flex-shrink-0">
                  <div
                    className="rounded-full bg-white flex items-center justify-center w-6 h-6 text-[10px] font-semibold"
                    style={{ color: msg.sender === 'user' ? '#2563EB' : '#374151' }}
                  >
                    {msg.sender === 'user' ? avatarInitials(user?.fullname || 'You') : 'AI'}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium">
                      {msg.sender === 'user' ? 'You' : 'Gemini AI'}
                    </span>
                    <span className="text-[9px] text-gray-500">{formatTimestamp(msg.timestamp)}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}
          {isChatting && (
            <div className="flex justify-start">
              <div className="max-w-[70%] p-3 rounded-lg bg-gray-200 text-gray-800">
                <p className="text-sm italic">Gemini is typing...</p>
              </div>
            </div>
          )}
          {chatMessages.length === 0 && !isChatting && (
            <div className="text-center text-sm text-gray-500">
              Start the conversation by asking something about your profile.
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={apiKey ? "Ask something based on your profile..." : "Set API key to chat"}
            onKeyPress={(e) => e.key === 'Enter' && !isChatting && apiKey && handleSendMessage()}
            className="flex-grow"
            disabled={!apiKey || isChatting}
            aria-label="Chat input"
          />
          <Button onClick={handleSendMessage} disabled={isChatting || !chatInput.trim() || !apiKey}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Applied Jobs Section */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl mt-8 p-6 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Applied Jobs</h2>
        <AppliedJobTable />
      </div>

      {/* Profile Update Dialog */}
      <UpdateProfileDialog open={open} setOpen={setOpen} />
    </div>
  );
};

export default Profile;


