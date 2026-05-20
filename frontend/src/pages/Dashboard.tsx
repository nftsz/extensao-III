export function Dashboard() {
  return (
    <div className="max-w-2xl">
      <div className="mb-2 text-sm text-white/60">Donare &gt; Dashboard</div>
      <h2 className="text-3xl font-bold text-white mb-4">Visão Geral</h2>
      <div className="bg-bg-card text-text-main p-6 rounded-xl shadow-xl">
        <p className="text-lg font-medium">Bem-vindo ao sistema de gestão Donare, Jade!</p>
        <p className="text-text-main/70 mt-2">
          Utilize o menu lateral esquerdo para navegar entre o controle de estoque, 
          cadastro de novas doações e ordens de distribuição.
        </p>
      </div>
    </div>
  );
}