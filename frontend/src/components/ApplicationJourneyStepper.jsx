import React from 'react';
import { 
    CheckCircle2, 
    Clock, 
    Calendar, 
    AlertCircle, 
    UserCheck, 
    XCircle, 
    Sparkles, 
    FileText, 
    Video, 
    ClipboardCheck, 
    PartyPopper 
} from 'lucide-react';
import { Badge } from './ui/badge';

/**
 * Maps application status string to a 0-4 numeric stage index
 */
export function getStageIndex(status) {
    switch (status) {
        case 'hired':
        case 'accepted':
        case 'selected':
        case 'rejected':
        case 'withdrawn':
            return 4;
        case 'interview':
            return 3;
        case 'assessment':
            return 2;
        case 'shortlisted':
            return 1;
        case 'applied':
        case 'pending':
        case 'under_review':
        default:
            return 0;
    }
}

const ApplicationJourneyStepper = ({ application, compact = false }) => {
    if (!application) return null;

    const {
        status = 'applied',
        interviewDate,
        assessmentDate,
        reminderNote,
        statusHistory = [],
        updatedAt,
        createdAt
    } = application;

    const isRejected = status === 'rejected' || status === 'withdrawn';
    const isSelected = status === 'selected' || status === 'accepted' || status === 'hired';
    const currentStageIndex = getStageIndex(status);

    const formatDateTime = (dateStr) => {
        if (!dateStr) return null;
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch {
            return null;
        }
    };

    const formattedInterview = formatDateTime(interviewDate);
    const formattedAssessment = formatDateTime(assessmentDate);

    // 5 Stages definition
    const steps = [
        {
            id: 'applied',
            label: 'Applied',
            sublabel: 'Resume submitted',
            icon: FileText
        },
        {
            id: 'shortlisted',
            label: 'Shortlisted',
            sublabel: 'Profile reviewed',
            icon: UserCheck
        },
        {
            id: 'assessment',
            label: 'Assessment',
            sublabel: formattedAssessment ? `On ${formattedAssessment}` : 'Skills evaluation',
            icon: ClipboardCheck,
            badge: formattedAssessment
        },
        {
            id: 'interview',
            label: 'Interview',
            sublabel: formattedInterview ? `On ${formattedInterview}` : 'Technical round',
            icon: Video,
            badge: formattedInterview
        },
        {
            id: isRejected ? 'rejected' : 'selected',
            label: isRejected ? 'Closed' : 'Selected',
            sublabel: isRejected ? 'Not selected' : 'Offer extended',
            icon: isRejected ? XCircle : PartyPopper
        }
    ];

    return (
        <div className="w-full space-y-3">
            {/* Scheduled Reminder Alert Banner (Assessment / Interview) */}
            {(formattedInterview || formattedAssessment || reminderNote) && !isRejected && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-xl bg-warning/10 border border-warning/30 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="p-1 rounded-md bg-accent text-white animate-pulse shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                        </span>
                        <div>
                            {formattedInterview && (
                                <p className="font-bold text-text-primary">
                                    📅 Interview Scheduled: <span className="text-accent font-semibold">{formattedInterview}</span>
                                </p>
                            )}
                            {formattedAssessment && !formattedInterview && (
                                <p className="font-bold text-text-primary">
                                    📝 Assessment Scheduled: <span className="text-accent font-semibold">{formattedAssessment}</span>
                                </p>
                            )}
                            {reminderNote && (
                                <p className="text-text-secondary text-[11px] mt-0.5">
                                    Recruiter note: <em>"{reminderNote}"</em>
                                </p>
                            )}
                        </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold text-[10px] border border-accent/20 shrink-0">
                        Upcoming Event
                    </span>
                </div>
            )}

            {/* Stepper Timeline */}
            <div className="p-4 bg-surface rounded-2xl border border-surface-border">
                <div className="grid grid-cols-5 gap-2 relative">
                    {/* Connecting Bar Background */}
                    <div className="absolute top-4 left-6 right-6 h-0.5 bg-surface-border -z-0" />
                    
                    {/* Filled Progress Bar */}
                    <div 
                        className={`absolute top-4 left-6 h-0.5 -z-0 transition-all duration-500 ${
                            isRejected ? 'bg-danger' : 'bg-accent'
                        }`}
                        style={{ 
                            width: `${(currentStageIndex / (steps.length - 1)) * 90}%` 
                        }}
                    />

                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const isCompleted = idx < currentStageIndex;
                        const isCurrent = idx === currentStageIndex;

                        let circleStyles = "bg-bg text-text-secondary/50 border-surface-border";
                        let textStyles = "text-text-secondary/70";

                        if (isCompleted) {
                            circleStyles = "bg-success text-white border-success shadow-warm-sm";
                            textStyles = "text-success font-bold";
                        } else if (isCurrent) {
                            if (isRejected && idx === 4) {
                                circleStyles = "bg-danger text-white border-danger shadow-warm-sm";
                                textStyles = "text-danger font-bold";
                            } else if (isSelected && idx === 4) {
                                circleStyles = "bg-success text-white border-success shadow-warm-sm animate-bounce";
                                textStyles = "text-success font-bold";
                            } else {
                                circleStyles = "bg-accent text-white border-accent ring-4 ring-accent/15 shadow-warm-sm";
                                textStyles = "text-text-primary font-bold";
                            }
                        }

                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center text-center">
                                {/* Node Circle */}
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${circleStyles}`}>
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                        <Icon className="w-3.5 h-3.5" />
                                    )}
                                </div>

                                {/* Step Label */}
                                <div className="mt-2">
                                    <p className={`text-xs ${textStyles} truncate`}>
                                        {step.label}
                                    </p>
                                    {!compact && (
                                        <p className="text-[10px] text-text-secondary/60 hidden sm:block mt-0.5 leading-tight">
                                            {step.sublabel}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Timestamp */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-surface-border text-[11px] text-text-secondary/70">
                    <span>
                        Latest status: <strong className="text-text-primary capitalize">{status.replace('_', ' ')}</strong>
                    </span>
                    <span>
                        Last updated: {updatedAt ? new Date(updatedAt).toLocaleDateString() : 'Recently'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ApplicationJourneyStepper;
