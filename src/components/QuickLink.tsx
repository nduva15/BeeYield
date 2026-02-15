import React, { useCallback, useRef } from 'react';
import { Link, LinkProps } from 'react-router-dom';

interface QuickLinkProps extends LinkProps {
    prefetch?: boolean;
    onPrefetch?: () => void;
}

/**
 * QuickLink is a drop-in replacement for react-router-dom Link 
 * that adds hover-based prefetching for faster page transitions.
 */
export const QuickLink: React.FC<QuickLinkProps> = ({
    to,
    prefetch = true,
    onPrefetch,
    onMouseEnter,
    children,
    ...props
}) => {
    const prefetched = useRef(false);

    const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
        if (onMouseEnter) onMouseEnter(e);

        if (prefetch && !prefetched.current) {
            // 1. Trigger route component prefetch
            if (typeof to === 'string') {
                window.dispatchEvent(new CustomEvent('prefetch-route', { detail: { path: to } }));
            }

            // 2. Trigger data prefetch if provided
            if (onPrefetch) {
                onPrefetch();
            }

            prefetched.current = true;
        }
    }, [to, prefetch, onPrefetch, onMouseEnter]);

    return (
        <Link to={to} onMouseEnter={handleMouseEnter} {...props}>
            {children}
        </Link>
    );
};
