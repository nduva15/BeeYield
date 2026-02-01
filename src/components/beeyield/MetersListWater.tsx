import React from 'react';
import MetersListBase from './MetersListBase';

interface MetersListWaterProps {
    onTabChange: (tab: string) => void;
}

const MetersListWater: React.FC<MetersListWaterProps> = ({ onTabChange }) => {
    return (
        <MetersListBase
            meterType="Water"
            title="Water"
            onTabChange={onTabChange}
        />
    );
};

export default MetersListWater;
