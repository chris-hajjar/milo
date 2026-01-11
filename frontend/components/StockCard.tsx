export default function StockCard() {
  return (
    <div className="max-w-md w-full mx-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-2">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Stock Information
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Ask about a stock in the sidebar
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Try asking:
            </p>
            <div className="mt-3 space-y-2">
              <div className="text-sm bg-blue-50 dark:bg-gray-700 rounded-lg px-4 py-2 text-blue-700 dark:text-blue-300">
                "What's the price of AAPL?"
              </div>
              <div className="text-sm bg-indigo-50 dark:bg-gray-700 rounded-lg px-4 py-2 text-indigo-700 dark:text-indigo-300">
                "Get me news about Tesla"
              </div>
              <div className="text-sm bg-purple-50 dark:bg-gray-700 rounded-lg px-4 py-2 text-purple-700 dark:text-purple-300">
                "Show technical indicators for NVDA"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
