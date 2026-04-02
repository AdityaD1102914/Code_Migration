
/**
 * Provides a global context for managing the current step in a multi-step process.
 *
 * @description
 * This context is needed to:
 * - Track the user's progress across multiple steps (e.g., Upload → Analysis → Migration).
 * - Persist the current step in `localStorage` so it survives page refresh.
 * - Allow any component to access and update the step state using `useStep()`.
 *
 * @usage
 * Wrap your app with `StepProvider` and use `useStep()` in components to read or update the step.
 */
import React, { createContext, useContext, useState, useEffect } from "react";

interface StepContextType {
    currentStep: number;
    setStep: (step: number) => void;
}

const StepContext = createContext<StepContextType | undefined>(undefined);

export const StepProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentStep, setStep] = useState(() => {
        const savedStep = localStorage.getItem("currentStep");
        return savedStep ? Number(savedStep) : 1;
    });

    useEffect(() => {
        localStorage.setItem("currentStep", currentStep.toString());
    }, [currentStep]);

    return (
        <StepContext.Provider value={{ currentStep, setStep }}>
            {children}
        </StepContext.Provider>
    );
};

export const useStep = () => {
    const context = useContext(StepContext);
    if (!context) throw new Error("useStep must be used within StepProvider");
    return context;
};
