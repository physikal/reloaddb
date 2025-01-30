import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, FileText } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useChangelogStore } from '../store/changelog';
import { Button } from '../components/ui/Button';
import { ChangelogEntry } from '../types';

function ChangelogEntryForm({ 
  onSubmit, 
  onCancel, 
  initialData 
}: { 
  onSubmit: (data: Omit<ChangelogEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: ChangelogEntry;
}) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [version, setVersion] = useState(initialData?.version || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content, version });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="version" className="block text-sm font-medium text-gray-700">
          Version
        </label>
        <input
          type="text"
          id="version"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          placeholder="e.g., 1.0.0"
          required
        />
      </div>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's new in this version?"
          required
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          placeholder="List the changes, improvements, and fixes..."
          required
          className="font-mono"
        />
      </div>
      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} Entry
        </Button>
      </div>
    </form>
  );
}

export function ChangelogPage() {
  const { user } = useAuthStore();
  const { entries, loading, error, fetchEntries, addEntry, updateEntry, deleteEntry } = useChangelogStore();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ChangelogEntry | undefined>();
  const isAdmin = user?.email === 'boody@physikal.com';

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSubmit = async (data: Omit<ChangelogEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedEntry) {
        await updateEntry(selectedEntry.id, data);
      } else {
        await addEntry(data);
      }
      setIsEditing(false);
      setSelectedEntry(undefined);
    } catch (error) {
      console.error('Error saving changelog entry:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Changelog</h1>
        </div>
        {isAdmin && !isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {isEditing ? (
        <div className="bg-white shadow rounded-lg p-6">
          <ChangelogEntryForm
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsEditing(false);
              setSelectedEntry(undefined);
            }}
            initialData={selectedEntry}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map(entry => (
            <div key={entry.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-semibold text-gray-900">{entry.title}</h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      v{entry.version}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {entry.createdAt.toLocaleDateString()}
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedEntry(entry);
                        setIsEditing(true);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEntry(entry.id)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="mt-4 prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg">
                  {entry.content}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}