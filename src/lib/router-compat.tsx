/**
 * Compatibility layer that exposes a react-router-dom-like API on top of
 * TanStack Router. Aliased as "react-router-dom" in vite.config.ts /
 * tsconfig.json so ported components keep working unchanged.
 */
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import {
  Link as TanstackLink,
  useNavigate as useTanstackNavigate,
  useParams as useTanstackParams,
  useRouterState,
} from "@tanstack/react-router";

export type To = string;

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: To;
  replace?: boolean;
  state?: unknown;
  children?: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, replace, state: _state, ...rest },
  ref,
) {
  return <TanstackLink ref={ref} to={to} replace={replace} {...(rest as Record<string, unknown>)} />;
});

export interface NavLinkProps extends Omit<LinkProps, "className" | "style"> {
  className?: string | ((props: { isActive: boolean; isPending: boolean }) => string);
  style?: React.CSSProperties;
  end?: boolean;
}

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink(
  { to, className, end, ...rest },
  ref,
) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const target = String(to).split("?")[0];
  const isActive = end ? pathname === target : pathname === target || pathname.startsWith(`${target}/`);
  const resolved =
    typeof className === "function" ? className({ isActive, isPending: false }) : className;
  return (
    <TanstackLink ref={ref} to={to} className={resolved} {...(rest as Record<string, unknown>)} />
  );
});

export function useNavigate() {
  const navigate = useTanstackNavigate();
  return (to: To | number, options?: { replace?: boolean; state?: unknown }) => {
    if (typeof to === "number") {
      if (typeof window !== "undefined") window.history.go(to);
      return;
    }
    navigate({ to, replace: options?.replace } as never);
  };
}

export function useLocation() {
  return useRouterState({ select: (s) => s.location });
}

export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  return useTanstackParams({ strict: false } as never) as T;
}

export function useSearchParams(): [URLSearchParams, (next: URLSearchParams | Record<string, string>) => void] {
  const search = useRouterState({ select: (s) => s.location.searchStr ?? "" });
  const navigate = useTanstackNavigate();
  const params = new URLSearchParams(search);
  const setParams = (next: URLSearchParams | Record<string, string>) => {
    const nextParams = next instanceof URLSearchParams ? next : new URLSearchParams(next);
    navigate({ search: Object.fromEntries(nextParams.entries()) } as never);
  };
  return [params, setParams];
}
