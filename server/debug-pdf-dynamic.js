
(async () => {
    try {
        const pkg = await import('pdf-parse');
        console.log('Dynamic Import Result:', pkg);
        console.log('Default:', pkg.default);
        console.log('Type of Default:', typeof pkg.default);
    } catch (e) {
        console.error(e);
    }
})();
