import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import CompaniesTable from './CompaniesTable'
import { useNavigate } from 'react-router-dom'
import useGetAllCompanies from '@/hooks/useGetAllCompanies'
import { useDispatch } from 'react-redux'
import { setSearchCompanyByText } from '@/redux/companySlice'

const Companies = () => {
    useGetAllCompanies();
    const [input, setInput] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(()=>{
        dispatch(setSearchCompanyByText(input));
    },[input]);
    return (
        <div className="min-h-screen bg-bg flex flex-col justify-between">
            <div>
                <Navbar />
                <div className='max-w-6xl mx-auto my-10 px-4'>
                    <div className='flex items-center justify-between my-5'>
                        <Input
                            className="w-fit bg-surface border-surface-border text-text-primary rounded-xl"
                            placeholder="Filter by name"
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <Button 
                            className="bg-accent hover:bg-accent-hover text-white rounded-xl shadow-warm-sm"
                            onClick={() => navigate("/recruiter/companies/create")}
                        >
                            New Company
                        </Button>
                    </div>
                    <CompaniesTable/>
                </div>
            </div>
        </div>
    )
}

export default Companies