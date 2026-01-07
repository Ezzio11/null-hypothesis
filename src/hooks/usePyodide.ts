"use client";

import { useEffect, useState, useRef } from "react";

declare global {
  interface Window {
    loadPyodide: any;
    pyodide: any;
  }
}

export default function usePyodide() {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pyodideRef = useRef<any>(null);

  useEffect(() => {
    const initPyodide = async () => {
      try {
        // 1. Load the Script if not present
        if (!document.getElementById("pyodide-script")) {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
          script.id = "pyodide-script";
          script.onload = main;
          document.body.appendChild(script);
        } else {
          main();
        }

        async function main() {
          if (!window.loadPyodide) return;
          
          // 2. Initialize Engine
          if (!pyodideRef.current) {
            const pyodide = await window.loadPyodide();
            // 3. Install Packages (e.g. Pandas)
            await pyodide.loadPackage(["pandas", "numpy"]);
            
            pyodideRef.current = pyodide;
            setIsReady(true);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Pyodide Failed:", err);
        setIsLoading(false);
      }
    };

    initPyodide();
  }, []);

  const runPython = async (code: string) => {
    if (!pyodideRef.current) return "Engine not ready.";
    
    try {
      // Redirect stdout to capture print() statements
      pyodideRef.current.runPython(`
        import sys
        from io import StringIO
        sys.stdout = StringIO()
      `);
      
      // Run user code
      await pyodideRef.current.runPythonAsync(code);
      
      // Get stdout
      const stdout = pyodideRef.current.runPython("sys.stdout.getvalue()");
      return stdout || "[No Output]";
    } catch (err: any) {
      return `Error: ${err.message}`;
    }
  };

  return { isReady, isLoading, runPython };
}