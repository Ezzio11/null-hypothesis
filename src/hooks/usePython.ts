import { useState, useEffect, useRef, useCallback } from "react";

declare global {
    interface Window {
        loadPyodide: any;
    }
}

interface UsePythonReturn {
    runPython: (code: string) => Promise<void>;
    output: string[];
    isRunning: boolean;
    isReady: boolean;
    error: string;
    resetOutput: () => void;
}

export function usePython(): UsePythonReturn {
    const [output, setOutput] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState("");
    const pyodideRef = useRef<any>(null);

    // Initialize Pyodide
    useEffect(() => {
        async function initPyodide() {
            if (pyodideRef.current) return;

            try {
                const pyodide = await window.loadPyodide();
                // Pre-load common data science packages
                await pyodide.loadPackage(["numpy", "scipy", "pandas"]);
                pyodideRef.current = pyodide;
                setIsReady(true);
            } catch (e) {
                console.error("Pyodide failed to load", e);
                setError("Failed to load Python engine.");
            }
        }

        const existingScript = document.getElementById("pyodide-script") as HTMLScriptElement;

        if (existingScript) {
            if (window.loadPyodide) initPyodide();
            else existingScript.addEventListener('load', initPyodide);
        } else {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
            script.id = "pyodide-script";
            script.onload = () => initPyodide();
            document.body.appendChild(script);
        }
    }, []);

    const runPython = useCallback(async (code: string) => {
        if (!pyodideRef.current) return;

        setIsRunning(true);
        setError("");
        setOutput([]); // Clear previous output on new run

        try {
            // Capture stdout
            pyodideRef.current.setStdout({
                batched: (msg: string) => setOutput((prev) => [...prev, msg])
            });

            await pyodideRef.current.runPythonAsync(code);
        } catch (err: any) {
            const errorMsg = `Error: ${err.message}`;
            setOutput((prev) => [...prev, errorMsg]);
            setError(errorMsg);
        } finally {
            setIsRunning(false);
        }
    }, []);

    const resetOutput = useCallback(() => {
        setOutput([]);
        setError("");
    }, []);

    return { runPython, output, isRunning, isReady, error, resetOutput };
}
