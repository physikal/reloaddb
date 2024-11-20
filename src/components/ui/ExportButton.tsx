import { Download } from 'lucide-react';
import { Button } from './Button';

interface ExportButtonProps {
  onExport: () => void;
  label?: string;
}

export function ExportButton({ onExport, label = 'Export to Excel' }: ExportButtonProps) {
  return (
    <Button
      onClick={onExport}
      variant="secondary"
      size="sm"
      className="text-gray-700 hover:text-gray-900"
    >
      <Download className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}