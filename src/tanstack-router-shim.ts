import { Link as RRDLink, useLocation as RRDUseLocation, useNavigate as RRDUseNavigate, useParams as RRDUseParams, useSearchParams as RRDUseSearchParams } from 'react-router-dom';
import React from 'react';

export const Link = RRDLink;
export const useLocation = RRDUseLocation;
export const useNavigate = RRDUseNavigate;

export const useParams = <T extends Record<string, any> = any>(opts?: any): T => {
    return RRDUseParams() as T;
};

export const useSearch = <T extends Record<string, any> = any>(opts?: any): T => {
    const [searchParams] = RRDUseSearchParams();
    return Object.fromEntries(searchParams.entries()) as any;
};

export const isRedirect = (obj?: any) => false;
export const useMatch = (opts?: any): any => ({ params: {} });
export const useLoaderData = <T = any>(opts?: any): T => ({} as T);
export const useActionData = <T = any>(opts?: any): T => ({} as T);
export const Outlet = (props?: any) => null;
export const HeadContent = (props?: any) => null;
export const Scripts = (props?: any) => null;
export const Meta = (props?: any) => null;

const genericRoute = {
    useParams: <T extends Record<string, any> = any>(opts?: any): T => RRDUseParams() as T,
    useSearch: <T extends Record<string, any> = any>(opts?: any): T => {
        const [searchParams] = RRDUseSearchParams();
        return Object.fromEntries(searchParams.entries()) as any;
    },
    useLoaderData: <T = any>(opts?: any): T => ({} as T),
    useActionData: <T = any>(opts?: any): T => ({} as T),
    useMatch: (opts?: any): any => ({ params: {} }),
    useNavigate: (opts?: any) => {
        const navigate = RRDUseNavigate();
        return navigate;
    },
};

export const createFileRoute = (path?: any) => (opts?: any) => ({
    ...genericRoute,
    ...opts,
});

export const createRootRoute = (opts?: any) => ({
    ...genericRoute,
    ...opts,
});

export const createRouter = (opts?: any) => ({
    ...genericRoute,
});

export const RouterProvider = (props?: any) => null;

export const useRouter = () => ({
    navigate: (opts?: any) => { },
    state: {},
});

// TanStack Start Shims
// (no debug logs)

export const createServerFn = (options?: any) => {
    const result: any = async (data: any) => {
        if (result._handler) {
            // Note: In TanStack Start, the handler receives an object with 'data'
            // If the user called fn({ data: value }), then data is { data: value }
            // Our handler in traceability.ts expects { data: code }
            return result._handler(data);
        }
        return Promise.resolve();
    };

    result.middleware = (m: any) => {
        return result;
    };
    result.validator = (v: any) => {
        return result;
    };
    result.inputValidator = (v: any) => {
        return result;
    };
    result._handler = null;
    result.handler = (h: any) => {
        result._handler = h;
        return result;
    };

    return result;
};

export const createMiddleware = () => {
    const result: any = {
        middleware: (m: any) => result,
        handler: (h: any) => h,
    };
    return result;
};

export const registerGlobalMiddleware = () => {
};
