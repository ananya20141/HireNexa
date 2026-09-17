import React from 'react';
import { useNavigate } from 'react-router-dom';

const LatestJobCards = ({ job }) => {
    const navigate = useNavigate();
    return (
        <div 
            onClick={() => navigate(`/description/${job?._id}`)} 
            className='p-5 rounded-2xl shadow-warm-sm bg-surface border border-surface-border hover:border-accent/60 hover:shadow-warm-md transition-all cursor-pointer flex flex-col justify-between h-full group'
        >
            <div>
                <div className="flex items-center justify-between gap-2">
                    <h3 className='font-semibold text-xs text-text-secondary truncate'>{job?.company?.name}</h3>
                    <span className='text-xs text-text-secondary/60 shrink-0'>{job?.location || "India"}</span>
                </div>
                <h4 className='font-bold text-base text-text-primary group-hover:text-accent transition-colors my-2 line-clamp-1'>{job?.title}</h4>
                <p className='text-xs text-text-secondary line-clamp-2 leading-relaxed'>{job?.description}</p>
            </div>
            <div className='flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-surface-border'>
                <span className='rounded-lg bg-bg text-text-secondary text-xs font-medium px-2.5 py-0.5 border border-surface-border'>
                    {job?.position} {job?.position === 1 ? 'Position' : 'Positions'}
                </span>
                <span className='rounded-lg bg-warning/10 text-warning text-xs font-medium px-2.5 py-0.5 border border-warning/30'>
                    {job?.jobType}
                </span>
                <span className='rounded-lg bg-success/10 text-success text-xs font-bold px-2.5 py-0.5 border border-success/30'>
                    {job?.salary} LPA
                </span>
            </div>
        </div>
    );
};

export default LatestJobCards;