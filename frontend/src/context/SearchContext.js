import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext({ q: '', setQ: () => {} });

export const SearchProvider = ({ children }) => {
  const [q, setQ] = useState('');
  return <SearchContext.Provider value={{ q, setQ }}>{children}</SearchContext.Provider>;
};

export const useSearch = () => useContext(SearchContext);
