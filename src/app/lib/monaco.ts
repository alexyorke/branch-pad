'use client';

import { loader } from '@monaco-editor/react';

// Only initialize Monaco on the client side
if (typeof window !== 'undefined') {
  // Configure the Monaco Editor loader
  loader.config({
    paths: {
      vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.47.0/min/vs',
    },
    'vs/nls': {
      availableLanguages: {
        '*': 'en',
      },
    },
  });

  // Pre-load Monaco Editor
  loader.init();
} 