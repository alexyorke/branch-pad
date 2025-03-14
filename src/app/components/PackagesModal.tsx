"use client";

interface PackagesModalProps {
  packageList: string[];
  onClose: () => void;
}

export function PackagesModal({ packageList, onClose }: PackagesModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Installed Packages</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Search packages..."
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900"
            onChange={(e) => {
              const searchTerm = e.target.value.toLowerCase();
              const filteredPackages = packageList.filter((pkg) =>
                pkg.toLowerCase().includes(searchTerm)
              );
              // TODO: Add state management for filtered packages
            }}
          />
          <div className="mt-4 space-y-1">
            {packageList.map((pkg, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 rounded"
              >
                <code className="font-mono text-sm">{pkg}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
