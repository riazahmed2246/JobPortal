// import React from 'react'
// import { Button } from './ui/button'
// import { Bookmark } from 'lucide-react'
// import { Avatar, AvatarImage } from './ui/avatar'
// import { Badge } from './ui/badge'
// import { useNavigate } from 'react-router-dom'

// const Job = ({job}) => {
//     const navigate = useNavigate();
//     // const jobId = "lsekdhjgdsnfvsdkjf";

//     const daysAgoFunction = (mongodbTime) => {
//         const createdAt = new Date(mongodbTime);
//         const currentTime = new Date();
//         const timeDifference = currentTime - createdAt;
//         return Math.floor(timeDifference/(1000*24*60*60));
//     }
    
//     return (
//         <div className='p-5 rounded-md shadow-xl bg-white border border-gray-100'>
//             <div className='flex items-center justify-between'>
//                 <p className='text-sm text-gray-500'>{daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}</p>
//                 <Button variant="outline" className="rounded-full" size="icon"><Bookmark /></Button>
//             </div>

//             <div className='flex items-center gap-2 my-2'>
//                 <Button className="p-6" variant="outline" size="icon">
//                     <Avatar>
//                         <AvatarImage src={job?.company?.logo} />
//                     </Avatar>
//                 </Button>
//                 <div>
//                     <h1 className='font-medium text-lg'>{job?.company?.name}</h1>
//                     <p className='text-sm text-gray-500'>India</p>
//                 </div>
//             </div>

//             <div>
//                 <h1 className='font-bold text-lg my-2'>{job?.title}</h1>
//                 <p className='text-sm text-gray-600'>{job?.description}</p>
//             </div>
//             <div className='flex items-center gap-2 mt-4'>
//                 <Badge className={'text-blue-700 font-bold'} variant="ghost">{job?.position} Positions</Badge>
//                 <Badge className={'text-[#F83002] font-bold'} variant="ghost">{job?.jobType}</Badge>
//                 <Badge className={'text-[#7209b7] font-bold'} variant="ghost">{job?.salary}LPA</Badge>
//             </div>
//             <div className='flex items-center gap-4 mt-4'>
//                 <Button onClick={()=> navigate(`/description/${job?._id}`)} variant="outline">Details</Button>
//                 <Button className="bg-[#7209b7]">Save For Later</Button>
//             </div>
//         </div>
//     )
// }

// export default Job


import React from 'react';
import { Button } from './ui/button';
import { Bookmark } from 'lucide-react';
import { Avatar, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';

const Job = ({ job }) => {
    const navigate = useNavigate();

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const now = new Date();
        const diff = now - createdAt;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        return days === 0 ? 'Today' : `${days} days ago`;
    };

    return (
        <div className="p-6 rounded-2xl shadow-md bg-white border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            {/* Top Bar */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <p>{daysAgoFunction(job?.createdAt)}</p>
                <Button variant="outline" className="rounded-full" size="icon">
                    <Bookmark className="h-4 w-4" />
                </Button>
            </div>

            {/* Company Info */}
            <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12 border">
                    <AvatarImage src={job?.company?.logo} />
                </Avatar>
                <div>
                    <h2 className="font-semibold text-lg text-gray-800">
                        {job?.company?.name}
                    </h2>
                    <p className="text-xs text-gray-500">India</p>
                </div>
            </div>

            {/* Job Title & Description */}
            <div className="mb-4">
                <h3 className="text-xl font-bold text-[#6A38C2]">{job?.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                    {job?.description}
                </p>
            </div>

            {/* Job Info Badges */}
            <div className="flex flex-wrap gap-2 text-sm mb-4">
                <Badge variant="ghost" className="text-blue-700 font-medium">
                    {job?.position} Position{job?.position > 1 ? 's' : ''}
                </Badge>
                <Badge variant="ghost" className="text-[#F83002] font-medium">
                    {job?.jobType}
                </Badge>
                <Badge variant="ghost" className="text-[#7209b7] font-medium">
                    ₹{job?.salary} LPA
                </Badge>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <Button
                    onClick={() => navigate(`/description/${job?._id}`)}
                    variant="outline"
                    className="rounded-full px-6"
                >
                    Details
                </Button>
                <Button className="bg-[#7209b7] text-white rounded-full px-6 hover:bg-[#5e0ba1] transition">
                    Save for Later
                </Button>
            </div>
        </div>
    );
};

export default Job;
