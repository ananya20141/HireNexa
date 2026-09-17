import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import Footer from '../shared/Footer'
import { Input } from '../ui/input'
import { Button } from '../ui/button' 
import { useNavigate, useSearchParams } from 'react-router-dom' 
import { useDispatch, useSelector } from 'react-redux' 
import AdminJobsTable from './AdminJobsTable'
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs'
import { setSearchJobByText } from '@/redux/jobSlice'
import { PlusCircle } from 'lucide-react'

const AdminJobs = () => {
  useGetAllAdminJobs();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { allAdminJobs } = useSelector(store => store.job);

  const statusFilter = searchParams.get('status') || 'all';

  useEffect(() => {
    dispatch(setSearchJobByText(input));
  }, [input, dispatch]);

  const totalCount = allAdminJobs?.length || 0;
  const activeCount = allAdminJobs?.filter(j => j.isActive && j.status === 'approved')?.length || 0;

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-between">
      <div>
        <Navbar />
        <div className='max-w-6xl mx-auto my-10 px-4'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-5'>
            <div className='flex flex-wrap items-center gap-3'>
              <Input
                className="w-64 bg-surface border-surface-border text-text-primary rounded-xl text-xs"
                placeholder="Filter by name, role..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('status');
                    setSearchParams(newParams);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    statusFilter === 'all' 
                      ? 'bg-accent text-white shadow-warm-sm' 
                      : 'bg-surface border border-surface-border text-text-secondary hover:bg-bg hover:text-text-primary'
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('status', 'active');
                    setSearchParams(newParams);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    statusFilter === 'active' 
                      ? 'bg-accent text-white shadow-warm-sm' 
                      : 'bg-surface border border-surface-border text-text-secondary hover:bg-bg hover:text-text-primary'
                  }`}
                >
                  Active ({activeCount})
                </button>
              </div>
            </div>
            <Button 
              className="bg-accent hover:bg-accent-hover text-white rounded-xl shadow-warm-sm text-xs font-semibold shrink-0 flex items-center gap-1.5"
              onClick={() => navigate("/recruiter/jobs/create")}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Job</span>
            </Button>
          </div>
          <AdminJobsTable />
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AdminJobs