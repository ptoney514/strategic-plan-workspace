import { SettingsSidebar } from '@/components/SettingsSidebar';

export default function SettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { districtSlug: string };
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <SettingsSidebar districtSlug={params.districtSlug} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}