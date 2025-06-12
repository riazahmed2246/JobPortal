// import React from 'react';
// import { Button } from './ui/button';
// import { Bookmark } from 'lucide-react';
// import { Avatar, AvatarImage } from './ui/avatar';
// import { Badge } from './ui/badge';
// import { useNavigate } from 'react-router-dom';

// const Job = ({ job }) => {
//     const navigate = useNavigate();

//     const daysAgoFunction = (mongodbTime) => {
//         const createdAt = new Date(mongodbTime);
//         const now = new Date();
//         const diff = now - createdAt;
//         const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//         return days === 0 ? 'Today' : `${days} days ago`;
//     };

//     return (
//         <div className="p-6 rounded-2xl shadow-md bg-white border border-gray-100 hover:shadow-xl transition-shadow duration-300">
//             {/* Top Bar */}
//             <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
//                 <p>{daysAgoFunction(job?.createdAt)}</p>
//                 <Button variant="outline" className="rounded-full" size="icon">
//                     <Bookmark className="h-4 w-4" />
//                 </Button>
//             </div>

//             {/* Company Info */}
//             <div className="flex items-center gap-4 mb-4">
//                 <Avatar className="h-12 w-12 border">
//                     <AvatarImage src={job?.company?.logo} />
//                 </Avatar>
//                 <div>
//                     <h2 className="font-semibold text-lg text-gray-800">
//                         {job?.company?.name}
//                     </h2>
//                     <p className="text-xs text-gray-500">India</p>
//                 </div>
//             </div>

//             {/* Job Title & Description */}
//             <div className="mb-4">
//                 <h3 className="text-xl font-bold text-[#6A38C2]">{job?.title}</h3>
//                 <p className="text-sm text-gray-600 mt-1 line-clamp-3">
//                     {job?.description}
//                 </p>
//             </div>

//             {/* Job Info Badges */}
//             <div className="flex flex-wrap gap-2 text-sm mb-4">
//                 <Badge variant="ghost" className="text-blue-700 font-medium">
//                     {job?.position} Position{job?.position > 1 ? 's' : ''}
//                 </Badge>
//                 <Badge variant="ghost" className="text-[#F83002] font-medium">
//                     {job?.jobType}
//                 </Badge>
//                 <Badge variant="ghost" className="text-[#7209b7] font-medium">
//                     ₹{job?.salary} LPA
//                 </Badge>
//             </div>

//             {/* Actions */}
//             <div className="flex gap-4">
//                 <Button
//                     onClick={() => navigate(`/description/${job?._id}`)}
//                     variant="outline"
//                     className="rounded-full px-6"
//                 >
//                     Details
//                 </Button>
//                 <Button className="bg-[#7209b7] text-white rounded-full px-6 hover:bg-[#5e0ba1] transition">
//                     Save for Later
//                 </Button>
//             </div>
//         </div>
//     );
// };

// export default Job;





import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Avatar, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Job = ({ job }) => {
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const savedJobs = JSON.parse(localStorage.getItem('savedJobs')) || [];
        setIsSaved(savedJobs.includes(job._id));
    }, [job._id]);

    const handleToggleSave = () => {
        const savedJobs = JSON.parse(localStorage.getItem('savedJobs')) || [];
        if (isSaved) {
            const updatedJobs = savedJobs.filter(id => id !== job._id);
            localStorage.setItem('savedJobs', JSON.stringify(updatedJobs));
            setIsSaved(false);
            toast.info('🔄 Job removed from saved list.');
        } else {
            savedJobs.push(job._id);
            localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
            setIsSaved(true);
            toast.success('✅ Job saved for later!');
        }
    };

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
                <Button
                    onClick={handleToggleSave}
                    variant="outline"
                    className="rounded-full"
                    size="icon"
                >
                    {isSaved ? (
                        <BookmarkCheck className="h-4 w-4 text-purple-600" />
                    ) : (
                        <Bookmark className="h-4 w-4" />
                    )}
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
                    <p className="text-xs text-gray-500">Bangladesh</p>
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
                    BDT {job?.salary}k
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
                <Button
                    onClick={handleToggleSave}
                    className={`rounded-full px-6 transition ${
                        isSaved
                            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            : 'bg-[#7209b7] text-white hover:bg-[#5e0ba1]'
                    }`}
                >
                    {isSaved ? 'Unsave' : 'Save for Later'}
                </Button>
            </div>
        </div>
    );
};

export default Job;




