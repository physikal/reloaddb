import { LayoutGrid, List } from 'lucide-react';
import { Button } from './Button';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <Button
        variant={view === 'grid' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className="flex items-center"
      >
        <LayoutGrid className="w-4 h-4 mr-2" />
        Grid
      </Button>
      <Button
        variant={view === 'list' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className="flex items-center"
      >
        <List className="w-4 h-4 mr-2" />
        List
      </Button>
    </div>
  );
}