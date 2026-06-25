import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { estoqueService, type Produto, type LoteDoacao } from "../services/api";
import { ArrowLeft, X, Plus } from "lucide-react";
import { Button } from "@heroui/react";

export function DetalhesProduto() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

// add
  const [lotes, setLotes] = useState<LoteDoacao[]>([]);
  const [loadingLotes, setLotesLoading] = useState(true);
  const [editingLoteId, setEditingLoteId] = useState<number | null>(null);
  const [erroLote, setErroLote] = useState("");
// add
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [novoLote, setNovoLote] = useState({
    quantidade: "",
    data_expiracao: "",
  });

// oq caraio mudou aqui
  useEffect(() => {
    if (!id) return; // essa linha
    estoqueService
      .getProduto(Number(id))
      .then((response) => setProduto(response.data))
      .catch((error) => {
        console.error(error);
        setErro("Não foi possível carregar os detalhes do produto.");
      })
      .finally(() => setLoading(false));
  }, [id]);

// add
  const carregarLotes = () => {
    if (!id) return;
    setLotesLoading(true);
    estoqueService
      .getLotesPorProduto(Number(id))
      .then((response) => setLotes(response.data))
      .catch((error) => {
        console.error(error);
        setErroLote("Não foi possível carregar os lotes deste produto.");
      })
      .finally(() => setLotesLoading(false));
  };

// add
  useEffect(() => {
    if (!id) return;
    estoqueService
      .getLotesPorProduto(Number(id))
      .then((response) => setLotes(response.data))
      .catch((error) => {
        console.error(error);
        setErroLote("Não foi possível carregar os lotes deste produto.");
      })
      .finally(() => setLotesLoading(false));
  }, [id]);

// add

  const handleSalvarLote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setIsSubmitting(true);
      const dadosLote = {
        produto: Number(id),
        quantidade: Number(novoLote.quantidade),
        data_expiracao: novoLote.data_expiracao,
      };
      if (editingLoteId) {
        await estoqueService.updateLote(editingLoteId, dadosLote);
      } else {
        await estoqueService.createLote(dadosLote);
      }
      handleFecharModal();
      carregarLotes();
    } catch {
      setErroLote(editingLoteId ? "Erro ao atualizar lote. Tente novamente." : "Erro ao criar lote. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditarLote = (lote: LoteDoacao) => {
    if (!lote.id) return;
    setEditingLoteId(lote.id);
    setNovoLote({
      quantidade: String(lote.quantidade),
      data_expiracao: lote.data_expiracao,
    });
    setIsModalOpen(true);
  }

  const handleExcluirLote = async (loteId: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este lote?")) return;
    try {
      await estoqueService.deleteLote(loteId);
      carregarLotes();
    } catch {
      setErroLote("Erro ao excluir lote. Tente novamente.");
    }
  };

 const handleFecharModal = () => {
    setIsModalOpen(false);
    setEditingLoteId(null);
    setNovoLote({ quantidade: "", data_expiracao: "" });
  }
  // add

  const formatarData = (data: string) =>
    new Date(data + "T00:00:00").toLocaleDateString("pt-BR");

  const isVencido = (data: string) =>
    new Date(data + "T00:00:00") < new Date(new Date().toDateString());

// já tinha
  if (loading) {
    return <div className="p-8 text-center text-white/60 font-medium">Carregando detalhes do produto...</div>;
  }

  if (erro || !produto) {
    return (
      <div className="p-8 text-center bg-bg-card rounded-xl shadow-xl max-w-md mx-auto mt-10 text-text-main">
        <p className="text-red-600 font-bold mb-4">{erro || "Produto não encontrado."}</p>
        <Button className="bg-btn-cancel text-white font-bold" onPress={() => navigate("/produtos")}>
          Voltar para Produtos
        </Button>
      </div>
    );
  }


  return (
    <div className="w-full h-full relative">
      {/* Cabeçalho */}
      <div className="mb-2 text-sm text-white/60">Doações &gt; Estoque &gt; Detalhes do Lote: {produto.nome}</div>
      <div className="flex items-center gap-4 mb-6">
        <Button isIconOnly className="bg-white/10 text-white hover:bg-white/20" onPress={() => navigate("/produtos")}>
          <ArrowLeft size={24} />
        </Button>
        <h2 className="text-3xl font-bold text-white">{produto.nome}</h2>
        <span className={`px-2 py-1 rounded-md text-xs font-bold ${produto.ativo ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
          {produto.ativo ? "Ativo" : "Inativo"}
        </span>
      </div>

      {/* Informações básicas */}
      <div className="bg-bg-card rounded-xl shadow-xl p-6 mb-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-text-main/60 mb-1">Categoria</p>
          <p className="text-lg font-semibold text-text-main">{produto.categoria}</p>
        </div>
        <div>
          <p className="text-sm text-text-main/60 mb-1">Unidade de Medida</p>
          <p className="text-lg font-semibold text-text-main capitalize">{produto.unidade}</p>
        </div>
      </div>

      {/* Seção de Lotes */}
      <div className="bg-bg-card rounded-xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-text-main">Lotes em Estoque</h3>
          <Button
            className="bg-btn-primary text-white font-bold px-4 shadow-md hover:opacity-90 transition-opacity" 
            onPress={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            Adicionar Lote
          </Button>
        </div>

        {erroLote && (
          <div className="bg-red-900/50 border-l-4 border-red-500 text-red-200 p-3 mb-4 rounded-md flex justify-between items-center">
            <span>{erroLote}</span>
            <button onClick={() => setErroLote("")}><X size={18} /></button>
          </div>
        )}

        {loadingLotes ? (
          <div className="p-8 text-center text-text-main/60">Carregando lotes...</div>
        ) : lotes.length === 0 ? (
          <div className="p-10 text-center border-2 border-dashed border-black/10 rounded-lg">
            <p className="text-text-main">Nenhum lote cadastrado.</p>
            <p className="text-text-main text-sm mt-1">Use o botão "Adicionar Lote" para começar.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-text-main/60 font-bold">
                <th className="pb-3">Validade</th>
                <th className="pb-3">Quantidade</th>
                <th className="pb-3">Validade</th>
                <th className="pb-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lotes.map((lote) => (
                <tr key={lote.id} className="border-b border-black/5 hover:bg-black/[0.02]">
                  <td className="py-3 text-text-main font-medium">
                    {formatarData(lote.data_expiracao)}
                  </td>
                  <td className="py-3 text-text-main">
                    {lote.quantidade} {produto.unidade}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${isVencido(lote.data_expiracao) ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"}`}>
                      {isVencido(lote.data_expiracao) ? "Vencido" : "Válido"}
                    </span>
                  </td>
                  <td className="py-3 flex gap-2">
                    <Button size="sm" className="bg-black/5 text-text-main hover:bg-black/10" onPress={() => handleEditarLote(lote)}>Editar</Button>
                    <Button size="sm" className="bg-black/5 text-text-main hover:bg-black/10" onPress={() => lote.id && handleExcluirLote(lote.id)}>Excluir</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Adicionar Lote */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-bg-card text-text-main rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10">
            <div className="flex justify-between items-center p-5 border-b border-black/10 bg-black/5">
              <h3 className="text-lg font-bold text-brand">
                {editingLoteId ? "Editar Lote" : "Adicionar Novo Lote"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-main/60 hover:text-text-main"><X size={20} /></button>
            </div>

            <form onSubmit={handleSalvarLote} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-text-main mb-1">Quantidade ({produto.unidade})</label>
                <input required type="number" min="1"
                  className="w-full p-2.5 bg-white border border-black/10 rounded-lg text-gray-800 focus:ring-2 focus:ring-brand focus:outline-none"
                  placeholder="Ex: 50"
                  value={novoLote.quantidade}
                  onChange={(e) => setNovoLote({ ...novoLote, quantidade: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main mb-1">Data de Validade</label>
                <input required type="date" min={new Date().toISOString().split("T")[0]}
                  className="w-full p-2.5 bg-white border border-black/10 rounded-lg text-gray-800 focus:ring-2 focus:ring-brand focus:outline-none"
                  value={novoLote.data_expiracao}
                  onChange={(e) => setNovoLote({ ...novoLote, data_expiracao: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button
                  className="bg-btn-cancel text-white font-bold px-5 shadow-md hover:opacity-80 transition-opacity"
                  onPress={() => setIsModalOpen(false)}
                  type="button"
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-btn-primary text-white font-bold px-5 shadow-md hover:opacity-90 transition-opacity"
                  type="submit"
                  isDisabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : editingLoteId ? "Atualizar Lote" : "Salvar Lote"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}