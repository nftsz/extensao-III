import { useEffect, useState } from "react";
import { estoqueService, type Produto } from "../services/api";
import { X } from "lucide-react";
import { Table, Button } from "@heroui/react";
import { TrashBin, Plus } from "@gravity-ui/icons";
import { useNavigate } from "react-router-dom";

export function Produtos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [erro, setErro] = useState("");

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProdutoId, setEditingProdutoId] = useState<number | null>(null); // null = Adicionar, number = Editar
  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    categoria: "",
    unidade: "unidade",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    carregarProdutos();
  }, []);

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

  // --- Ações da Tabela ---

  const handleVer = (id: number) => {
    navigate(`/produtos/${id}`);
  };

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
      await carregarProdutos();
    } catch (error) {
      setErro("Erro ao alterar o status do produto.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleExcluir = async (id: number) => {
    if (
      window.confirm(
        "Atenção: Tem certeza que deseja excluir este produto permanentemente?",
      )
    ) {
      try {
        setActionLoading(id);
        await estoqueService.deleteProduto(id);
        await carregarProdutos();
      } catch (error) {
        setErro(
          "Erro ao excluir o produto. Ele pode estar atrelado a algum lote existente.",
        );
      } finally {
        setActionLoading(null);
      }
    }
  };

  // --- Ações do Formulário ---

  const handleSalvarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      if (editingProdutoId) {
        // Modo Edição
        await estoqueService.updateProduto(editingProdutoId, novoProduto);
      } else {
        // Modo Criação
        await estoqueService.createProduto({ ...novoProduto, ativo: true });
      }

      handleFecharModal();
      await carregarProdutos();
    } catch (error) {
      setErro(
        editingProdutoId
          ? "Erro ao atualizar o produto. Verifique os dados."
          : "Erro ao criar o produto. Verifique os dados.",
      );
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Estoque de Produtos
        </h2>
        <Button variant="primary" className="text-base" onPress={() => setIsModalOpen(true)}>
          <Plus />
          Novo Produto
          
        </Button>
      </div>

      {erro && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm flex justify-between">
          {erro}
          <button onClick={() => setErro("")}>
            <X size={20} />
          </button>
        </div>
      )}

      {/* Tabela */}
      {loading ? (
        <div className="p-8 text-center text-gray-500 font-medium">
          Carregando dados do servidor...
        </div>
      ) : produtos.length === 0 ? (
        <div className="p-8 text-center text-gray-500 font-medium bg-white rounded-xl shadow-sm border border-gray-100">
          Nenhum produto cadastrado ainda.
        </div>
      ) : (
        <Table
          aria-label="Tabela de gestão de produtos"
          className="bg-white shadow-sm rounded-xl border border-gray-100"
        >
          <Table.ScrollContainer>
            <Table.Content>
              <Table.Header>
                <Table.Column isRowHeader className="w-[20%]">NOME</Table.Column>
                <Table.Column className="w-[20%]">CATEGORIA</Table.Column>
                <Table.Column className="w-[15%]">UNIDADE</Table.Column>
                <Table.Column className="w-[15%]">STATUS</Table.Column>
                <Table.Column className="w-[10%]">AÇÕES</Table.Column>
              </Table.Header>

              <Table.Body>
                {produtos.map((produto) => (
                  <Table.Row id={produto.id?.toString()} key={produto.id}>
                    <Table.Cell className="font-medium text-base">
                      {produto.nome}
                    </Table.Cell>
                    <Table.Cell className="text-base">{produto.categoria}</Table.Cell>
                    <Table.Cell className="capitalize text-base">
                      {produto.unidade}
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`px-2 py-1 rounded-md text-sm font-bold ${produto.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {produto.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2 items-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onPress={() => produto.id && handleVer(produto.id)}
                          isDisabled={actionLoading === produto.id}
                        >
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onPress={() => handleEditar(produto)}
                          isDisabled={actionLoading === produto.id}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onPress={() => handleToggleAtivo(produto)}
                          isDisabled={actionLoading === produto.id}
                          className="min-w-[85px]"
                        >
                          {actionLoading === produto.id
                            ? "..."
                            : produto.ativo
                              ? "Desativar"
                              : "Ativar"}
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="danger"
                          onPress={() =>
                            produto.id && handleExcluir(produto.id)
                          }
                          isDisabled={actionLoading === produto.id}
                        >
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

      {/* Modal Reutilizável (Cadastro / Edição) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {editingProdutoId ? "Editar Produto" : "Cadastrar Novo Produto"}
              </h3>
              <button
                onClick={handleFecharModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSalvarProduto}
              className="p-4 flex flex-col gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto
                </label>
                <input
                  required
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Ex: Arroz Branco"
                  value={novoProduto.nome}
                  onChange={(e) =>
                    setNovoProduto({ ...novoProduto, nome: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <input
                  required
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Ex: Grãos"
                  value={novoProduto.categoria}
                  onChange={(e) =>
                    setNovoProduto({
                      ...novoProduto,
                      categoria: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidade de Medida
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  value={novoProduto.unidade}
                  onChange={(e) =>
                    setNovoProduto({ ...novoProduto, unidade: e.target.value })
                  }
                >
                  <option value="kg">Quilograma (kg)</option>
                  <option value="litro">Litro (L)</option>
                  <option value="unidade">Unidade (un)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="secondary"
                  onPress={handleFecharModal}
                  type="button"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  isDisabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Salvando..."
                    : editingProdutoId
                      ? "Atualizar Produto"
                      : "Salvar Produto"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
