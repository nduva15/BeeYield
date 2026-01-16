import { Link as RRDLink, useLocation as RRDUseLocation, useNavigate as RRDUseNavigate, useParams as RRDUseParams, useSearchParams as RRDUseSearchParams } from 'react-router-dom';
import React from 'react';

export const Link = RRDLink;
export const useLocation = RRDUseLocation;
export const useNavigate = RRDUseNavigate;
export const useParams = RRDUseParams;
export const useSearch = () => {
    const [searchParams] = RRDUseSearchParams();
    return Object.fromEntries(searchParams.entries());
};
export const isRedirect = (obj: any) => false;
export const useMatch = () => ({ params: {} });
export const useLoaderData = () => ({});
export const useActionData = () => ({});
export const Outlet = () => null;
export const createFileRoute = () => () => () => null;
export const createRootRoute = () => null;
export const createRouter = () => null;
export const RouterProvider = () => null;
export const useRouter = () => ({
    navigate: () => { },
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
