import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { estoqueService, type Produto } from "../services/api";
import { ArrowLeft } from "lucide-react";
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
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Carregando detalhes do produto...
      </div>
    );
  }

  if (erro || !produto) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium mb-4">{erro || "Produto não encontrado."}</p>
        <Button variant="outline" onPress={() => navigate("/produtos")}>
          Voltar para Produtos
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div className="flex items-center gap-4 mb-6">
        <Button isIconOnly variant="outline" onPress={() => navigate("/produtos")}>
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">
          Detalhes: {produto.nome}
        </h2>
      </div>

      {/* Container principal - removido max-w-4xl e aumentado padding */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-8 flex flex-col gap-6 w-full">
        {/* Informações Básicas - Grid ajustado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Categoria</p>
            <p className="text-lg text-gray-900">{produto.categoria}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Unidade de Medida</p>
            <p className="text-lg text-gray-900 capitalize">{produto.unidade}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Status</p>
            <span
              className={`inline-block px-3 py-1 rounded-md text-sm font-bold ${
                produto.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {produto.ativo ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Seção de Lotes - Agora centralizada e maior */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Lotes em Estoque</h3>
            <Button size="sm" variant="primary">
              Adicionar Lote
            </Button>
          </div>
          
          {/* Container maior e centralizado */}
          <div className="bg-gray-50 rounded-lg p-12 text-center border border-dashed border-gray-200 min-h-[300px] flex items-center justify-center">
            <div>
              <p className="text-gray-500 text-lg">
                A listagem de lotes e acompanhamento de validade aparecerão aqui.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Use o botão "Adicionar Lote" para começar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}