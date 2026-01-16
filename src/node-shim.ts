export const AsyncLocalStorage = class {
    disable() { }
    getStore() { return undefined; }
    run(store: any, callback: any) { return callback(); }
    exit(callback: any) { return callback(); }
    enterWith(store: any) { }
};
