try {
    const startConfig = await import('@tanstack/start/config');
    console.log('@tanstack/start/config:', typeof startConfig.defineConfig);
} catch (e) {
    console.log('@tanstack/start/config failed:', e.code || e.message);
}

try {
    const reactStartConfig = await import('@tanstack/react-start/config');
    console.log('@tanstack/react-start/config:', typeof reactStartConfig.defineConfig);
} catch (e) {
    console.log('@tanstack/react-start/config failed:', e.code || e.message);
}
