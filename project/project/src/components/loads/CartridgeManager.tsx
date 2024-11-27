import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useCartridgesStore } from '../../store/cartridges';
import { useAuthStore } from '../../store/auth';
import { Button } from '../ui/Button';

export function CartridgeManager() {
  const { cartridges, loading, fetchCartridges, addCartridge, deleteCartridge } = useCartridgesStore();
  const { user } = useAuthStore();
  const [newCartridge, setNewCartridge] = useState('');

  useEffect(() => {
    if (user?.id) fetchCartridges(user.id);
  }, [fetchCartridges]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCartridge.trim()) {
      await addCartridge(newCartridge.trim(), user?.id || '');
      setNewCartridge('');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newCartridge}
          onChange={(e) => setNewCartridge(e.target.value)}
          placeholder="Enter new cartridge name"
          className="flex-1"
        />
        <Button type="submit" disabled={!newCartridge.trim()}>
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {cartridges.filter(c => c.userId === user?.id).map((cartridge) => (
            <li key={cartridge.id} className="py-3 flex justify-between items-center">
              <span className="text-gray-900">{cartridge.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteCartridge(cartridge.id)}
                className="text-gray-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}