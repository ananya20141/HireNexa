import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Edit2, MoreHorizontal } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getCompanyInitials } from '@/utils/constant'

const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "N/A";
        return date.toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return "N/A";
    }
};

const CompaniesTable = () => {
    const { companies, searchCompanyByText } = useSelector(store => store.company);
    const [filterCompany, setFilterCompany] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const compList = Array.isArray(companies) ? companies : [];
        const filtered = compList.filter((company) => {
            if (!searchCompanyByText) return true;
            return company?.name?.toLowerCase().includes(searchCompanyByText.toLowerCase());
        });
        setFilterCompany(filtered);
    }, [companies, searchCompanyByText]);

    return (
        <div className="overflow-hidden border border-surface-border rounded-2xl bg-surface shadow-warm-sm">
            <Table>
                <TableCaption className="pb-3 text-xs text-text-secondary">A list of your recent registered companies</TableCaption>
                <TableHeader className="bg-bg">
                    <TableRow>
                        <TableHead className="text-xs font-bold text-text-primary">Logo</TableHead>
                        <TableHead className="text-xs font-bold text-text-primary">Name</TableHead>
                        <TableHead className="text-xs font-bold text-text-primary">Date</TableHead>
                        <TableHead className="text-right text-xs font-bold text-text-primary">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(!filterCompany || filterCompany.length === 0) ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-xs text-text-secondary">
                                No registered companies found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filterCompany.map((company) => (
                            <TableRow key={company?._id || Math.random()} className="hover:bg-bg/60 transition-colors">
                                <TableCell>
                                    <Avatar className="h-10 w-10 rounded-xl border border-surface-border bg-bg/80 shrink-0 shadow-warm-sm">
                                        <AvatarImage 
                                            src={company?.logo} 
                                            alt={company?.name || "Company"} 
                                            className="object-cover rounded-xl"
                                        />
                                        <AvatarFallback className="rounded-xl bg-accent/10 text-accent font-bold text-xs border border-accent/20">
                                            {getCompanyInitials(company?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell className="font-semibold text-xs text-text-primary">{company?.name || "Untitled"}</TableCell>
                                <TableCell className="text-text-secondary text-xs">{formatDate(company?.createdAt)}</TableCell>
                                <TableCell className="text-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="p-1 hover:bg-bg rounded-md text-text-secondary">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-32 p-1 rounded-xl shadow-warm-md border border-surface-border bg-surface" align="end">
                                            <button 
                                                onClick={() => navigate(`/recruiter/companies/${company?._id}`)} 
                                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-text-primary hover:bg-bg hover:text-accent rounded-lg transition-colors text-left font-medium"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                                <span>Edit</span>
                                            </button>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default CompaniesTable;