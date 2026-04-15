import React from 'react';
import { Hive } from '@/services/beeyieldService';
import { GlassModal } from './GlassTheme';
import { HiveForm } from './HiveForm';

interface HiveFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingHive?: Hive | null;
    preselectedApiaryId?: string;
}

const HiveFormModal: React.FC<HiveFormModalProps> = ({ isOpen, onClose, editingHive, preselectedApiaryId }) => {
    return (
        <GlassModal
            isOpen={isOpen}
            onClose={onClose}
            title={editingHive ? 'Edit hive' : 'Add hive'}
            subtitle="Hive registration in progress."
            maxWidth="max-w-xl"
        >
            <HiveForm 
                editingHive={editingHive} 
                preselectedApiaryId={preselectedApiaryId} 
                onSuccess={onClose} 
                onCancel={onClose} 
            />
        </GlassModal>
    );
};

export default HiveFormModal;
