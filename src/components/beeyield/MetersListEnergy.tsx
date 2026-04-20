import React from 'react';
import MetersListBase from './MetersListBase';

interface MetersListEnergyProps {
    onTabChange: (tab: string) => void;
}

const MetersListEnergy: React.FC<MetersListEnergyProps> = ({ onTabChange }) => {
    return (
        <MetersListBase
            meterType="Energy"
            title="Energy"
            onTabChange={onTabChange}
        />
    );
};

export default MetersListEnergy;

