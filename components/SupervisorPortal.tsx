
import React, { useState, useMemo } from 'react';
import { User, LogEntry, Task, TaskStatus, LogStatus, TaskPriority, Report, Goal, Resource, GoalStatus, Evaluation, EvaluationType, FeedbackType, TaskFeedback, Message, Meeting, Role, Skill, SkillAssessment, Notification, NotificationType, Badge, UserBadge, LeaveRequest, LeaveStatus, SiteVisit, AttendanceException } from '../types';
import { Button, Card, StatusBadge, ScoreBar, PriorityBadge, FeedbackBadge } from './UI';
import { TaskBoard } from './TaskBoard';
import { AttendanceCalendar } from './AttendanceCalendar';
import { SkillTracker } from './SkillTracker';
import { createPortal } from 'react-dom';
import { Users, Send, Wand2, X, Check, Clock, ChevronDown, ChevronUp, UserPlus, Settings, Layout, AlertCircle, Briefcase, FileText, Target, Paperclip, Plus, ThumbsUp, TrendingUp, MessageSquare, Calendar as CalendarIcon, Video, Award, Megaphone, Medal, CheckCircle2, LayoutDashboard, AlertTriangle, Printer, MessageSquarePlus, PieChart, CalendarOff, CalendarCheck, MapPin, Pencil, Trash2, Heart, Trophy, Rocket } from 'lucide-react';
import { generateTaskDescription } from '../services/geminiService';

interface SupervisorPortalProps {
  user: User;
  users: User[];
  logs: LogEntry[];
  tasks: Task[];
  reports: Report[];
  goals: Goal[];
  resources: Resource[];
  evaluations: Evaluation[];
  messages: Message[];
  meetings: Meeting[];
  skills: Skill[];
  skillAssessments: SkillAssessment[];
  badges: Badge[];
  userBadges: UserBadge[];
  leaveRequests: LeaveRequest[];
  siteVisits: SiteVisit[];
  attendanceExceptions: AttendanceException[];
  onApproveLog: (logId: string, approved: boolean, comment?: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'status' | 'createdAt'>) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onAddIntern: (user: Omit<User, 'id' | 'role' | 'avatar'>) => void;
  onUpdateIntern: (user: User) => void;
  onAddGoal: (goal: Omit<Goal, 'id' | 'progress' | 'status'>) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  onAddResource: (resource: Omit<Resource, 'id' | 'uploadDate' | 'uploadedBy'>) => void;
  onGiveFeedback: (taskId: string, feedback: TaskFeedback) => void;
  onAddEvaluation: (evaluation: Omit<Evaluation, 'id'>) => void;
  onSendMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  onScheduleMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  onAddSkillAssessment: (assessment: Omit<SkillAssessment, 'id'>) => void;
  onAddSkill: (skill: Omit<Skill, 'id'>) => void;
  onSendNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  onUpdateLeaveStatus: (requestId: string, status: LeaveStatus) => void;
  onAddSiteVisit: (visit: Omit<SiteVisit, 'id'>) => void;
  onUpdateSiteVisit: (visit: SiteVisit) => void;
  onDeleteSiteVisit: (visitId: string) => void;
  onAddAttendanceException: (exception: Omit<AttendanceException, 'id'>) => void;
  onDeleteAttendanceException: (id: string) => void;
}

const LogReviewCard: React.FC<{
    log: LogEntry;
    student?: User;
    showAvatar: boolean;
    onApproveLog: (id: string, approved: boolean, comment?: string) => void;
  }> = ({ log, student, showAvatar, onApproveLog }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [rejectComment, setRejectComment] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
  
    const statusColors = {
      [LogStatus.PENDING]: 'border-l-amber-400',
      [LogStatus.APPROVED]: 'border-l-emerald-400',
      [LogStatus.REJECTED]: 'border-l-rose-400',
    };

    const handleReject = () => {
        if (!rejectComment) return;
        onApproveLog(log.id, false, rejectComment);
        setIsRejecting(false);
        setRejectComment('');
    };
  
    return (
      <Card className={`p-5 border-l-4 ${statusColors[log.status]} transition-all duration-200 hover:shadow-md group`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            {showAvatar && (
              <img src={student?.avatar} className="w-9 h-9 rounded-full object-cover border border-slate-200" alt="" />
            )}
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                {student?.name} <span className="text-slate-400 font-normal">on {new Date(log.date).toLocaleDateString()}</span>
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-600 flex items-center gap-1">
                    <Clock size={10} /> {log.hoursWorked}h
                </span>
              </div>
            </div>
          </div>
          <StatusBadge status={log.status} />
        </div>
  
        <div className="bg-slate-50 p-4 rounded-lg text-slate-700 text-sm mb-3 relative">
            <div 
                className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[800px]' : 'max-h-16'}`}
            >
                <p className={isExpanded ? '' : 'line-clamp-2'}>
                    {log.activityDescription}
                </p>

                {log.supervisorComment && (
                    <div className={`mt-4 pt-4 border-t border-slate-200 transition-opacity duration-500 delay-100 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="p-3 bg-indigo-50 text-indigo-800 rounded-lg border border-indigo-100">
                            <span className="font-bold block text-xs uppercase tracking-wider mb-1 text-indigo-500">Supervisor Feedback</span>
                            {log.supervisorComment}
                        </div>
                    </div>
                )}
            </div>
            
            {!isExpanded && (
                <div 
                    className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 to-transparent rounded-b-lg pointer-events-none"
                />
            )}
        </div>
  
        {log.challenges && (
          <div className="mb-3 text-sm text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100">
            <span className="font-bold block text-xs uppercase tracking-wider mb-1 text-rose-400">Blockers / Challenges</span>
            {log.challenges}
          </div>
        )}

        <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
            >
                {isExpanded ? (
                    <>Show Less <ChevronUp size={14} /></>
                ) : (
                    <>View Details <ChevronDown size={14} /></>
                )}
            </button>

            {log.status === LogStatus.PENDING && !isRejecting && (
                <div className="flex gap-2">
                    <Button variant="danger" className="text-xs px-3 h-8" onClick={() => setIsRejecting(true)}>
                        <X size={14}/> Reject
                    </Button>
                    <Button variant="primary" className="text-xs px-3 h-8 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 border-none" onClick={() => onApproveLog(log.id, true, "Great work!")}>
                        <Check size={14}/> Approve
                    </Button>
                </div>
            )}
        </div>

        {isRejecting && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                <textarea
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="w-full text-sm p-2 border border-slate-300 rounded mb-2"
                />
                <div className="flex gap-2 justify-end">
                    <Button variant="secondary" className="text-xs px-3 py-1" onClick={() => setIsRejecting(false)}>Cancel</Button>
                    <Button variant="danger" className="text-xs px-3 py-1" onClick={handleReject}>Confirm Reject</Button>
                </div>
            </div>
        )}
      </Card>
    );
  };

const ReportPreview: React.FC<{
    student: User;
    supervisor: User;
    logs: LogEntry[];
    tasks: Task[];
    reports: Report[];
    evaluations: Evaluation[];
    skills: Skill[];
    assessments: SkillAssessment[];
    goals: Goal[];
    onClose: () => void;
}> = ({ student, supervisor, logs, tasks, reports, evaluations, skills, assessments, goals, onClose }) => {
    
    // Calculate Stats for Report
    const totalHours = logs.filter(l => l.status === LogStatus.APPROVED).reduce((acc, l) => acc + l.hoursWorked, 0);
    const completionRate = Math.min(100, Math.round((totalHours / (student.totalHoursRequired || 1)) * 100));
    
    // Attendance Rate (Simplified: Present Days / Total Logged Weekdays)
    const uniqueLogDates = new Set(logs.map(l => l.date));
    const attendanceRate = Math.min(100, Math.round((uniqueLogDates.size / 20) * 100)); // Assuming 20 working days/month roughly for demo

    // Challenges aggregation
    const challenges = logs.filter(l => l.challenges).map(l => l.challenges);

    const renderReportContent = () => (
        <div className="bg-white p-12 max-w-[210mm] mx-auto min-h-[297mm] shadow-2xl print:shadow-none print:w-full print:max-w-none text-slate-800">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-8 mb-8">
                <div>
                    <img src="https://i.postimg.cc/xdsSw8X5/DEEP_SHIFT_LOGOOO.png" alt="Logo" className="h-16 mb-4" />
                    <h1 className="text-3xl font-bold uppercase tracking-tight">Internship Progress Report</h1>
                    <p className="text-slate-500 mt-2">Generated on {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-slate-800">DEEP SHIFT SYSTEM</h2>
                    <p className="text-sm text-slate-500">Official Internship Record</p>
                </div>
            </div>

            {/* Intern Details */}
            <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-200 pb-2">Intern Details</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase">Full Name</span>
                        <span className="text-lg font-bold text-slate-800">{student.name}</span>
                    </div>
                     <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase">Institute / University</span>
                        <span className="text-lg font-bold text-slate-800">{student.institution || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase">Department</span>
                        <span className="text-lg text-slate-800">{student.department || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase">Supervisor</span>
                        <span className="text-lg text-slate-800">{supervisor.name}</span>
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase">Email</span>
                        <span className="text-lg text-slate-800">{student.email}</span>
                    </div>
                </div>
            </div>

            {/* Executive Summary */}
            <div className="mb-8">
                <h3 className="text-lg font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-200 pb-2">Executive Summary</h3>
                <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 border border-slate-200 rounded-lg text-center">
                        <div className="text-3xl font-bold text-indigo-600">{totalHours}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Hours Logged</div>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-lg text-center">
                        <div className="text-3xl font-bold text-emerald-600">{completionRate}%</div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Completion</div>
                    </div>
                     <div className="p-4 border border-slate-200 rounded-lg text-center">
                        <div className="text-3xl font-bold text-blue-600">{tasks.filter(t => t.status === TaskStatus.COMPLETED).length}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Tasks Done</div>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-lg text-center">
                        <div className="text-3xl font-bold text-amber-600">{attendanceRate}%</div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Attendance Rate</div>
                    </div>
                </div>
            </div>

            {/* Goal Tracking */}
            <div className="mb-8 break-inside-avoid">
                 <h3 className="text-lg font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-200 pb-2">Learning Goal Progress</h3>
                 <div className="space-y-3">
                     {goals.map(goal => (
                         <div key={goal.id} className="flex items-center gap-4">
                             <div className="flex-1">
                                 <div className="text-sm font-bold text-slate-700">{goal.description}</div>
                                 <div className="text-xs text-slate-500">{goal.category}</div>
                             </div>
                             <div className="w-32">
                                 <div className="text-right text-xs font-bold mb-1">{goal.progress}%</div>
                                 <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                     <div className="h-full bg-indigo-600" style={{width: `${goal.progress}%`}}></div>
                                 </div>
                             </div>
                         </div>
                     ))}
                     {goals.length === 0 && <div className="text-sm text-slate-400 italic">No learning goals recorded.</div>}
                 </div>
            </div>

            {/* Skill Gap Analysis */}
            <div className="mb-8 break-inside-avoid">
                <h3 className="text-lg font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-200 pb-2">Competency Assessment</h3>
                <div className="space-y-4">
                    {skills.map(skill => {
                         const studentScore = assessments.filter(a => a.studentId === student.id && a.role === 'STUDENT').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.ratings.find(r => r.skillId === skill.id)?.score || 0;
                         const supervisorScore = assessments.filter(a => a.studentId === student.id && a.role === 'SUPERVISOR').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.ratings.find(r => r.skillId === skill.id)?.score || 0;

                         return (
                             <div key={skill.id} className="flex items-center gap-4 text-sm">
                                 <div className="w-1/3 font-bold text-slate-700">{skill.name}</div>
                                 <div className="flex-1 flex gap-2 items-center">
                                     <div className="flex-1 bg-slate-100 rounded-full h-2 relative">
                                         {/* Student Marker */}
                                         <div className="absolute top-0 bottom-0 bg-indigo-400 rounded-full opacity-50" style={{width: `${(studentScore/5)*100}%`}}></div>
                                         {/* Supervisor Marker */}
                                         <div className="absolute top-0 bottom-0 bg-emerald-500 h-1 top-0.5 rounded-full" style={{width: `${(supervisorScore/5)*100}%`}}></div>
                                     </div>
                                     <span className="text-xs font-bold text-emerald-600 w-8 text-right">{supervisorScore}/5</span>
                                 </div>
                             </div>
                         );
                    })}
                </div>
            </div>

            {/* Challenges & Blockers */}
            <div className="mb-8 break-inside-avoid">
                <h3 className="text-lg font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-200 pb-2">Challenges & Blockers Identified</h3>
                <ul className="list-disc list-inside space-y-1">
                    {challenges.length > 0 ? (
                        challenges.map((c, i) => (
                            <li key={i} className="text-sm text-slate-700">{c}</li>
                        ))
                    ) : (
                        <li className="text-sm text-slate-400 italic">No major challenges reported.</li>
                    )}
                </ul>
            </div>

            {/* Recent Activity Logs */}
            <div className="mb-8 break-inside-avoid">
                <h3 className="text-lg font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-200 pb-2">Recent Activity Log</h3>
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                        <tr>
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2">Activity</th>
                            <th className="px-4 py-2 text-right">Hours</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.slice(0, 10).map(log => (
                            <tr key={log.id}>
                                <td className="px-4 py-2 font-mono text-slate-500">{new Date(log.date).toLocaleDateString()}</td>
                                <td className="px-4 py-2 text-slate-700">{log.activityDescription}</td>
                                <td className="px-4 py-2 text-right font-bold">{log.hoursWorked}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Evaluation History */}
            <div className="mb-12 break-inside-avoid">
                <h3 className="text-lg font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-200 pb-2">Formal Evaluations</h3>
                {evaluations.map(e => (
                    <div key={e.id} className="mb-4 bg-slate-50 p-4 rounded border border-slate-200">
                        <div className="flex justify-between mb-2">
                             <span className="font-bold text-slate-800">{e.type.replace('_', ' ')}</span>
                             <span className="text-sm text-slate-500">{new Date(e.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-700 italic">"{e.overallFeedback}"</p>
                    </div>
                ))}
            </div>

            {/* Signature Block */}
            <div className="grid grid-cols-2 gap-16 mt-16 break-inside-avoid">
                <div className="border-t border-slate-800 pt-2">
                    <p className="font-bold text-slate-800">{supervisor.name}</p>
                    <p className="text-xs text-slate-500 uppercase">Supervisor Signature</p>
                </div>
                 <div className="border-t border-slate-800 pt-2">
                    <p className="font-bold text-slate-800">Date</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-xl flex flex-col shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <Printer className="text-indigo-600" /> Report Preview
                    </h2>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={onClose}>Close</Button>
                        <Button onClick={() => window.print()}>Print / Save PDF</Button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-slate-100 p-8 custom-scrollbar">
                    {renderReportContent()}
                </div>
            </div>
            {/* Render Print-Only Version via Portal */}
            {createPortal(
                 <div id="printable-report-container">
                    {renderReportContent()}
                 </div>,
                 document.body
            )}
        </div>
    );
};

export const SupervisorPortal: React.FC<SupervisorPortalProps> = ({ 
    user, users, logs, tasks, reports, goals, resources, evaluations, messages, meetings, skills, skillAssessments, badges, userBadges, leaveRequests, siteVisits, attendanceExceptions,
    onApproveLog, onAddTask, onUpdateTaskStatus, onAddIntern, onUpdateIntern, onAddGoal, onUpdateGoal, onDeleteGoal, onAddResource, onGiveFeedback, onAddEvaluation, onSendMessage, onScheduleMeeting, onAddSkillAssessment, onAddSkill, onSendNotification, onUpdateLeaveStatus, onAddSiteVisit, onUpdateSiteVisit, onDeleteSiteVisit, onAddAttendanceException, onDeleteAttendanceException
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'management' | 'resources' | 'communication' | 'meetings' | 'reports'>('dashboard');
  
  const [studentSubTab, setStudentSubTab] = useState<'OVERVIEW' | 'TASKS' | 'REPORTS' | 'PLAN' | 'EVALUATIONS' | 'SKILLS' | 'LOGS' | 'SITE_VISITS' | 'ATTENDANCE'>('OVERVIEW');

  const [isInternModalOpen, setIsInternModalOpen] = useState(false);
  const [internForm, setInternForm] = useState({ name: '', email: '', totalHoursRequired: 120 });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: TaskPriority.MEDIUM, dueDate: '' });
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [newResource, setNewResource] = useState({ title: '', type: 'PDF' as 'PDF' | 'DOC' | 'LINK', url: '#' });

  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [evalType, setEvalType] = useState<EvaluationType>(EvaluationType.MID_TERM);
  const [evalScores, setEvalScores] = useState({ quality: 3, comms: 3, init: 3, punct: 3 });
  const [evalComment, setEvalComment] = useState('');

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackTask, setFeedbackTask] = useState<Task | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({ type: FeedbackType.PRAISE, comment: '' });

  const [activeChatStudentId, setActiveChatStudentId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ title: '', date: '', time: '', link: '', attendees: [] as string[] });

  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', recipientId: 'ALL' });

  // Site Visit State
  const [isSiteVisitModalOpen, setIsSiteVisitModalOpen] = useState(false);
  const [siteVisitForm, setSiteVisitForm] = useState({ date: '', location: '', purpose: '', notes: '' });
  const [editingSiteVisit, setEditingSiteVisit] = useState<SiteVisit | null>(null);

  // Goal Modal State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({ description: '', category: '', alignment: '' });
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Report Modal State
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);

  // Attendance Exception Modal
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState('');
  const [attendanceForm, setAttendanceForm] = useState({ reason: '', type: 'EXCUSED' as 'EXCUSED' | 'HOLIDAY' });

  const supervisedStudents = useMemo(() => users.filter(u => u.assignedSupervisorId === user.id), [users, user.id]);
  const selectedStudent = useMemo(() => users.find(u => u.id === selectedStudentId), [users, selectedStudentId]);
  
  const filteredLogs = useMemo(() => {
    let result = [];
    if (selectedStudentId) {
      result = logs.filter(l => l.studentId === selectedStudentId);
    } else {
      result = logs.filter(l => l.status === LogStatus.PENDING && supervisedStudents.some(s => s.id === l.studentId));
    }
    return result.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, selectedStudentId, supervisedStudents]);
  
  const studentTasks = useMemo(() => {
    return selectedStudentId ? tasks.filter(t => t.assignedToId === selectedStudentId) : [];
  }, [tasks, selectedStudentId]);
  
  const studentReports = useMemo(() => {
    return selectedStudentId ? reports.filter(r => r.studentId === selectedStudentId) : [];
  }, [reports, selectedStudentId]);

  const studentGoals = useMemo(() => {
    return selectedStudentId ? goals.filter(g => g.studentId === selectedStudentId) : [];
  }, [goals, selectedStudentId]);

  const studentEvaluations = useMemo(() => {
      return selectedStudentId ? evaluations.filter(e => e.studentId === selectedStudentId) : [];
  }, [evaluations, selectedStudentId]);

  const studentSiteVisits = useMemo(() => {
      return selectedStudentId ? siteVisits.filter(sv => sv.studentId === selectedStudentId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
  }, [siteVisits, selectedStudentId]);

  const dashboardAlerts = useMemo(() => {
    const overdueCount = tasks.filter(t => t.status === TaskStatus.OVERDUE && supervisedStudents.some(s => s.id === t.assignedToId)).length;
    const missingReports = supervisedStudents.filter(s => {
        const studentReports = reports.filter(r => r.studentId === s.id);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const lastReport = studentReports.sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];
        return !lastReport || new Date(lastReport.submittedAt) < oneWeekAgo;
    }).length;

    const pendingLeaves = leaveRequests.filter(lr => lr.status === LeaveStatus.PENDING && supervisedStudents.some(s => s.id === lr.studentId)).length;
    
    // Tasks completed but not given feedback
    const feedbackNeeded = tasks.filter(t => 
        t.status === TaskStatus.COMPLETED && 
        !t.feedback && 
        supervisedStudents.some(s => s.id === t.assignedToId)
    ).length;

    return { overdueCount, missingReports, pendingLeaves, feedbackNeeded };
  }, [tasks, reports, supervisedStudents, leaveRequests]);

  // Meeting Logic - Conflict Detection
  const meetingConflicts = useMemo(() => {
      if (!meetingForm.date || !meetingForm.time || meetingForm.attendees.length === 0) return [];
      
      const newMeetingStart = new Date(`${meetingForm.date}T${meetingForm.time}`).getTime();
      const newMeetingEnd = newMeetingStart + (60 * 60 * 1000); // Assume 1 hour

      const conflicts: string[] = [];

      meetings.forEach(m => {
          const mStart = new Date(`${m.date}T${m.time}`).getTime();
          const mEnd = mStart + (60 * 60 * 1000);

          // Check time overlap
          if (newMeetingStart < mEnd && newMeetingEnd > mStart) {
              // Check attendees
              const commonAttendees = m.attendees.filter(id => meetingForm.attendees.includes(id));
              if (commonAttendees.length > 0) {
                  commonAttendees.forEach(id => {
                      const name = users.find(u => u.id === id)?.name;
                      if (name && !conflicts.includes(name)) conflicts.push(name);
                  });
              }
          }
      });
      return conflicts;
  }, [meetingForm, meetings, users]);


  const handleAddTaskSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedStudentId) {
          onAddTask({
              ...newTask,
              assignedToId: selectedStudentId,
              assignedById: user.id
          });
          setIsTaskModalOpen(false);
          setNewTask({ title: '', description: '', priority: TaskPriority.MEDIUM, dueDate: '' });
      }
  };

  const handleGenerateAiTask = async () => {
      if (!newTask.title) return;
      setIsAiLoading(true);
      const result = await generateTaskDescription(newTask.title);
      setNewTask(prev => ({ ...prev, description: result.description, priority: result.priority }));
      setIsAiLoading(false);
  };

  const handleAddInternSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onAddIntern({
          ...internForm,
          assignedSupervisorId: user.id
      });
      setIsInternModalOpen(false);
      setInternForm({ name: '', email: '', totalHoursRequired: 120 });
  };

  const handleAddResourceSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onAddResource(newResource);
      setIsResourceModalOpen(false);
      setNewResource({ title: '', type: 'PDF', url: '#' });
  };

  const handleGiveFeedback = (task: Task) => {
      setFeedbackTask(task);
      setFeedbackForm({ type: FeedbackType.PRAISE, comment: '' });
      setIsFeedbackModalOpen(true);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
      e.preventDefault();
      if (feedbackTask) {
          onGiveFeedback(feedbackTask.id, {
              type: feedbackForm.type,
              comment: feedbackForm.comment,
              givenAt: new Date().toISOString()
          });
      }
      setIsFeedbackModalOpen(false);
  };

  const handleSubmitEvaluation = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedStudentId) {
          onAddEvaluation({
              studentId: selectedStudentId,
              supervisorId: user.id,
              type: evalType,
              date: new Date().toISOString(),
              scores: [
                  { category: 'Quality of Work', score: evalScores.quality },
                  { category: 'Communication', score: evalScores.comms },
                  { category: 'Initiative', score: evalScores.init },
                  { category: 'Punctuality', score: evalScores.punct },
              ],
              overallFeedback: evalComment
          });
      }
      setIsEvaluationModalOpen(false);
      setEvalComment('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim() || !activeChatStudentId) return;
      onSendMessage({
          senderId: user.id,
          content: chatInput,
          channel: 'DIRECT',
          relatedStudentId: activeChatStudentId
      });
      setChatInput('');
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSendNotification({
          senderId: user.id,
          recipientId: announcementForm.recipientId,
          title: announcementForm.title,
          message: announcementForm.message,
          type: NotificationType.ANNOUNCEMENT
      });
      setIsAnnouncementModalOpen(false);
      setAnnouncementForm({ title: '', message: '', recipientId: 'ALL' });
  };

  const handleMeetingSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onScheduleMeeting({
          ...meetingForm,
          organizerId: user.id
      });
      setIsMeetingModalOpen(false);
      setMeetingForm({ title: '', date: '', time: '', link: '', attendees: [] });
  };

  const handleSiteVisitSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedStudentId) {
          if (editingSiteVisit) {
              onUpdateSiteVisit({
                  ...editingSiteVisit,
                  ...siteVisitForm
              });
          } else {
              onAddSiteVisit({
                  studentId: selectedStudentId,
                  visitorId: user.id,
                  ...siteVisitForm
              });
          }
          setIsSiteVisitModalOpen(false);
          setSiteVisitForm({ date: '', location: '', purpose: '', notes: '' });
          setEditingSiteVisit(null);
      }
  };

  const handleOpenSiteVisitModal = (visit?: SiteVisit) => {
      if (visit) {
          setEditingSiteVisit(visit);
          setSiteVisitForm({
              date: visit.date,
              location: visit.location,
              purpose: visit.purpose,
              notes: visit.notes
          });
      } else {
          setEditingSiteVisit(null);
          setSiteVisitForm({ date: '', location: '', purpose: '', notes: '' });
      }
      setIsSiteVisitModalOpen(true);
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedStudentId) {
          if (editingGoal) {
              onUpdateGoal({
                  ...editingGoal,
                  description: goalForm.description,
                  category: goalForm.category,
                  alignment: goalForm.alignment
              });
          } else {
              onAddGoal({
                  studentId: selectedStudentId,
                  description: goalForm.description,
                  category: goalForm.category,
                  alignment: goalForm.alignment
              });
          }
          setIsGoalModalOpen(false);
          setGoalForm({ description: '', category: '', alignment: '' });
          setEditingGoal(null);
      }
  };

  const handleOpenGoalModal = (goal?: Goal) => {
      if (goal) {
          setEditingGoal(goal);
          setGoalForm({
              description: goal.description,
              category: goal.category,
              alignment: goal.alignment
          });
      } else {
          setEditingGoal(null);
          setGoalForm({ description: '', category: '', alignment: '' });
      }
      setIsGoalModalOpen(true);
  };

  const handleAttendanceDateClick = (dateStr: string) => {
      setSelectedAttendanceDate(dateStr);
      // Check if exception exists
      const existing = attendanceExceptions.find(e => (e.studentId === selectedStudentId || e.studentId === 'ALL') && e.date === dateStr);
      if (existing) {
          setAttendanceForm({ reason: existing.reason, type: existing.type });
      } else {
          setAttendanceForm({ reason: '', type: 'EXCUSED' });
      }
      setIsAttendanceModalOpen(true);
  };

  const handleAttendanceSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedStudentId && selectedAttendanceDate) {
           onAddAttendanceException({
               studentId: selectedStudentId,
               date: selectedAttendanceDate,
               reason: attendanceForm.reason,
               type: attendanceForm.type
           });
           setIsAttendanceModalOpen(false);
      }
  };
  
  const handleDeleteException = () => {
      if (selectedStudentId && selectedAttendanceDate) {
          const existing = attendanceExceptions.find(e => (e.studentId === selectedStudentId || e.studentId === 'ALL') && e.date === selectedAttendanceDate);
          if (existing) {
              onDeleteAttendanceException(existing.id);
          }
          setIsAttendanceModalOpen(false);
      }
  };

  const renderContent = () => {
    switch (viewMode) {
        case 'dashboard':
        default:
            if (selectedStudentId && selectedStudent) {
                // Detail View for Student - Now handled within Dashboard mode
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 mb-4">
                            <button onClick={() => setSelectedStudentId(null)} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium">
                                <ChevronDown className="rotate-90" size={16} /> Back to Overview
                            </button>
                            <span className="text-slate-300">|</span>
                            <span className="font-bold text-slate-800">{selectedStudent.name}</span>
                        </div>
                        
                        {/* Student Sub-Nav */}
                        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
                             {['OVERVIEW', 'ATTENDANCE', 'TASKS', 'REPORTS', 'PLAN', 'LOGS', 'EVALUATIONS', 'SKILLS', 'SITE_VISITS'].map(tab => (
                                 <button
                                    key={tab}
                                    onClick={() => setStudentSubTab(tab as any)}
                                    className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors whitespace-nowrap ${studentSubTab === tab ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                                 >
                                     {tab.replace('_', ' ')}
                                 </button>
                             ))}
                        </div>

                        {/* Student Sub-Content */}
                        <div className="min-h-[500px]">
                            {studentSubTab === 'OVERVIEW' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-1 space-y-6">
                                        <Card className="p-6 text-center">
                                            <img src={selectedStudent.avatar} alt="" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-50 shadow-sm" />
                                            <h3 className="font-bold text-lg text-slate-900">{selectedStudent.name}</h3>
                                            <p className="text-sm text-slate-500">{selectedStudent.email}</p>
                                            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-left">
                                                <div>
                                                    <span className="block text-xs text-slate-400 uppercase">Institution</span>
                                                    <span className="text-sm font-medium text-slate-700">{selectedStudent.institution || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs text-slate-400 uppercase">Dept</span>
                                                    <span className="text-sm font-medium text-slate-700">{selectedStudent.department || '-'}</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="block text-xs text-slate-400 uppercase">Bio</span>
                                                    <p className="text-sm text-slate-600 italic mt-1">{selectedStudent.bio || 'No bio.'}</p>
                                                </div>
                                            </div>
                                        </Card>
                                        
                                        <Card className="p-6">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1">
                                                <Heart size={12} className="text-rose-500" /> Hobbies & Interests
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedStudent.hobbies && selectedStudent.hobbies.length > 0 ? (
                                                    selectedStudent.hobbies.map((h, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-xs">{h}</span>
                                                    ))
                                                ) : <span className="text-xs text-slate-400 italic">None listed</span>}
                                            </div>
                                        </Card>
                                        
                                        <Card className="p-6">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1">
                                                <Trophy size={12} className="text-amber-500" /> Achievements & Goals
                                            </h4>
                                            {selectedStudent.achievements && selectedStudent.achievements.length > 0 && (
                                                <div className="mb-3">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Achievements</span>
                                                    <ul className="text-xs list-disc list-inside text-slate-600">
                                                        {selectedStudent.achievements.slice(0, 3).map((a, i) => <li key={i} className="truncate">{a}</li>)}
                                                    </ul>
                                                </div>
                                            )}
                                             {selectedStudent.futureGoals && selectedStudent.futureGoals.length > 0 && (
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Aspirations</span>
                                                    <ul className="text-xs list-disc list-inside text-slate-600">
                                                        {selectedStudent.futureGoals.slice(0, 3).map((g, i) => <li key={i} className="truncate">{g}</li>)}
                                                    </ul>
                                                </div>
                                            )}
                                        </Card>
                                    </div>
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Card className="p-4 bg-emerald-50 border-emerald-100">
                                                <div className="text-emerald-600 text-xs font-bold uppercase mb-1">Total Hours</div>
                                                <div className="text-2xl font-bold text-emerald-800">
                                                    {logs.filter(l => l.studentId === selectedStudent.id && l.status === LogStatus.APPROVED).reduce((a,b) => a + b.hoursWorked, 0)}
                                                    <span className="text-sm font-normal text-emerald-600 ml-1">/ {selectedStudent.totalHoursRequired}</span>
                                                </div>
                                            </Card>
                                            <Card className="p-4 bg-indigo-50 border-indigo-100">
                                                <div className="text-indigo-600 text-xs font-bold uppercase mb-1">Tasks Completed</div>
                                                <div className="text-2xl font-bold text-indigo-800">
                                                    {studentTasks.filter(t => t.status === TaskStatus.COMPLETED).length}
                                                </div>
                                            </Card>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 mb-3">Recent Activity Logs</h4>
                                            <div className="space-y-3">
                                                {filteredLogs.slice(0, 3).map(log => (
                                                    <LogReviewCard key={log.id} log={log} student={selectedStudent} showAvatar={false} onApproveLog={onApproveLog} />
                                                ))}
                                                {filteredLogs.length === 0 && <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">No pending logs.</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {studentSubTab === 'ATTENDANCE' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">Attendance Monitoring</h2>
                                        <p className="text-slate-500 text-sm">Review daily attendance. Click a date to mark as Excused.</p>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="lg:col-span-1">
                                            <AttendanceCalendar 
                                                studentId={selectedStudent.id} 
                                                logs={logs} 
                                                exceptions={attendanceExceptions}
                                                onDateClick={handleAttendanceDateClick}
                                                interactive={true}
                                            />
                                        </div>
                                        <div className="lg:col-span-1">
                                            <Card className="p-0 overflow-hidden h-full flex flex-col">
                                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                                    <h3 className="font-bold text-slate-800">Daily Log History</h3>
                                                </div>
                                                <div className="flex-1 overflow-y-auto max-h-[400px]">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
                                                            <tr>
                                                                <th className="px-4 py-3 font-medium">Date</th>
                                                                <th className="px-4 py-3 font-medium">Hours</th>
                                                                <th className="px-4 py-3 font-medium text-right">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-50">
                                                            {logs.filter(l => l.studentId === selectedStudent.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).length === 0 ? (
                                                                <tr>
                                                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">No attendance records found.</td>
                                                                </tr>
                                                            ) : (
                                                                logs.filter(l => l.studentId === selectedStudent.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                                                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                                                        <td className="px-4 py-3 font-bold text-slate-700">{new Date(log.date).toLocaleDateString()}</td>
                                                                        <td className="px-4 py-3">
                                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                                                <Clock size={12} /> {log.hoursWorked}h
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-3 text-right">
                                                                            <StatusBadge status={log.status} />
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {studentSubTab === 'TASKS' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <h3 className="font-bold text-slate-800">Assigned Tasks</h3>
                                        <Button onClick={() => setIsTaskModalOpen(true)}>
                                            <Plus size={16} /> Assign Task
                                        </Button>
                                    </div>
                                    <TaskBoard 
                                        tasks={studentTasks} 
                                        onGiveFeedback={handleGiveFeedback}
                                    />
                                </div>
                            )}

                            {studentSubTab === 'SKILLS' && (
                                <SkillTracker 
                                    student={selectedStudent} 
                                    viewerRole={Role.SUPERVISOR} 
                                    skills={skills} 
                                    assessments={skillAssessments} 
                                    onAddAssessment={onAddSkillAssessment}
                                    onAddSkill={onAddSkill}
                                />
                            )}
                            
                            {studentSubTab === 'LOGS' && (
                                 <div className="space-y-4">
                                     <h3 className="font-bold text-slate-800">Activity Log History</h3>
                                     {logs.filter(l => l.studentId === selectedStudent.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                                         <LogReviewCard key={log.id} log={log} student={selectedStudent} showAvatar={false} onApproveLog={onApproveLog} />
                                     ))}
                                 </div>
                            )}

                            {studentSubTab === 'REPORTS' && (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-slate-800">Submitted Reports</h3>
                                    {studentReports.length === 0 ? <p className="text-slate-500">No reports found.</p> : 
                                        studentReports.slice().reverse().map(r => (
                                            <Card key={r.id} className="p-5">
                                                <div className="flex justify-between mb-2">
                                                    <span className="font-bold text-indigo-700 uppercase text-xs tracking-wide bg-indigo-50 px-2 py-1 rounded">{r.type}</span>
                                                    <span className="text-xs text-slate-400">{new Date(r.submittedAt).toLocaleDateString()}</span>
                                                </div>
                                                <h4 className="font-bold text-slate-800 mb-2">Summary</h4>
                                                <p className="text-sm text-slate-600 mb-4">{r.summary}</p>
                                                <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-3 rounded">
                                                    <div>
                                                        <strong className="block text-xs text-slate-500 uppercase">Key Learnings</strong>
                                                        {r.keyLearnings}
                                                    </div>
                                                    <div>
                                                        <strong className="block text-xs text-slate-500 uppercase">Next Steps</strong>
                                                        {r.nextSteps}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))
                                    }
                                </div>
                            )}

                            {studentSubTab === 'PLAN' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <h3 className="font-bold text-slate-800">Learning Goals</h3>
                                        <Button onClick={() => handleOpenGoalModal()}>
                                            <Plus size={16} /> New Goal
                                        </Button>
                                    </div>
                                    {studentGoals.map(goal => (
                                        <Card key={goal.id} className="p-4 flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-slate-800">{goal.description}</h4>
                                                    <div className="flex gap-2">
                                                        <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-600">{goal.category}</span>
                                                        <button onClick={() => handleOpenGoalModal(goal)} className="text-slate-400 hover:text-indigo-600"><Pencil size={14}/></button>
                                                        <button onClick={() => onDeleteGoal(goal.id)} className="text-slate-400 hover:text-rose-600"><Trash2 size={14}/></button>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 mb-2">Alignment: {goal.alignment}</p>
                                                <div className="w-full bg-slate-100 rounded-full h-2">
                                                    <div className={`h-2 rounded-full ${goal.status === GoalStatus.ACHIEVED ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{width: `${goal.progress}%`}}></div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                    {studentGoals.length === 0 && <p className="text-slate-500">No learning goals set.</p>}
                                </div>
                            )}

                            {studentSubTab === 'EVALUATIONS' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <h3 className="font-bold text-slate-800">Evaluations</h3>
                                        <Button onClick={() => setIsEvaluationModalOpen(true)}>
                                            <Plus size={16} /> New Eval
                                        </Button>
                                    </div>
                                    {studentEvaluations.map(e => (
                                        <Card key={e.id} className="p-5">
                                            <div className="flex justify-between mb-4 border-b border-slate-100 pb-2">
                                                <span className="font-bold text-slate-800">{e.type.replace('_', ' ')} EVALUATION</span>
                                                <span className="text-sm text-slate-500">{new Date(e.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-4">
                                                {e.scores.map((s, idx) => (
                                                    <div key={idx}>
                                                        <span className="text-xs font-medium text-slate-600 block mb-1">{s.category}</span>
                                                        <ScoreBar score={s.score} max={5} />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="bg-indigo-50 p-3 rounded text-sm text-indigo-900 italic">
                                                "{e.overallFeedback}"
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                            
                            {studentSubTab === 'SITE_VISITS' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <h3 className="font-bold text-slate-800">Site Visits</h3>
                                        <Button onClick={() => handleOpenSiteVisitModal()}>
                                            <Plus size={16} /> Record Visit
                                        </Button>
                                    </div>
                                    {studentSiteVisits.length === 0 ? <p className="text-slate-500">No site visits recorded.</p> :
                                        studentSiteVisits.map(visit => (
                                            <Card key={visit.id} className="p-5 relative group">
                                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleOpenSiteVisitModal(visit)} className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-600"><Pencil size={14}/></button>
                                                    <button onClick={() => onDeleteSiteVisit(visit.id)} className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-rose-600"><Trash2 size={14}/></button>
                                                </div>
                                                <div className="flex justify-between items-start mb-2 pr-12">
                                                     <div className="flex items-center gap-2">
                                                         <CalendarIcon size={18} className="text-indigo-600" />
                                                         <span className="font-bold text-slate-800">{new Date(visit.date).toLocaleDateString()}</span>
                                                     </div>
                                                     <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded flex items-center gap-1">
                                                         <MapPin size={10} /> {visit.location}
                                                     </span>
                                                </div>
                                                <p className="text-sm font-medium text-slate-700 mb-2">Purpose: {visit.purpose}</p>
                                                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded italic border border-slate-100">
                                                    "{visit.notes}"
                                                </div>
                                            </Card>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none">
                            <h3 className="text-indigo-100 text-sm font-medium mb-1">Active Interns</h3>
                            <div className="text-4xl font-bold">{supervisedStudents.length}</div>
                        </Card>
                        <Card className="p-6 flex items-center justify-between">
                             <div>
                                <h3 className="text-slate-500 text-sm font-medium mb-1">Pending Logs</h3>
                                <div className="text-4xl font-bold text-slate-800">{filteredLogs.length}</div>
                             </div>
                             <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
                                 <Clock size={24} />
                             </div>
                        </Card>
                        <Card className="p-6 flex items-center justify-between">
                             <div>
                                <h3 className="text-slate-500 text-sm font-medium mb-1">Alerts</h3>
                                <div className="flex gap-4">
                                    <div className="text-center">
                                        <span className="block text-2xl font-bold text-rose-600">{dashboardAlerts.overdueCount}</span>
                                        <span className="text-[10px] text-slate-400 uppercase">Overdue</span>
                                    </div>
                                    <div className="w-px bg-slate-200"></div>
                                    <div className="text-center">
                                        <span className="block text-2xl font-bold text-amber-600">{dashboardAlerts.missingReports}</span>
                                        <span className="text-[10px] text-slate-400 uppercase">Miss Rep.</span>
                                    </div>
                                     <div className="w-px bg-slate-200"></div>
                                    <div className="text-center">
                                        <span className="block text-2xl font-bold text-blue-600">{dashboardAlerts.pendingLeaves}</span>
                                        <span className="text-[10px] text-slate-400 uppercase">Leave Req.</span>
                                    </div>
                                </div>
                             </div>
                             <div className="p-3 bg-rose-50 text-rose-600 rounded-full">
                                 <AlertTriangle size={24} />
                             </div>
                        </Card>
                    </div>

                    {/* Pending Feedback Alert */}
                    {dashboardAlerts.feedbackNeeded > 0 && (
                        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-md shadow-sm flex items-start gap-3">
                             <MessageSquarePlus className="text-indigo-600 flex-shrink-0 mt-1" size={20} />
                             <div>
                                 <h3 className="font-bold text-indigo-800">Feedback Needed</h3>
                                 <p className="text-sm text-indigo-700 mt-1">
                                     You have {dashboardAlerts.feedbackNeeded} completed task(s) waiting for your feedback (Praise/Growth).
                                     Please review them in the intern dashboards.
                                 </p>
                             </div>
                        </div>
                    )}

                    {/* Pending Leave Requests */}
                     {leaveRequests.some(lr => lr.status === LeaveStatus.PENDING && supervisedStudents.some(s => s.id === lr.studentId)) && (
                         <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                             <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                                 <CalendarOff size={18} /> Pending Leave Requests
                             </h3>
                             <div className="space-y-3">
                                 {leaveRequests.filter(lr => lr.status === LeaveStatus.PENDING && supervisedStudents.some(s => s.id === lr.studentId)).map(req => {
                                     const student = users.find(u => u.id === req.studentId);
                                     return (
                                         <div key={req.id} className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center">
                                             <div>
                                                 <div className="flex items-center gap-2">
                                                     <span className="font-bold text-slate-800">{student?.name}</span>
                                                     <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">{req.type}</span>
                                                 </div>
                                                 <p className="text-xs text-slate-500 mt-1">
                                                     {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()} • "{req.reason}"
                                                 </p>
                                             </div>
                                             <div className="flex gap-2">
                                                 <Button variant="danger" className="py-1 px-3 text-xs" onClick={() => onUpdateLeaveStatus(req.id, LeaveStatus.REJECTED)}>Deny</Button>
                                                 <Button variant="primary" className="py-1 px-3 text-xs" onClick={() => onUpdateLeaveStatus(req.id, LeaveStatus.APPROVED)}>Approve</Button>
                                             </div>
                                         </div>
                                     );
                                 })}
                             </div>
                         </div>
                     )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                    <Clock className="text-indigo-600" /> Review Queue
                                </h3>
                                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                    {filteredLogs.length} Pending
                                </span>
                            </div>
                            <div className="space-y-4">
                                {filteredLogs.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                                        All caught up! No logs to review.
                                    </div>
                                ) : (
                                    filteredLogs.slice(0, 5).map(log => {
                                        const student = supervisedStudents.find(s => s.id === log.studentId);
                                        return <LogReviewCard key={log.id} log={log} student={student} showAvatar={true} onApproveLog={onApproveLog} />;
                                    })
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Card className="p-5">
                                <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <Button variant="outline" className="w-full justify-start" onClick={() => { setViewMode('management'); setIsInternModalOpen(true); }}>
                                        <UserPlus size={16} /> Add New Intern
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" onClick={() => setIsAnnouncementModalOpen(true)}>
                                        <Megaphone size={16} /> Post Announcement
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" onClick={() => { setViewMode('resources'); setIsResourceModalOpen(true); }}>
                                        <Paperclip size={16} /> Upload Resource
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            );
        case 'management':
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">My Interns</h2>
                            <p className="text-slate-500">Manage your team of students.</p>
                        </div>
                        <Button onClick={() => setIsInternModalOpen(true)}>
                            <UserPlus size={16} /> Add Intern
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {supervisedStudents.map(student => {
                            const activeLogs = logs.filter(l => l.studentId === student.id && l.status === LogStatus.PENDING).length;
                            const completedHours = logs.filter(l => l.studentId === student.id && l.status === LogStatus.APPROVED).reduce((a,b) => a + b.hoursWorked, 0);
                            
                            return (
                                <Card key={student.id} className="p-5 flex flex-col gap-4 hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-indigo-100">
                                    <div className="flex items-center gap-4">
                                        <img src={student.avatar} alt="" className="w-14 h-14 rounded-full border border-slate-100" />
                                        <div>
                                            <h3 className="font-bold text-slate-800">{student.name}</h3>
                                            <p className="text-xs text-slate-500">{student.institution}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-center">
                                        <div className="bg-slate-50 p-2 rounded-lg">
                                            <div className="text-xl font-bold text-slate-700">{completedHours}</div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Hours Done</div>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded-lg">
                                            <div className="text-xl font-bold text-slate-700">{student.totalHoursRequired}</div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Target</div>
                                        </div>
                                    </div>
                                    {activeLogs > 0 && (
                                        <div className="bg-amber-50 text-amber-700 text-xs py-1.5 px-3 rounded-full font-bold flex items-center justify-center gap-2">
                                            <AlertCircle size={14} /> {activeLogs} Logs Pending Review
                                        </div>
                                    )}
                                    <button 
                                        className="w-full py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors mt-auto"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedStudentId(student.id);
                                            setViewMode('dashboard');
                                            setStudentSubTab('OVERVIEW');
                                        }}
                                    >
                                        View Dashboard
                                    </button>
                                </Card>
                            );
                        })}
                        {supervisedStudents.length === 0 && (
                            <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                                No interns assigned yet. Add one to get started.
                            </div>
                        )}
                    </div>
                </div>
            );
        case 'reports':
             return (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                     <div className="flex justify-between items-center">
                         <div>
                             <h2 className="text-2xl font-bold text-slate-800">Generate Reports</h2>
                             <p className="text-slate-500">Create comprehensive PDF reports for your interns.</p>
                         </div>
                     </div>
                     <div className="grid grid-cols-1 gap-4">
                         {supervisedStudents.map(student => (
                             <Card key={student.id} className="p-6 flex justify-between items-center hover:shadow-md transition-shadow">
                                 <div className="flex items-center gap-4">
                                     <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                                         <FileText size={24} />
                                     </div>
                                     <div>
                                         <h3 className="font-bold text-slate-800 text-lg">{student.name}</h3>
                                         <p className="text-sm text-slate-500">{student.institution} • {student.department}</p>
                                     </div>
                                 </div>
                                 <Button onClick={() => { setSelectedStudentId(student.id); setIsReportPreviewOpen(true); }}>
                                     <Printer size={16} /> Generate Report
                                 </Button>
                             </Card>
                         ))}
                     </div>

                     {isReportPreviewOpen && selectedStudentId && (
                         <ReportPreview 
                             student={users.find(u => u.id === selectedStudentId)!}
                             supervisor={user}
                             logs={logs.filter(l => l.studentId === selectedStudentId)}
                             tasks={tasks.filter(t => t.assignedToId === selectedStudentId)}
                             reports={reports.filter(r => r.studentId === selectedStudentId)}
                             evaluations={evaluations.filter(e => e.studentId === selectedStudentId)}
                             skills={skills}
                             assessments={skillAssessments.filter(a => a.studentId === selectedStudentId)}
                             goals={goals.filter(g => g.studentId === selectedStudentId)}
                             onClose={() => { setIsReportPreviewOpen(false); setSelectedStudentId(null); }}
                         />
                     )}
                 </div>
             );
        case 'resources':
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Resource Library</h2>
                            <p className="text-slate-500">Shared documents and templates for students.</p>
                        </div>
                        <Button onClick={() => setIsResourceModalOpen(true)}>
                            <Plus size={16} /> Upload Resource
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {resources.map(res => (
                            <Card key={res.id} className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                                <div className={`p-3 rounded-lg ${res.type === 'PDF' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-700">{res.title}</h4>
                                    <p className="text-xs text-slate-400">Uploaded {new Date(res.uploadDate).toLocaleDateString()}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            );
        case 'meetings':
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Meetings</h2>
                            <p className="text-slate-500">Schedule check-ins with your interns.</p>
                        </div>
                        <Button onClick={() => setIsMeetingModalOpen(true)}>
                            <Plus size={16} /> Schedule Meeting
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {meetings.map(m => (
                             <Card key={m.id} className="p-4 flex justify-between items-center">
                                 <div>
                                     <h4 className="font-bold text-slate-800">{m.title}</h4>
                                     <div className="text-sm text-slate-500 flex gap-4 mt-1">
                                         <span className="flex items-center gap-1"><CalendarIcon size={14}/> {new Date(m.date).toLocaleDateString()}</span>
                                         <span className="flex items-center gap-1"><Clock size={14}/> {m.time}</span>
                                     </div>
                                 </div>
                                 {m.link && (
                                     <a href={m.link} target="_blank" rel="noreferrer" className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100">
                                         Join Call
                                     </a>
                                 )}
                             </Card>
                        ))}
                    </div>
                </div>
            );
        case 'communication':
            return (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                     <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Communication Hub</h2>
                            <p className="text-slate-500">Messages and Announcements.</p>
                        </div>
                        <Button variant="secondary" onClick={() => setIsAnnouncementModalOpen(true)}>
                            <Megaphone size={16} /> New Announcement
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
                        <Card className="md:col-span-1 p-0 overflow-hidden flex flex-col">
                            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">Recent Chats</div>
                            <div className="flex-1 overflow-y-auto">
                                {supervisedStudents.map(student => (
                                    <div 
                                        key={student.id} 
                                        onClick={() => setActiveChatStudentId(student.id)}
                                        className={`p-4 border-b border-slate-50 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 transition-colors ${activeChatStudentId === student.id ? 'bg-indigo-50 border-indigo-100' : ''}`}
                                    >
                                        <img src={student.avatar} className="w-10 h-10 rounded-full" alt="" />
                                        <div>
                                            <div className="font-bold text-sm text-slate-800">{student.name}</div>
                                            <div className="text-xs text-slate-500 truncate w-32">Click to chat...</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                        <Card className="md:col-span-2 p-0 overflow-hidden flex flex-col">
                            {activeChatStudentId ? (
                                <>
                                    <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center">
                                        <span>Chat with {users.find(u => u.id === activeChatStudentId)?.name}</span>
                                        <div className="text-xs text-slate-400 font-normal flex items-center gap-1">
                                            <Users size={12}/> Tri-Group (You, Intern, Mentor)
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                                        {messages
                                            .filter(m => m.relatedStudentId === activeChatStudentId)
                                            .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                            .map(msg => (
                                            <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] p-3 rounded-lg text-sm ${msg.senderId === user.id ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                                                    {msg.content}
                                                    <div className={`text-[9px] mt-1 text-right ${msg.senderId === user.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 border-t border-slate-200 bg-slate-50">
                                        <form onSubmit={handleSendMessage} className="flex gap-2">
                                            <input 
                                                className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                                                placeholder="Type your message..."
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                            />
                                            <Button type="submit"><Send size={16}/></Button>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                                    <MessageSquare size={48} className="mb-4 opacity-20" />
                                    <p>Select a student to start chatting</p>
                                </div>
                            )}
                        </Card>
                    </div>
                 </div>
            );
    }
  };

  const NavButton = ({ mode, label, icon: Icon }: { mode: string, label: string, icon: any }) => (
      <button 
        onClick={() => {
            setViewMode(mode as any);
            setSelectedStudentId(null);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg md:rounded-none md:border-l-4 ${
            viewMode === mode 
            ? 'bg-indigo-50 text-indigo-700 md:border-indigo-600' 
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 md:border-transparent'
        }`}
    >
        <Icon size={18} />
        <span className="whitespace-nowrap">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-8rem)]">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
                <div className="flex overflow-x-auto md:flex-col p-2 md:p-0 gap-2 md:gap-0">
                    <NavButton mode="dashboard" label="Dashboard" icon={LayoutDashboard} />
                    <NavButton mode="management" label="Intern Management" icon={Users} />
                    <NavButton mode="reports" label="Reports" icon={FileText} />
                    <NavButton mode="resources" label="Resources" icon={Briefcase} />
                    <NavButton mode="communication" label="Communication" icon={MessageSquare} />
                    <NavButton mode="meetings" label="Meetings" icon={CalendarCheck} />
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
            {renderContent()}
        </div>

        {/* Modals */}
        {isInternModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <Card className="w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Add New Intern</h2>
                    <form onSubmit={handleAddInternSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input type="text" value={internForm.name} onChange={e => setInternForm({...internForm, name: e.target.value})} className="w-full p-2 border border-slate-300 rounded outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" value={internForm.email} onChange={e => setInternForm({...internForm, email: e.target.value})} className="w-full p-2 border border-slate-300 rounded outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Total Hours Required</label>
                            <input type="number" value={internForm.totalHoursRequired} onChange={e => setInternForm({...internForm, totalHoursRequired: Number(e.target.value)})} className="w-full p-2 border border-slate-300 rounded outline-none" required />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="secondary" onClick={() => setIsInternModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Add Intern</Button>
                        </div>
                    </form>
                </Card>
            </div>
        )}

        {isTaskModalOpen && (
             <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                 <Card className="w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
                     <h2 className="text-xl font-bold text-slate-800 mb-4">Assign New Task</h2>
                     <form onSubmit={handleAddTaskSubmit} className="space-y-4">
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
                             <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newTask.title} 
                                    onChange={e => setNewTask({...newTask, title: e.target.value})} 
                                    className="w-full p-2 border border-slate-300 rounded outline-none" 
                                    required 
                                />
                                <button 
                                    type="button" 
                                    onClick={handleGenerateAiTask}
                                    disabled={!newTask.title || isAiLoading}
                                    className="p-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 disabled:opacity-50"
                                    title="Auto-generate description with AI"
                                >
                                    <Wand2 size={20} className={isAiLoading ? 'animate-spin' : ''} />
                                </button>
                             </div>
                         </div>
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                             <textarea 
                                value={newTask.description} 
                                onChange={e => setNewTask({...newTask, description: e.target.value})} 
                                className="w-full p-2 border border-slate-300 rounded outline-none h-24 resize-none" 
                                required 
                             />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                                 <select 
                                    value={newTask.priority} 
                                    onChange={e => setNewTask({...newTask, priority: e.target.value as TaskPriority})} 
                                    className={`w-full p-2 border border-slate-300 rounded outline-none transition-colors ${isAiLoading ? 'bg-slate-100 text-slate-400' : ''}`}
                                    disabled={isAiLoading}
                                 >
                                     <option value={TaskPriority.LOW}>Low</option>
                                     <option value={TaskPriority.MEDIUM}>Medium</option>
                                     <option value={TaskPriority.HIGH}>High</option>
                                 </select>
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                                 <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} className="w-full p-2 border border-slate-300 rounded outline-none" required />
                             </div>
                         </div>
                         <div className="flex justify-end gap-2 pt-2">
                             <Button type="button" variant="secondary" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
                             <Button type="submit">Assign Task</Button>
                         </div>
                     </form>
                 </Card>
             </div>
        )}

        {isResourceModalOpen && (
             <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                 <Card className="w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                     <h2 className="text-xl font-bold text-slate-800 mb-4">Upload Resource</h2>
                     <form onSubmit={handleAddResourceSubmit} className="space-y-4">
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                             <input type="text" value={newResource.title} onChange={e => setNewResource({...newResource, title: e.target.value})} className="w-full p-2 border border-slate-300 rounded outline-none" required />
                         </div>
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                             <select value={newResource.type} onChange={e => setNewResource({...newResource, type: e.target.value as any})} className="w-full p-2 border border-slate-300 rounded outline-none">
                                 <option value="PDF">PDF Document</option>
                                 <option value="DOC">Word Document</option>
                                 <option value="LINK">External Link</option>
                             </select>
                         </div>
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">URL / Link</label>
                             <input type="text" value={newResource.url} onChange={e => setNewResource({...newResource, url: e.target.value})} className="w-full p-2 border border-slate-300 rounded outline-none" placeholder="https://..." required />
                         </div>
                         <div className="flex justify-end gap-2 pt-2">
                             <Button type="button" variant="secondary" onClick={() => setIsResourceModalOpen(false)}>Cancel</Button>
                             <Button type="submit">Add Resource</Button>
                         </div>
                     </form>
                 </Card>
             </div>
        )}

        {isFeedbackModalOpen && (
             <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                 <Card className="w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                     <h2 className="text-xl font-bold text-slate-800 mb-4">Provide Task Feedback</h2>
                     <form onSubmit={handleSubmitFeedback} className="space-y-4">
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">Feedback Type</label>
                             <div className="grid grid-cols-2 gap-4">
                                 <label 
                                    className={`
                                        flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all
                                        ${feedbackForm.type === FeedbackType.PRAISE ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-purple-200'}
                                    `}
                                 >
                                     <input 
                                        type="radio" 
                                        name="fbType" 
                                        className="hidden"
                                        checked={feedbackForm.type === FeedbackType.PRAISE} 
                                        onChange={() => setFeedbackForm({...feedbackForm, type: FeedbackType.PRAISE})}
                                     />
                                     <ThumbsUp size={24} className={feedbackForm.type === FeedbackType.PRAISE ? 'text-purple-600' : 'text-slate-400'} />
                                     <div className="text-center">
                                         <span className={`block font-bold text-sm ${feedbackForm.type === FeedbackType.PRAISE ? 'text-purple-700' : 'text-slate-600'}`}>Praise</span>
                                         <span className="text-xs text-slate-500">Recognize achievement</span>
                                     </div>
                                     {feedbackForm.type === FeedbackType.PRAISE && <div className="absolute top-2 right-2 text-purple-600"><CheckCircle2 size={16} /></div>}
                                 </label>

                                 <label 
                                    className={`
                                        flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all
                                        ${feedbackForm.type === FeedbackType.GROWTH ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-sky-200'}
                                    `}
                                 >
                                     <input 
                                        type="radio" 
                                        name="fbType" 
                                        className="hidden"
                                        checked={feedbackForm.type === FeedbackType.GROWTH} 
                                        onChange={() => setFeedbackForm({...feedbackForm, type: FeedbackType.GROWTH})}
                                     />
                                     <TrendingUp size={24} className={feedbackForm.type === FeedbackType.GROWTH ? 'text-sky-600' : 'text-slate-400'} />
                                     <div className="text-center">
                                         <span className={`block font-bold text-sm ${feedbackForm.type === FeedbackType.GROWTH ? 'text-sky-700' : 'text-slate-600'}`}>Growth Area</span>
                                         <span className="text-xs text-slate-500">Suggest improvement</span>
                                     </div>
                                     {feedbackForm.type === FeedbackType.GROWTH && <div className="absolute top-2 right-2 text-sky-600"><CheckCircle2 size={16} /></div>}
                                 </label>
                             </div>
                         </div>
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Comment</label>
                             <textarea 
                                value={feedbackForm.comment} 
                                onChange={e => setFeedbackForm({...feedbackForm, comment: e.target.value})} 
                                className="w-full p-2 border border-slate-300 rounded outline-none h-24 resize-none" 
                                placeholder="Write your feedback here..."
                                autoFocus
                                required 
                             />
                         </div>
                         <div className="flex justify-end gap-2 pt-2">
                             <Button type="button" variant="secondary" onClick={() => setIsFeedbackModalOpen(false)}>Cancel</Button>
                             <Button type="submit">Submit Feedback</Button>
                         </div>
                     </form>
                 </Card>
             </div>
        )}

        {isEvaluationModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <Card className="w-full max-w-lg p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">New Evaluation</h2>
                    <form onSubmit={handleSubmitEvaluation} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Evaluation Type</label>
                            <select value={evalType} onChange={e => setEvalType(e.target.value as EvaluationType)} className="w-full p-2 border border-slate-300 rounded outline-none">
                                <option value={EvaluationType.MID_TERM}>Mid-Term</option>
                                <option value={EvaluationType.FINAL}>Final</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             {Object.entries(evalScores).map(([key, score]) => (
                                 <div key={key}>
                                     <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">{key === 'comms' ? 'Communication' : key === 'init' ? 'Initiative' : key === 'punct' ? 'Punctuality' : 'Quality of Work'}</label>
                                     <input 
                                        type="range" 
                                        min="1" max="5" 
                                        value={score} 
                                        onChange={e => setEvalScores(prev => ({...prev, [key]: Number(e.target.value)}))}
                                        className="w-full accent-indigo-600"
                                     />
                                     <div className="text-right text-xs text-slate-500 font-bold">{score}/5</div>
                                 </div>
                             ))}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Overall Feedback</label>
                            <textarea 
                                value={evalComment} 
                                onChange={e => setEvalComment(e.target.value)} 
                                className="w-full p-2 border border-slate-300 rounded outline-none h-24 resize-none" 
                                required 
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                             <Button type="button" variant="secondary" onClick={() => setIsEvaluationModalOpen(false)}>Cancel</Button>
                             <Button type="submit">Save Evaluation</Button>
                         </div>
                    </form>
                </Card>
            </div>
        )}

        {isAnnouncementModalOpen && (
             <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                 <Card className="w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                     <h2 className="text-xl font-bold text-slate-800 mb-4">Post Announcement</h2>
                     <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                             <input type="text" value={announcementForm.title} onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})} className="w-full p-2 border border-slate-300 rounded outline-none" required />
                         </div>
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                             <textarea 
                                value={announcementForm.message} 
                                onChange={e => setAnnouncementForm({...announcementForm, message: e.target.value})} 
                                className="w-full p-2 border border-slate-300 rounded outline-none h-24 resize-none" 
                                required 
                             />
                         </div>
                         <div className="flex justify-end gap-2 pt-2">
                             <Button type="button" variant="secondary" onClick={() => setIsAnnouncementModalOpen(false)}>Cancel</Button>
                             <Button type="submit">Post</Button>
                         </div>
                     </form>
                 </Card>
             </div>
        )}

        {isMeetingModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                  <Card className="w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800">Schedule Meeting</h2>
                        <button onClick={() => setIsMeetingModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                      </div>

                      {/* Conflict Warning */}
                      {meetingConflicts.length > 0 && (
                          <div className="mb-4 bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-700">
                              <strong className="flex items-center gap-1 mb-1"><AlertCircle size={14}/> Schedule Conflict Detected!</strong>
                              <p>The following attendees are already booked at this time:</p>
                              <ul className="list-disc list-inside mt-1">
                                  {meetingConflicts.map((name, i) => <li key={i}>{name}</li>)}
                              </ul>
                          </div>
                      )}

                      <form onSubmit={handleMeetingSubmit} className="space-y-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                              <input type="text" value={meetingForm.title} onChange={e => setMeetingForm({...meetingForm, title: e.target.value})} className="w-full p-2 border border-slate-300 rounded outline-none" required />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                  <input type="date" value={meetingForm.date} onChange={e => setMeetingForm({...meetingForm, date: e.target.value})} className="w-full p-2 border border-slate-300 rounded outline-none" required />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                  <input type="time" value={meetingForm.time} onChange={e => setMeetingForm({...meetingForm, time: e.target.value})} className="w-full p-2 border border-slate-300 rounded outline-none" required />
                              </div>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Video Link (Optional)</label>
                              <input type="text" value={meetingForm.link} onChange={e => setMeetingForm({...meetingForm, link: e.target.value})} className="w-full p-2 border border-slate-300 rounded outline-none" placeholder="https://meet.google.com/..." />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Attendees</label>
                              <select multiple className="w-full p-2 border border-slate-300 rounded outline-none h-24" value={meetingForm.attendees} onChange={e => setMeetingForm({...meetingForm, attendees: Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value)})}>
                                  {supervisedStudents.map(s => (
                                      <option key={s.id} value={s.id}>{s.name}</option>
                                  ))}
                              </select>
                              <p className="text-[10px] text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple.</p>
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                              <Button type="button" variant="secondary" onClick={() => setIsMeetingModalOpen(false)}>Cancel</Button>
                              <Button type="submit">Schedule</Button>
                          </div>
                      </form>
                  </Card>
              </div>
        )}

        {isSiteVisitModalOpen && (
             <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                 <Card className="w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                     <h2 className="text-xl font-bold text-slate-800 mb-4">{editingSiteVisit ? 'Edit Site Visit' : 'Record Site Visit'}</h2>
                     <form onSubmit={handleSiteVisitSubmit} className="space-y-4">
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                             <input type="date" value={siteVisitForm.date} onChange={e => setSiteVisitForm({...siteVisitForm, date: e.target.value})} className="w-full p-2 border border-slate-300 rounded outline-none" required />
                         </div>
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                             <input type="text" value={siteVisitForm.location} onChange={e => setSiteVisitForm({...siteVisitForm, location: e.target.value})} className="w-full p-2 border border-slate-300 rounded outline-none" placeholder="e.g. Main Office, Lab 3" required />
                         </div>
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Purpose</label>
                             <input type="text" value={siteVisitForm.purpose} onChange={e => setSiteVisitForm({...siteVisitForm, purpose: e.target.value})} className="w-full p-2 border border-slate-300 rounded outline-none" placeholder="e.g. Monthly Progress Check" required />
                         </div>
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Observations</label>
                             <textarea 
                                value={siteVisitForm.notes} 
                                onChange={e => setSiteVisitForm({...siteVisitForm, notes: e.target.value})} 
                                className="w-full p-2 border border-slate-300 rounded outline-none h-24 resize-none" 
                                required 
                             />
                         </div>
                         <div className="flex justify-end gap-2 pt-2">
                             <Button type="button" variant="secondary" onClick={() => setIsSiteVisitModalOpen(false)}>Cancel</Button>
                             <Button type="submit">{editingSiteVisit ? 'Update Visit' : 'Save Visit'}</Button>
                         </div>
                     </form>
                 </Card>
             </div>
        )}

        {isGoalModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <Card className="w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">{editingGoal ? 'Edit Goal' : 'New Goal'}</h2>
                    <form onSubmit={handleGoalSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <input type="text" value={goalForm.description} onChange={e => setGoalForm({...goalForm, description: e.target.value})} className="w-full p-2 border border-slate-300 rounded outline-none" placeholder="e.g. Master React hooks" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select value={goalForm.category} onChange={e => setGoalForm({...goalForm, category: e.target.value})} className="w-full p-2 border border-slate-300 rounded outline-none">
                                <option value="">Select Category</option>
                                <option value="Technical Skill">Technical Skill</option>
                                <option value="Soft Skills">Soft Skills</option>
                                <option value="Business">Business</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Alignment (Learning Outcome)</label>
                            <input type="text" value={goalForm.alignment} onChange={e => setGoalForm({...goalForm, alignment: e.target.value})} className="w-full p-2 border border-slate-300 rounded outline-none" placeholder="e.g. CLO-3: Backend Proficiency" required />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="secondary" onClick={() => setIsGoalModalOpen(false)}>Cancel</Button>
                            <Button type="submit">{editingGoal ? 'Update Goal' : 'Add Goal'}</Button>
                        </div>
                    </form>
                </Card>
            </div>
        )}

        {isAttendanceModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <Card className="w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-1">Manage Attendance Date</h2>
                    <p className="text-sm text-slate-500 mb-4">Set exception for: {selectedAttendanceDate}</p>
                    
                    <form onSubmit={handleAttendanceSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Exception Type</label>
                            <select 
                                value={attendanceForm.type} 
                                onChange={e => setAttendanceForm({...attendanceForm, type: e.target.value as any})} 
                                className="w-full p-2 border border-slate-300 rounded outline-none"
                            >
                                <option value="EXCUSED">Excused Absence</option>
                                <option value="HOLIDAY">Holiday</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Reason / Note</label>
                            <input 
                                type="text" 
                                value={attendanceForm.reason} 
                                onChange={e => setAttendanceForm({...attendanceForm, reason: e.target.value})} 
                                className="w-full p-2 border border-slate-300 rounded outline-none" 
                                placeholder="e.g. Sick Leave Approved, Public Holiday" 
                                required 
                            />
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <button 
                                type="button" 
                                onClick={handleDeleteException}
                                className="text-sm text-rose-600 hover:text-rose-800 underline"
                            >
                                Remove Exception
                            </button>
                            <div className="flex gap-2">
                                <Button type="button" variant="secondary" onClick={() => setIsAttendanceModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </div>
                    </form>
                </Card>
            </div>
        )}
    </div>
  );
};
