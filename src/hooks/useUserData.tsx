import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { loadUserData, saveUserData } from '../lib/storage';
import type { PaperState, UserData } from '../types';

interface UserDataCtx {
  data: UserData;
  get: (id: string) => PaperState;
  toggleVisited: (id: string) => void;
  toggleStarred: (id: string) => void;
  setMemo: (id: string, memo: string) => void;
  importData: (d: UserData) => void;
  resetAll: () => void;
}

const Ctx = createContext<UserDataCtx | null>(null);

const isEmpty = (s: PaperState) => !s.visited && !s.starred && !s.memo;

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<UserData>(loadUserData);

  const mutate = useCallback((id: string, patch: (prev: PaperState) => PaperState) => {
    setData((prev) => {
      const papers = { ...prev.papers };
      const nextState = patch(papers[id] ?? {});
      if (isEmpty(nextState)) delete papers[id];
      else papers[id] = nextState;
      const next: UserData = { version: 1, updatedAt: new Date().toISOString(), papers };
      saveUserData(next);
      return next;
    });
  }, []);

  const get = useCallback((id: string) => data.papers[id] ?? {}, [data]);
  const toggleVisited = useCallback(
    (id: string) => mutate(id, (s) => ({ ...s, visited: !s.visited })),
    [mutate],
  );
  const toggleStarred = useCallback(
    (id: string) => mutate(id, (s) => ({ ...s, starred: !s.starred })),
    [mutate],
  );
  const setMemo = useCallback(
    (id: string, memo: string) => mutate(id, (s) => ({ ...s, memo: memo || undefined })),
    [mutate],
  );
  const importData = useCallback((d: UserData) => {
    saveUserData(d);
    setData(d);
  }, []);
  const resetAll = useCallback(() => {
    const next: UserData = { version: 1, updatedAt: new Date().toISOString(), papers: {} };
    saveUserData(next);
    setData(next);
  }, []);

  return (
    <Ctx.Provider value={{ data, get, toggleVisited, toggleStarred, setMemo, importData, resetAll }}>
      {children}
    </Ctx.Provider>
  );
}

export function useUserData(): UserDataCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useUserData must be used within UserDataProvider');
  return ctx;
}
