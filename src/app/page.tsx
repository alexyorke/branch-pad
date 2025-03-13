"use client";

import { useState, useEffect } from "react";

declare global {
  interface Window {
    loadPyodide: any;
  }
}

export default function Home() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initPyodide() {
      try {
        setLoading(true);
        // Load Pyodide script
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
        document.head.appendChild(script);

        script.onload = async () => {
          try {
            const pyodideInstance = await window.loadPyodide({
              indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
            });
            setPyodide(pyodideInstance);
          } catch (err) {
            console.error("Error loading Pyodide:", err);
            setError("Failed to initialize Python environment");
          } finally {
            setLoading(false);
          }
        };

        script.onerror = () => {
          setError("Failed to load Pyodide script");
          setLoading(false);
        };
      } catch (err) {
        setError("Failed to load Python environment");
        console.error(err);
        setLoading(false);
      }
    }
    initPyodide();

    // Cleanup
    return () => {
      const script = document.querySelector('script[src*="pyodide.js"]');
      if (script) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const runCode = async () => {
    if (!pyodide) return;

    setError(null);
    setOutput("");

    try {
      // Redirect stdout to capture print statements
      await pyodide.runPythonAsync(`
        import sys
        from io import StringIO
        sys.stdout = StringIO()
      `);

      // Run the user's code
      await pyodide.runPythonAsync(code);

      // Get the captured output
      const stdout = await pyodide.runPythonAsync("sys.stdout.getvalue()");
      setOutput(stdout as string);

      // Reset stdout
      await pyodide.runPythonAsync("sys.stdout = sys.__stdout__");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center gap-8 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-2xl w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">Python Code Input</h1>

        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Enter your Python code below. You can include:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>Functions and classes</li>
            <li>Data structures and algorithms</li>
            <li>Any valid Python syntax</li>
          </ul>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-64 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="# Enter your Python code here
def example():
    return 'Hello, World!'

print(example())"
        />

        <div className="flex justify-end">
          <button
            onClick={runCode}
            disabled={loading || !pyodide}
            className={`px-4 py-2 rounded-lg font-medium text-white ${
              loading || !pyodide
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Loading Python..." : "Run Code"}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <pre className="text-red-600 dark:text-red-400 text-sm whitespace-pre-wrap font-mono">
              {error}
            </pre>
          </div>
        )}

        {output && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-sm font-semibold mb-2">Output:</h2>
            <pre className="text-sm whitespace-pre-wrap font-mono">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
