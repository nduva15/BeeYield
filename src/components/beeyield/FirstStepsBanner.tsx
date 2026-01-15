import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FirstStepsBannerProps {
    onTabChange: (tab: string) => void;
}

const FirstStepsBanner: React.FC<FirstStepsBannerProps> = ({ onTabChange }) => {
    const [showBanner, setShowBanner] = useState(true);

    useEffect(() => {
        const bannerHidden = localStorage.getItem('hideBeeYieldBanner');
        if (bannerHidden) {
            setShowBanner(false);
        }
    }, []);

    const hideBanner = () => {
        setShowBanner(false);
        localStorage.setItem('hideBeeYieldBanner', 'true');
    };

    if (!showBanner) return null;

    return (
        <div className="relative bg-[#FFF9F2] dark:bg-[#1C160C] p-8 rounded-[2rem] border border-[#FDE6D2] dark:border-orange-900/20 shadow-sm mb-8">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">First steps</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Start here to set up your apiaries, devices, and measurements.
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={hideBanner}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-medium"
                >
                    Hide
                </Button>
            </div>

            <div className="mt-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">QUICK LINKS</p>
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onTabChange('places')}
                        className="rounded-full bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm text-xs font-semibold px-6"
                    >
                        Add apiaries and hives
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onTabChange('devices')}
                        className="rounded-full bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm text-xs font-semibold px-6"
                    >
                        My devices
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onTabChange('data')}
                        className="rounded-full bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm text-xs font-semibold px-6"
                    >
                        Measurement data
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onTabChange('support')}
                        className="rounded-full bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm text-xs font-semibold px-6"
                    >
                        Support Center
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onTabChange('agro-intelligence')}
                        className="rounded-full bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm text-xs font-semibold px-6"
                    >
                        BeeYield Agro Intelligence
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onTabChange('settings')}
                        className="rounded-full bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm text-xs font-semibold px-6"
                    >
                        Settings
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FirstStepsBanner;
