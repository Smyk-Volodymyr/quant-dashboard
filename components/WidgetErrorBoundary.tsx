"use client";

import React, { Component, ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  widgetName: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[Widget Error: ${this.props.widgetName}]`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="h-full w-full flex flex-col items-center justify-center p-6 bg-[#050505]/80 backdrop-blur-sm border border-red-900/30 rounded-2xl animate-in fade-in"
        >
          <div className="h-12 w-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-red-500" />
          </div>

          <h3 className="font-mono text-sm font-bold text-slate-200 uppercase tracking-widest text-center mb-1">
            {this.props.widgetName} Offline
          </h3>

          <p className="text-xs text-slate-500 font-mono mb-6 text-center max-w-xs truncate" title={this.state.errorMessage}>
            Error: {this.state.errorMessage || "Data stream corrupted"}
          </p>

          <button
            onClick={this.handleReset}
            className="flex items-center px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-mono uppercase tracking-widest transition-all focus:ring-2 focus:ring-red-500/40 outline-none group"
            aria-label={`Перезавантажити віджет ${this.props.widgetName}`}
          >
            <RefreshCw size={14} className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Reload Widget
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}