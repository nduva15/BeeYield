import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface InteractiveButtonProps {
    children: React.ReactNode;
    icon?: LucideIcon;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

const InteractiveButton: React.FC<InteractiveButtonProps> = ({
    children,
    icon: Icon,
    onClick,
    variant = 'primary',
    className,
    disabled = false,
    type = 'button'
}) => {
    const variantStyles = {
        primary: 'bg-[hsl(var(--honey-gold))] text-[#1A1A1A] hover:bg-[hsl(var(--pollen-yellow))]',
        secondary: 'bg-[hsl(var(--secondary))] text-[#1A1A1A] hover:bg-[hsl(var(--secondary))]/90',
        ghost: 'bg-transparent border-2 border-[#F4D03F]/20 hover:border-[hsl(var(--honey-gold))]'
    };

    return (
        <Button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "btn-interactive",
                "px-5 py-3 rounded-xl font-semibold",
                "transition-all duration-200",
                variantStyles[variant],
                className
            )}
        >
            <div className="flex items-center gap-2">
                {Icon && <Icon size={18} />}
                <span>{children}</span>
            </div>
        </Button>
    );
};

export default InteractiveButton;
