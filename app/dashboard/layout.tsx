import DashboardShell from '@/app/_components/DashboardShell';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
