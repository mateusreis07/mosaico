import EventControls from '@/components/EventControls';
import SeatGrid from '@/components/SeatGrid';

export default function AdminPage() {
    return (
        <main className="h-screen bg-black flex flex-col p-6 overflow-hidden">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Mosaico Admin</h1>
                    <p className="text-zinc-500 text-sm">Painel de Controle de Estádio</p>
                </div>
                <EventControls />
            </header>

            <section className="flex-1 flex flex-col">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-t-xl p-3 flex justify-between items-center">
                    <h2 className="text-zinc-300 text-sm font-medium">Mapa de Assentos (Setor A - Simulação)</h2>
                    <span className="text-xs text-zinc-600">400 Assentos Visíveis</span>
                </div>

                <SeatGrid />
            </section>
        </main>
    );
}
