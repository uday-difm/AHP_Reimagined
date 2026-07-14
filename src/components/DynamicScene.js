'use client';

import React, { useState, useEffect } from 'react';
import Scene from './Scene';

class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("3D Scene failed to render:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-slate-100 dark:bg-slate-800/50 rounded-xl overflow-hidden shadow-inner p-2 relative">
          <div className="absolute top-2 right-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-md z-10 shadow-sm border border-red-200">
            2D Fallback
          </div>
          {this.props.frontUrl ? (
            <img 
              src={this.props.frontUrl} 
              alt="Magazine Cover" 
              className="w-full h-auto max-h-full object-contain rounded-md shadow-md"
            />
          ) : (
            <div className="text-xs font-semibold text-slate-400">Cover Unavailable</div>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default function DynamicScene(props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-slate-100 dark:bg-slate-800/50 rounded-xl flex items-center justify-center animate-pulse min-h-[300px]">
        <div className="text-xs font-semibold text-slate-400">Loading 3D Viewer...</div>
      </div>
    );
  }

  return (
    <SceneErrorBoundary frontUrl={props.frontUrl}>
      <Scene {...props} />
    </SceneErrorBoundary>
  );
}
