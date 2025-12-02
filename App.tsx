
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MOCK_USERS, MOCK_LOGS, MOCK_TASKS, MOCK_REPORTS, MOCK_GOALS, MOCK_RESOURCES, APP_NAME, MOCK_EVALUATIONS, MOCK_MESSAGES, MOCK_MEETINGS, MOCK_SKILLS, MOCK_SKILL_ASSESSMENTS, MOCK_NOTIFICATIONS, MOCK_BADGES, MOCK_USER_BADGES, MOCK_LEAVE_REQUESTS, MOCK_SITE_VISITS, MOCK_ATTENDANCE_EXCEPTIONS } from './constants';
import { Role, User, LogEntry, Task, TaskStatus, LogStatus, Report, Goal, Resource, TaskDeliverable, TaskFeedback, Evaluation, Message, Meeting, Skill, SkillAssessment, Notification, NotificationType, Badge, UserBadge, LeaveRequest, LeaveStatus, FeedbackType, SiteVisit, GoalStatus, AttendanceException } from './types';
import { StudentPortal } from './components/StudentPortal';
import { SupervisorPortal } from './components/SupervisorPortal';
import { Bell, X, Megaphone, Info } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); 
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  const [evaluations, setEvaluations] = useState<Evaluation[]>(MOCK_EVALUATIONS);

  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [meetings, setMeetings] = useState<Meeting[]>(MOCK_MEETINGS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const [skills, setSkills] = useState<Skill[]>(MOCK_SKILLS);
  const [skillAssessments, setSkillAssessments] = useState<SkillAssessment[]>(MOCK_SKILL_ASSESSMENTS);

  const [badges, setBadges] = useState<Badge[]>(MOCK_BADGES);
  const [userBadges, setUserBadges] = useState<UserBadge[]>(MOCK_USER_BADGES);
  
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(MOCK_LEAVE_REQUESTS);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>(MOCK_SITE_VISITS);
  const [attendanceExceptions, setAttendanceExceptions] = useState<AttendanceException[]>(MOCK_ATTENDANCE_EXCEPTIONS);

  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
          if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
              setIsNotifDropdownOpen(false);
          }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Gamification Logic ---
  const awardBadge = (userId: string, badgeId: string) => {
      setUserBadges(prev => {
          const hasBadge = prev.some(ub => ub.userId === userId && ub.badgeId === badgeId);
          if (hasBadge) return prev;
          
          const badge = badges.find(b => b.id === badgeId);
          if (badge) {
              handleSendNotification({
                  senderId: 'SYSTEM',
                  recipientId: userId,
                  title: 'Badge Unlocked!',
                  message: `Congratulations! You've earned the "${badge.name}" badge and ${badge.points} XP!`,
                  type: NotificationType.INFO
              });
          }
          
          return [...prev, {
              id: `ub${Date.now()}`,
              userId,
              badgeId,
              earnedAt: new Date().toISOString()
          }];
      });
  };

  const checkLogStreak = (studentId: string, currentLogs: LogEntry[]) => {
      const uniqueDates = Array.from(new Set(
          currentLogs
          .filter(l => l.studentId === studentId)
          .map(l => l.date)
      )).sort();

      let streak = 0;
      for (let i = 0; i < uniqueDates.length; i++) {
          if (i === 0) {
              streak = 1;
              continue;
          }
          const prev = new Date(uniqueDates[i-1]);
          const curr = new Date(uniqueDates[i]);
          const diffTime = Math.abs(curr.getTime() - prev.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

          if (diffDays === 1) {
              streak++;
          } else {
              streak = 1;
          }

          if (streak >= 5) {
              awardBadge(studentId, 'b1'); // b1 = Early Bird
              break;
          }
      }
  };

  const handleAddLog = (newLogData: Omit<LogEntry, 'id' | 'status'>) => {
    const newLog: LogEntry = {
      ...newLogData,
      id: `l${Date.now()}`,
      status: LogStatus.PENDING
    };
    setLogs(prev => {
        const updatedLogs = [...prev, newLog];
        // Check for Early Bird Badge (5 days streak)
        checkLogStreak(newLog.studentId, updatedLogs);
        return updatedLogs;
    });
  };

  const handleApproveLog = (logId: string, approved: boolean, comment?: string) => {
    setLogs(prev => prev.map(log => 
        log.id === logId 
        ? { ...log, status: approved ? LogStatus.APPROVED : LogStatus.REJECTED, supervisorComment: comment } 
        : log
    ));
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `t${Date.now()}`,
      status: TaskStatus.TODO,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
      setTasks(prev => {
          const updatedTasks = prev.map(task => task.id === taskId ? { ...task, status } : task);
          
          if (status === TaskStatus.COMPLETED) {
              const task = updatedTasks.find(t => t.id === taskId);
              if (task) {
                  // Check for Task Master Badge (10 completed tasks)
                  const completedCount = updatedTasks.filter(t => t.assignedToId === task.assignedToId && t.status === TaskStatus.COMPLETED).length;
                  if (completedCount >= 10) {
                      awardBadge(task.assignedToId, 'b2'); // b2 = Task Master
                  }
              }
          }
          return updatedTasks;
      });
  };
  
  const handleSubmitDeliverable = (taskId: string, deliverable: TaskDeliverable) => {
      setTasks(prev => {
          const updatedTasks = prev.map(task =>
            task.id === taskId ? { ...task, deliverable, status: TaskStatus.COMPLETED } : task
          );
          
          // Check for Task Master Badge
          const task = updatedTasks.find(t => t.id === taskId);
          if (task) {
              const completedCount = updatedTasks.filter(t => t.assignedToId === task.assignedToId && t.status === TaskStatus.COMPLETED).length;
              if (completedCount >= 10) {
                  awardBadge(task.assignedToId, 'b2');
              }
          }
          return updatedTasks;
      });
  };

  const handleGiveFeedback = (taskId: string, feedback: TaskFeedback) => {
      setTasks(prev => prev.map(task =>
          task.id === taskId ? { ...task, feedback } : task
      ));

      // Check for Impact Player Badge (Praise)
      if (feedback.type === FeedbackType.PRAISE) {
          const task = tasks.find(t => t.id === taskId);
          if (task) {
              awardBadge(task.assignedToId, 'b4'); // b4 = Impact Player
          }
      }
  };

  const handleAddIntern = (userData: Omit<User, 'id' | 'role' | 'avatar'>) => {
      const newUser: User = {
          ...userData,
          id: `u${Date.now()}`,
          role: Role.STUDENT,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
          assignedSupervisorId: currentUser.role === Role.SUPERVISOR ? currentUser.id : undefined
      };
      setUsers(prev => [...prev, newUser]);
  };

  const handleUpdateIntern = (updatedUser: User) => {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const switchRole = () => {
      const newRole = currentUser.role === Role.STUDENT ? Role.SUPERVISOR : Role.STUDENT;
      const newUser = users.find(u => u.role === newRole);
      if (newUser) setCurrentUser(newUser);
  };

  const handleAddReport = (reportData: Omit<Report, 'id' | 'submittedAt'>) => {
    const newReport: Report = {
      ...reportData,
      id: `r${Date.now()}`,
      submittedAt: new Date().toISOString()
    };
    setReports(prev => [...prev, newReport]);
  };

  const handleAddGoal = (goalData: Omit<Goal, 'id' | 'progress' | 'status'>) => {
      const newGoal: Goal = {
          ...goalData,
          id: `g${Date.now()}`,
          status: GoalStatus.NOT_STARTED,
          progress: 0
      };
      setGoals(prev => [...prev, newGoal]);
  };

  const handleUpdateGoal = (updatedGoal: Goal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const handleDeleteGoal = (goalId: string) => {
      setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const handleAddResource = (resourceData: Omit<Resource, 'id' | 'uploadDate' | 'uploadedBy'>) => {
    const newResource: Resource = {
      ...resourceData,
      id: `res${Date.now()}`,
      uploadedBy: currentUser.id,
      uploadDate: new Date().toISOString()
    };
    setResources(prev => [...prev, newResource]);
  };

  const handleAddEvaluation = (evalData: Omit<Evaluation, 'id'>) => {
    const newEval: Evaluation = {
        ...evalData,
        id: `e${Date.now()}`
    };
    setEvaluations(prev => [...prev, newEval]);
  };

  const handleSendMessage = (msgData: Omit<Message, 'id' | 'timestamp'>) => {
      const newMsg: Message = {
          ...msgData,
          id: `m${Date.now()}`,
          timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMsg]);
  };

  const handleScheduleMeeting = (meetingData: Omit<Meeting, 'id'>) => {
      const newMeeting: Meeting = {
          ...meetingData,
          id: `mt${Date.now()}`
      };
      setMeetings(prev => {
          const updatedMeetings = [...prev, newMeeting];
          
          // Check for Networking Ninja Badge (3 meetings)
          newMeeting.attendees.forEach(attendeeId => {
              const meetingCount = updatedMeetings.filter(m => m.attendees.includes(attendeeId)).length;
              if (meetingCount >= 3) {
                  awardBadge(attendeeId, 'b3'); // b3 = Networking Ninja
              }
          });
          
          return updatedMeetings;
      });
  };

  const handleSendNotification = (notifData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotif: Notification = {
          ...notifData,
          id: `n${Date.now()}`,
          timestamp: new Date().toISOString(),
          read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleAddSkillAssessment = (assessmentData: Omit<SkillAssessment, 'id'>) => {
    const newAssessment: SkillAssessment = {
        ...assessmentData,
        id: `sa${Date.now()}`
    };
    setSkillAssessments(prev => [...prev, newAssessment]);
  };

  const handleAddSkill = (skillData: Omit<Skill, 'id'>) => {
    const newSkill: Skill = {
        ...skillData,
        id: `s${Date.now()}`
    };
    setSkills(prev => [...prev, newSkill]);
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  };

  const handleAddLeaveRequest = (requestData: Omit<LeaveRequest, 'id' | 'status'>) => {
      const newRequest: LeaveRequest = {
          ...requestData,
          id: `lr${Date.now()}`,
          status: LeaveStatus.PENDING
      };
      setLeaveRequests(prev => [...prev, newRequest]);
  };

  const handleUpdateLeaveStatus = (requestId: string, status: LeaveStatus) => {
      setLeaveRequests(prev => prev.map(lr => lr.id === requestId ? { ...lr, status } : lr));
  };
  
  const handleAddSiteVisit = (visitData: Omit<SiteVisit, 'id'>) => {
      const newVisit: SiteVisit = {
          ...visitData,
          id: `sv${Date.now()}`
      };
      setSiteVisits(prev => [...prev, newVisit]);
  };

  const handleUpdateSiteVisit = (updatedVisit: SiteVisit) => {
      setSiteVisits(prev => prev.map(sv => sv.id === updatedVisit.id ? updatedVisit : sv));
  };

  const handleDeleteSiteVisit = (visitId: string) => {
      setSiteVisits(prev => prev.filter(sv => sv.id !== visitId));
  };

  const handleAddAttendanceException = (exceptionData: Omit<AttendanceException, 'id'>) => {
      const newException: AttendanceException = {
          ...exceptionData,
          id: `ae${Date.now()}`
      };
      setAttendanceExceptions(prev => [...prev, newException]);
  };

  const handleDeleteAttendanceException = (id: string) => {
      setAttendanceExceptions(prev => prev.filter(ae => ae.id !== id));
  };

  const myNotifications = useMemo(() => {
      return notifications.filter(n => n.recipientId === 'ALL' || n.recipientId === currentUser.id)
          .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications, currentUser.id]);
  
  const unreadCount = myNotifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
               <img src="https://i.postimg.cc/xdsSw8X5/DEEP_SHIFT_LOGOOO.png" alt="Deep Shift Logo" className="h-10 w-auto" />
               <span className="text-xl font-bold text-slate-900 tracking-tight hidden md:block">{APP_NAME}</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative" ref={notifDropdownRef}>
                    <button 
                        onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                        className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-colors"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                            </span>
                        )}
                    </button>

                    {isNotifDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 py-2 animate-in fade-in zoom-in-95 z-50">
                            <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={() => setNotifications(prev => prev.map(n => ({...n, read:true})))} className="text-xs text-indigo-600 hover:underline">
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {myNotifications.length === 0 ? (
                                    <div className="p-4 text-center text-slate-400 text-sm">No notifications</div>
                                ) : (
                                    myNotifications.map(notif => (
                                        <div 
                                            key={notif.id} 
                                            className={`px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none cursor-pointer ${!notif.read ? 'bg-indigo-50/50' : ''}`}
                                            onClick={() => markNotificationRead(notif.id)}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-1 flex-shrink-0 p-1.5 rounded-full h-fit ${notif.type === NotificationType.ANNOUNCEMENT ? 'bg-purple-100 text-purple-600' : notif.type === NotificationType.ALERT ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {notif.type === NotificationType.ANNOUNCEMENT ? <Megaphone size={14}/> : notif.type === NotificationType.ALERT ? <X size={14}/> : <Info size={14}/>}
                                                </div>
                                                <div>
                                                    <h4 className={`text-sm ${!notif.read ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>{notif.title}</h4>
                                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                                    <span className="text-[10px] text-slate-400 mt-1 block">
                                                        {new Date(notif.timestamp).toLocaleDateString()} • {new Date(notif.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-medium text-slate-900">{currentUser.name}</span>
                    <span className="text-xs text-slate-500 font-mono uppercase">{currentUser.role}</span>
                </div>
                <img 
                    src={currentUser.avatar} 
                    alt="Profile" 
                    className="h-10 w-10 rounded-full ring-2 ring-white shadow-sm"
                />
                <div className="h-8 w-px bg-slate-200 mx-2"></div>
                <button 
                    onClick={switchRole}
                    className="text-xs bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                    Switch Persona
                </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentUser.role === Role.STUDENT ? (
            <StudentPortal 
                user={currentUser} 
                users={users}
                logs={logs} 
                tasks={tasks} 
                reports={reports}
                goals={goals}
                resources={resources}
                evaluations={evaluations}
                messages={messages}
                meetings={meetings}
                skills={skills}
                skillAssessments={skillAssessments}
                badges={badges}
                userBadges={userBadges}
                leaveRequests={leaveRequests}
                siteVisits={siteVisits}
                onAddLog={handleAddLog}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onAddReport={handleAddReport}
                onUpdateGoal={handleUpdateGoal}
                onSubmitDeliverable={handleSubmitDeliverable}
                onSendMessage={handleSendMessage}
                onAddSkillAssessment={handleAddSkillAssessment}
                onUpdateProfile={handleUpdateProfile}
                onAddLeaveRequest={handleAddLeaveRequest}
            />
        ) : (
            <SupervisorPortal 
                user={currentUser}
                users={users}
                logs={logs}
                tasks={tasks}
                reports={reports}
                goals={goals}
                resources={resources}
                evaluations={evaluations}
                messages={messages}
                meetings={meetings}
                skills={skills}
                skillAssessments={skillAssessments}
                badges={badges}
                userBadges={userBadges}
                leaveRequests={leaveRequests}
                siteVisits={siteVisits}
                attendanceExceptions={attendanceExceptions}
                onApproveLog={handleApproveLog}
                onAddTask={handleAddTask}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onAddIntern={handleAddIntern}
                onUpdateIntern={handleUpdateIntern}
                onAddGoal={handleAddGoal}
                onUpdateGoal={handleUpdateGoal}
                onDeleteGoal={handleDeleteGoal}
                onAddResource={handleAddResource}
                onGiveFeedback={handleGiveFeedback}
                onAddEvaluation={handleAddEvaluation}
                onSendMessage={handleSendMessage}
                onScheduleMeeting={handleScheduleMeeting}
                onAddSkillAssessment={handleAddSkillAssessment}
                onAddSkill={handleAddSkill}
                onSendNotification={handleSendNotification}
                onUpdateLeaveStatus={handleUpdateLeaveStatus}
                onAddSiteVisit={handleAddSiteVisit}
                onUpdateSiteVisit={handleUpdateSiteVisit}
                onDeleteSiteVisit={handleDeleteSiteVisit}
                onAddAttendanceException={handleAddAttendanceException}
                onDeleteAttendanceException={handleDeleteAttendanceException}
            />
        )}
      </main>
    </div>
  );
}

export default App;
