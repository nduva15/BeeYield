import React from 'react';
import SettingsPage from './lovable_ai/SettingsPage';

interface SettingsViewProps {
  onTabChange?: (tab: string) => void;
  embedded?: boolean;
}

export default function SettingsView({ onTabChange, embedded = true }: SettingsViewProps) {
  return (
    <SettingsPage
      isOpen={true}
      onClose={() => onTabChange?.('home')}
      embedded={embedded}
    />
  );
}
