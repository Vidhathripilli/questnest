// src/context/SearchContext.js
"use client";
import { createContext, useState, useContext } from 'react';
 
const SearchContext = createContext();
 
export function SearchProvider({ children }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState('dashboard'); // Default page
 
  // Handle search input changes
  const handleSearch = (term) => {
    setSearchTerm(term);
  };
 
  // Update current page context
  const changePage = (pageName) => {    
    setCurrentPage(pageName);
    // Optionally reset search when changing pages
    // setSearchTerm('');
  };
 
  return (
    <SearchContext.Provider value={{
      searchTerm,
      currentPage,
      handleSearch,
      changePage
    }}>
      {children}
    </SearchContext.Provider>
  );
}
 
// Custom hook to use the search context
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
 