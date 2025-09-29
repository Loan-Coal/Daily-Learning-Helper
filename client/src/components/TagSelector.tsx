import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ value, onChange }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (input.length < 1) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    axios.get(`/tags?search=${input}`)
      .then(res => setSuggestions(res.data?.data || []))
      .finally(() => setLoading(false));
  }, [input]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
    }
    setInput('');
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      addTag(input.trim());
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map(tag => (
          <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs flex items-center">
            {tag}
            <button type="button" className="ml-1 text-red-500" onClick={() => removeTag(tag)}>&times;</button>
          </span>
        ))}
      </div>
      <input
        className="border rounded px-2 py-1 w-full"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add tag... (Press Enter to add)"
      />
      {loading && <div className="text-xs text-gray-400 mt-1">Loading...</div>}
      {suggestions.length > 0 && (
        <div className="border rounded bg-white mt-1 shadow absolute z-10 w-full">
          {suggestions.map(tag => (
            <div
              key={tag}
              className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
              onClick={() => addTag(tag)}
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagSelector;
