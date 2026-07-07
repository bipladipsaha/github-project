'use client';

import dynamic from 'next/dynamic';

const ParticleField = dynamic(() => import('./ParticleField'), {
  ssr: false,
});

export default function ParticleFieldWrapper() {
  return <ParticleField />;
}
