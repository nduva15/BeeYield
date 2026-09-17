import React from 'react';
import IntegrationsPage from './lovable_ai/IntegrationsPage';

interface IntegrationsViewProps {
  onTabChange?: (tab: string) => void;
  embedded?: boolean;
}

export default function IntegrationsView({ onTabChange, embedded = true }: IntegrationsViewProps) {
  return (
    <IntegrationsPage
      isOpen={true}
      onClose={() => onTabChange?.('home')}
      embedded={embedded}
    />
  );
}
