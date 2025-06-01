import React, { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { useDispatch, useSelector } from 'react-redux';
import { setSingleJob } from '@/redux/jobSlice';
import { toast } from 'sonner';

const JobDescription = () => {
    const { singleJob } = useSelector((store) => store.job);
    const { user } = useSelector((store) => store.auth);
    const dispatch = useDispatch();
    const params = useParams();
    const jobId = params.id;

    const isInitiallyApplied = singleJob?.applications?.some(app => app.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isInitiallyApplied);

    const applyJobHandler = async () => {
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {
                withCredentials: true,
            });
            if (res.data.success) {
                setIsApplied(true);
                const updatedSingleJob = {
                    ...singleJob,
                    applications: [...singleJob.applications, { applicant: user?._id }],
                };
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    };

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, {
                    withCredentials: true,
                });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(
                        res.data.job.applications.some((app) => app.applicant === user?._id)
                    );
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchSingleJob();
    }, [jobId, dispatch, user?._id]);

    return (
        <div className="max-w-5xl mx-auto px-6 py-10 bg-white shadow-lg rounded-2xl mt-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{singleJob?.title}</h1>
                    <div className="flex gap-3 mt-3 flex-wrap">
                        <Badge variant="ghost" className="text-blue-700 font-medium">
                            {singleJob?.position} Position{singleJob?.position > 1 ? 's' : ''}
                        </Badge>
                        <Badge variant="ghost" className="text-[#F83002] font-medium">
                            {singleJob?.jobType}
                        </Badge>
                        <Badge variant="ghost" className="text-[#7209b7] font-medium">
                            ₹{singleJob?.salary} LPA
                        </Badge>
                    </div>
                </div>
                <Button
                    onClick={!isApplied ? applyJobHandler : null}
                    disabled={isApplied}
                    className={`px-6 py-2 rounded-full text-white font-semibold transition 
                        ${isApplied ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#7209b7] hover:bg-[#5f32ad]'}`}
                >
                    {isApplied ? 'Already Applied' : 'Apply Now'}
                </Button>
            </div>

            {/* Divider */}
            <hr className="border-t border-gray-300 mb-6" />

            {/* Job Details */}
            <div className="space-y-4 text-gray-700">
                <div>
                    <span className="font-semibold text-gray-800">Role:</span>
                    <span className="pl-4">{singleJob?.title}</span>
                </div>
                <div>
                    <span className="font-semibold text-gray-800">Location:</span>
                    <span className="pl-4">{singleJob?.location}</span>
                </div>
                <div>
                    <span className="font-semibold text-gray-800">Description:</span>
                    <p className="pl-4 mt-1 text-sm leading-relaxed text-gray-600">{singleJob?.description}</p>
                </div>
                <div>
                    <span className="font-semibold text-gray-800">Experience:</span>
                    <span className="pl-4">{singleJob?.experience} years</span>
                </div>
                <div>
                    <span className="font-semibold text-gray-800">Salary:</span>
                    <span className="pl-4">₹{singleJob?.salary} LPA</span>
                </div>
                <div>
                    <span className="font-semibold text-gray-800">Total Applicants:</span>
                    <span className="pl-4">{singleJob?.applications?.length}</span>
                </div>
                <div>
                    <span className="font-semibold text-gray-800">Posted On:</span>
                    <span className="pl-4">{singleJob?.createdAt?.split("T")[0]}</span>
                </div>
            </div>
        </div>
    );
};

export default JobDescription;

