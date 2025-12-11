
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

console.log("Attempting to load pdfjs-dist...");

try {
    // Just accessing the library might trigger the polyfill check
    console.log("pdfjsLib loaded:", !!pdfjsLib);

    // Create a dummy loading task to see if it initializes the worker/environment
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array([0]) });

    loadingTask.promise.then(() => {
        console.log("Document loaded (unexpected for empty data, but no crash is good)");
    }).catch(err => {
        console.log("Expected error (invalid PDF) but no crash:", err.message);
    });

} catch (e) {
    console.error("CRASHED:", e);
}
