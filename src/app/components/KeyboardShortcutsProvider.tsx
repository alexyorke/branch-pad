"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { KeyboardShortcutsHelp } from "./KeyboardShortcutsHelp";

interface KeyboardShortcutsContextType {
  showHelp: () => void;
  hideHelp: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType>({
  showHelp: () => {},
  hideHelp: () => {},
});

export function useKeyboardShortcuts() {
  return useContext(KeyboardShortcutsContext);
}

interface KeyboardShortcutsProviderProps {
  children: ReactNode;
}

export function KeyboardShortcutsProvider({
  children,
}: KeyboardShortcutsProviderProps) {
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const showHelp = useCallback(() => {
    setIsHelpVisible(true);
  }, []);

  const hideHelp = useCallback(() => {
    setIsHelpVisible(false);
  }, []);

  // Listen for '?' key to show help
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        event.key === "?" &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey
      ) {
        event.preventDefault();
        showHelp();
      } else if (event.key === "Escape" && isHelpVisible) {
        hideHelp();
      }
    },
    [isHelpVisible, showHelp, hideHelp]
  );

  // Add global keyboard listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <KeyboardShortcutsContext.Provider value={{ showHelp, hideHelp }}>
      {children}
      {isHelpVisible && <KeyboardShortcutsHelp onClose={hideHelp} />}
    </KeyboardShortcutsContext.Provider>
  );
}
