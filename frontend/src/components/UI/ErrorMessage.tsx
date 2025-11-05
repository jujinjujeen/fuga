interface ErrorMessageProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ error, onRetry }: ErrorMessageProps) => {
  return (
    <div
      className="bg-red-50  border border-red-200  rounded-lg p-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-4xl mb-4" aria-hidden="true">
        ❌
      </div>
      <h3
        className="text-lg font-semibold text-red-800  mb-2"
        id="error-title"
      >
        Oops! Something went wrong
      </h3>
      <p className="text-red-600  mb-4" id="error-message">
        {error}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600   px-4 py-2 rounded-lg hover:bg-red-700  transition-colors"
          aria-describedby="error-title error-message"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
