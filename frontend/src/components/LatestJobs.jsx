import React from 'react';
import LatestJobCards from './LatestJobCards';
import { useSelector } from 'react-redux'; 

const LatestJobs = () => {
    const { allJobs } = useSelector(store => store.job);
   
    return (
        <div className='max-w-7xl mx-auto my-20 px-4 sm:px-6 lg:px-8'>
            <h2 className='text-3xl sm:text-4xl font-bold text-text-primary tracking-tight'>
                Latest & featured <span className='text-accent'>job openings</span>
            </h2>
            <p className='text-sm text-text-secondary mt-2 mb-6'>Explore newly listed verified opportunities from vetted hiring teams.</p>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                {
                    allJobs.length <= 0 
                        ? <span className='text-text-secondary text-sm'>No jobs currently available.</span> 
                        : allJobs?.slice(0, 6).map((job) => <LatestJobCards key={job._id} job={job}/>)
                }
            </div>
        </div>
    );
};

export default LatestJobs;