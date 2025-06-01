import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Edit2, Eye, MoreHorizontal } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const AdminJobsTable = () => {
  const { allAdminJobs, searchJobByText } = useSelector((store) => store.job);
  const [filterJobs, setFilterJobs] = useState(allAdminJobs);
  const navigate = useNavigate();

  useEffect(() => {
    const filtered = allAdminJobs.filter((job) => {
      if (!searchJobByText) return true;
      const query = searchJobByText.toLowerCase();
      return (
        job?.title?.toLowerCase().includes(query) ||
        job?.company?.name?.toLowerCase().includes(query)
      );
    });
    setFilterJobs(filtered);
  }, [allAdminJobs, searchJobByText]);

  return (
    <div className="overflow-x-auto rounded-lg shadow-sm bg-white border border-gray-200">
      <Table>
        <TableCaption className="text-sm text-gray-500">
          A list of your recently posted jobs
        </TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="text-gray-700">Company Name</TableHead>
            <TableHead className="text-gray-700">Role</TableHead>
            <TableHead className="text-gray-700">Date Posted</TableHead>
            <TableHead className="text-gray-700 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filterJobs.length > 0 ? (
            filterJobs.map((job) => (
              <TableRow key={job._id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{job?.company?.name}</TableCell>
                <TableCell>{job?.title}</TableCell>
                <TableCell>{job?.createdAt?.split('T')[0]}</TableCell>
                <TableCell className="text-right">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="p-1 rounded-md hover:bg-gray-200 transition">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-36 bg-white shadow-md rounded-md p-2 border">
                      <div
                        onClick={() => navigate(`/admin/companies/${job._id}`)}
                        className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Job
                      </div>
                      <div
                        onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)}
                        className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer mt-1"
                      >
                        <Eye className="w-4 h-4" />
                        View Applicants
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan="4" className="text-center py-5 text-gray-500">
                No jobs found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminJobsTable;
