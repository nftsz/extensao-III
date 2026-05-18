import { useEffect, useState } from 'react';
import { estoqueService, type Produto } from '../services/api';
import { PackagePlus } from 'lucide-react';
import { Table, Button } from '@heroui/react';

export function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = () => {
    setLoading(true);
    estoqueService.getProdutos()
      .then(response => setProdutos(response.data))
      .catch(error => {
        console.error(error);
        setErro('Não foi possível carregar os produtos.');
      })
      .finally(() => setLoading(false));
  };

  const handleVer = (id: number) => {
    console.log(`Abrir detalhes do produto ${id}`);
  };

  const handleToggleAtivo = (produto: Produto) => {
    console.log(`Alterando status do produto ${produto.id} para ${!produto.ativo}`);
  };

  const handleExcluir = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      console.log(`Excluir produto ${id}`);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Estoque de Produtos</h2>
        {/* CORREÇÃO 1: Prop variant e ícone como child */}
        <Button variant="primary">
          Novo Produto
          <PackagePlus size={20} />
        </Button>
      </div>

      {erro && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm">
          {erro}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500 font-medium">Carregando dados do servidor...</div>
      ) : produtos.length === 0 ? (
        <div className="p-8 text-center text-gray-500 font-medium bg-white rounded-xl shadow-sm border border-gray-100">
          Nenhum produto cadastrado ainda.
        </div>
      ) : (
        <Table aria-label="Tabela de gestão de produtos" className="bg-white shadow-sm rounded-xl border border-gray-100">
          <Table.ScrollContainer>
            <Table.Content>
              <Table.Header>
                <Table.Column>NOME</Table.Column>
                <Table.Column>CATEGORIA</Table.Column>
                <Table.Column>UNIDADE</Table.Column>
                <Table.Column>STATUS</Table.Column>
                <Table.Column>AÇÕES</Table.Column>
              </Table.Header>
              
              <Table.Body>
                {produtos.map((produto) => (
                  <Table.Row id={produto.id?.toString()} key={produto.id}>
                    <Table.Cell className="font-medium">{produto.nome}</Table.Cell>
                    <Table.Cell>{produto.categoria}</Table.Cell>
                    <Table.Cell>{produto.unidade}</Table.Cell>
                    <Table.Cell>
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${produto.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {produto.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2 items-center">
                        {/* CORREÇÃO 2: Ver (Secondary) */}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onPress={() => produto.id && handleVer(produto.id)}
                        >
                          Ver
                        </Button>
                        
                        {/* CORREÇÃO 3: Ativar/Desativar (Classes dinâmicas do Tailwind em cima do secondary) */}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onPress={() => handleToggleAtivo(produto)}
                        >
                          {produto.ativo ? "Desativar" : "Ativar"}
                        </Button>
                        
                        {/* CORREÇÃO 4: Excluir (Nova variante danger-soft) */}
                        <Button 
                          size="sm" 
                          variant="danger-soft"
                          onPress={() => produto.id && handleExcluir(produto.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}
    </div>
  );
}