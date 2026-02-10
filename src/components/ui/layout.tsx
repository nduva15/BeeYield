import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// --- Container Component ---
// Enforces consistent max-width and horizontal padding across the app.
// "Better containers" means having a Single Source of Truth for your page width.

const containerVariants = cva(
    "mx-auto w-full px-4 sm:px-6 lg:px-8",
    {
        variants: {
            size: {
                default: "max-w-7xl", // Standard max-width (1280px)
                sm: "max-w-3xl",      // Reading width
                lg: "max-w-[1600px]", // Dashboard width
                full: "max-w-full",   // Full width
            },
            padding: {
                default: "px-4 sm:px-6 lg:px-8",
                none: "px-0",
                sm: "px-4",
                lg: "px-6 lg:px-12",
            }
        },
        defaultVariants: {
            size: "default",
            padding: "default",
        },
    }
);

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof containerVariants> {
    as?: React.ElementType;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
    ({ className, size, padding, as: Component = "div", ...props }, ref) => {
        return (
            <Component
                ref={ref}
                className={cn(containerVariants({ size, padding, className }))}
                {...props}
            />
        );
    }
);
Container.displayName = "Container";

// --- Section Component ---
// Enforces consistent vertical spacing. "No slop" means consistent rhythm.

const sectionVariants = cva(
    "w-full",
    {
        variants: {
            spacing: {
                default: "py-12 md:py-16 lg:py-24",
                sm: "py-8 md:py-12",
                lg: "py-16 md:py-24 lg:py-32",
                none: "py-0",
            },
            bg: {
                default: "bg-background",
                muted: "bg-muted/50",
                primary: "bg-primary text-primary-foreground",
            }
        },
        defaultVariants: {
            spacing: "default",
            bg: "default",
        },
    }
);

export interface SectionProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sectionVariants> {
    as?: React.ElementType;
}

const Section = React.forwardRef<HTMLDivElement, SectionProps>(
    ({ className, spacing, bg, as: Component = "section", ...props }, ref) => {
        return (
            <Component
                ref={ref}
                className={cn(sectionVariants({ spacing, bg, className }))}
                {...props}
            />
        );
    }
);
Section.displayName = "Section";


// --- Grid Component ---
// "Better columns" means a predictable 12-column grid system.

const gridVariants = cva(
    "grid",
    {
        variants: {
            cols: {
                1: "grid-cols-1",
                2: "grid-cols-1 md:grid-cols-2",
                3: "grid-cols-1 md:grid-cols-3",
                4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
                12: "grid-cols-12", // The master grid
            },
            gap: {
                default: "gap-6 lg:gap-8",
                sm: "gap-4",
                lg: "gap-10",
                none: "gap-0",
            },
            align: {
                start: "items-start",
                center: "items-center",
                end: "items-end",
                stretch: "items-stretch",
            }
        },
        defaultVariants: {
            cols: 3,
            gap: "default",
            align: "stretch",
        },
    }
);

export interface GridProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof gridVariants> { }

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
    ({ className, cols, gap, align, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(gridVariants({ cols, gap, align, className }))}
                {...props}
            />
        );
    }
);
Grid.displayName = "Grid";

// --- Grid Item / Column Component ---
// Allows spanning specific columns within the grid.

const colVariants = cva(
    "",
    {
        variants: {
            span: {
                1: "col-span-1",
                2: "col-span-1 md:col-span-2",
                3: "col-span-1 md:col-span-3",
                4: "col-span-1 md:col-span-4",
                5: "col-span-1 md:col-span-5",
                6: "col-span-1 md:col-span-6", // Half width
                7: "col-span-1 md:col-span-7",
                8: "col-span-1 md:col-span-8", // 2/3 width
                9: "col-span-1 md:col-span-9",
                10: "col-span-1 md:col-span-10",
                11: "col-span-1 md:col-span-11",
                12: "col-span-full", // Full width
            }
        },
        defaultVariants: {
            span: 1,
        },
    }
);

export interface ColProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof colVariants> { }

const Col = React.forwardRef<HTMLDivElement, ColProps>(
    ({ className, span, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(colVariants({ span, className }))}
                {...props}
            />
        );
    }
);
Col.displayName = "Col";

export { Container, Section, Grid, Col };
