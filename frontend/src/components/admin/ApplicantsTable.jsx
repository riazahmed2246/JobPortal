import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from '../ui/table'; // Assuming path is correct
import {
  Popover, PopoverContent, PopoverTrigger,
} from '../ui/popover'; // Assuming path is correct
import { MoreHorizontal, MessageSquare, Settings, Video, Link as LinkIcon } from 'lucide-react'; // Added Video, LinkIcon
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
// Import messaging service functions
import {
  addMessage,
  setAdminMessageViewPermission, // Renamed
  isAdminMessageViewEnabledForSeekers, // Renamed
  setApplicantCanSendMessagePermission, // New
  canApplicantSendMessage, // New
  getMessages,
} from '@/utils/messagingService'; // Adjust path as needed

const shortlistingStatus = ['Accepted', 'Rejected'];

// Modal for Admin to send messages or view history
const AdminMessageModal = ({ isOpen, onClose, onSubmitText, onSubmitMeetLink, applicantName, applicationId }) => {
  const [messageText, setMessageText] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [pastMessages, setPastMessages] = useState([]);

  useEffect(() => {
    if (isOpen && applicationId) {
      setPastMessages(getMessages(applicationId));
    }
  }, [isOpen, applicationId, pastMessages]); // Refresh if pastMessages itself is a trigger (e.g. after sending)

  const handleTextSubmit = () => {
    if (messageText.trim()) {
      onSubmitText(messageText);
      setMessageText('');
      // Optimistically update or rely on useEffect to refresh
      setPastMessages(getMessages(applicationId));
    } else {
      toast.error("Message cannot be empty.");
    }
  };

  const handleMeetLinkSubmit = () => {
    if (meetLink.trim()) {
      try {
        new URL(meetLink); // Validate URL
        onSubmitMeetLink(meetLink);
        setMeetLink('');
        setPastMessages(getMessages(applicationId));
      } catch (e) {
        toast.error("Invalid Google Meet link format.");
      }
    } else {
      toast.error("Meet link cannot be empty.");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      backgroundColor: 'white', padding: '20px', borderRadius: '8px', zIndex: 1050, // Ensure higher zIndex
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)', minWidth: '400px', maxWidth: '600px'
    }}>
      <h3 className="text-lg font-semibold mb-2">Chat with {applicantName}</h3>
      <div className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
        <h4 className="text-sm font-semibold mb-1">Conversation History:</h4>
        {pastMessages.length > 0 ? (
          pastMessages.slice().reverse().map(msg => (
            <div key={msg.id} className={`text-xs p-2 my-1 border rounded-md ${msg.sender === 'admin' ? 'bg-blue-50 ml-auto' : 'bg-gray-50 mr-auto'}`} style={{maxWidth: '80%'}}>
              <p className="font-bold">{msg.sender === 'admin' ? 'You' : applicantName || 'Applicant'}:</p>
              {msg.type === 'meet_link' ? (
                <>
                  <p>{msg.text}</p>
                  <a href={msg.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                    Join Meeting: {msg.linkUrl}
                  </a>
                </>
              ) : (
                <p>{msg.text}</p>
              )}
              <p className="text-gray-400 italic text-right text-[10px] mt-1">{new Date(msg.timestamp).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-500 italic">No messages yet.</p>
        )}
      </div>
      <textarea
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        placeholder="Type your message..."
        rows={3}
        className="w-full p-2 border rounded-md mb-2"
      />
      <button onClick={handleTextSubmit} className="w-full px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-3 text-sm">Send Message</button>

      <div className="flex items-center space-x-2 mb-3">
        <input
          type="url"
          value={meetLink}
          onChange={(e) => setMeetLink(e.target.value)}
          placeholder="Paste Google Meet link here"
          className="flex-grow p-2 border rounded-md text-sm"
        />
        <button onClick={handleMeetLinkSubmit} className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm flex items-center">
          <Video size={16} className="mr-1" /> Send Invite
        </button>
      </div>

      <div className="flex justify-end">
        <button onClick={onClose} className="px-3 py-1 border rounded-md hover:bg-gray-100 text-sm">Close</button>
      </div>
    </div>
  );
};


const ApplicantsTable = () => {
  const { applicants } = useSelector((store) => store.application); // { applications: [...] }
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [currentApplicant, setCurrentApplicant] = useState(null); // To store { id, name }

  const [adminMessageViewEnabled, setAdminMessageViewEnabled] = useState(isAdminMessageViewEnabledForSeekers());
  const [applicantSendingEnabled, setApplicantSendingEnabled] = useState(canApplicantSendMessage());

  const statusHandler = async (status, id) => {
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.post(
        `${APPLICATION_API_END_POINT}/status/${id}/update`,
        { status }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        // TODO: Refresh applicant data or update locally:
        // dispatch(updateApplicantStatusInList({ id, status }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong updating status');
    }
  };

  const handleOpenMessageModal = (applicationId, applicantName) => {
    setCurrentApplicant({ id: applicationId, name: applicantName });
    setIsMessageModalOpen(true);
  };

  const handleCloseMessageModal = () => {
    setIsMessageModalOpen(false);
    setCurrentApplicant(null);
  };

  const handleSendTextMessage = (messageText) => {
    if (currentApplicant?.id && messageText) {
      addMessage(currentApplicant.id, messageText, 'admin', 'text');
      toast.success(`Message sent to ${currentApplicant.name}`);
      // Modal can optionally close or stay open for more messages
      // handleCloseMessageModal();
    }
  };

  const handleSendMeetLink = (linkUrl) => {
    if (currentApplicant?.id && linkUrl) {
      addMessage(currentApplicant.id, "You're invited to a Google Meet session.", 'admin', 'meet_link', linkUrl);
      toast.success(`Meet link sent to ${currentApplicant.name}`);
      // handleCloseMessageModal();
    }
  };

  const toggleAdminMessageView = () => {
    const newPermission = !adminMessageViewEnabled;
    setAdminMessageViewPermission(newPermission);
    setAdminMessageViewEnabled(newPermission);
    toast.info(`Job seeker message viewing ${newPermission ? 'ENABLED' : 'DISABLED'}`);
  };

  const toggleApplicantSendingPermission = () => {
    const newPermission = !applicantSendingEnabled;
    setApplicantCanSendMessagePermission(newPermission);
    setApplicantSendingEnabled(newPermission);
    toast.info(`Job seeker message sending ${newPermission ? 'ENABLED' : 'DISABLED'}`);
  };

  return (
    <div className="bg-white shadow-sm border rounded-xl overflow-x-auto">
      <div className="p-4 flex flex-wrap justify-end space-x-0 sm:space-x-2">
        <button
          onClick={toggleAdminMessageView}
          className="flex items-center px-3 py-2 border rounded-md text-xs sm:text-sm hover:bg-gray-100 mb-2 sm:mb-0"
          title="Toggle job seeker visibility of admin messages"
        >
          <Settings size={16} className="mr-1" />
          Seeker View: {adminMessageViewEnabled ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={toggleApplicantSendingPermission}
          className="flex items-center px-3 py-2 border rounded-md text-xs sm:text-sm hover:bg-gray-100"
          title="Toggle job seeker ability to send messages"
        >
          <Settings size={16} className="mr-1" />
          Seeker Send: {applicantSendingEnabled ? 'ON' : 'OFF'}
        </button>
      </div>
      <Table>
        <TableCaption className="text-sm text-gray-500 p-2">
          A list of all users who applied for this job
        </TableCaption>
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applicants?.applications?.length > 0 ? (
            applicants.applications.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="font-medium">
                  {item?.applicant?.fullname}
                </TableCell>
                <TableCell>{item?.applicant?.email}</TableCell>
                <TableCell>{item?.applicant?.phoneNumber}</TableCell>
                <TableCell>
                  {item.applicant?.profile?.resume ? (
                    <a
                      href={item.applicant.profile.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 transition"
                    >
                      {item.applicant.profile.resumeOriginalName || 'View Resume'} <LinkIcon size={12} className="inline"/>
                    </a>
                  ) : (
                    <span className="text-gray-500 italic">NA</span>
                  )}
                </TableCell>
                <TableCell>
                  {item?.createdAt?.split('T')[0]}
                </TableCell>
                <TableCell className="text-right">
                  <Popover>
                    <PopoverTrigger className="hover:bg-gray-200 p-1 rounded-md">
                      <MoreHorizontal />
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2 space-y-1"> {/* Increased width */}
                      {shortlistingStatus.map((status) => (
                        <div
                          key={status}
                          onClick={() => statusHandler(status, item._id)}
                          className="cursor-pointer hover:bg-gray-100 p-1.5 rounded text-sm hover:text-blue-600"
                        >
                          Mark as {status}
                        </div>
                      ))}
                      <div className="border-t my-1"></div> {/* Separator */}
                      <div
                        onClick={() => handleOpenMessageModal(item._id, item?.applicant?.fullname)}
                        className="cursor-pointer hover:bg-gray-100 p-1.5 rounded text-sm hover:text-blue-600 flex items-center"
                      >
                        <MessageSquare size={14} className="mr-2" /> Chat / View History
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                No applicants yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <AdminMessageModal
        isOpen={isMessageModalOpen}
        onClose={handleCloseMessageModal}
        onSubmitText={handleSendTextMessage}
        onSubmitMeetLink={handleSendMeetLink}
        applicantName={currentApplicant?.name}
        applicationId={currentApplicant?.id}
      />
    </div>
  );
};

export default ApplicantsTable;