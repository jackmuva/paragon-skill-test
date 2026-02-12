import { TabNavigation } from "../components/TabNavigation";
import { SyncCatalog } from "../components/SyncCatalog";

export default function SyncPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-start py-16 px-8 bg-white dark:bg-black">
        <TabNavigation />
        <SyncCatalog />
      </main>
    </div>
  );
}
