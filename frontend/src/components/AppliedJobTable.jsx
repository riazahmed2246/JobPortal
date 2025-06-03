import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from './ui/table'; // Assuming path is correct
import { Badge } from './ui/badge'; // Assuming path is correct
import { useSelector } from 'react-redux';
import { toast } from 'sonner'; // For potential toasts on applicant side
// Import messaging service functions
import {
  getMessages,
  isAdminMessageViewEnabledForSeekers, // Renamed
  canApplicantSendMessage, // New
  addMessage, // For applicant to send messages
} from '@/utils/messagingService'; // Adjust path as needed
import { Mail, Send, Video, MessageCircle } from 'lucide-react'; // For message icon & send

// Modal for Applicant to view messages and send (if permitted)
const ApplicantMessageInteractionModal = ({ isOpen, onClose, messages, jobTitle, applicationId, canSendMessagePermission }) => {
  const [replyText, setReplyText] = useState('');
  const [meetLinkText, setMeetLinkText] = useState('');
  const [currentMessages, setCurrentMessages] = useState(messages);

  useEffect(() => {
    // Refresh messages if modal is open and related data changes
    if (isOpen && applicationId) {
      setCurrentMessages(getMessages(applicationId));
    }
  }, [isOpen, applicationId, messages]);


  const handleSendReply = () => {
    if (!replyText.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }
    addMessage(applicationId, replyText, 'applicant', 'text');
    toast.success("Message sent to admin.");
    setReplyText('');
    setCurrentMessages(getMessages(applicationId)); // Refresh messages
  };

  const handleSendMeetLink = () => {
    if (!meetLinkText.trim()) {
      toast.error("Meet link cannot be empty.");
      return;
    }
    try {
        new URL(meetLinkText); // Basic URL validation
        addMessage(applicationId, "Applicant shared a Google Meet link.", 'applicant', 'meet_link', meetLinkText);
        toast.success("Meet link sent to admin.");
        setMeetLinkText('');
        setCurrentMessages(getMessages(applicationId)); // Refresh messages
    } catch (e) {
        toast.error("Invalid Google Meet link format.");
    }
  };

  if (!isOpen) return null;

  // const allMessagesToDisplay = messages.filter(msg => msg.sender === 'admin' || msg.sender === 'applicant');
  // Using currentMessages which is updated
  const allMessagesToDisplay = currentMessages;


  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      backgroundColor: 'white', padding: '20px', borderRadius: '8px', zIndex: 1050, // Higher zIndex
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)', minWidth: '400px', maxWidth: '600px',
      display: 'flex', flexDirection: 'column', maxHeight: '90vh'
    }}>
      <h3 className="text-lg font-semibold mb-3">Messages for {jobTitle}</h3>
      <div className="space-y-2 flex-grow overflow-y-auto mb-3" style={{border: '1px solid #eee', padding: '10px', borderRadius: '4px'}}>
        {allMessagesToDisplay.length > 0 ? (
          allMessagesToDisplay.slice().reverse().map(msg => ( // Newest first
            <div key={msg.id} className={`text-xs p-2 my-1 border rounded-md ${msg.sender === 'applicant' ? 'bg-green-50 ml-auto' : 'bg-gray-50 mr-auto'}`} style={{maxWidth: '80%'}}>
              <p className="font-bold">{msg.sender === 'admin' ? 'Admin' : 'You'}:</p>
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
              <p className="text-xs text-gray-400 italic text-right mt-1">{new Date(msg.timestamp).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-600 italic">No messages for this application yet.</p>
        )}
      </div>

      {canSendMessagePermission && (
        <div className="mt-auto border-t pt-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply..."
            rows={3}
            className="w-full p-2 border rounded-md mb-2 text-sm"
          />
          <button onClick={handleSendReply} className="w-full px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-3 text-sm flex items-center justify-center">
            <Send size={16} className="mr-2" /> Send Message
          </button>
          <div className="flex items-center space-x-2 mb-2">
            <input
                type="url"
                value={meetLinkText}
                onChange={(e) => setMeetLinkText(e.target.value)}
                placeholder="Share your Google Meet link"
                className="flex-grow p-2 border rounded-md text-sm"
            />
            <button onClick={handleSendMeetLink} className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm flex items-center">
                <Video size={16} className="mr-1" /> Share Link
            </button>
          </div>
        </div>
      )}
      <div className="flex justify-end mt-3">
        <button onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-100 text-sm">Close</button>
      </div>
    </div>
  );
};


const AppliedJobTable = () => {
  const { allAppliedJobs } = useSelector((store) => store.job); // Assumes structure: { applications: [{ _id, job: { title, company: { name } }, createdAt, status }] }
  const [showAdminMessagesToSeeker, setShowAdminMessagesToSeeker] = useState(false);
  const [seekerCanSendMessage, setSeekerCanSendMessage] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [currentJobTitleForModal, setCurrentJobTitleForModal] = useState('');
  const [currentApplicationIdForModal, setCurrentApplicationIdForModal] = useState('');

  useEffect(() => {
    setShowAdminMessagesToSeeker(isAdminMessageViewEnabledForSeekers());
    setSeekerCanSendMessage(canApplicantSendMessage());
    // Could add an interval or event listener if permissions change frequently without page reload
  }, []);

  const renderStatusBadge = (status) => {
    const statusLower = status ? status.toLowerCase() : 'pending';
    let badgeColor = 'bg-gray-400'; // Default/pending
    if (statusLower === 'accepted') badgeColor = 'bg-green-500';
    else if (statusLower === 'rejected') badgeColor = 'bg-red-500';

    return (
      <Badge className={`${badgeColor} text-white`}>
        {(status || 'Pending').toUpperCase()}
      </Badge>
    );
  };

  const handleOpenInteractionModal = useCallback((applicationId, jobTitle) => {
    setCurrentMessages(getMessages(applicationId)); // Initial messages load
    setCurrentJobTitleForModal(jobTitle || 'this application');
    setCurrentApplicationIdForModal(applicationId);
    setIsViewModalOpen(true);
  }, []);


  const handleCloseInteractionModal = () => {
    setIsViewModalOpen(false);
    setCurrentMessages([]);
    setCurrentJobTitleForModal('');
    setCurrentApplicationIdForModal('');
  };

  // This determines if the "Messages" column and button appear at all
  const messagingFeatureEnabled = showAdminMessagesToSeeker || seekerCanSendMessage;

  return (
    <div className="border rounded-xl shadow-sm overflow-x-auto">
      <Table>
        <TableCaption className="text-sm text-gray-500 italic py-2">
          A list of your applied jobs
        </TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Job Role</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            {messagingFeatureEnabled && <TableHead className="text-right">Interaction</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {allAppliedJobs && allAppliedJobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={messagingFeatureEnabled ? 5 : 4} className="text-center py-6 text-gray-500">
                You haven't applied to any jobs yet.
              </TableCell>
            </TableRow>
          ) : (
            allAppliedJobs?.map((appliedJob) => {
              const messagesForThisJob = getMessages(appliedJob._id);
              // Unread could be defined as admin messages not yet seen by applicant, or any new message.
              // For simplicity, count admin messages if seeker can view them.
              const adminMessagesCount = showAdminMessagesToSeeker ? messagesForThisJob.filter(m => m.sender === 'admin').length : 0;
              // A more robust "unread" would require tracking last viewed timestamp.
              // Here, we just indicate if there are any admin messages.
              const hasAdminMessages = adminMessagesCount > 0;

              return (
                <TableRow key={appliedJob._id}>
                  <TableCell>
                    {new Date(appliedJob?.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {appliedJob?.job?.title}
                  </TableCell>
                  <TableCell>{appliedJob?.job?.company?.name}</TableCell>
                  <TableCell>
                    {renderStatusBadge(appliedJob?.status)}
                  </TableCell>
                  {messagingFeatureEnabled && (
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleOpenInteractionModal(appliedJob._id, appliedJob?.job?.title)}
                        className="p-1.5 hover:bg-gray-100 rounded-md relative"
                        title={seekerCanSendMessage ? "View & Send Messages" : "View Messages"}
                      >
                        {seekerCanSendMessage ? <MessageCircle size={20} className={hasAdminMessages ? "text-blue-600" : "text-gray-500"} />
                                              : <Mail size={20} className={hasAdminMessages ? "text-blue-600" : "text-gray-500"} />}
                        {hasAdminMessages && ( // Simple indicator for admin messages
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-3.5 w-3.5 flex items-center justify-center">
                            {adminMessagesCount}
                          </span>
                        )}
                      </button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      <ApplicantMessageInteractionModal
        isOpen={isViewModalOpen}
        onClose={handleCloseInteractionModal}
        messages={currentMessages}
        jobTitle={currentJobTitleForModal}
        applicationId={currentApplicationIdForModal}
        canSendMessagePermission={seekerCanSendMessage} // Pass permission to modal
      />
    </div>
  );
};

export default AppliedJobTable;