// import React, { useState } from 'react';
// import Navbar from './shared/Navbar';
// import { Avatar, AvatarImage } from './ui/avatar';
// import { Button } from './ui/button';
// import { Contact, Mail, Pen } from 'lucide-react';
// import { Badge } from './ui/badge';
// import { Label } from './ui/label';
// import AppliedJobTable from './AppliedJobTable';
// import UpdateProfileDialog from './UpdateProfileDialog';
// import { useSelector } from 'react-redux';
// import useGetAppliedJobs from '@/hooks/useGetAppliedJobs';

// const isResume = true;

// const Profile = () => {
//   useGetAppliedJobs();
//   const [open, setOpen] = useState(false);
//   const { user } = useSelector((store) => store.auth);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />

//       <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl mt-10 p-8 shadow-sm">
//         {/* Header */}
//         <div className="flex justify-between items-start">
//           <div className="flex items-center gap-6">
//             <Avatar className="h-24 w-24 shadow-md">
//               <AvatarImage
//                 src="https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"
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
//             {user?.profile?.skills.length > 0
//               ? user?.profile?.skills.map((skill, idx) => (
//                   <Badge key={idx} className="text-sm rounded-full px-3 py-1">
//                     {skill}
//                   </Badge>
//                 ))
//               : <span className="text-sm text-gray-500">NA</span>}
//           </div>
//         </div>

//         {/* Resume */}
//         <div className="my-6">
//           <Label className="block text-md font-semibold text-gray-800 mb-1">Resume</Label>
//           {isResume ? (
//             <a
//               target="_blank"
//               rel="noopener noreferrer"
//               href={user?.profile?.resume}
//               className="text-blue-600 hover:underline text-sm"
//             >
//               {user?.profile?.resumeOriginalName}
//             </a>
//           ) : (
//             <span className="text-sm text-gray-500">NA</span>
//           )}
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
import { Contact, Mail, Pen, Download, MessageSquare, Send } from 'lucide-react';
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

  const resumeContentRef = useRef(null); // For html2canvas

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
        // Dispatch an action to set this user in your Redux store
        // This depends on how your Redux store is structured.
        // For example, if you have an action `auth/setUser`:
        // dispatch({ type: 'auth/setUser', payload: parsedUser });
        // For this example, let's assume a simple action:
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
  // (This assumes `user` object from Redux store is the source of truth after profile updates)
  useEffect(() => {
    if (user && Object.keys(user).length > 0) { // Basic check to avoid saving empty initial state
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(user));
    }
  }, [user]);


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
    setIsGeneratingResume(true);

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
      1.  **Contact Information**: (Name, Phone, Email, LinkedIn (generate a placeholder if not provided), GitHub (generate a placeholder if not provided))
      2.  **Summary**: An engaging professional summary based on the bio, expanded if necessary.
      3.  **Skills**: Categorized if possible (e.g., Languages, Frameworks/Libraries, Tools, Databases).
      4.  **Experience**: At least two relevant job experiences with responsibilities and achievements. If no specific experience is given, create typical software engineering roles. Quantify achievements where possible.
      5.  **Education**: A relevant degree (e.g., Bachelor's in Computer Science). If not provided, create a plausible one.
      6.  **Projects**: At least one or two personal or academic projects relevant to the skills. Describe the project and the technologies used.

      User Information:
      ${profileSummary}

      Ensure the output is ONLY valid Markdown. Do not include any conversational text before or after the Markdown.
      Example for a skill: - JavaScript (Proficient)
      Example for experience:
      **Software Engineer** | Tech Solutions Inc. | Jan 2022 - Present
      - Developed and maintained web applications using React, Node.js, and Express.
      - Collaborated with cross-functional teams to define, design, and ship new features.
      - Improved application performance by 20% through code optimization.
    `;

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{text: prompt}] }],
        generationConfig,
        safetySettings,
      });
      const response = result.response;
      const markdownContent = response.text();

      // Render markdown to a hidden div for PDF conversion
      const hiddenResumeDiv = document.createElement('div');
      hiddenResumeDiv.innerHTML = marked(markdownContent);
      hiddenResumeDiv.style.position = 'absolute';
      hiddenResumeDiv.style.left = '-9999px';
      hiddenResumeDiv.style.width = '700px'; // Typical A4 width for content
      hiddenResumeDiv.style.padding = '20px';
      hiddenResumeDiv.style.fontFamily = 'Arial, sans-serif';
      document.body.appendChild(hiddenResumeDiv);

      // Apply some basic styling for the PDF
      // You might want to use a CSS file and link it, or use more sophisticated styling.
      const style = document.createElement('style');
      style.innerHTML = `
        .resume-container h1, .resume-container h2, .resume-container h3 { margin-bottom: 0.5em; margin-top: 1em; color: #333; }
        .resume-container h1 { font-size: 24px; text-align: center; }
        .resume-container h2 { font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 0.3em;}
        .resume-container h3 { font-size: 16px; }
        .resume-container p, .resume-container ul { margin-bottom: 0.8em; line-height: 1.6; font-size: 12px; color: #555;}
        .resume-container ul { list-style-type: disc; padding-left: 20px; }
      `;
      hiddenResumeDiv.appendChild(style);
      hiddenResumeDiv.classList.add('resume-container'); // Add a class to target styles


      // Wait for images (if any) to load, and for styles to apply
      await new Promise(resolve => setTimeout(resolve, 500)); 

      const canvas = await html2canvas(hiddenResumeDiv, { scale: 2 }); // Increase scale for better quality
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt', // points
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / imgHeight;
      
      let finalImgWidth = pdfWidth - 40; // With some margin
      let finalImgHeight = finalImgWidth / ratio;

      if (finalImgHeight > pdfHeight - 40) {
        finalImgHeight = pdfHeight - 40;
        finalImgWidth = finalImgHeight * ratio;
      }
      
      const x = (pdfWidth - finalImgWidth) / 2;
      const y = 20; // Top margin

      pdf.addImage(imgData, 'PNG', x, y, finalImgWidth, finalImgHeight);
      pdf.save(`${user.fullname}_Resume.pdf`);

      document.body.removeChild(hiddenResumeDiv);

    } catch (error) {
      console.error("Error generating resume:", error);
      alert("Failed to generate resume. Check console for details. Is your API Key valid and does it have Gemini API enabled?");
    } finally {
      setIsGeneratingResume(false);
    }
  };

  // --- AI Chat ---
  const handleSendMessage = async () => {
    if (!model) {
        alert("Gemini API Key not configured or model not initialized. Please set your API key.");
        return;
    }
    if (!chatInput.trim() || !user) return;

    const newMessage = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput("");
    setIsChatting(true);

    const userContext = `
      You are a helpful AI assistant. You are currently chatting with ${user.fullname}.
      Here is some information about ${user.fullname}:
      Bio: ${user.profile?.bio || 'Not specified.'}
      Skills: ${user.profile?.skills?.join(', ') || 'Not specified.'}
      Please use this context when responding to ${user.fullname}'s messages. Be conversational and helpful.
    `;

    // Construct chat history for the API
    const history = chatMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    try {
      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
          // Prime the model with context
          { role: "user", parts: [{ text: userContext + "\nOkay, I understand the context."}] },
          { role: "model", parts: [{ text: `Hello ${user.fullname}! How can I help you today based on your profile?` }] },
          ...history // previous actual messages
        ],
      });

      const result = await chat.sendMessage(newMessage.text); // Send only the latest user message
      const response = result.response;
      const aiResponse = response.text();
      setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);

    } catch (error) {
      console.error("Error sending message:", error);
      setChatMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I encountered an error. Please check the API key and console." }]);
    } finally {
      setIsChatting(false);
    }
  };
  
  const isResume = user?.profile?.resume ? true : false; // Recalculate based on potentially updated user

  if (!user) { // Handle case where user is not yet loaded (e.g. from local storage)
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p>Loading profile...</p>
        </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* API Key Input - Basic version */}
      {!apiKey && (
        <div className="max-w-4xl mx-auto bg-yellow-100 border border-yellow-300 rounded-lg mt-6 p-4 shadow-sm">
            <h3 className="text-md font-semibold text-yellow-800 mb-2">Configure Gemini API Key</h3>
            <p className="text-sm text-yellow-700 mb-2">
                To use AI features (Resume Generation, AI Chat), please enter your Google Gemini API Key.
                You can get one from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>.
                Your key will be stored in local storage for convenience.
            </p>
            <div className="flex gap-2 items-center">
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
                <Button 
                    onClick={handleGenerateResume} 
                    disabled={isGeneratingResume || !apiKey}
                    className="flex items-center gap-2"
                >
                    {isGeneratingResume ? 'Generating...' : <Download className="w-4 h-4" />}
                    {isGeneratingResume ? '' : 'Generate & Download PDF'}
                </Button>
                {!apiKey && <p className="text-xs text-red-500 mt-1">Gemini API Key required.</p>}
            </div>
        </div>
        {/* Hidden div for rendering resume content for PDF generation */}
        <div ref={resumeContentRef} style={{ position: 'absolute', left: '-9999px', width: '800px' }}></div>

      </div>

      {/* AI Chat Section */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl mt-8 p-6 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Chat with Gemini AI (Profile Aware)
        </h2>
        {!apiKey && <p className="text-sm text-red-500 mb-2">Gemini API Key required to use chat.</p>}
        <div className="chat-window h-64 overflow-y-auto border rounded-md p-4 mb-4 bg-gray-50 space-y-3">
            {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                        <p className="text-sm">{msg.text}</p>
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


