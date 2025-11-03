import { Button, Heading } from '@radix-ui/themes';
import { X, Music } from 'lucide-react';

interface SidebarHeaderProps {
  title: string;
  onClose: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  title,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200  bg-gradient-to-r from-indigo-50 to-purple-50  ">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100  rounded-xl">
          <Music
            size={24}
            className="text-indigo-600 "
            aria-hidden="true"
          />
        </div>
        <Heading
          size="5"
          as="h2"
          className="font-semibold text-gray-700 "
        >
          {title}
        </Heading>
      </div>
      <Button
        variant="ghost"
        color="gray"
        onClick={onClose}
        size="2"
        className="shrink-0 cursor-pointer hover:bg-gray-200  rounded-full transition-all"
        aria-label="Close sidebar"
      >
        <X
          size={20}
          aria-hidden="true"
          className="text-black "
        />
      </Button>
    </div>
  );
};
