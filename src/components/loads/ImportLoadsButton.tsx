import { Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import { useRef } from 'react';

interface ImportLoadsButtonProps {
  onImport: (file: File) => Promise<void>;
  label?: string;
}

export function ImportLoadsButton({ onImport, label = 'Import from Excel' }: ImportLoadsButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onImport(file);
      // Reset the input so the same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx,.xls"
        className="hidden"
      />
      <Button
        onClick={handleClick}
        variant="secondary"
        className="flex items-center"
      >
        <Upload className="w-4 h-4 mr-2" />
        {label}
      </Button>
    </>
  );
}