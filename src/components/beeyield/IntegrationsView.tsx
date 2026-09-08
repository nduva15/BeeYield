import React from 'react';
import IntegrationsModal from './lovable_ai/IntegrationsModal';

const IntegrationsView: React.FC = () => {
  return (
    <div className="w-full">
      <IntegrationsModal isOpen={true} onClose={() => {}} embedded={true} />
    </div>
  );
};

export default IntegrationsView;
