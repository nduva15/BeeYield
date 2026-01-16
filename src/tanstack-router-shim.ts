import { Link as RRDLink, useLocation as RRDUseLocation, useNavigate as RRDUseNavigate, useParams as RRDUseParams, useSearchParams as RRDUseSearchParams } from 'react-router-dom';
import React from 'react';

export const Link = RRDLink;
export const useLocation = RRDUseLocation;
export const useNavigate = RRDUseNavigate;

export const useParams = (opts?: any): any => {
    return RRDUseParams();
};

export const useSearch = (opts?: any): any => {
    const [searchParams] = RRDUseSearchParams();
    return Object.fromEntries(searchParams.entries());
};

export const isRedirect = (obj?: any) => false;
export const useMatch = (opts?: any): any => ({ params: {} });
export const useLoaderData = (opts?: any): any => ({});
export const useActionData = (opts?: any): any => ({});
export const Outlet = (props?: any) => null;
export const HeadContent = (props?: any) => null;
export const Scripts = (props?: any) => null;
export const Meta = (props?: any) => null;

const genericRoute = {
    useParams: (opts?: any): any => RRDUseParams(),
    useSearch: (opts?: any): any => {
        const [searchParams] = RRDUseSearchParams();
        return Object.fromEntries(searchParams.entries());
    },
    useLoaderData: (opts?: any): any => ({}),
    useActionData: (opts?: any): any => ({}),
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
console.log("[Shim] TanStack Router Shim loaded");

export const createServerFn = (options?: any) => {
    console.log("[Shim] createServerFn called with options:", options);
    const result: any = async (data: any) => {
        console.log("[Shim] Running server function handler with data:", data);
        if (result._handler) {
            // Note: In TanStack Start, the handler receives an object with 'data'
            // If the user called fn({ data: value }), then data is { data: value }
            // Our handler in traceability.ts expects { data: code }
            return result._handler(data);
        }
        return Promise.resolve();
    };

    result.middleware = (m: any) => {
        console.log("[Shim] .middleware() called");
        return result;
    };
    result.validator = (v: any) => {
        console.log("[Shim] .validator() called");
        return result;
    };
    result.inputValidator = (v: any) => {
        console.log("[Shim] .inputValidator() called");
        return result;
    };
    result._handler = null;
    result.handler = (h: any) => {
        console.log("[Shim] .handler() registered");
        result._handler = h;
        return result;
    };

    return result;
};

export const createMiddleware = () => {
    console.log("[Shim] createMiddleware called");
    const result: any = {
        middleware: (m: any) => result,
        handler: (h: any) => h,
    };
    return result;
};

export const registerGlobalMiddleware = () => {
    console.log("[Shim] registerGlobalMiddleware called");
};
