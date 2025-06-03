
// src/utils/messagingService.js

const MESSAGES_STORAGE_KEY = 'jobApplicationMessages_v1';
const ADMIN_MESSAGE_VIEW_PERMISSION_KEY = 'jobSeekerMessagingPermission_v1'; // Renamed for clarity
const APPLICANT_SEND_MESSAGE_PERMISSION_KEY = 'jobSeekerCanSendMessagePermission_v1'; // New permission
const MESSAGE_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// Helper to get all messages from local storage
const getAllStoredMessages = () => {
  try {
    const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
    return storedMessages ? JSON.parse(storedMessages) : {};
  } catch (error) {
    console.error("Error reading messages from local storage:", error);
    return {};
  }
};

// Helper to save all messages to local storage
const saveAllStoredMessages = (allMessages) => {
  try {
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages));
  } catch (error) {
    console.error("Error saving messages to local storage:", error);
  }
};

/**
 * Adds a message for a specific application.
 * @param {string} applicationId - The ID of the application.
 * @param {string} text - The message content or description for a link.
 * @param {string} sender - Who sent the message (e.g., 'admin', 'applicant').
 * @param {string} [type='text'] - The type of message ('text' or 'meet_link').
 * @param {string|null} [linkUrl=null] - The URL if type is 'meet_link'.
 */
export const addMessage = (applicationId, text, sender, type = 'text', linkUrl = null) => {
  if (!applicationId || !text || !sender) {
    console.error("Application ID, text, and sender are required to add a message.");
    return;
  }
  if (type === 'meet_link' && !linkUrl) {
    console.error("Link URL is required for 'meet_link' message type.");
    return;
  }

  const allMessages = getAllStoredMessages();
  if (!allMessages[applicationId]) {
    allMessages[applicationId] = [];
  }
  const newMessage = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9), // Simple unique ID
    text,
    sender,
    timestamp: Date.now(),
    type, // 'text' or 'meet_link'
    linkUrl, // URL for meet_link
  };
  allMessages[applicationId].push(newMessage);
  saveAllStoredMessages(allMessages);
};

/**
 * Retrieves messages for a specific application, filtering out expired messages.
 * @param {string} applicationId - The ID of the application.
 * @returns {Array} - Array of message objects.
 */
export const getMessages = (applicationId) => {
  if (!applicationId) return [];
  const allMessages = getAllStoredMessages();
  const applicationMessages = allMessages[applicationId] || [];
  const now = Date.now();

  // Filter out expired messages
  const validMessages = applicationMessages.filter(
    (msg) => now - msg.timestamp < MESSAGE_EXPIRY_MS
  );

  // If messages were filtered, update local storage
  if (validMessages.length < applicationMessages.length) {
    allMessages[applicationId] = validMessages;
    saveAllStoredMessages(allMessages);
  }
  return validMessages;
};

/**
 * Sets the permission for job seekers to view messages sent by admin.
 * @param {boolean} isEnabled - True if seekers can view admin messages, false otherwise.
 */
export const setAdminMessageViewPermission = (isEnabled) => {
  try {
    localStorage.setItem(ADMIN_MESSAGE_VIEW_PERMISSION_KEY, JSON.stringify({ seekersCanViewAdminMessages: isEnabled }));
  } catch (error) {
    console.error("Error saving admin message view permission to local storage:", error);
  }
};

/**
 * Checks if job seekers are allowed to view messages sent by admin.
 * @returns {boolean} - True if seekers can view admin messages, defaults to true if not set.
 */
export const isAdminMessageViewEnabledForSeekers = () => {
  try {
    const permission = localStorage.getItem(ADMIN_MESSAGE_VIEW_PERMISSION_KEY);
    if (permission === null) {
      return true; // Default to enabled
    }
    return JSON.parse(permission).seekersCanViewAdminMessages;
  } catch (error) {
    console.error("Error reading admin message view permission from local storage:", error);
    return true; // Default to enabled on error
  }
};

/**
 * Sets the permission for job seekers/applicants to send messages to admin.
 * @param {boolean} isEnabled - True if seekers can send messages, false otherwise.
 */
export const setApplicantCanSendMessagePermission = (isEnabled) => {
  try {
    localStorage.setItem(APPLICANT_SEND_MESSAGE_PERMISSION_KEY, JSON.stringify({ applicantCanSendMessage: isEnabled }));
  } catch (error) {
    console.error("Error saving applicant send message permission to local storage:", error);
  }
};

/**
 * Checks if job seekers/applicants are allowed to send messages to admin.
 * @returns {boolean} - True if seekers can send messages, defaults to false if not set.
 */
export const canApplicantSendMessage = () => {
  try {
    const permission = localStorage.getItem(APPLICANT_SEND_MESSAGE_PERMISSION_KEY);
    if (permission === null) {
      return false; // Default to disabled
    }
    return JSON.parse(permission).applicantCanSendMessage;
  } catch (error) {
    console.error("Error reading applicant send message permission from local storage:", error);
    return false; // Default to disabled on error
  }
};

/**
 * (Optional) Call this function periodically, e.g., on app load,
 * to clean up expired messages from all applications.
 */
export const cleanupAllExpiredMessages = () => {
  const allMessages = getAllStoredMessages();
  const now = Date.now();
  let updated = false;
  for (const appId in allMessages) {
    const originalCount = allMessages[appId].length;
    allMessages[appId] = allMessages[appId].filter(
      (msg) => now - msg.timestamp < MESSAGE_EXPIRY_MS
    );
    if (allMessages[appId].length < originalCount) {
      updated = true;
    }
    if (allMessages[appId].length === 0) {
      delete allMessages[appId]; // Remove app ID if no valid messages left
      updated = true;
    }
  }
  if (updated) {
    saveAllStoredMessages(allMessages);
  }
};

// Example: Call cleanup on load (optional)
// cleanupAllExpiredMessages();