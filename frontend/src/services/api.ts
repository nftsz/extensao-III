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
  produto: number; // ID do produto
  quantidade: number;
  data_validade: string; // ISO date string
}

export interface DashboardData {
  total_recebido: number;
  total_distribuido: number;
  total_perdido: number;
}

// Serviços organizados por entidade
export const estoqueService = {
  // Produtos
  getProdutos: () => api.get<Produto[]>('produtos/'),
  getProduto: (id: number) => api.get<Produto>(`produtos/${id}/`), 
  createProduto: (produto: Omit<Produto, 'id'>) => api.post<Produto>('produtos/', produto),
  updateProduto: (id: number, dados: Partial<Produto>) => api.patch<Produto>(`produtos/${id}/`, dados),
  deleteProduto: (id: number) => api.delete(`produtos/${id}/`),
  
  // Dashboard
  getDashboard: () => api.get<DashboardData>('dashboard/'),

  // Distribuição
  distribuir: (produtoId: number, quantidade: number) => 
    api.post('distribuir/', { produto: produtoId, quantidade }),
};