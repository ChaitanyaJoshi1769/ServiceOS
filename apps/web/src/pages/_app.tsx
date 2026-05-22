import type { AppProps } from 'next/app';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize app
    console.log('ServiceOS Dashboard initialized');
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Component {...pageProps} />
    </div>
  );
}
