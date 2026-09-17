import { setSingleCompany } from '@/redux/companySlice'
import { setAllJobs } from '@/redux/jobSlice'
import { COMPANY_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const useGetCompanyById = (companyId) => {
    const dispatch = useDispatch();
    useEffect(()=>{
        const fetchSingleCompany = async () => {
            if (!companyId) return;
            try {
                const res = await axios.get(`${COMPANY_API_END_POINT}/get/${companyId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleCompany(res.data.company));
                }
            } catch (error) {
                console.error("Fetch Single Company Error:", error?.response?.data?.message || error?.message || error);
            }
        }
        fetchSingleCompany();
    }, [companyId, dispatch])
}


export default useGetCompanyById