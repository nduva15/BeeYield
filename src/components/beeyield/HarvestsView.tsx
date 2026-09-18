import React from 'react';
import HarvestsPage from './lovable_ai/HarvestsPage';

interface HarvestsViewProps {
  onTabChange?: (tab: string, message?: string, action?: string) => void;
  initialParams?: { message?: string; action?: string } | null;
  embedded?: boolean;
}

export default function HarvestsView({ onTabChange, embedded = true }: HarvestsViewProps) {
  return (
    <HarvestsPage
      isOpen={true}
      onClose={() => onTabChange?.('home')}
      embedded={embedded}
      onTabChange={onTabChange}
    />
  );
}
