import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Produtos } from './pages/Produtos';
import { Dashboard } from './pages/Dashboard';
import { DetalhesProduto } from './pages/DetalhesProduto';
import { Distribuicao} from './pages/Distribuicao';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/produtos/:id" element={<DetalhesProduto />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/distribuicao" element={<Distribuicao />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}