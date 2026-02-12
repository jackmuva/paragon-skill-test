"use client";

import { useState, useEffect } from "react";

interface ParameterSchema {
  type: string;
  description?: string;
  enum?: string[];
  items?: { type: string };
}

interface ActionFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, ParameterSchema>;
    required: string[];
  };
}

interface Action {
  type: string;
  function: ActionFunction;
}

interface ActionsResponse {
  actions: Record<string, Action[]>;
  errors: string[];
}

function ParameterInput({
  name,
  schema,
  isRequired,
  value,
  onChange,
}: {
  name: string;
  schema: ParameterSchema;
  isRequired: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputClassName =
    "mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-500";

  // Handle enum types with a select dropdown
  if (schema.enum && schema.enum.length > 0) {
    return (
      <div className="mb-3">
        <label className="block text-sm">
          <span className="font-mono text-zinc-800 dark:text-zinc-200">{name}</span>
          {isRequired && <span className="ml-1 text-xs text-red-500">*</span>}
          <span className="ml-2 text-zinc-500">({schema.type})</span>
        </label>
        {schema.description && (
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {schema.description}
          </p>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClassName}
          required={isRequired}
        >
          <option value="">Select an option...</option>
          {schema.enum.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Handle boolean types with a select
  if (schema.type === "boolean") {
    return (
      <div className="mb-3">
        <label className="block text-sm">
          <span className="font-mono text-zinc-800 dark:text-zinc-200">{name}</span>
          {isRequired && <span className="ml-1 text-xs text-red-500">*</span>}
          <span className="ml-2 text-zinc-500">({schema.type})</span>
        </label>
        {schema.description && (
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {schema.description}
          </p>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClassName}
          required={isRequired}
        >
          <option value="">Select...</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      </div>
    );
  }

  // Handle number/integer types
  if (schema.type === "number" || schema.type === "integer") {
    return (
      <div className="mb-3">
        <label className="block text-sm">
          <span className="font-mono text-zinc-800 dark:text-zinc-200">{name}</span>
          {isRequired && <span className="ml-1 text-xs text-red-500">*</span>}
          <span className="ml-2 text-zinc-500">({schema.type})</span>
        </label>
        {schema.description && (
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {schema.description}
          </p>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${name}...`}
          className={inputClassName}
          required={isRequired}
          step={schema.type === "integer" ? "1" : "any"}
        />
      </div>
    );
  }

  // Handle array types with a textarea (comma-separated or JSON)
  if (schema.type === "array") {
    return (
      <div className="mb-3">
        <label className="block text-sm">
          <span className="font-mono text-zinc-800 dark:text-zinc-200">{name}</span>
          {isRequired && <span className="ml-1 text-xs text-red-500">*</span>}
          <span className="ml-2 text-zinc-500">(array)</span>
        </label>
        {schema.description && (
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {schema.description}
          </p>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter JSON array, e.g. [&quot;item1&quot;, &quot;item2&quot;]"
          className={`${inputClassName} min-h-[60px] resize-y`}
          required={isRequired}
        />
      </div>
    );
  }

  // Handle object types with a textarea (JSON)
  if (schema.type === "object") {
    return (
      <div className="mb-3">
        <label className="block text-sm">
          <span className="font-mono text-zinc-800 dark:text-zinc-200">{name}</span>
          {isRequired && <span className="ml-1 text-xs text-red-500">*</span>}
          <span className="ml-2 text-zinc-500">(object)</span>
        </label>
        {schema.description && (
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {schema.description}
          </p>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='Enter JSON object, e.g. {"key": "value"}'
          className={`${inputClassName} min-h-[60px] resize-y`}
          required={isRequired}
        />
      </div>
    );
  }

  // Default: string input
  return (
    <div className="mb-3">
      <label className="block text-sm">
        <span className="font-mono text-zinc-800 dark:text-zinc-200">{name}</span>
        {isRequired && <span className="ml-1 text-xs text-red-500">*</span>}
        <span className="ml-2 text-zinc-500">({schema.type || "string"})</span>
      </label>
      {schema.description && (
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {schema.description}
        </p>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${name}...`}
        className={inputClassName}
        required={isRequired}
      />
    </div>
  );
}

function ActionCard({ action }: { action: Action }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [parameterValues, setParameterValues] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; data: unknown } | null>(null);
  const parameterKeys = Object.keys(action.function.parameters?.properties || {});

  const handleParameterChange = (key: string, value: string) => {
    setParameterValues((prev) => ({ ...prev, [key]: value }));
  };

  const buildParameters = () => {
    const params: Record<string, unknown> = {};
    
    for (const key of parameterKeys) {
      const value = parameterValues[key];
      if (value === undefined || value === "") continue;
      
      const schema = action.function.parameters.properties[key];
      
      // Convert values based on type
      if (schema.type === "boolean") {
        params[key] = value === "true";
      } else if (schema.type === "number") {
        params[key] = parseFloat(value);
      } else if (schema.type === "integer") {
        params[key] = parseInt(value, 10);
      } else if (schema.type === "array" || schema.type === "object") {
        try {
          params[key] = JSON.parse(value);
        } catch {
          params[key] = value;
        }
      } else {
        params[key] = value;
      }
    }
    
    return params;
  };

  const handleRunAction = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const parameters = buildParameters();
      
      const response = await fetch("/api/actions/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: action.function.name,
          parameters,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({ success: false, data });
      } else {
        setResult({ success: true, data });
      }
    } catch (error) {
      setResult({
        success: false,
        data: { error: error instanceof Error ? error.message : "Failed to run action" },
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div
        className="flex cursor-pointer items-start justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <h4 className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {action.function.name}
          </h4>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {action.function.description}
          </p>
        </div>
        <button className="ml-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
          <svg
            className={`h-5 w-5 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          {parameterKeys.length > 0 ? (
            <>
              <h5 className="mb-3 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                Parameters
              </h5>
              <div>
                {parameterKeys.map((key) => {
                  const param = action.function.parameters.properties[key];
                  const isRequired = action.function.parameters.required?.includes(key);
                  return (
                    <ParameterInput
                      key={key}
                      name={key}
                      schema={param}
                      isRequired={isRequired}
                      value={parameterValues[key] || ""}
                      onChange={(value) => handleParameterChange(key, value)}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              This action has no parameters.
            </p>
          )}

          <button
            onClick={handleRunAction}
            disabled={isRunning}
            className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isRunning ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Running...
              </span>
            ) : (
              "Run Action"
            )}
          </button>

          {result && (
            <div
              className={`mt-4 rounded-lg p-4 ${
                result.success
                  ? "bg-green-50 dark:bg-green-900/20"
                  : "bg-red-50 dark:bg-red-900/20"
              }`}
            >
              <h5
                className={`mb-2 text-xs font-semibold uppercase ${
                  result.success
                    ? "text-green-700 dark:text-green-400"
                    : "text-red-700 dark:text-red-400"
                }`}
              >
                {result.success ? "Result" : "Error"}
              </h5>
              <pre className="max-h-64 overflow-auto rounded bg-white p-3 text-xs text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function IntegrationSection({
  integration,
  actions,
}: {
  integration: string;
  actions: Action[];
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="mb-8">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mb-4 flex w-full items-center justify-between text-left"
      >
        <h3 className="text-lg font-semibold capitalize text-zinc-900 dark:text-zinc-100">
          {integration.replace(/_/g, " ")}
          <span className="ml-2 text-sm font-normal text-zinc-500">
            ({actions.length} action{actions.length !== 1 ? "s" : ""})
          </span>
        </h3>
        <svg
          className={`h-5 w-5 text-zinc-400 transition-transform ${isCollapsed ? "" : "rotate-180"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!isCollapsed && (
        <div className="grid gap-3">
          {actions.map((action) => (
            <ActionCard key={action.function.name} action={action} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ActionsCatalog() {
  const [actionsData, setActionsData] = useState<ActionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActions() {
      try {
        const response = await fetch("/api/actions");
        if (!response.ok) {
          throw new Error("Failed to fetch actions");
        }
        const data = await response.json();
        setActionsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load actions");
      } finally {
        setIsLoading(false);
      }
    }

    fetchActions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-lg text-zinc-500">Loading actions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  const integrations = Object.entries(actionsData?.actions || {});
  const totalActions = integrations.reduce((sum, [, actions]) => sum + actions.length, 0);

  if (integrations.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="text-lg text-zinc-500">No actions available</div>
        <p className="text-sm text-zinc-400">
          Enable integrations in your{" "}
          <a
            href="https://dashboard.useparagon.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Paragon dashboard
          </a>{" "}
          to see available actions.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          ActionKit Actions
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {totalActions} available action{totalActions !== 1 ? "s" : ""} across{" "}
          {integrations.length} integration{integrations.length !== 1 ? "s" : ""}
        </p>
      </div>

      {integrations.map(([integration, actions]) => (
        <IntegrationSection
          key={integration}
          integration={integration}
          actions={actions}
        />
      ))}
    </div>
  );
}
