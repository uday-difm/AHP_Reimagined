'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('./Scene'), { ssr: false });

export default function DynamicScene(props) {
  return <Scene {...props} />;
}
