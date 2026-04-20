import React from 'react';
import MetersListBase from './MetersListBase';

interface MetersListOtherProps {
    onTabChange: (tab: string) => void;
}

const MetersListOther: React.FC<MetersListOtherProps> = ({ onTabChange }) => {
    return (
        <MetersListBase
            meterType="Other"
            title="Other"
            onTabChange={onTabChange}
        />
    );
};

export default MetersListOther;

