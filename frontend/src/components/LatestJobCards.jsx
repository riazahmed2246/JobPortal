import React from 'react';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';

const LatestJobCards = ({ job }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/description/${job._id}`)}
      className="p-6 rounded-2xl shadow-lg bg-white border border-gray-200 cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-2xl"
    >
      <div className="mb-3">
        <h2 className="text-xl font-semibold text-gray-800">{job?.company?.name}</h2>
        <p className="text-sm text-gray-500">Bangladesh</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{job?.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{job?.description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge className="text-blue-700 font-semibold px-3 py-1 rounded-full" variant="ghost">
          {job?.position} Positions
        </Badge>
        <Badge className="text-[#F83002] font-semibold px-3 py-1 rounded-full" variant="ghost">
          {job?.jobType}
        </Badge>
        <Badge className="text-[#7209b7] font-semibold px-3 py-1 rounded-full" variant="ghost">
          {job?.salary} LPA
        </Badge>
      </div>
    </div>
  );
};

export default LatestJobCards;
