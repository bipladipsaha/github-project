import './globals.css';
import ParticleFieldWrapper from './components/ParticleFieldWrapper';
import AuthProvider from './components/AuthProvider';

export const metadata = {
  title: 'ProfileForge — Premium GitHub Profile Generator',
  description: 'Transform your GitHub profile with stunning SVG-based designs. Generate a complete, dark-mode-ready profile with animated stats, custom projects, and auto-updating telemetry.',
  keywords: ['GitHub', 'profile', 'README', 'generator', 'SVG', 'developer'],
  authors: [{ name: 'Bipladip Saha' }],
  openGraph: {
    title: 'ProfileForge — Premium GitHub Profile Generator',
    description: 'Transform your GitHub profile with stunning SVG-based designs.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ParticleFieldWrapper />
          <div className="app-container">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
