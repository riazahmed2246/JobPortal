import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Send, Video } from 'lucide-react';
import { getMessages, addMessage } from '@/utils/messagingService';

const MessageInteractionModal = ({
  isOpen,
  onClose,
  messages,
  jobTitle,
  applicationId,
  canSendMessagePermission
}) => {
  const [replyText, setReplyText] = useState('');
  const [meetLinkText, setMeetLinkText] = useState('');
  const [currentMessages, setCurrentMessages] = useState(messages);

  useEffect(() => {
    if (isOpen && applicationId) {
      setCurrentMessages(getMessages(applicationId));
    }
  }, [isOpen, applicationId, messages]);

  const handleSendReply = () => {
    if (!replyText.trim()) return toast.error("Message cannot be empty.");
    addMessage(applicationId, replyText, 'applicant', 'text');
    toast.success("Message sent to admin.");
    setReplyText('');
    setCurrentMessages(getMessages(applicationId));
  };

  const handleSendMeetLink = () => {
    if (!meetLinkText.trim()) return toast.error("Meet link cannot be empty.");
    try {
      new URL(meetLinkText);
      addMessage(applicationId, "Applicant shared a Google Meet link.", 'applicant', 'meet_link', meetLinkText);
      toast.success("Meet link sent to admin.");
      setMeetLinkText('');
      setCurrentMessages(getMessages(applicationId));
    } catch {
      toast.error("Invalid Google Meet link format.");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      backgroundColor: 'white', padding: '20px', borderRadius: '8px', zIndex: 1050,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)', minWidth: '400px', maxWidth: '600px',
      display: 'flex', flexDirection: 'column', maxHeight: '90vh'
    }}>
      <h3 className="text-lg font-semibold mb-3">Messages for {jobTitle}</h3>
      <div className="space-y-2 flex-grow overflow-y-auto mb-3" style={{border: '1px solid #eee', padding: '10px', borderRadius: '4px'}}>
        {currentMessages.length > 0 ? (
          currentMessages.slice().reverse().map(msg => (
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

export default MessageInteractionModal;
