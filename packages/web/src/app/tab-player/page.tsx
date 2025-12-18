'use client';

'use client';

import TabPlayerShell from '@/components/tabplayer/TabPlayerShell';
import { AlphaTabProvider } from '@/components/tabplayer/AlphaTabContext';

export default function TabPlayerPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <AlphaTabProvider>
        <TabPlayerShell />
      </AlphaTabProvider>
    </main>
  );
}
