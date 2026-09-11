import { PublicShell } from '@/components/PublicShell'

export const revalidate = 3600

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>
}
