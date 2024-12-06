import React, { createContext, useState, ReactNode, useContext } from "react";

// Définition du type pour les clés d'état
type StateKeys = "En retard" | "À faire" | "En cours" | "Progression";

// Définition du type pour le contexte LegendContext
interface LegendContextType {
  activeStates: Record<StateKeys, boolean>;
  setActiveStates: React.Dispatch<
    React.SetStateAction<Record<StateKeys, boolean>>
  >;
}

// Création du contexte avec une valeur initiale null
const LegendContext = createContext<LegendContextType | null>(null);

// Composant Provider pour le contexte
const LegendProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeStates, setActiveStates] = useState<Record<StateKeys, boolean>>({
    "En retard": true,
    "À faire": true,
    "En cours": true,
    Progression: true,
  });

  // Retourner le provider avec les valeurs et les enfants
  return (
    <LegendContext.Provider value={{ activeStates, setActiveStates }}>
      {children}
    </LegendContext.Provider>
  );
};

// Hook personnalisé pour accéder facilement au contexte
const useLegendContext = () => {
  const context = useContext(LegendContext);
  if (!context) {
    throw new Error("useLegendContext must be used within a LegendProvider");
  }
  return context;
};

// Exporter le contexte et le provider
export { LegendProvider, useLegendContext };
