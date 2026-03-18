import React, { forwardRef } from 'react';
import Logo from '@/assets/Logo.png';

export const ServiceForm = forwardRef<HTMLDivElement, any>((props, ref) => {
    return (
        <>
            <style type="text/css" media="print">
                {`
                @page { 
                    margin: 0; 
                    size: A4;
                }
                body { 
                    margin: 0; 
                    -webkit-print-color-adjust: exact;
                }
                `}
            </style>
            <div ref={ref} className="bg-[#FFF9F0] text-[#1A1A1A] p-[60px] max-w-[210mm] mx-auto min-h-[297mm] relative print:w-screen print:h-screen print:max-w-none print:m-0 print:p-[60px] font-sans flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-10 border-b-2 border-[#F4D03F]/10 pb-8">
                    <div className="flex items-center gap-6">
                        <img src={Logo} alt="BeeYield Logo" className="h-[140px] w-auto" />
                        <div className="flex flex-col">
                            <span className="text-[28px] font-black tracking-tight text-[#0F172A] leading-none">BeeYield</span>
                            <span className="text-[11px] font-bold text-[#B48428] mt-1.5">Partner in pollination</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-gray-300">Service Dept.</span>
                    </div>
                </div>

                {/* Title Section */}
                <div className="mb-10">
                    <h1 className="text-2xl font-[900] text-[#0F172A] tracking-tight mb-1">Service form</h1>
                    <p className="text-gray-400 font-medium text-[13px]">Fill in and include with the shipment.</p>
                </div>

                {/* Form Fields - Figma-perfect grid/linear alignment */}
                <div className="space-y-7 flex-1">

                    {/* Full Name */}
                    <div className="flex items-end">
                        <div className="w-[180px] shrink-0">
                            <span className="text-[13px] font-bold text-[#0F172A]">Full name</span>
                        </div>
                        <div className="flex-1 border-b border-[#F4D03F]/40 h-5"></div>
                    </div>

                    {/* Email */}
                    <div className="flex items-end">
                        <div className="w-[180px] shrink-0">
                            <span className="text-[13px] font-bold text-[#0F172A]">Email</span>
                        </div>
                        <div className="flex-1 border-b border-[#F4D03F]/40 h-5"></div>
                    </div>

                    {/* Phone number */}
                    <div className="flex items-end">
                        <div className="w-[180px] shrink-0">
                            <span className="text-[13px] font-bold text-[#0F172A]">Phone number</span>
                        </div>
                        <div className="flex-1 border-b border-[#F4D03F]/40 h-5"></div>
                    </div>

                    {/* Device short id / serial */}
                    <div className="flex items-end">
                        <div className="w-[180px] shrink-0">
                            <span className="text-[13px] font-bold text-[#0F172A]">Device short id / serial</span>
                        </div>
                        <div className="flex-1 border-b border-[#F4D03F]/40 h-5"></div>
                    </div>

                    {/* Issue description */}
                    <div className="flex pt-1 mt-1">
                        <div className="w-[180px] shrink-0 pt-0.5">
                            <span className="text-[13px] font-bold text-[#0F172A]">Issue description</span>
                        </div>
                        <div className="flex-1 space-y-7">
                            <div className="border-b border-[#F4D03F]/40 h-4 w-full"></div>
                            <div className="border-b border-[#F4D03F]/40 h-4 w-full"></div>
                        </div>
                    </div>

                    {/* Return address */}
                    <div className="flex pt-1 mt-1">
                        <div className="w-[180px] shrink-0 pt-0.5">
                            <span className="text-[13px] font-bold text-[#0F172A]">Return address</span>
                        </div>
                        <div className="flex-1 space-y-7">
                            <div className="border-b border-[#F4D03F]/40 h-4 w-full"></div>
                            <div className="border-b border-[#F4D03F]/40 h-4 w-full"></div>
                        </div>
                    </div>

                    {/* Preferred contact */}
                    <div className="flex items-end">
                        <div className="w-[180px] shrink-0">
                            <span className="text-[13px] font-bold text-[#0F172A]">Preferred contact</span>
                        </div>
                        <div className="flex-1 border-b border-[#F4D03F]/40 h-5"></div>
                    </div>

                    {/* Date */}
                    <div className="flex items-end">
                        <div className="w-[180px] shrink-0">
                            <span className="text-[13px] font-bold text-[#0F172A]">Date</span>
                        </div>
                        <div className="flex-1 border-b border-[#F4D03F]/40 h-5"></div>
                    </div>

                    {/* Signature */}
                    <div className="flex items-end pt-2">
                        <div className="w-[180px] shrink-0">
                            <span className="text-[13px] font-bold text-[#0F172A]">Signature</span>
                        </div>
                        <div className="flex-1 border-b border-[#F4D03F]/40 h-5"></div>
                    </div>

                </div>

                {/* Footer Address - Exact Spacing */}
                <div className="mt-12 pt-8 border-t border-gray-50 flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-[11px] font-[900] text-gray-400 mb-2">Service address</p>
                        <p className="text-[15px] font-black text-[#0F172A]">BeeYield</p>
                        <p className="text-[13px] text-gray-500 font-medium">Kibwezi, Kenya</p>
                    </div>
                    <div className="text-right text-[12px] text-gray-400 font-medium">
                        <p>info@beeyield.com</p>
                        <p>+1 (800) 123-4567</p>
                    </div>
                </div>
            </div>
        </>
    );
});

ServiceForm.displayName = 'ServiceForm';
