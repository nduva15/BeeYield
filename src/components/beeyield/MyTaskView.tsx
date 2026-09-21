import React from 'react';
import TasksPage from './lovable_ai/TasksPage';

type MyTaskViewProps = {
  onTabChange?: (tab: string, message?: string, action?: string) => void;
};

const MyTaskView: React.FC<MyTaskViewProps> = ({ onTabChange }) => {
  return <TasksPage isOpen={true} onClose={() => onTabChange?.('home')} embedded={true} />;
};

export default MyTaskView;
