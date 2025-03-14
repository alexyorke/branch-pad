"use client";

import { useState } from "react";
import { Cell, Parameter, ParameterSweep } from "../types";

interface ParameterSweepModalProps {
  cell: Cell;
  onClose: () => void;
  onRunParameterSweep: (
    cellId: string,
    parameters: Parameter[]
  ) => Promise<void>;
}

export function ParameterSweepModal({
  cell,
  onClose,
  onRunParameterSweep,
}: ParameterSweepModalProps) {
  const [parameters, setParameters] = useState<Parameter[]>(cell.parameters);
  const [isGenerating, setIsGenerating] = useState(false);

  const addParameter = () => {
    setParameters([
      ...parameters,
      {
        name: `param${parameters.length + 1}`,
        type: "number",
        value: 0,
      },
    ]);
  };

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const updateParameter = (index: number, updates: Partial<Parameter>) => {
    setParameters(
      parameters.map((param, i) =>
        i === index ? { ...param, ...updates } : param
      )
    );
  };

  const generateSweepCombinations = (
    parameters: Parameter[]
  ): Parameter[][] => {
    const combinations: Parameter[][] = [];

    const generateCombination = (
      current: Parameter[],
      remainingParams: Parameter[]
    ) => {
      if (remainingParams.length === 0) {
        combinations.push(current);
        return;
      }

      const param = remainingParams[0];
      const rest = remainingParams.slice(1);

      if (param.type === "number" && param.range) {
        const { min = 0, max = 0, step = 1 } = param.range;
        for (let value = min; value <= max; value += step) {
          generateCombination([...current, { ...param, value }], rest);
        }
      } else if (param.options) {
        for (const value of param.options) {
          generateCombination([...current, { ...param, value }], rest);
        }
      } else {
        generateCombination([...current, param], rest);
      }
    };

    generateCombination([], parameters);
    return combinations;
  };

  const runSweep = async () => {
    setIsGenerating(true);
    try {
      await onRunParameterSweep(cell.id, parameters);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[800px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Parameter Sweep</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {parameters.map((param, index) => (
            <div
              key={index}
              className="flex gap-4 items-start p-4 border rounded-lg"
            >
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={param.name}
                  onChange={(e) =>
                    updateParameter(index, { name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Parameter name"
                />

                <select
                  value={param.type}
                  onChange={(e) =>
                    updateParameter(index, {
                      type: e.target.value as Parameter["type"],
                    })
                  }
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="number">Number</option>
                  <option value="string">String</option>
                  <option value="boolean">Boolean</option>
                </select>

                {param.type === "number" && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={param.range?.min ?? 0}
                        onChange={(e) =>
                          updateParameter(index, {
                            range: {
                              ...param.range,
                              min: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="flex-1 px-3 py-2 border rounded"
                        placeholder="Min"
                      />
                      <input
                        type="number"
                        value={param.range?.max ?? 0}
                        onChange={(e) =>
                          updateParameter(index, {
                            range: {
                              ...param.range,
                              max: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="flex-1 px-3 py-2 border rounded"
                        placeholder="Max"
                      />
                      <input
                        type="number"
                        value={param.range?.step ?? 1}
                        onChange={(e) =>
                          updateParameter(index, {
                            range: {
                              ...param.range,
                              step: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="flex-1 px-3 py-2 border rounded"
                        placeholder="Step"
                      />
                    </div>
                  </div>
                )}

                {param.type !== "number" && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={param.options?.join(", ") ?? ""}
                      onChange={(e) =>
                        updateParameter(index, {
                          options: e.target.value
                            .split(",")
                            .map((v) => v.trim())
                            .filter(Boolean),
                        })
                      }
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Options (comma-separated)"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={() => removeParameter(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            onClick={addParameter}
            className="w-full px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded"
          >
            Add Parameter
          </button>

          <div className="mt-6">
            <button
              onClick={runSweep}
              disabled={isGenerating}
              className={`w-full px-4 py-2 text-white rounded ${
                isGenerating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {isGenerating ? "Running..." : "Run Parameter Sweep"}
            </button>
          </div>
        </div>

        {cell.parameterSweeps.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Previous Sweeps</h3>
            <div className="space-y-4">
              {cell.parameterSweeps.map((sweep) => (
                <div key={sweep.id} className="border rounded-lg p-4 space-y-2">
                  <h4 className="font-medium">Sweep {sweep.id}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {sweep.results.map((result, i) => (
                      <div
                        key={i}
                        className="border rounded p-2 text-sm space-y-1"
                      >
                        <div className="font-medium">Run {i + 1}</div>
                        <div className="space-y-1">
                          {Object.entries(result.parameters).map(
                            ([key, value]) => (
                              <div key={key}>
                                {key}: {value}
                              </div>
                            )
                          )}
                        </div>
                        <div className="mt-2 font-mono text-xs whitespace-pre-wrap">
                          {result.output}
                        </div>
                        {result.error && (
                          <div className="text-red-500">{result.error}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
