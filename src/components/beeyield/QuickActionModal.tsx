import React from 'react';
import NewRecordModal from './NewRecordModal';

interface QuickActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialTab?: 'apiary' | 'hive';
}

const QuickActionModal: React.FC<QuickActionModalProps> = ({ 
    isOpen, 
    onClose, 
    onSuccess, 
    initialTab = 'hive' 
}) => {
    return (
        <NewRecordModal
            isOpen={isOpen}
            onClose={onClose}
            onSuccess={onSuccess}
            initialTab={initialTab}
        />
    );
};

export default QuickActionModal;
