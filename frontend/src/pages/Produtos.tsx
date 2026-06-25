import { useEffect, useState } from "react";
import { estoqueService, type Produto } from "../services/api";
import { X, Plus, } from "lucide-react";
import { TrashBin } from "@gravity-ui/icons";
import { Table, Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";

export function Produtos() {
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [erro, setErro] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProdutoId, setEditingProdutoId] = useState<number | null>(null);
  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    categoria: "",
    unidade: "unidade",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Usado pelos handlers (criar, editar, excluir, toggle)
  const carregarProdutos = () => {
    setLoading(true);
    estoqueService
      .getProdutos()
      .then((response) => setProdutos(response.data))
      .catch((error) => {
        console.error(error);
        setErro("Não foi possível carregar os produtos.");
      })
      .finally(() => setLoading(false));
  };

  // Carga inicial — lógica inline para não acionar a regra do ESLint
  useEffect(() => {
    estoqueService
      .getProdutos()
      .then((response) => setProdutos(response.data))
      .catch(() => setErro("Não foi possível carregar os produtos."))
      .finally(() => setLoading(false));
  }, []);

  const handleVer = (id: number) => navigate(`/produtos/${id}`);

  const handleEditar = (produto: Produto) => {
    if (!produto.id) return;
    setEditingProdutoId(produto.id);
    setNovoProduto({
      nome: produto.nome,
      categoria: produto.categoria,
      unidade: produto.unidade,
    });
    setIsModalOpen(true);
  };

  const handleToggleAtivo = async (produto: Produto) => {
    if (!produto.id) return;
    try {
      setActionLoading(produto.id);
      await estoqueService.updateProduto(produto.id, { ativo: !produto.ativo });
      carregarProdutos();
    } catch (_) {
      setErro("Erro ao alterar o status do produto.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleExcluir = async (id: number) => {
    if (window.confirm("Atenção: Tem certeza que deseja excluir este produto permanentemente?")) {
      try {
        setActionLoading(id);
        await estoqueService.deleteProduto(id);
        carregarProdutos();
      } catch (_) {
        setErro("Erro ao excluir o produto. Ele pode estar atrelado a algum lote existente.");
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleSalvarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingProdutoId) {
        await estoqueService.updateProduto(editingProdutoId, novoProduto);
      } else {
        await estoqueService.createProduto({ ...novoProduto, ativo: true });
      }
      handleFecharModal();
      carregarProdutos();
    } catch (_) {
      setErro(editingProdutoId ? "Erro ao atualizar o produto." : "Erro ao criar o produto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFecharModal = () => {
    setIsModalOpen(false);
    setEditingProdutoId(null);
    setNovoProduto({ nome: "", categoria: "", unidade: "unidade" });
  };

  return (
    <div className="w-full relative">
      <div className="mb-2 text-sm text-white/60">Doações &gt; Estoque</div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Estoque de Doações</h2>
        <Button
          className="bg-btn-primary text-white font-bold text-base px-5 shadow-md hover:opacity-90 transition-opacity"
          onPress={() => setIsModalOpen(true)}
        >
          <Plus size={18} />
          Nova Doação
        </Button>
      </div>

      {erro && (
        <div className="bg-red-900/50 border-l-4 border-red-500 text-red-200 p-4 mb-6 rounded-md shadow-sm flex justify-between items-center">
          <span>{erro}</span>
          <button onClick={() => setErro("")} className="hover:text-white"><X size={20} /></button>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-white/60 font-medium">Carregando dados do servidor...</div>
      ) : produtos.length === 0 ? (
        <div className="p-12 text-center text-text-main bg-bg-card rounded-xl shadow-xl">
          Nenhum produto cadastrado ainda.
        </div>
      ) : (
        <Table aria-label="Tabela de gestão de produtos" className="bg-bg-card text-text-main shadow-xl rounded-xl overflow-hidden">
          <Table.ScrollContainer>
            <Table.Content>
              <Table.Header>
                <Table.Column isRowHeader className="bg-black/5 text-text-main font-bold">NOME</Table.Column>
                <Table.Column className="bg-black/5 text-text-main font-bold">CATEGORIA</Table.Column>
                <Table.Column className="bg-black/5 text-text-main font-bold">UNIDADE</Table.Column>
                <Table.Column className="bg-black/5 text-text-main font-bold">STATUS</Table.Column>
                <Table.Column className="bg-black/5 text-text-main font-bold text-center">AÇÕES</Table.Column>
              </Table.Header>

              <Table.Body>
                {produtos.map((produto) => (
                  <Table.Row key={produto.id} className="border-b border-black/5 hover:bg-black/[0.02]">
                    <Table.Cell className="font-semibold text-base text-text-main">{produto.nome}</Table.Cell>
                    <Table.Cell className="text-base text-text-main/80">{produto.categoria}</Table.Cell>
                    <Table.Cell className="capitalize text-base text-text-main/80">{produto.unidade}</Table.Cell>
                    <Table.Cell>
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${produto.ativo ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                        {produto.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2 items-center justify-center">
                        <Button size="sm" className="bg-black/5 text-text-main hover:bg-black/10" onPress={() => produto.id && handleVer(produto.id)}>Lotes</Button>
                        <Button size="sm" className="bg-black/5 text-text-main hover:bg-black/10" onPress={() => handleEditar(produto)}>Editar</Button>
                        <Button size="sm" className={`min-w-[85px] ${produto.ativo ? 'bg-black/5 text-text-main hover:bg-black/10' : 'bg-black/5 text-text-main hover:bg-black/10'}`} onPress={() => handleToggleAtivo(produto)}>
                          {actionLoading === produto.id ? "..." : produto.ativo ? "Desativar" : "Ativar"}
                        </Button>
                        <Button isIconOnly size="sm" className="bg-red-100 text-red-600 hover:bg-red-200" onPress={() => produto.id && handleExcluir(produto.id)}>
                          <TrashBin />
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-bg-card text-text-main rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10">
            <div className="flex justify-between items-center p-5 border-b border-black/10 bg-black/5">
              <h3 className="text-lg font-bold text-brand">
                {editingProdutoId ? "Editar Produto" : "Cadastrar Novo Produto"}
              </h3>
              <button onClick={handleFecharModal} className="text-text-main/60 hover:text-text-main"><X size={20} /></button>
            </div>

            <form onSubmit={handleSalvarProduto} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-text-main mb-1">Nome do Produto</label>
                <input required type="text" className="w-full p-2.5 bg-white border border-black/10 rounded-lg text-text-main focus:ring-2 focus:ring-brand focus:outline-none" placeholder="Ex: Arroz Branco" value={novoProduto.nome} onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main mb-1">Categoria</label>
                <input required type="text" className="w-full p-2.5 bg-white border border-black/10 rounded-lg text-text-main focus:ring-2 focus:ring-brand focus:outline-none" placeholder="Ex: Grãos" value={novoProduto.categoria} onChange={(e) => setNovoProduto({ ...novoProduto, categoria: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main mb-1">Unidade de Medida</label>
                <select className="w-full p-2.5 bg-white border border-black/10 rounded-lg text-text-main focus:ring-2 focus:ring-brand focus:outline-none" value={novoProduto.unidade} onChange={(e) => setNovoProduto({ ...novoProduto, unidade: e.target.value })}>
                  <option value="kg">Quilograma (kg)</option>
                  <option value="litro">Litro (L)</option>
                  <option value="unidade">Unidade (un)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button className="bg-btn-cancel text-white font-bold px-5 shadow-md hover:opacity-80 transition-opacity" onPress={handleFecharModal} type="button">Cancelar</Button>
                <Button className="bg-btn-primary text-white font-bold px-5 shadow-md hover:opacity-90 transition-opacity" type="submit" isDisabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : editingProdutoId ? "Atualizar" : "Salvar Produto"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}