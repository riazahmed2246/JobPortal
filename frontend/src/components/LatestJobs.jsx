// export default LatestJobs

import React from 'react';
import LatestJobCards from './LatestJobCards';
import { useSelector } from 'react-redux';

const LatestJobs = () => {
  const { allJobs } = useSelector((store) => store.job);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
          <span className="text-[#6A38C2]">FOR YOU</span>
        </h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base">Explore recent jobs curated just for you</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allJobs.length <= 0 ? (
          <div className="col-span-full text-center text-gray-500 py-10 text-lg">
            No Job Available
          </div>
        ) : (
          allJobs?.slice(0, 6).map((job) => (
            <LatestJobCards key={job._id} job={job} />
          ))
        )}
      </div>
    </div>
  );
};

export default LatestJobs;




// import React, { useMemo } from 'react';
// import LatestJobCards from './LatestJobCards';
// import { useSelector } from 'react-redux';

// const LatestJobs = () => {
//   const { allJobs } = useSelector((store) => store.job);
//   // Assuming the user's information, including skills, is stored in the 'auth' slice of your Redux store.
//   const { user } = useSelector((store) => store.auth);

//   const suggestedJobs = useMemo(() => {
//     if (!user?.profile?.skills?.length) {
//       // If the user has no skills listed, return a slice of the latest jobs.
//       return allJobs?.slice(0, 6) || [];
//     }

//     const userSkills = new Set(user.profile.skills.map(skill => skill.toLowerCase()));

//     const scoredJobs = allJobs.map(job => {
//       let score = 0;
//       if (job.skills) {
//         job.skills.forEach(jobSkill => {
//           if (userSkills.has(jobSkill.toLowerCase())) {
//             score++;
//           }
//         });
//       }
//       return { ...job, score };
//     });

//     // Sort jobs by the number of matching skills in descending order.
//     const sortedJobs = scoredJobs.sort((a, b) => b.score - a.score);

//     // Filter out jobs with no matching skills and take the top 6.
//     return sortedJobs.filter(job => job.score > 0).slice(0, 6);

//   }, [allJobs, user]);

//   return (
//     <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16">
//       <div className="text-center mb-10">
//         <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
//           <span className="text-[#6A38C2]">FOR YOU</span>
//         </h1>
//         <p className="text-gray-500 mt-2 text-sm md:text-base">Explore recent jobs curated just for you</p>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {suggestedJobs.length === 0 ? (
//           <div className="col-span-full text-center text-gray-500 py-10 text-lg">
//             No Job Available
//           </div>
//         ) : (
//           suggestedJobs.map((job) => (
//             <LatestJobCards key={job._id} job={job} />
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default LatestJobs;
