import { Button } from '@radix-ui/themes';

interface SidebarFooterProps {
  onReset: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitDisabled: boolean;
  isSubmitting?: boolean;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  onReset,
  onSubmit,
  isSubmitDisabled,
  isSubmitting = false,
}) => {
  return (
    <div className="border-t border-gray-200 dark:border-gray-800 p-4 sm:p-6 flex gap-3 bg-gray-50 dark:bg-gray-900/50">
      <Button
        type="button"
        variant="soft"
        color="gray"
        onClick={onReset}
        className="flex-1 transition-all hover:scale-105 dark:color-gray-400"
        size="3"
        disabled={isSubmitting}
      >
        Reset
      </Button>
      <Button
        type="submit"
        onClick={onSubmit}
        className="flex-1 shadow-lg hover:shadow-xl transition-all hover:scale-105"
        size="3"
        highContrast
        disabled={isSubmitDisabled || isSubmitting}
        loading={isSubmitting}
      >
        {isSubmitting ? 'Creating...' : 'Create Product'}
      </Button>
    </div>
  );
};
