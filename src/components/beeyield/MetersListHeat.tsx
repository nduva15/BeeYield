import React from 'react';
import MetersListBase from './MetersListBase';

interface MetersListHeatProps {
    onTabChange: (tab: string) => void;
}

const MetersListHeat: React.FC<MetersListHeatProps> = ({ onTabChange }) => {
    return (
        <MetersListBase
            meterType="Heat"
            title="Heat"
            onTabChange={onTabChange}
        />
    );
};

export default MetersListHeat;

