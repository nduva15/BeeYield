import React from 'react';
import MeasurementDataTools from '@/components/beeyield/lovable_ai/MeasurementDataTools';

export default function MeasurementData() {
    return (
        <div className="min-h-screen bg-[#FAF9F5] p-4 md:p-8">
            <MeasurementDataTools isOpen={true} onClose={() => {}} embedded={true} />
        </div>
    );
}
