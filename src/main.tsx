import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Suppress findDOMNode warning from react-quill
// This is a known issue with react-quill v2.0.0 that uses findDOMNode internally
// The warning is harmless but annoying. We suppress it only for this specific warning.
if (import.meta.env.DEV) {
    const originalError = console.error;
    const originalWarn = console.warn;

    const shouldSuppress = (...args: unknown[]): boolean => {
        const firstArg = args[0];
        const message = typeof firstArg === 'string' 
            ? firstArg 
            : (firstArg && typeof firstArg === 'object' && 'message' in firstArg)
                ? String(firstArg.message)
                : String(firstArg || '');

        // Only suppress the specific findDOMNode deprecation warning
        return message.includes('findDOMNode is deprecated') || 
               (message.includes('findDOMNode') && message.includes('deprecated'));
    };

    console.error = (...args: unknown[]) => {
        if (!shouldSuppress(...args)) {
            originalError(...args);
        }
    };

    console.warn = (...args: unknown[]) => {
        if (!shouldSuppress(...args)) {
            originalWarn(...args);
        }
    };
}

createRoot(document.getElementById("root")!).render(<App />);
