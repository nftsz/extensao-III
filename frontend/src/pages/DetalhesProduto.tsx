import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { estoqueService, type Produto } from "../services/api";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@heroui/react";

export function DetalhesProduto() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (id) {
      estoqueService
        .getProduto(Number(id))
        .then((response) => setProduto(response.data))
        .catch((error) => {
          console.error(error);
          setErro("Não foi possível carregar os detalhes do produto.");
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

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
      {/* Caminho/Breadcrumbs */}
      <div className="mb-2 text-sm text-white/60">Doações &gt; Estoque &gt; Detalhes</div>

      {/* Faixa de Aviso FEFO (Igualzinha à da imagem do layout) */}
      <div className="bg-bg-notice text-white/90 px-5 py-3 rounded-xl mb-6 text-sm font-medium shadow-sm border border-white/5">
        Os itens serão classificados automaticamente por data de validade (FEFO).
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Button isIconOnly className="bg-white/10 text-white hover:bg-white/20" onPress={() => navigate("/produtos")}>
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-3xl font-bold text-white">Detalhes: {produto.nome}</h2>
      </div>

      {/* Cartão Principal Claro */}
      <div className="bg-bg-card text-text-main shadow-2xl rounded-xl p-8 flex flex-col gap-6 w-full">
        {/* Informações em Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/5 p-5 rounded-xl">
          <div>
            <p className="text-xs text-text-main/60 font-bold uppercase tracking-wider mb-1">Categoria</p>
            <p className="text-lg font-semibold text-text-main">{produto.categoria}</p>
          </div>
          <div>
            <p className="text-xs text-text-main/60 font-bold uppercase tracking-wider mb-1">Unidade de Medida</p>
            <p className="text-lg font-semibold text-text-main capitalize">{produto.unidade}</p>
          </div>
          <div>
            <p className="text-xs text-text-main/60 font-bold uppercase tracking-wider mb-1">Status do Registro</p>
            <span className={`inline-block mt-1 px-3 py-1 rounded-md text-xs font-bold ${produto.ativo ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
              {produto.ativo ? "Ativo no Sistema" : "Inativo"}
            </span>
          </div>
        </div>

        <hr className="border-black/10" />

        {/* Seção de Lotes */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-brand">Lotes em Estoque</h3>
            <Button className="bg-btn-primary text-white font-bold shadow-md hover:opacity-90 transition-opacity">
              <Plus size={16} /> Adicionar Lote
            </Button>
          </div>
          
          {/* Caixa tracejada interna para listagem vazia */}
          <div className="bg-white/50 rounded-xl p-12 text-center border-2 border-dashed border-black/10 min-h-[250px] flex items-center justify-center">
            <div>
              <p className="text-text-main font-semibold text-lg">
                A listagem de lotes e acompanhamento de validade aparecerão aqui.
              </p>
              <p className="text-text-main/60 text-sm mt-2">
                Use o botão "Adicionar Lote" para iniciar o controle FEFO deste produto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}