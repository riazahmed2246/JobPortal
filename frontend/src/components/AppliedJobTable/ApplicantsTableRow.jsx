import React from "react";

export default function ApplicantsTableRow({ user, onMessageClick }) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-2">{user.name}</td>
      <td className="p-2">{user.email}</td>
      <td className="p-2">{user.phone}</td>
      <td className="p-2">
        <button
          onClick={onMessageClick}
          className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
        >
          Message
        </button>
      </td>
    </tr>
  );
}
