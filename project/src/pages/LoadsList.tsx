import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Star } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useLoadsStore } from '../store/loads';
import { LoadCard } from '../components/loads/LoadCard';
import { Button } from '../components/ui/Button';
import { Load } from '../types';
import { LoadFormModal } from '../components/loads/LoadFormModal';

export function LoadsListPage() {
  const { user } = useAuthStore();
  const { loads, loading, error, fetchLoads, deleteLoad, addLoad, updateLoad } = useLoadsStore();
  
  console.log('LoadsList - User:', user?.id);
  console.log('LoadsList - Current loads:', loads);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<Load | undefined>();
  const [selectedCartridge, setSelectedCartridge] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    if (user?.id) {
      console.log('LoadsList - Fetching loads for user:', user.id);
      fetchLoads(user.id);
    }
  }, [user?.id, fetchLoads]);

  const handleCreateLoad = useCallback(
    async (data: Omit<Load, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (user?.id) {
        await addLoad({ ...data, userId: user.id });
      }
    },
    [user?.id, addLoad]
  );

  const handleUpdateLoad = useCallback(
    async (data: Omit<Load, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (selectedLoad?.id) {
        await updateLoad(selectedLoad.id, data);
        setSelectedLoad(undefined);
      }
    },
    [selectedLoad?.id, updateLoad]
  );

  const handleEdit = (load: Load) => {
    setSelectedLoad(load);
    setIsModalOpen(true);
  };

  const handleDuplicate = (load: Load) => {
    const { id, createdAt, updatedAt, ...loadData } = load;
    handleCreateLoad(loadData);
  };

  const handleToggleFavorite = async (load: Load) => {
    await updateLoad(load.id, { favorite: !load.favorite });
  };

  const filteredLoads = loads.filter(load => {
    const matchesSearch = searchTerm === '' || 
      load.cartridge.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.bullet.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCartridge = selectedCartridge === '' || load.cartridge === selectedCartridge;
    const matchesFavorites = !showFavoritesOnly || load.favorite;
    return matchesSearch && matchesCartridge && matchesFavorites;
  });

  const uniqueCartridges = Array.from(new Set(loads.map(load => load.cartridge))).sort();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">My Loads</h1>
          <Button
            variant={showFavoritesOnly ? 'primary' : 'secondary'}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="flex items-center"
          >
            <Star className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            {showFavoritesOnly ? 'Show All' : 'Show Favorites'}
          </Button>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Load
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search loads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <select
          value={selectedCartridge}
          onChange={(e) => setSelectedCartridge(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="">All Cartridges</option>
          {uniqueCartridges.map(cartridge => (
            <option key={cartridge} value={cartridge}>{cartridge}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLoads.map(load => (
          <LoadCard
            key={load.id}
            load={load}
            onEdit={handleEdit}
            onDelete={deleteLoad}
            onDuplicate={handleDuplicate}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>

      <LoadFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLoad(undefined);
        }}
        onSubmit={selectedLoad ? handleUpdateLoad : handleCreateLoad}
        initialData={selectedLoad}
      />
    </div>
  );
}