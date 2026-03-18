import React from 'react';

export const PageLoader: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] w-full gap-5 animate-in fade-in duration-500">
        <div className="relative">
            <div className="absolute inset-0 bg-beeyield-gold/20 blur-xl rounded-full" />
            <img src="/logo.png" alt="BeeYield" className="h-16 w-16 object-contain relative z-10" />
        </div>
        <div className="text-center">
            <h2 className="text-xl font-black text-beeyield-green tracking-tight">BeeYield</h2>
            <div className="mt-4 flex gap-1 justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-beeyield-gold animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-beeyield-gold animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-beeyield-gold animate-bounce" />
            </div>
        </div>
    </div>
);
