import React, { useState } from 'react';
import { useUpdateDocument, useDeleteDocument } from '../api/documents';
import TagSelector from './TagSelector';

interface Document {
  id: string;
  title: string;
  tags: string[];
  content: string;
}

interface Props {
  document: Document;
  onEdit: (doc: Document) => void;
  onDelete: (id: string) => void;
}

const DocumentCard: React.FC<Props> = ({ document, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState({
    title: document.title,
    tags: document.tags,
    content: document.content,
  });

  const updateMutation = useUpdateDocument();
  const deleteMutation = useDeleteDocument();

  const handleSave = () => {
    updateMutation.mutate(
      { id: document.id, ...form },
      {
        onSuccess: (data) => {
          onEdit(data);
          setIsEditing(false);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(document.id, {
      onSuccess: () => {
        onDelete(document.id);
        setShowDelete(false);
      },
    });
  };

  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      {isEditing ? (
        <div className="space-y-2">
          <input
            className="border rounded px-2 py-1 w-full"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <TagSelector
            value={form.tags}
            onChange={tags => setForm(f => ({ ...f, tags }))}
          />
          <textarea
            className="border rounded px-2 py-1 w-full"
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={3}
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Save</button>
            <button onClick={() => setIsEditing(false)} className="bg-gray-200 px-3 py-1 rounded">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">{document.title}</h3>
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:underline">Edit</button>
              <button onClick={() => setShowDelete(true)} className="text-red-500 hover:underline">Delete</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {document.tags.map(tag => (
              <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{tag}</span>
            ))}
          </div>
          <p className="mt-2 text-gray-700 whitespace-pre-line">{document.content}</p>
        </>
      )}
      {showDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow p-6 w-80">
            <p className="mb-4">Are you sure you want to delete this document?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={handleDelete} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
              <button onClick={() => setShowDelete(false)} className="bg-gray-200 px-3 py-1 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {(updateMutation.isPending || deleteMutation.isPending) && (
        <div className="flex items-center gap-2 mt-2 text-blue-500">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
          Loading...
        </div>
      )}
      {(updateMutation.isError || deleteMutation.isError) && (
        <div className="text-red-500 mt-2">Error: {String(updateMutation.error || deleteMutation.error)}</div>
      )}
    </div>
  );
};

export default DocumentCard;
