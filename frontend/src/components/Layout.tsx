import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, LayoutDashboard, Send, Settings } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/produtos', label: 'Doações', icon: <Package size={20} /> },
    { path: '/distribuicao', label: 'Distribuição', icon: <Send size={20} /> },
    { path: '/configuracoes', label: 'Configurações', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg-dark text-white">
      {/* Sidebar baseada inteiramente na imagem */}
      <aside className="w-full md:w-64 bg-bg-sidebar text-text-main p-4 flex flex-col justify-between border-r border-black/10 shadow-lg">
        <div>
          {/* Logo Donare com a fonte Cherry Swash */}
          <div className="flex items-center gap-2 px-2 py-4 mb-6">
            <span className="text-3xl font-brand font-bold text-brand">Donare</span>
          </div>

          {/* Navegação */}
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-black/10 text-brand font-bold'
                      : 'hover:bg-black/5 text-text-main/80 hover:text-text-main'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Perfil do Usuário no rodapé (Igual ao layout da imagem) */}
        <div className="border-t border-black/10 pt-4 mt-4 flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center font-bold text-text-main border border-black/20">
            JD
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-text-main">Jade Diniz</span>
            <span className="text-xs text-text-main/60">Admin</span>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal com o fundo Vinho Escuro */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-bg-dark">
        {children}
      </main>
    </div>
  );
}