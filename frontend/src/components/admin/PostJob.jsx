import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useSelector } from 'react-redux';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import axios from 'axios';
import { JOB_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const PostJob = () => {
  const [input, setInput] = useState({
    title: '',
    description: '',
    requirements: '',
    salary: '',
    location: '',
    jobType: '',
    experience: '',
    position: 0,
    companyId: '',
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { companies } = useSelector((store) => store.company);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const selectChangeHandler = (value) => {
    const selectedCompany = companies.find(
      (company) => company.name.toLowerCase() === value
    );
    setInput({ ...input, companyId: selectedCompany?._id });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${JOB_API_END_POINT}/post`, input, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        navigate('/admin/jobs');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
        <h1 className='text-2xl font-bold text-gray-800 mb-6'>
          Post a New Job
        </h1>

        <form
          onSubmit={submitHandler}
          className='bg-white shadow-md border border-gray-200 rounded-lg p-8'
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <Label htmlFor='title'>Job Title</Label>
              <Input
                id='title'
                name='title'
                value={input.title}
                onChange={changeEventHandler}
                placeholder='e.g. Frontend Developer'
              />
            </div>
            <div>
              <Label htmlFor='description'>Job Description</Label>
              <Input
                id='description'
                name='description'
                value={input.description}
                onChange={changeEventHandler}
                placeholder='Brief overview of job role'
              />
            </div>
            <div>
              <Label htmlFor='requirements'>Requirements</Label>
              <Input
                id='requirements'
                name='requirements'
                value={input.requirements}
                onChange={changeEventHandler}
                placeholder='e.g. React, Node.js, MongoDB'
              />
            </div>
            <div>
              <Label htmlFor='salary'>Salary</Label>
              <Input
                id='salary'
                name='salary'
                value={input.salary}
                onChange={changeEventHandler}
                placeholder='e.g. BDT 40k'
              />
            </div>
            <div>
              <Label htmlFor='location'>Location</Label>
              <Input
                id='location'
                name='location'
                value={input.location}
                onChange={changeEventHandler}
                placeholder='e.g. Dhaka, Remote'
              />
            </div>
            <div>
              <Label htmlFor='jobType'>Job Type</Label>
              <Input
                id='jobType'
                name='jobType'
                value={input.jobType}
                onChange={changeEventHandler}
                placeholder='e.g. Full-time, Part-time, Internship'
              />
            </div>
            <div>
              <Label htmlFor='experience'>Experience Level</Label>
              <Input
                id='experience'
                name='experience'
                value={input.experience}
                onChange={changeEventHandler}
                placeholder='e.g. Entry-level, Mid, Senior'
              />
            </div>
            <div>
              <Label htmlFor='position'>Number of Positions</Label>
              <Input
                id='position'
                name='position'
                type='number'
                min={1}
                value={input.position}
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Company</Label>
              {companies.length > 0 ? (
                <Select onValueChange={selectChangeHandler}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select a Company' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {companies.map((company) => (
                        <SelectItem
                          key={company._id}
                          value={company.name.toLowerCase()}
                        >
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (
                <p className='text-red-500 text-sm mt-1'>
                  * Please register a company before posting a job.
                </p>
              )}
            </div>
          </div>

          <div className='mt-8'>
            {loading ? (
              <Button type='button' disabled className='w-full'>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Posting Job...
              </Button>
            ) : (
              <Button type='submit' className='w-full'>
                Post Job
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
