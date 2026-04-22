import Link from 'next/link'
import { FiEdit3, FiBriefcase, FiClock, FiTool, FiSettings, FiLogOut } from 'react-icons/fi'
import { logout } from '@/app/admin/actions'

const items = [
  { href: '/admin/innstillinger', label: 'Innstillinger', Icon: FiSettings },
  { href: '/admin/blogg', label: 'Blogg', Icon: FiEdit3 },
  { href: '/admin/prosjekter', label: 'Prosjekter', Icon: FiBriefcase },
  { href: '/admin/na', label: 'Nå', Icon: FiClock },
  { href: '/admin/uses', label: 'Uses', Icon: FiTool },
]

export function AdminNav() {
  return (
    <aside className="w-60 border-r border-rule bg-bg-elev p-6 sticky top-0 h-screen">
      <div className="flex items-center gap-2.5 font-semibold tracking-tight mb-8">
        <span className="w-2 h-2 rounded-full bg-accent" aria-hidden="true" />
        Admin
      </div>
      <nav className="flex flex-col gap-1">
        {items.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-ink-2 hover:bg-bg-sunken hover:text-ink transition-colors"
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <form action={logout} className="mt-8">
        <button
          type="submit"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-ink-3 hover:bg-bg-sunken hover:text-ink transition-colors w-full"
        >
          <FiLogOut size={16} />
          Logg ut
        </button>
      </form>
    </aside>
  )
}
