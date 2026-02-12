import { TabNavigation } from "../components/TabNavigation";
import { ActionsCatalog } from "../components/ActionsCatalog";

export default function ActionsPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-start py-16 px-8 bg-white dark:bg-black">
        <TabNavigation />
        <ActionsCatalog />
      </main>
    </div>
  );
}
