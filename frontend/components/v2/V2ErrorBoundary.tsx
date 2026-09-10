'use client';

import { Component, type ReactNode } from 'react';

interface State { error: Error | null }

export class V2ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-4xl">⚠️</p>
          <p className="text-lg font-semibold text-[#173A78]">Something went wrong</p>
          <p className="max-w-xs text-sm text-[#667085]">
            {this.state.error.message || 'An unexpected error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="mt-2 rounded-full bg-[#173A78] px-6 py-2.5 text-sm font-semibold text-white active:opacity-80"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
