interface EmptyStateProps {
  message: string;
  icon?: string;
}

export const EmptyState = ({ message, icon = '📭' }: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4" aria-hidden="true">
        {icon}
      </div>
      <p className="text-lg text-gray-600 ">{message}</p>
    </div>
  );
};
