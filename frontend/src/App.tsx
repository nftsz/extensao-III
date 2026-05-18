import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Produtos } from './pages/Produtos';
import { Dashboard } from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/produtos" element={<Produtos />} />
          {/* A tela de distribuição criaremos no próximo passo */}
          <Route path="/distribuicao" element={<div className="p-4 text-xl">Tela de Distribuição (Em breve)</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}