import { Heart } from 'lucide-react';
import { Button } from './Button';

export function DonateButton() {
  const handleDonate = () => {
    const paypalUrl = `https://www.paypal.com/donate/?business=boody%40physikal.com&no_recurring=0&item_name=Support+ReloadDB+Development&currency_code=USD`;
    window.open(paypalUrl, '_blank');
  };

  return (
    <Button
      onClick={handleDonate}
      variant="ghost"
      size="sm"
      className="text-primary-600 hover:text-primary-700"
    >
      <Heart className="w-4 h-4 mr-2" />
      Donate
    </Button>
  );
}