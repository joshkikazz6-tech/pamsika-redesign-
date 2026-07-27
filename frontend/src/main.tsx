import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);

// Do not reveal the real app (icons included) until the icon font has
// genuinely finished loading, or 5 seconds have passed - whichever comes
// first. This guarantees the boot loader is the only thing visible during
// any slow-network gap, instead of a partially-rendered page with icon
// fallback text. The CSS overflow:hidden clip is a second-layer backstop
// for the rare case where the 5s cutoff is hit before the font is ready.
function revealApp() {
  const bootLoader = document.getElementById('pm-boot-loader');
  if (bootLoader) bootLoader.remove();
}

if ('fonts' in document) {
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, 5000));
  Promise.race([document.fonts.ready.then(() => undefined), timeout]).then(revealApp);
} else {
  // Very old browser without the Font Loading API - fall back to a fixed delay.
  setTimeout(revealApp, 1500);
}
