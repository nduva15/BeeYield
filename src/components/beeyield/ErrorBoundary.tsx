import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in dashboard component:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      
      return (
        <div className="flex flex-col items-center justify-center p-8 m-4 rounded-xl border border-destructive/20 bg-destructive/5 text-center animate-fade-in">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-display font-bold text-foreground mb-2">Something went wrong</h2>
          <p className="text-muted-foreground text-sm max-w-md mb-6">
            The optimization engine encountered an unexpected error while rendering this view.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-all"
          >
            Try Again
          </button>
          {this.state.error && (
            <pre className="mt-6 p-4 bg-background border border-border rounded-lg text-[10px] text-muted-foreground text-left overflow-auto max-w-full max-h-[150px]">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
