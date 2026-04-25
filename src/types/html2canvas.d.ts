declare module 'html2canvas' {
  interface Options {
    useCORS?: boolean;
    allowTaint?: boolean;
    scale?: number;
    logging?: boolean;
    [key: string]: unknown;
  }
  export default function html2canvas(
    element: HTMLElement,
    options?: Options
  ): Promise<HTMLCanvasElement>;
}
