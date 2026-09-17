import React, { useState } from 'react';
import { 
    CheckCircle2, 
    XCircle, 
    ChevronDown, 
    ChevronUp, 
    Sparkles, 
    GraduationCap, 
    Clock, 
    Target, 
    Sprout, 
    ArrowRight,
    HelpCircle
} from 'lucide-react';
import MatchBadge from './MatchBadge';
import { Link } from 'react-router-dom';

const MatchBreakdown = ({ matchResult, candidateName = "You", compact = false, jobId = null }) => {
    const [isExpanded, setIsExpanded] = useState(!compact);

    if (!matchResult) return null;

    const {
        score,
        matchLevel,
        matchedSkills = [],
        missingSkills = [],
        skillsCount = 0,
        skillsMatchedCount = 0,
        skillsRatioLabel,
        expStatus,
        eduStatus,
        isFirstJobMode,
        modeExplanation,
        details = {},
        hasSufficientData,
        message
    } = matchResult;

    if (!hasSufficientData) {
        return (
            <div className="bg-muted/40 border border-surface-border rounded-2xl p-5 text-sm text-text-primary shadow-warm-sm">
                <div className="flex items-center gap-2 font-bold text-text-primary mb-1">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>AI Job Match Score</span>
                </div>
                <p className="text-text-secondary text-xs leading-relaxed">
                    {message || "Add your skills or resume to get a match score."}
                </p>
                <div className="mt-3">
                    <Link 
                        to="/profile" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-accent hover:bg-accent-hover text-white transition-colors shadow-warm-sm"
                    >
                        <span>Update Skills in Profile</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        );
    }

    const displaySkillsRatio = skillsRatioLabel || `${matchedSkills.length}/${skillsCount || (matchedSkills.length + missingSkills.length)} matched`;
    const displayExp = expStatus || (details.jobExp <= (details.candidateExp || 0) ? 'Meets requirement' : `${details.jobExp - (details.candidateExp || 0)} yrs gap`);
    const displayEdu = eduStatus || 'Meets requirement';

    return (
        <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-warm-sm transition-all">
            {/* Header bar */}
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between p-4 bg-bg border-b border-surface-border cursor-pointer hover:bg-muted/40 transition-colors"
            >
                <div className="flex flex-wrap items-center gap-3">
                    <MatchBadge 
                        score={score} 
                        matchLevel={matchLevel} 
                        size="md" 
                        hasSufficientData={true} 
                        isFirstJobMode={isFirstJobMode}
                    />
                    <span className="font-bold text-text-primary text-sm hidden sm:inline">
                        AI Match Transparency Breakdown
                    </span>
                </div>
                <button 
                    type="button" 
                    className="text-text-secondary hover:text-text-primary flex items-center gap-1 text-xs font-semibold"
                >
                    <span>{isExpanded ? 'Hide Factors' : 'View Factors'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {/* Expandable Breakdown Content */}
            {isExpanded && (
                <div className="p-5 space-y-5 bg-surface">
                    {/* First Job Mode Banner */}
                    {isFirstJobMode && (
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-success/10 border border-success/30 text-success text-xs">
                            <Sprout className="w-4 h-4 text-success shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-success">🌱 First Job Mode Active</p>
                                <p className="text-success/90 text-[11px] mt-0.5 leading-relaxed">
                                    {modeExplanation || "Scores are adjusted to prioritize hands-on projects, skills, and coursework rather than professional years of experience."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Key Transparency Factors (4 Core Pillars) */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
                            Calculation Breakdown Factors
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Factor 1: Skills */}
                            <div className="p-3.5 rounded-xl border border-surface-border bg-bg flex flex-col justify-between">
                                <div className="flex items-center justify-between gap-1 text-text-secondary text-xs font-medium mb-1">
                                    <span className="flex items-center gap-1">
                                        <Target className="w-3.5 h-3.5 text-accent" />
                                        <span>Skills Match</span>
                                    </span>
                                </div>
                                <div className="text-sm font-bold text-text-primary">
                                    {displaySkillsRatio}
                                </div>
                                <div className="text-[11px] text-text-secondary/80 mt-1">
                                    Weight: 50%
                                </div>
                            </div>

                            {/* Factor 2: Experience */}
                            <div className="p-3.5 rounded-xl border border-surface-border bg-bg flex flex-col justify-between">
                                <div className="flex items-center justify-between gap-1 text-text-secondary text-xs font-medium mb-1">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-text-secondary/60" />
                                        <span>Experience</span>
                                    </span>
                                </div>
                                <div className={`text-sm font-bold truncate ${displayExp.includes('Meets') || displayExp.includes('Credited') ? 'text-success' : 'text-warning'}`}>
                                    {displayExp}
                                </div>
                                <div className="text-[11px] text-text-secondary/80 mt-1">
                                    {isFirstJobMode ? 'Weight: 10% (Credited)' : 'Weight: 25%'}
                                </div>
                            </div>

                            {/* Factor 3: Education */}
                            <div className="p-3.5 rounded-xl border border-surface-border bg-bg flex flex-col justify-between">
                                <div className="flex items-center justify-between gap-1 text-text-secondary text-xs font-medium mb-1">
                                    <span className="flex items-center gap-1">
                                        <GraduationCap className="w-3.5 h-3.5 text-text-secondary/60" />
                                        <span>Education</span>
                                    </span>
                                </div>
                                <div className="text-sm font-bold text-text-primary truncate">
                                    {displayEdu}
                                </div>
                                <div className="text-[11px] text-text-secondary/80 mt-1">
                                    Weight: 10%
                                </div>
                            </div>

                            {/* Factor 4: Missing Skills */}
                            <div className="p-3.5 rounded-xl border border-surface-border bg-bg flex flex-col justify-between">
                                <div className="flex items-center justify-between gap-1 text-text-secondary text-xs font-medium mb-1">
                                    <span className="flex items-center gap-1">
                                        <HelpCircle className="w-3.5 h-3.5 text-warning" />
                                        <span>Missing Skills</span>
                                    </span>
                                </div>
                                <div className="text-sm font-bold text-text-primary truncate">
                                    {missingSkills.length === 0 ? (
                                        <span className="text-success font-bold">None (100% Fit)</span>
                                    ) : (
                                        <span className="text-warning font-bold">{missingSkills.slice(0, 2).join(', ')}{missingSkills.length > 2 ? ` +${missingSkills.length - 2}` : ''}</span>
                                    )}
                                </div>
                                <div className="text-[11px] text-text-secondary/80 mt-1">
                                    {missingSkills.length} remaining
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Matched vs Missing Detail Pill Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {/* Matched Skills */}
                        <div className="p-4 bg-success/10 border border-success/30 rounded-xl">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-success uppercase tracking-wide mb-2.5">
                                <CheckCircle2 className="w-4 h-4 text-success" />
                                <span>Matched Skills ({matchedSkills.length})</span>
                            </div>
                            {matchedSkills.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {matchedSkills.map((skill, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface text-success border border-success/30">
                                            ✓ {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-text-secondary italic">No exact skill matches detected yet.</p>
                            )}
                        </div>

                        {/* Missing Skills */}
                        <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-warning uppercase tracking-wide mb-2.5">
                                <XCircle className="w-4 h-4 text-warning" />
                                <span>Missing Skills ({missingSkills.length})</span>
                            </div>
                            {missingSkills.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {missingSkills.map((skill, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface text-warning border border-warning/30">
                                            • {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-success font-bold">You meet all listed skill requirements for this position!</p>
                            )}
                        </div>
                    </div>

                    {/* Skill Gap Analyzer CTA */}
                    {missingSkills.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-muted/60 border border-surface-border">
                            <div>
                                <p className="text-xs font-bold text-text-primary">Want to bridge this skill gap?</p>
                                <p className="text-[11px] text-text-secondary mt-0.5">
                                    Generate a personalized 4-stage learning roadmap tailored for this job.
                                </p>
                            </div>
                            <Link 
                                to={jobId ? `/skill-gap-analyzer?jobId=${jobId}` : `/skill-gap-analyzer`}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-xs transition-colors shadow-warm-sm shrink-0"
                            >
                                <span>Analyze Skill Gap & Roadmap</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MatchBreakdown;
