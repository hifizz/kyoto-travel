import { useState, useEffect } from 'react';

type BreakpointConfig = {
  [key: string]: number; // value is column count
};

// Breakpoints should be defined from smallest to largest
const useBreakpoint = (config: BreakpointConfig, defaultCols: number): number => {
  const [columns, setColumns] = useState(defaultCols);

  useEffect(() => {
    // A map of media query listeners
    const mediaQueryLists: { [key: string]: MediaQueryList } = {};
    const keys = Object.keys(config);

    const handleChange = () => {
      // Get the last matching media query
      const lastMatching = keys
        .slice()
        .reverse()
        .find(key => window.matchMedia(`(min-width: ${key}px)`).matches);
      
      setColumns(lastMatching ? config[lastMatching] : defaultCols);
    };

    // Add listeners for each breakpoint
    keys.forEach(key => {
      const mql = window.matchMedia(`(min-width: ${key}px)`);
      mql.addEventListener('change', handleChange);
      mediaQueryLists[key] = mql;
    });

    // Set initial value
    handleChange();

    return () => {
      // Clean up listeners
      keys.forEach(key => {
        mediaQueryLists[key].removeEventListener('change', handleChange);
      });
    };
  }, [config, defaultCols]);

  return columns;
};

export default useBreakpoint; 