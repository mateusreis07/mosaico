'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEvent, resetEvent } from '@/services/api';
import { Plus, Trash2 } from 'lucide-react';

export default function EventControls() {
    const [isOpen, setIsOpen] = useState(false);
    const [eventName, setEventName] = useState('');
    const [fallbackColor, setFallbackColor] = useState('#000000');
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: createEvent,
        onSuccess: () => {
            setIsOpen(false);
            setEventName('');
            queryClient.invalidateQueries({ queryKey: ['seats'] }); // Refresh grid
            alert('Evento criado e ativado!');
        },
        onError: (err) => alert('Erro ao criar evento: ' + err),
    });

    const resetMutation = useMutation({
        mutationFn: resetEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seats'] });
            alert('Cores resetadas!');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (eventName.trim()) createMutation.mutate({ name: eventName, fallbackColor });
    };

    return (
        <div className="flex gap-4 items-center">
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
                <Plus size={20} />
                Novo Evento
            </button>

            <button
                onClick={() => {
                    if (confirm('Tem certeza? Isso vai apagar todas as cores.')) resetMutation.mutate();
                }}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
                <Trash2 size={20} />
                Resetar Cores
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl w-96 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">Criar Novo Evento</h2>

                        <div className="mb-4">
                            <label className="block text-zinc-400 text-sm mb-1">Nome do Evento</label>
                            <input
                                type="text"
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2 focus:outline-none focus:border-blue-500"
                                placeholder="Ex: Final da Copa"
                                autoFocus
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-zinc-400 text-sm mb-1">Cor de Fundo (Padrão)</label>
                            <div className="flex gap-2">
                                {['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00'].map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setFallbackColor(c)}
                                        className={`w-8 h-8 rounded-full border-2 ${fallbackColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                            <input
                                type="text"
                                value={fallbackColor}
                                onChange={(e) => setFallbackColor(e.target.value)}
                                className="mt-2 w-full bg-zinc-800 border border-zinc-700 text-white text-xs rounded p-1"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-zinc-300 hover:bg-zinc-800 rounded"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {createMutation.isPending ? 'Criando...' : 'Criar e Ativar'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
