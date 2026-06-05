import Link from "next/link";
import { redirect } from "next/navigation";
import { AsicomLogo } from "@/components/asicom-logo";
import { getCurrentUser, logout } from "@/lib/auth";

async function logoutAction() {
  "use server";
  await logout();
  redirect("/login");
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-asicom-gradient flex items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="flex items-center">
          <AsicomLogo className="h-8 w-auto text-white" />
        </Link>
        <nav className="flex items-center gap-5 text-sm text-white/85">
          <Link href="/" className="transition-colors hover:text-white">
            Dosare
          </Link>
          <Link href="/clienti" className="transition-colors hover:text-white">
            Clienți
          </Link>
          <Link
            href="/automatizari"
            className="flex items-center gap-1.5 transition-colors hover:text-white"
          >
            Automatizări
            <span className="rounded bg-white/20 px-1 py-px text-[9px] font-bold uppercase tracking-wider">
              preview
            </span>
          </Link>
          <Link
            href="/portal-client"
            className="flex items-center gap-1.5 transition-colors hover:text-white"
          >
            Portal client
            <span className="rounded bg-white/20 px-1 py-px text-[9px] font-bold uppercase tracking-wider">
              preview
            </span>
          </Link>
        </nav>
        <div className="flex items-center gap-4 text-sm text-white/85">
          <span className="hidden sm:inline">{user}</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-white/40 px-3 py-1.5 text-white transition-colors hover:bg-white/10"
            >
              Ieșire
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 sm:px-10">{children}</main>
    </div>
  );
}
