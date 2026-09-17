import React from 'react';
import InspectionsPage from './lovable_ai/InspectionsPage';

interface InspectionsViewProps {
  onTabChange?: (tab: string) => void;
  embedded?: boolean;
}

export default function InspectionsView({ onTabChange, embedded = true }: InspectionsViewProps) {
  return (
    <InspectionsPage
      isOpen={true}
      onClose={() => onTabChange?.('home')}
      embedded={embedded}
    />
  );
}
