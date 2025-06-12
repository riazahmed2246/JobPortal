import React from "react";

export default function TableControls({ searchQuery, setSearchQuery }) {
  return (
    <div className="mb-4 flex justify-between items-center">
      <input
        type="text"
        placeholder="Search by name..."
        className="border px-3 py-2 rounded w-full max-w-xs"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}
