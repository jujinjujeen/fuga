interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner = ({
  message = 'Loading...',
}: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin text-4xl mb-4">🎶</div>
      <p
        className="text-lg text-gray-600 dark:text-gray-400"
        aria-hidden="true"
      >
        {message}
      </p>
    </div>
  );
};
