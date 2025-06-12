import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow
} from '../ui/table';
import { Mail, MessageCircle } from 'lucide-react';
import {
  getMessages,
  isAdminMessageViewEnabledForSeekers,
  canApplicantSendMessage
} from '@/utils/messagingService';
import MessageInteractionModal from './MessageInteractionModal';
import { renderStatusBadge } from './utils';

const AppliedJobTable = () => {
  const { allAppliedJobs } = useSelector((store) => store.job);
  const [showAdminMessagesToSeeker, setShowAdminMessagesToSeeker] = useState(false);
  const [seekerCanSendMessage, setSeekerCanSendMessage] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [currentJobTitle, setCurrentJobTitle] = useState('');
  const [currentApplicationId, setCurrentApplicationId] = useState('');

  useEffect(() => {
    setShowAdminMessagesToSeeker(isAdminMessageViewEnabledForSeekers());
    setSeekerCanSendMessage(canApplicantSendMessage());
  }, []);

  const handleOpenInteractionModal = useCallback((applicationId, jobTitle) => {
    setCurrentMessages(getMessages(applicationId));
    setCurrentJobTitle(jobTitle || 'this application');
    setCurrentApplicationId(applicationId);
    setIsViewModalOpen(true);
  }, []);

  const handleCloseInteractionModal = () => {
    setIsViewModalOpen(false);
    setCurrentMessages([]);
    setCurrentJobTitle('');
    setCurrentApplicationId('');
  };

  const messagingEnabled = showAdminMessagesToSeeker || seekerCanSendMessage;

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
            {messagingEnabled && <TableHead className="text-right">Interaction</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {(!allAppliedJobs || allAppliedJobs.length === 0) ? (
            <TableRow>
              <TableCell colSpan={messagingEnabled ? 5 : 4} className="text-center py-6 text-gray-500">
                You haven't applied to any jobs yet.
              </TableCell>
            </TableRow>
          ) : (
            allAppliedJobs.map((appliedJob) => {
              const messages = getMessages(appliedJob._id);
              const adminMessages = showAdminMessagesToSeeker ? messages.filter(m => m.sender === 'admin') : [];
              const hasAdminMessages = adminMessages.length > 0;

              return (
                <TableRow key={appliedJob._id}>
                  <TableCell>{new Date(appliedJob.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{appliedJob.job?.title}</TableCell>
                  <TableCell>{appliedJob.job?.company?.name}</TableCell>
                  <TableCell>{renderStatusBadge(appliedJob.status)}</TableCell>
                  {messagingEnabled && (
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleOpenInteractionModal(appliedJob._id, appliedJob?.job?.title)}
                        className="p-1.5 hover:bg-gray-100 rounded-md relative"
                        title={seekerCanSendMessage ? "View & Send Messages" : "View Messages"}
                      >
                        {seekerCanSendMessage ? (
                          <MessageCircle size={20} className={hasAdminMessages ? "text-blue-600" : "text-gray-500"} />
                        ) : (
                          <Mail size={20} className={hasAdminMessages ? "text-blue-600" : "text-gray-500"} />
                        )}
                        {hasAdminMessages && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-3.5 w-3.5 flex items-center justify-center">
                            {adminMessages.length}
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

      <MessageInteractionModal
        isOpen={isViewModalOpen}
        onClose={handleCloseInteractionModal}
        messages={currentMessages}
        jobTitle={currentJobTitle}
        applicationId={currentApplicationId}
        canSendMessagePermission={seekerCanSendMessage}
      />
    </div>
  );
};

export default AppliedJobTable;
