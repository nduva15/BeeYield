/// <reference types="vite/client" />

declare module '*?url' {
    const content: string
    export default content
}
declare module '*.png' {
    const value: string;
    export default value;
}

declare module '*.jpg' {
    const value: string;
    export default value;
}

declare module '*.svg' {
    const value: string;
    export default value;
}
