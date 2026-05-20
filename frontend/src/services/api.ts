import axios from 'axios';

// Instância base do Axios apontando para as rotas configuradas no seu router
export const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1/', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tipagens espelhando seus Models do Django
export interface Produto {
  id?: number;
  nome: string;
  categoria: string;
  unidade: string;
  ativo?: boolean;
}

export interface LoteDoacao {
  id?: number;
  produto: number; // FK id do produto
  produto_nome?: string;
  produto_unidade?: string;
  quantidade: number;
  available_quantity?: number; 
  data_expiracao: string; 
  recebido_em?: string;
}

export interface DashboardData {
  total_recebido: number;
  total_distribuido: number;
  total_perdido: number;
}

export interface Perca {
  id?: number;
  lote: number; // FK id do lote
  quantidade: number;
  motivo: string;
  criado_em?: string;
}

// Serviços organizados por entidade
export const estoqueService = {
  // Produtos
  getProdutos: () => api.get<Produto[]>('produtos/'),
  getProduto: (id: number) => api.get<Produto>(`produtos/${id}/`), 
  createProduto: (produto: Omit<Produto, 'id'>) => api.post<Produto>('produtos/', produto),
  updateProduto: (id: number, dados: Partial<Produto>) => api.patch<Produto>(`produtos/${id}/`, dados),
  deleteProduto: (id: number) => api.delete(`produtos/${id}/`),
  
  // Lotes de Doação
  getLotes: () => api.get<LoteDoacao[]>('lotes/'),
  getLotesPorProduto: (produtoId: number) => api.get<LoteDoacao[]>(`lotes/?produto=${produtoId}`),
  createLote: (lote: Omit<LoteDoacao, 'id' | 'recebido_em'>) => api.post<LoteDoacao>('lotes/', lote),
  updateLote: (id: number, dados: Partial<Omit<LoteDoacao, 'id' | 'recebido_em'>>) => api.patch<LoteDoacao>(`lotes/${id}/`, dados),
  deleteLote: (id: number) => api.delete(`lotes/${id}/`),
  // Dashboard
  getDashboard: () => api.get<DashboardData>('dashboard/'),

  // Perdas
  getPerdas: () => api.get<Perca[]>('percas/'),
  createPerca: (perca: Omit<Perca, 'id' | 'criado_em'>) => api.post<Perca>('percas/', perca),
  // Distribuição
  distribuir: (produtoId: number, quantidade: number) => 
    api.post('distribuir/', { produto: produtoId, quantidade }),
};