import React, { Component, type ReactNode } from "react";

interface ModelErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ModelErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches 3D model asset and WebGL rendering errors gracefully
 * Prevents full-application crashes if a network request or 3D shader fails
 */
export class ModelErrorBoundary extends Component<
  ModelErrorBoundaryProps,
  ModelErrorBoundaryState
> {
  public state: ModelErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ModelErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[3D Model ErrorBoundary caught an error]:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

export default ModelErrorBoundary;
