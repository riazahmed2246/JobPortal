// import React, { useEffect, useState } from 'react'
// import Navbar from '../shared/Navbar'
// import { Input } from '../ui/input'
// import { Button } from '../ui/button' 
// import { useNavigate } from 'react-router-dom' 
// import { useDispatch } from 'react-redux' 
// import AdminJobsTable from './AdminJobsTable'
// import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs'
// import { setSearchJobByText } from '@/redux/jobSlice'

// const AdminJobs = () => {
//   useGetAllAdminJobs();
//   const [input, setInput] = useState("");
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   useEffect(() => {
//     dispatch(setSearchJobByText(input));
//   }, [input]);
//   return (
//     <div>
//       <Navbar />
//       <div className='max-w-6xl mx-auto my-10'>
//         <div className='flex items-center justify-between my-5'>
//           <Input
//             className="w-fit"
//             placeholder="Filter by name, role"
//             onChange={(e) => setInput(e.target.value)}
//           />
//           <Button onClick={() => navigate("/admin/jobs/create")}>New Jobs</Button>
//         </div>
//         <AdminJobsTable />
//       </div>
//     </div>
//   )
// }

// export default AdminJobs


import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import AdminJobsTable from './AdminJobsTable';
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs';
import { setSearchJobByText } from '@/redux/jobSlice';

const AdminJobs = () => {
  useGetAllAdminJobs();
  const [input, setInput] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchJobByText(input));
  }, [input]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <Input
            className="w-full sm:w-1/2 px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by job title, role, or company..."
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            onClick={() => navigate('/admin/jobs/create')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-200"
          >
            + New Job
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">All Posted Jobs</h2>
          <AdminJobsTable />
        </div>
      </div>
    </div>
  );
};

export default AdminJobs;
