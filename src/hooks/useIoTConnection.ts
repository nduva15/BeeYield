import { useState, useEffect, useRef, useCallback } from 'react';

export type IoTConnectionState = 'CONNECTED' | 'CONNECTING' | 'RECONNECTING' | 'STALE' | 'DISCONNECTED';

interface UseIoTConnectionOptions {
    staleTimeoutMs?: number; // Time without packets before declaring data stale (default: 45s)
    heartbeatIntervalMs?: number; // Ping interval (default: 20s)
    maxReconnectAttempts?: number;
    onStatusChange?: (status: IoTConnectionState) => void;
}

export function useIoTConnection(options: UseIoTConnectionOptions = {}) {
    const {
        staleTimeoutMs = 45000,
        heartbeatIntervalMs = 20000,
        maxReconnectAttempts = 5,
        onStatusChange
    } = options;

    const [status, setStatus] = useState<IoTConnectionState>('CONNECTED');
    const [lastPacketTime, setLastPacketTime] = useState<number>(Date.now());
    const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);
    const [timeSinceLastPacketSec, setTimeSinceLastPacketSec] = useState<number>(0);

    const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);
    const tickerRef = useRef<NodeJS.Timeout | null>(null);

    // Call this whenever ANY telemetry payload or WebSocket message arrives
    const notifyPacketReceived = useCallback(() => {
        const now = Date.now();
        setLastPacketTime(now);
        setTimeSinceLastPacketSec(0);
        setReconnectAttempts(0);
        
        setStatus(prev => {
            if (prev !== 'CONNECTED') {
                onStatusChange?.('CONNECTED');
                return 'CONNECTED';
            }
            return prev;
        });
    }, [onStatusChange]);

    // Force manual reconnection attempt
    const triggerReconnect = useCallback(() => {
        setStatus('RECONNECTING');
        setReconnectAttempts(prev => prev + 1);
        onStatusChange?.('RECONNECTING');

        // Simulate reconnect handshake or trigger WebSocket reconnect
        setTimeout(() => {
            notifyPacketReceived();
        }, 1500);
    }, [notifyPacketReceived, onStatusChange]);

    // Watchdog timer to detect silent disconnects / stale streams
    useEffect(() => {
        const checkWatchdog = () => {
            const elapsed = Date.now() - lastPacketTime;
            const elapsedSec = Math.floor(elapsed / 1000);
            setTimeSinceLastPacketSec(elapsedSec);

            if (elapsed > staleTimeoutMs) {
                setStatus(prev => {
                    if (prev === 'CONNECTED') {
                        onStatusChange?.('STALE');
                        return 'STALE';
                    }
                    return prev;
                });
            }
        };

        watchdogTimerRef.current = setInterval(checkWatchdog, 5000);
        tickerRef.current = setInterval(() => {
            setTimeSinceLastPacketSec(Math.floor((Date.now() - lastPacketTime) / 1000));
        }, 1000);

        return () => {
            if (watchdogTimerRef.current) clearInterval(watchdogTimerRef.current);
            if (tickerRef.current) clearInterval(tickerRef.current);
        };
    }, [lastPacketTime, staleTimeoutMs, onStatusChange]);

    // Browser online/offline event listeners
    useEffect(() => {
        const handleOffline = () => {
            setStatus('DISCONNECTED');
            onStatusChange?.('DISCONNECTED');
        };

        const handleOnline = () => {
            triggerReconnect();
        };

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, [triggerReconnect, onStatusChange]);

    return {
        status,
        isLive: status === 'CONNECTED',
        isStale: status === 'STALE',
        isReconnecting: status === 'RECONNECTING',
        isDisconnected: status === 'DISCONNECTED',
        lastPacketTime,
        timeSinceLastPacketSec,
        reconnectAttempts,
        notifyPacketReceived,
        triggerReconnect,
    };
}
