import React, { useState } from "react";
import TableControls from "./TableControls";
import ApplicantsTableRow from "./ApplicantsTableRow";
import AdminMessageModal from "./AdminMessageModal";

export default function ApplicantsTable({ applicants, onSendMessage }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApplicants = applicants.filter((applicant) =>
    applicant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setModalOpen(false);
  };

  return (
    <div className="p-4">
      <TableControls searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <table className="min-w-full mt-4 bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Phone</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredApplicants.map((applicant) => (
            <ApplicantsTableRow
              key={applicant.id}
              user={applicant}
              onMessageClick={() => handleOpenModal(applicant)}
            />
          ))}
        </tbody>
      </table>
      {modalOpen && selectedUser && (
        <AdminMessageModal
          user={selectedUser}
          onClose={handleCloseModal}
          onSendMessage={onSendMessage}
        />
      )}
    </div>
  );
}
