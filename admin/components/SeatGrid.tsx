'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSeat, setSeatColor, getEventMap } from '@/services/api';
import { useState, useEffect } from 'react';

// Mock seats for visualization since we rely on user scanning to populate initially? 
// OR we should seed the backend with a grid structure.
// For this MVP, since we only "Upsert" seats when scanning or admin touches them, 
// we likely want to visualize a Fixed Grid (e.g., Sector A) to start coloring.
// TO SIMULATE A STADIUM: We will generate a grid of 20x20 seats for Sector A.

const ROWS = 20;
const COLS = 20;
const SEATS = Array.from({ length: ROWS * COLS }, (_, i) => {
    const row = Math.floor(i / COLS) + 1;
    const num = (i % COLS) + 1;
    const rowStr = String(row).padStart(2, '0');
    const numStr = String(num).padStart(2, '0');
    return {
        id: `A-${rowStr}-${numStr}`,
        label: `A-${rowStr}-${numStr}`
    };
});

export default function SeatGrid() {
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
    const [seatColors, setSeatColors] = useState<Record<string, string>>({});
    const queryClient = useQueryClient();

    const { data: serverMap } = useQuery({
        queryKey: ['map'],
        queryFn: getEventMap,
        refetchInterval: 5000, // Poll every 5s for updates from other admins
    });

    useEffect(() => {
        if (serverMap) {
            setSeatColors(prev => ({ ...prev, ...serverMap }));
        }
    }, [serverMap]);

    const colorMutation = useMutation({
        mutationFn: ({ seatId, color }: { seatId: string; color: string }) =>
            setSeatColor(seatId, color),
        onSuccess: (_, variables) => {
            // Optimistic update
            setSeatColors(prev => ({
                ...prev,
                [variables.seatId]: variables.color
            }));
            setSelectedSeat(null);
        }
    });

    const COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#000000', '#FFFFFF'];

    return (
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-auto flex justify-center items-start">
            <div
                className="grid gap-1.5"
                style={{
                    gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                    width: 'fit-content'
                }}
            >
                {SEATS.map((seat) => (
                    <div
                        key={seat.id}
                        className="w-5 h-5 bg-zinc-700 hover:bg-zinc-500 cursor-pointer rounded-sm flex items-center justify-center transition-colors border border-zinc-800"
                        style={{
                            backgroundColor: seatColors[seat.id] || undefined,
                            borderColor: seatColors[seat.id] ? 'rgba(255,255,255,0.2)' : undefined
                        }}
                        onClick={() => setSelectedSeat(seat.id)}
                        title={seat.id}
                    />
                ))}
            </div>

            {selectedSeat && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedSeat(null)}>
                    <div className="bg-zinc-800 p-4 rounded-lg shadow-xl border border-zinc-700" onClick={e => e.stopPropagation()}>
                        <h3 className="text-white font-bold mb-4 text-center">Assento {selectedSeat}</h3>
                        <div className="grid grid-cols-3 gap-3 mb-2">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    className="w-12 h-12 rounded-full border-2 border-zinc-600 hover:scale-110 transition-transform shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
                                    style={{ backgroundColor: c }}
                                    onClick={() => colorMutation.mutate({ seatId: selectedSeat, color: c })}
                                />
                            ))}
                        </div>
                        {colorMutation.isPending && <p className="text-xs text-zinc-400 text-center mt-2 animate-pulse">Salvando...</p>}
                    </div>
                </div>
            )}
        </div>
    );
}
