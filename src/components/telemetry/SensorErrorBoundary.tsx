import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Radio } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallbackTitle?: string;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * SensorErrorBoundary: Prevents a crashed sensor card or graph from taking down
 * the entire BeeYield dashboard. Renders an actionable, resilient card fallback.
 */
export class SensorErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('BeeYield Sensor Card Catch:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/20 p-4 sm:p-5 flex flex-col justify-between h-full min-h-[140px] text-left transition-all">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                                <Radio className="w-4 h-4 animate-pulse" />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-foreground">
                                    {this.props.fallbackTitle || 'Sensor Telemetry Offline'}
                                </h4>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Hardware stream interrupted or payload unavailable.
                                </p>
                            </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                            DEGRADED
                        </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground font-mono">
                            Safe degradation active
                        </span>
                        <button
                            type="button"
                            onClick={this.handleReset}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-700 text-foreground hover:bg-amber-100/50 transition-colors shadow-xs active:scale-95"
                        >
                            <RefreshCw className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>Retry Sensor</span>
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
