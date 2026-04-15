import React, { createContext, useContext } from 'react';
import { useExecutionStepper } from '@/hooks/useExecutionStepper.hook';

type ExecutionContextType = ReturnType<typeof useExecutionStepper>;

const ExecutionContext = createContext<ExecutionContextType | undefined>(undefined);

export const ExecutionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const stepperState = useExecutionStepper();

    return (
        <ExecutionContext.Provider value={stepperState}>
            {children}
        </ExecutionContext.Provider>
    );
};

export const useExecution = () => {
    const context = useContext(ExecutionContext);
    if (!context) {
        throw new Error('useExecution must be used within an ExecutionProvider');
    }
    return context;
};
