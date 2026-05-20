import { useEffect, useState } from "react";
import { estoqueService, type Produto, type LoteDoacao } from "../services/api";
import { X } from "lucide-react";
import { Button } from "@heroui/react";

type Aba = "distribuicao" | "perda";

export function Distribuicao() {
  const [aba, setAba] = useState<Aba>("distribuicao");

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [lotes, setLotes] = useState<LoteDoacao[]>([]);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [distProdutoId, setDistProdutoId] = useState("");
  const [distQuantidade, setDistQuantidade] = useState("");
  const [distDestino, setDistDestino] = useState("");

  const [percaProdutoId, setPercaProdutoId] = useState("");
  const [percaLoteId, setPercaLoteId] = useState("");
  const [percaQuantidade, setPercaQuantidade] = useState("");
  const [percaMotivo, setPercaMotivo] = useState("");

  useEffect(() => {
    estoqueService
      .getProdutos()
      .then((res) => setProdutos(res.data.filter((p) => p.ativo)))
      .catch(() => setErro("Não foi possível carregar os produtos."));
  }, []);

  const carregarLotesPorProduto = async (produtoId: string) => {
    if (!produtoId) {
      setLotes([]);
      setPercaLoteId("");
      return;
    }
    try {
      const res = await estoqueService.getLotesPorProduto(Number(produtoId));
      setLotes(res.data.filter((l) => (l.available_quantity ?? 0) > 0));
      setPercaLoteId("");
    } catch {
      setErro("Não foi possível carregar os lotes.");
    }
  };

  const isVencido = (data: string) =>
    new Date(data + "T00:00:00") < new Date(new Date().toDateString());

  const formatarData = (data: string) =>
    new Date(data + "T00:00:00").toLocaleDateString("pt-BR");

  const limparMensagens = () => {
    setErro("");
    setSucesso("");
  };

  const handleDistribuir = async (e: React.FormEvent) => {
    e.preventDefault();
    limparMensagens();
    try {
      setIsSubmitting(true);
      await estoqueService.distribuir(Number(distProdutoId), Number(distQuantidade));
      setSucesso(`Distribuição de ${distQuantidade} unidades registrada com sucesso!`);
      setDistProdutoId("");
      setDistQuantidade("");
      setDistDestino("");
    } catch {
      setErro("Erro ao registrar distribuição. Verifique se há estoque suficiente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePerda = async (e: React.FormEvent) => {
    e.preventDefault();
    limparMensagens();
    try {
      setIsSubmitting(true);
      await estoqueService.createPerca({
        lote: Number(percaLoteId),
        quantidade: Number(percaQuantidade),
        motivo: percaMotivo,
      });
      setSucesso("Perda registrada com sucesso.");
      setPercaProdutoId("");
      setPercaLoteId("");
      setPercaQuantidade("");
      setPercaMotivo("");
      setLotes([]);
    } catch {
      setErro("Erro ao registrar perda. Verifique os dados.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loteAtual = lotes.find((l) => l.id === Number(percaLoteId));

  return (
    <div className="w-full">
      <div className="mb-2 text-sm text-white/60">Donare &gt; Distribuição</div>
      <h2 className="text-3xl font-bold text-white mb-6">Distribuição</h2>

      {erro && (
        <div className="bg-red-900/50 border-l-4 border-red-500 text-red-200 p-4 mb-6 rounded-md flex justify-between items-center">
          <span>{erro}</span>
          <button onClick={() => setErro("")}><X size={18} /></button>
        </div>
      )}
      {sucesso && (
        <div className="bg-green-900/50 border-l-4 border-green-500 text-green-200 p-4 mb-6 rounded-md flex justify-between items-center">
          <span>{sucesso}</span>
          <button onClick={() => setSucesso("")}><X size={18} /></button>
        </div>
      )}

      {/* Abas */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setAba("distribuicao"); limparMensagens(); }}
          className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
            aba === "distribuicao"
              ? "bg-btn-primary text-white shadow-md"
              : "bg-bg-card text-text-main/60 hover:text-text-main"
          }`}
        >
          Registrar Distribuição
        </button>
        <button
          onClick={() => { setAba("perda"); limparMensagens(); }}
          className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
            aba === "perda"
              ? "bg-btn-primary text-white shadow-md"
              : "bg-bg-card text-text-main/60 hover:text-text-main"
          }`}
        >
          Registrar Perda
        </button>
      </div>

      {/* Aba Distribuição */}
      {aba === "distribuicao" && (
        <div className="bg-bg-card rounded-xl shadow-xl p-6 max-w-lg">
          <h3 className="text-lg font-bold text-text-main mb-1">Nova Distribuição</h3>
          <p className="text-text-main/60 text-sm mb-6">
            O sistema distribui automaticamente pelos lotes mais próximos do vencimento (FEFO).
          </p>

          <form onSubmit={handleDistribuir} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-text-main mb-1">Produto</label>
              <select
                required
                className="w-full p-2.5 bg-white border border-black/10 rounded-lg text-gray-800 focus:ring-2 focus:ring-brand focus:outline-none"
                value={distProdutoId}
                onChange={(e) => setDistProdutoId(e.target.value)}
              >
                <option value="">Selecione um produto...</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-main mb-1">Quantidade</label>
              <input
                required
                type="number"
                min="1"
                className="w-full p-2.5 bg-white border border-black/10 rounded-lg text-gray-800 focus:ring-2 focus:ring-brand focus:outline-none"
                placeholder="Ex: 10"
                value={distQuantidade}
                onChange={(e) => setDistQuantidade(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-main mb-1">
                Destino <span className="text-text-main/40 font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                className="w-full p-2.5 bg-white border border-black/10 rounded-lg text-gray-800 focus:ring-2 focus:ring-brand focus:outline-none"
                placeholder="Ex: Família Silva, Abrigo Norte..."
                value={distDestino}
                onChange={(e) => setDistDestino(e.target.value)}
              />
            </div>

            <div className="flex justify-end mt-2">
              <Button
                className="bg-btn-primary text-white font-bold px-6 shadow-md hover:opacity-90 transition-opacity"
                type="submit"
                isDisabled={isSubmitting}
              >
                {isSubmitting ? "Registrando..." : "Confirmar Distribuição"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Aba Perda */}
      {aba === "perda" && (
        <div className="bg-bg-card rounded-xl shadow-xl p-6 max-w-lg">
          <h3 className="text-lg font-bold text-text-main mb-1">Registrar Perda</h3>
          <p className="text-text-main/60 text-sm mb-6">
            Selecione o produto e o lote específico onde ocorreu a perda.
          </p>

          <form onSubmit={handlePerda} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-text-main mb-1">Produto</label>
              <select
                required
                className="w-full p-2.5 bg-white border border-black/10 rounded-lg text-gray-800 focus:ring-2 focus:ring-brand focus:outline-none"
                value={percaProdutoId}
                onChange={(e) => {
                  setPercaProdutoId(e.target.value);
                  carregarLotesPorProduto(e.target.value);
                }}
              >
                <option value="">Selecione um produto...</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-main mb-1">Lote</label>
              <select
                required
                disabled={lotes.length === 0}
                className="w-full p-2.5 bg-white border border-black/10 rounded-lg text-gray-800 focus:ring-2 focus:ring-brand focus:outline-none disabled:opacity-50"
                value={percaLoteId}
                onChange={(e) => setPercaLoteId(e.target.value)}
              >
                <option value="">
                  {percaProdutoId && lotes.length === 0
                    ? "Nenhum lote disponível"
                    : "Selecione um lote..."}
                </option>
                {lotes.map((l) => (
                  <option key={l.id} value={l.id}>
                    Validade: {formatarData(l.data_expiracao)}
                    {isVencido(l.data_expiracao) ? " ⚠️ Vencido" : ""} — Disponível: {l.available_quantity} {l.produto_unidade}
                  </option>
                ))}
              </select>
            </div>

            {loteAtual && (
              <div className="bg-black/5 rounded-lg p-3 text-sm text-text-main/70">
                Disponível neste lote:{" "}
                <span className="font-bold text-text-main">
                  {loteAtual.available_quantity} {loteAtual.produto_unidade}
                </span>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-text-main mb-1">Quantidade Perdida</label>
              <input
                required
                type="number"
                min="1"
                max={loteAtual?.available_quantity}
                className="w-full p-2.5 bg-white border border-black/10 rounded-lg text-gray-800 focus:ring-2 focus:ring-brand focus:outline-none"
                placeholder="Ex: 5"
                value={percaQuantidade}
                onChange={(e) => setPercaQuantidade(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-main mb-1">Motivo</label>
              <input
                required
                type="text"
                className="w-full p-2.5 bg-white border border-black/10 rounded-lg text-gray-800 focus:ring-2 focus:ring-brand focus:outline-none"
                placeholder="Ex: Vencimento, Avaria, Contaminação..."
                value={percaMotivo}
                onChange={(e) => setPercaMotivo(e.target.value)}
              />
            </div>

            <div className="flex justify-end mt-2">
              <Button
                className="bg-btn-primary text-white font-bold px-6 shadow-md hover:opacity-90 transition-opacity"
                type="submit"
                isDisabled={isSubmitting || !percaLoteId}
              >
                {isSubmitting ? "Registrando..." : "Confirmar Perda"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}