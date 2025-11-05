import { AlertDialog, Button, Flex } from '@radix-ui/themes';
import { Trash2 } from 'lucide-react';

interface DeleteProductDialogProps {
  productTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
}

export const DeleteProductDialog = ({
  productTitle,
  isDeleting,
  onConfirm,
}: DeleteProductDialogProps) => {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <Button variant="outline" color="red" type="button">
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>Delete Product</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Are you sure you want to delete <strong>{productTitle}</strong>? This
          action cannot be undone.
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button
              variant="solid"
              color="red"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};
