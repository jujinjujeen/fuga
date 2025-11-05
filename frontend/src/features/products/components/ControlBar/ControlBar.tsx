import { AddButton } from './AddButton';
import { SearchBar } from './SearchBar';

interface IControlBar {
  onAdd: () => void;
}

export const ControlBar: React.FC<IControlBar> = ({ onAdd }) => {
  return (
    <div className="sticky top-0 z-10 glass border-b border-white/20 shadow-lg animate-slide-in-up">
      <div className="flex items-center gap-3 p-4 sm:p-5 max-w-7xl mx-auto">
        <SearchBar />
        <AddButton onAdd={onAdd} />
      </div>
    </div>
  );
};
