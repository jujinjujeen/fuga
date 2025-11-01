interface ErrorMessageProps {
  error: Error;
  onRetry?: () => void;
}

export const ErrorMessage = ({ error, onRetry }: ErrorMessageProps) => {
  return (
    <div
      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-4xl mb-4" aria-hidden="true">
        ❌
      </div>
      <h3
        className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2"
        id="error-title"
      >
        Oops! Something went wrong
      </h3>
      <p className="text-red-600 dark:text-red-300 mb-4" id="error-message">
        {error.message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 dark:bg-red-700 dark:text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
          aria-describedby="error-title error-message"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
