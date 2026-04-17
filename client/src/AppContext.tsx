import { createContext, useContext, useMemo, useState, ReactNode } from "react";

type AppState = {
  // Add global settings or UI state here
  options: Record<string, unknown>;
  setOption: (key: string, value: unknown) => void;
};

const AppCtx = createContext<AppState | undefined>(undefined);

type AppProviderProps = {
  children: ReactNode;
};

export default function AppContext({ children }: AppProviderProps) {
  const [options, setOptions] = useState<Record<string, unknown>>({});

  const setOption = (key: string, value: unknown) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const value = useMemo(
    () => ({
      options,
      setOption
    }),
    [options]
  );

  return (
    <AppCtx.Provider value={value}>
      {children}
    </AppCtx.Provider>
  );
}

export function useAppContext(): AppState {
  const ctx = useContext(AppCtx);

  if (!ctx) {
    throw new Error("useAppContext must be used inside <AppContext>");
  }

  return ctx;
}