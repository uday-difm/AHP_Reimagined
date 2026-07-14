'use client';

import React, { useState, useEffect } from 'react';
import Scene from './Scene';

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

  return <Scene {...props} />;
}
