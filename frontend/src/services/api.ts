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

export interface DashboardData {
  total_recebido: number;
  total_distribuido: number;
  total_perdido: number;
}

// Serviços organizados por entidade
export const estoqueService = {
  // Produtos
  getProdutos: () => api.get<Produto[]>('produtos/'),
  createProduto: (produto: Produto) => api.post<Produto>('produtos/', produto),
  
  // Dashboard
  getDashboard: () => api.get<DashboardData>('dashboard/'),

  // Distribuição (A lógica do FEFO)
  distribuir: (produtoId: number, quantidade: number) => 
    api.post('distribuir/', { produto: produtoId, quantidade }),
};