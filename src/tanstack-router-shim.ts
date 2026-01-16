import { Link as RRDLink, useLocation as RRDUseLocation, useNavigate as RRDUseNavigate, useParams as RRDUseParams, useSearchParams as RRDUseSearchParams } from 'react-router-dom';

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
export const createServerFn = (options: any) => {
    const fn: any = () => { };
    fn.validator = () => fn;
    fn.handler = () => fn;
    return fn;
};
export const Outlet = () => null;
export const createFileRoute = () => () => () => null;
export const createRootRoute = () => null;
export const createRouter = () => null;
export const RouterProvider = () => null;
export const useRouter = () => ({
    navigate: () => { },
});
