import DashboardShell from '@/components/dashboard/DashboardShell';

// Auth-gated app surface: keep every /dashboard route out of search indexes.
export const metadata = {
  robots: { index: false, follow: false },
  title: 'Dashboard — Sceneviz',
};

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
