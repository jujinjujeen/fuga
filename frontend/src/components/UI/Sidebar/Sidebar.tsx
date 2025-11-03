import classNames from 'classnames';
import { useEffect } from 'react';

interface SidebarProps {
  isOpen: boolean;

  onClose: () => void;
  children: React.ReactNode;
  width?: string;
  ariaLabel?: string;
}

/**
 * Generic sidebar component with slide-in animation and backdrop
 * Handles UI concerns only - content is passed as children
 */
export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  children,
  width = 'w-full sm:w-[420px] md:w-[500px]',
  ariaLabel = 'Sidebar',
}) => {
  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={classNames([
          'fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md z-40 transition-all duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ])}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Sidebar Panel */}
      <aside
        className={classNames([
          'fixed top-0 right-0 h-full bg-white shadow-2xl z-50 transform transition-all duration-300 ease-out',
          width,
          isOpen ? 'translate-x-0 scale-100' : 'translate-x-full scale-95',
        ])}
        aria-label={ariaLabel}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </aside>
    </>
  );
};
