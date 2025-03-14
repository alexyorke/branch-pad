"use client";

interface ShortcutProps {
  keys: string[];
  description: string;
}

function Shortcut({ keys, description }: ShortcutProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-600 dark:text-gray-300">{description}</span>
      <div className="flex gap-1">
        {keys.map((key, i) => (
          <>
            <kbd
              key={key}
              className="px-2 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            >
              {key}
            </kbd>
            {i < keys.length - 1 && (
              <span className="text-gray-500 dark:text-gray-400">+</span>
            )}
          </>
        ))}
      </div>
    </div>
  );
}

interface KeyboardShortcutsHelpProps {
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ onClose }: KeyboardShortcutsHelpProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[600px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
            Cell Operations
          </h3>
          <Shortcut keys={["Shift", "Enter"]} description="Run cell" />
          <Shortcut
            keys={["Ctrl", "D"]}
            description="Fork cell into new branch"
          />
          <Shortcut keys={["Alt", "C"]} description="Toggle branch collapse" />
          <Shortcut keys={["Alt", "P"]} description="Toggle parameter sweep" />
          <Shortcut keys={["Alt", "S"]} description="Toggle snapshots" />

          <h3 className="font-medium text-gray-700 dark:text-gray-200 mt-6 mb-2">
            Navigation
          </h3>
          <Shortcut
            keys={["Alt", "↑"]}
            description="Navigate to parent branch"
          />
          <Shortcut
            keys={["Alt", "↓"]}
            description="Navigate to child branch"
          />
          <Shortcut
            keys={["Alt", "←"]}
            description="Navigate to previous sibling"
          />
          <Shortcut
            keys={["Alt", "→"]}
            description="Navigate to next sibling"
          />

          <h3 className="font-medium text-gray-700 dark:text-gray-200 mt-6 mb-2">
            Editor
          </h3>
          <Shortcut keys={["Ctrl", "F"]} description="Format code" />
          <Shortcut
            keys={["Ctrl", "Space"]}
            description="Show code completion"
          />
          <Shortcut keys={["Alt", "/"]} description="Toggle line comment" />
        </div>
      </div>
    </div>
  );
}
