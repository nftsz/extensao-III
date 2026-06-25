import { useEffect, useState } from "react";
import { estoqueService, type LoteDoacao, type DashboardData } from "../services/api";
import { Package, Send, Trash2, Archive, Search } from "lucide-react";
import { X } from "lucide-react";

export function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [lotes, setLotes] = useState<LoteDoacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "valido" | "vencido">("todos");

  useEffect(() => {
    Promise.all([
      estoqueService.getDashboard(),
      estoqueService.getLotes(),
    ])
      .then(([dashRes, lotesRes]) => {
        setDashboard(dashRes.data);
        setLotes(lotesRes.data);
      })
      .catch(() => setErro("Não foi possível carregar os dados."))
      .finally(() => setLoading(false));
  }, []);

  const isVencido = (data: string) =>
    new Date(data + "T00:00:00") < new Date(new Date().toDateString());

  const formatarData = (data: string) =>
    new Date(data + "T00:00:00").toLocaleDateString("pt-BR");

  const lotesFiltrados = lotes.filter((lote) => {
    const nomeOk = lote.produto_nome?.toLowerCase().includes(filtroNome.toLowerCase());
    const vencido = isVencido(lote.data_expiracao);
    const statusOk =
      filtroStatus === "todos" ||
      (filtroStatus === "valido" && !vencido) ||
      (filtroStatus === "vencido" && vencido);
    return nomeOk && statusOk;
  });

  return (
    <div className="w-full">
      <div className="mb-2 text-sm text-white/60">Donare &gt; Dashboard</div>
      <h2 className="text-3xl font-bold text-white mb-6">Visão Geral</h2>

      {erro && (
        <div className="bg-red-900/50 border-l-4 border-red-500 text-red-200 p-4 mb-6 rounded-md flex justify-between items-center">
          <span>{erro}</span>
          <button onClick={() => setErro("")}><X size={18} /></button>
        </div>
      )}

      {/* Cards de indicadores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Recebido",
            valor: dashboard?.total_recebido ?? "—",
            icon: <Package size={20} />,
            cor: "text-blue-400",
          },
          {
            label: "Total Distribuído",
            valor: dashboard?.total_distribuido ?? "—",
            icon: <Send size={20} />,
            cor: "text-green-400",
          },
          {
            label: "Total Perdido",
            valor: dashboard?.total_perdido ?? "—",
            icon: <Trash2 size={20} />,
            cor: "text-red-400",
          },
          {
            label: "Disponível",
            valor: dashboard
              ? dashboard.total_recebido - dashboard.total_distribuido - dashboard.total_perdido
              : "—",
            icon: <Archive size={20} />,
            cor: "text-yellow-400",
          },
        ].map((card) => (
          <div key={card.label} className="bg-bg-card rounded-xl p-5 shadow-xl">
            <div className={`mb-2 ${card.cor}`}>{card.icon}</div>
            <p className="text-text-main/60 text-xs font-bold uppercase mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-text-main">
              {loading ? "..." : card.valor}
            </p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <h3 className="text-lg font-bold text-white mb-3">Estoque por Lote</h3>
      <div className="bg-bg-card rounded-xl shadow-xl p-4 mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/40" />
          <input
            type="text"
            placeholder="Filtrar por produto..."
            className="w-full pl-9 p-2.5 bg-white border border-black/10 rounded-lg text-gray-800 focus:ring-2 focus:ring-brand focus:outline-none text-sm"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />
        </div>
        <select
          className="p-2.5 bg-white border border-black/10 rounded-lg text-gray-800 focus:ring-2 focus:ring-brand focus:outline-none text-sm"
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as typeof filtroStatus)}
        >
          <option value="todos">Todos os status</option>
          <option value="valido">Apenas válidos</option>
          <option value="vencido">Apenas vencidos</option>
        </select>
      </div>

      {/* Tabela de lotes */}
      {loading ? (
        <div className="p-12 text-center text-white/60">Carregando dados...</div>
      ) : lotesFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-bg-card rounded-xl shadow-xl text-text-main/60">
          Nenhum lote encontrado.
        </div>
      ) : (
        <div className="bg-bg-card rounded-xl shadow-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-text-main/60 font-bold">
                <th className="p-4">Produto</th>
                <th className="p-4">Qtd. Recebida</th>
                <th className="p-4">Qtd. Disponível</th>
                <th className="p-4">Validade</th>
                <th className="p-4">Recebido em</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {lotesFiltrados.map((lote) => {
                const vencido = isVencido(lote.data_expiracao);
                const esgotado = (lote.available_quantity ?? 0) === 0 && !vencido;
                return (
                  <tr key={lote.id} className="border-b border-black/5 hover:bg-black/[0.02]">
                    <td className="p-4 font-semibold text-text-main">{lote.produto_nome}</td>
                    <td className="p-4 text-text-main">
                      {lote.quantidade} {lote.produto_unidade}
                    </td>
                    <td className="p-4 text-text-main">
                      {lote.available_quantity} {lote.produto_unidade}
                    </td>
                    <td className="p-4 text-text-main">{formatarData(lote.data_expiracao)}</td>
                    <td className="p-4 text-text-main/60">
                      {lote.recebido_em ? formatarData(lote.recebido_em.split("T")[0]) : "—"}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        vencido
                          ? "bg-red-200 text-red-800"
                          : esgotado
                            ? "bg-gray-200 text-gray-600"
                            : "bg-green-200 text-green-800"
                      }`}>
                        {vencido ? "Vencido" : esgotado ? "Esgotado" : "Válido"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}