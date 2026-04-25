import { useMemo, useRef, useEffect, useState } from 'react';
import { useExecution } from '@/contexts';
import { getActiveExecutionSteps, getExecutionStatusBadge } from '@/utils';

export function useExecutionDebugger(onClose: () => void) {
    const { steps, isExecuting, isFetching, isSimulationDone, globalLogs, resetStepper } = useExecution();
    const timelineScrollRef = useRef<HTMLDivElement>(null);

    const [ioWidth, setIoWidth] = useState(550);
    const [isDragging, setIsDragging] = useState(false);
    const [activeIoTab, setActiveIoTab] = useState<'node' | 'log'>('node');
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        if (timelineScrollRef.current) {
            timelineScrollRef.current.scrollTop = timelineScrollRef.current.scrollHeight;
        }
    }, [steps]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const newWidth = window.innerWidth - e.clientX;
            const clampedWidth = Math.max(300, Math.min(newWidth, window.innerWidth * 0.6));
            setIoWidth(clampedWidth);
        };

        const handleMouseUp = () => {
            if (isDragging) setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleClose = () => {
        resetStepper();
        onClose();
    };

    const activeSteps = useMemo(() => getActiveExecutionSteps(steps), [steps]);

    const statusBadge = useMemo(
        () => getExecutionStatusBadge(isExecuting, isSimulationDone, steps),
        [isExecuting, isSimulationDone, steps]
    );

    return {
        steps,
        isExecuting,
        isFetching,
        isSimulationDone,
        globalLogs,
        timelineScrollRef,
        ioWidth,
        isDragging,
        setIsDragging,
        activeIoTab,
        setActiveIoTab,
        isFullScreen,
        setIsFullScreen,
        handleClose,
        activeSteps,
        statusBadge,
    };
}
