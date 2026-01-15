import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Trash2 } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        localStorage.clear();
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
                    <div className="max-w-md space-y-6">
                        <h1 className="text-4xl font-bold text-primary">Oops!</h1>
                        <p className="text-xl font-semibold">Something went wrong.</p>
                        <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm font-mono text-left overflow-auto max-h-40">
                            {this.state.error?.message}
                        </div>
                        <p className="text-muted-foreground">
                            This usually happens due to a corrupted session or bad data.
                            Click below to reset the app.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button onClick={() => window.location.reload()} variant="outline">
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Reload Page
                            </Button>
                            <Button onClick={this.handleReset} variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Reset App & Clear Cache
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
