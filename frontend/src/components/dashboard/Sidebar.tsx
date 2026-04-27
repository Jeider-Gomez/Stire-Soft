'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navByRole: Record<string, { sections: { title: string; items: NavItem[] }[] }> = {
  estudiante: {
    sections: [
      {
        title: 'Principal',
        items: [
          { label: 'Dashboard', href: '/estudiante', icon: '📊' },
          { label: 'Mis Unidades', href: '/estudiante/unidades', icon: '📘' },
          { label: 'Mi Progreso', href: '/estudiante/progreso', icon: '📈' },
        ],
      },
      {
        title: 'Comunicación',
        items: [
          { label: 'Tutor Inteligente', href: '/tutor', icon: '🤖' },
          { label: 'Mensajes', href: '/estudiante/mensajes', icon: '💬' },
        ],
      },
    ],
  },
  docente: {
    sections: [
      {
        title: 'Principal',
        items: [
          { label: 'Dashboard', href: '/docente', icon: '📊' },
          { label: 'Mis Clases', href: '/docente/clases', icon: '🏫' },
          { label: 'Unidades', href: '/docente/unidades', icon: '📘' },
        ],
      },
      {
        title: 'Comunicación',
        items: [
          { label: 'Mensajes', href: '/docente/mensajes', icon: '💬' },
        ],
      },
    ],
  },
  admin: {
    sections: [
      {
        title: 'Administración',
        items: [
          { label: 'Dashboard', href: '/admin', icon: '📊' },
          { label: 'Usuarios', href: '/admin/usuarios', icon: '👥' },
          { label: 'Unidades', href: '/admin/unidades', icon: '📘' },
        ],
      },
    ],
  },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const nav = navByRole[user.role];
  if (!nav) return null;

  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">🧠 STIRE</div>
        <div className="sidebar-role">{user.role}</div>
      </div>

      <nav className="sidebar-nav">
        {nav.sections.map((section) => (
          <div key={section.title} className="sidebar-section">
            <div className="sidebar-section-title">{section.title}</div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.fullName}</div>
            <div className="sidebar-user-email">{user.email}</div>
          </div>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', marginTop: '0.75rem' }}
          onClick={logout}
        >
          🚪 Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
