import React from 'react';

interface State {
  hasError: boolean;
  error?: Error | null;
  info?: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ error, info });
    // You could also log to an external service here
    console.error('ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
          <pre className="mt-4 whitespace-pre-wrap bg-slate-50 p-4 rounded border">{String(this.state.error?.message || this.state.error)}</pre>
          <details className="mt-2 text-sm text-slate-500">
            <summary>Show stack</summary>
            <pre className="mt-2 whitespace-pre-wrap">{this.state.error?.stack}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
