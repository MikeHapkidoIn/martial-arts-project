import { useState, useEffect, useCallback } from 'react';

export const useSearch = (searchFunction, delay = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay]);

  // Execute search when debounced term changes
  useEffect(() => {
    if (searchFunction) {
      searchFunction(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchFunction]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  return {
    searchTerm,
    handleSearch,
    clearSearch
  };
};