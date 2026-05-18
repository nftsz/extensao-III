import { type  ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Package, LayoutDashboard, Send } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-900">
      {/* Sidebar de alta visibilidade */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-blue-400 mb-4">Donare</h1>
        
        <nav className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-3 hover:text-blue-300 transition-colors">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/produtos" className="flex items-center gap-3 hover:text-blue-300 transition-colors">
            <Package size={20} /> Produtos
          </Link>
          <Link to="/distribuicao" className="flex items-center gap-3 hover:text-blue-300 transition-colors">
            <Send size={20} /> Distribuição
          </Link>
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}