// @ts-nocheck
import React, { ErrorInfo, ReactNode } from "react";
interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; errorInfo: ErrorInfo | null; }
export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = { hasError: false, error: null, errorInfo: null };
  public static getDerivedStateFromError(error: Error): State { return { hasError: true, error, errorInfo: null }; }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) { this.setState({ errorInfo }); console.error("Uncaught error:", error, errorInfo); }
  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", color: "red", backgroundColor: "white", minHeight: "100vh" }}>
          <h1>Something went wrong.</h1>
          <details style={{ whiteSpace: "pre-wrap" }}>
            <summary>Click for error details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
