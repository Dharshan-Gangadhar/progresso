import React, { useState } from 'react';
import { TrackerProvider, useTracker } from './context/TrackerContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DailyTaskView } from './components/DailyTaskView';
import { DashboardView } from './components/DashboardView';
import { MonthlyReportView } from './components/MonthlyReportView';
import { DailyReportView } from './components/DailyReportView';
import { TaskModal } from './components/TaskModal';
import { HabitTemplatesModal } from './components/HabitTemplatesModal';
import { PomodoroModal } from './components/PomodoroModal';
import { DataManagementModal } from './components/DataManagementModal';
import { LoginModal } from './components/LoginModal';
import { Task } from './types';

function MainTrackerApp() {
  const { activeTab, selectedDate } = useTracker();

  // Mobile sidebar drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskModalDate, setTaskModalDate] = useState<string | undefined>(undefined);

  const [isHabitsModalOpen, setIsHabitsModalOpen] = useState(false);
  const [isPomodoroModalOpen, setIsPomodoroModalOpen] = useState(false);
  const [pomodoroTask, setPomodoroTask] = useState<Task | null>(null);
  const [isDataMgmtModalOpen, setIsDataMgmtModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleOpenNewTask = (date?: string) => {
    setTaskToEdit(null);
    setTaskModalDate(date || selectedDate);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setTaskModalDate(task.date);
    setIsTaskModalOpen(true);
  };

  const handleStartFocus = (task: Task) => {
    setPomodoroTask(task);
    setIsPomodoroModalOpen(true);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden text-slate-800 antialiased">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar
          onOpenHabits={() => setIsHabitsModalOpen(true)}
          onOpenPomodoro={() => {
            setPomodoroTask(null);
            setIsPomodoroModalOpen(true);
          }}
          onOpenDataMgmt={() => setIsDataMgmtModalOpen(true)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-64 h-full bg-white shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              onOpenHabits={() => setIsHabitsModalOpen(true)}
              onOpenPomodoro={() => {
                setPomodoroTask(null);
                setIsPomodoroModalOpen(true);
              }}
              onOpenDataMgmt={() => setIsDataMgmtModalOpen(true)}
              onOpenLogin={() => setIsLoginModalOpen(true)}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sleek Top Header */}
        <Header
          onOpenNewTask={() => handleOpenNewTask()}
          onOpenHabits={() => setIsHabitsModalOpen(true)}
          onOpenPomodoro={() => {
            setPomodoroTask(null);
            setIsPomodoroModalOpen(true);
          }}
          onOpenDataMgmt={() => setIsDataMgmtModalOpen(true)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'daily' && (
            <DailyTaskView
              onOpenNewTask={handleOpenNewTask}
              onEditTask={handleEditTask}
              onStartFocusOnTask={handleStartFocus}
            />
          )}

          {activeTab === 'dashboard' && <DashboardView />}

          {activeTab === 'monthly' && (
            <MonthlyReportView onSelectDay={(date) => console.log('Selected day', date)} />
          )}

          {activeTab === 'daily-report' && <DailyReportView />}
        </main>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
        initialDate={taskModalDate}
      />

      <HabitTemplatesModal
        isOpen={isHabitsModalOpen}
        onClose={() => setIsHabitsModalOpen(false)}
      />

      <PomodoroModal
        isOpen={isPomodoroModalOpen}
        onClose={() => {
          setIsPomodoroModalOpen(false);
          setPomodoroTask(null);
        }}
        initialTask={pomodoroTask}
      />

      <DataManagementModal
        isOpen={isDataMgmtModalOpen}
        onClose={() => setIsDataMgmtModalOpen(false)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <TrackerProvider>
      <MainTrackerApp />
    </TrackerProvider>
  );
}
