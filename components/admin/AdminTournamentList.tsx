import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit2, Trash2, Image as ImageIcon, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Tournament } from '../../types/database';

interface SortableTournamentItemProps {
    key?: string | number;
    tournament: Tournament;
    onUpdate: (id: string, updates: Partial<Tournament>) => void;
    onDelete: (id: string) => void;
    onSelect: (tournament: Tournament) => void;
}

function SortableTournamentItem({ tournament, onUpdate, onDelete, onSelect }: SortableTournamentItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: tournament.id });
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(tournament.name);
    const [status, setStatus] = useState(tournament.status);
    const [gameType, setGameType] = useState(tournament.game_type);
    const [description, setDescription] = useState(tournament.description || '');
    const [prizeAmount, setPrizeAmount] = useState(tournament.prize_amount?.toString() || '');

    const style = { transform: CSS.Transform.toString(transform), transition };

    const handleSave = () => {
        setIsEditing(false);
        const parsedPrize = prizeAmount ? parseFloat(prizeAmount) : null;
        if (name !== tournament.name || status !== tournament.status || gameType !== tournament.game_type || description !== tournament.description || parsedPrize !== tournament.prize_amount) {
            onUpdate(tournament.id, { name, status, game_type: gameType, description, prize_amount: parsedPrize });
        }
    };

    return (
        <div ref={setNodeRef} style={style} className="flex flex-col gap-2 p-4 bg-zinc-900 border border-zinc-800 rounded-xl mb-2 group">
            <div className="flex items-center gap-4">
                <div {...attributes} {...listeners} className="cursor-grab text-zinc-500 hover:text-white transition-colors">
                    <GripVertical size={20} />
                </div>

                <div className="flex-1">
                    {isEditing ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2 items-center">
                                <input
                                    autoFocus
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Tournament Name"
                                    className="bg-zinc-950 text-white px-3 py-1.5 rounded-lg border border-blue-500 outline-none w-full text-sm font-bold"
                                />
                                <select
                                    value={gameType}
                                    onChange={(e) => setGameType(e.target.value as any)}
                                    className="bg-zinc-950 text-white px-3 py-1.5 rounded-lg border border-zinc-700 outline-none text-sm font-bold"
                                >
                                    <option className="bg-zinc-950 text-white" value="billiards">Billiards</option>
                                    <option className="bg-zinc-950 text-white" value="darts">Darts</option>
                                    <option className="bg-zinc-950 text-white" value="chess">Chess</option>
                                </select>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                    className="bg-zinc-950 text-white px-3 py-1.5 rounded-lg border border-zinc-700 outline-none text-sm font-bold"
                                >
                                    <option className="bg-zinc-950 text-white" value="pending">Pending</option>
                                    <option className="bg-zinc-950 text-white" value="in_progress">In Progress</option>
                                    <option className="bg-zinc-950 text-white" value="completed">Completed</option>
                                </select>
                            </div>
                            <div className="flex gap-2 items-center">
                                <input
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Description"
                                    className="bg-zinc-950 text-white px-3 py-1.5 rounded-lg border border-zinc-700 outline-none w-full text-sm"
                                />
                                <input
                                    type="number"
                                    value={prizeAmount}
                                    onChange={(e) => setPrizeAmount(e.target.value)}
                                    placeholder="Prize Amount"
                                    className="bg-zinc-950 text-white px-3 py-1.5 rounded-lg border border-zinc-700 outline-none w-32 text-sm"
                                />
                                <button onClick={handleSave} className="p-1.5 bg-brand text-white rounded-lg hover:bg-brand/80 text-xs font-bold px-3">Save</button>
                                <button onClick={() => {
                                    setIsEditing(false);
                                    setName(tournament.name);
                                    setGameType(tournament.game_type);
                                    setStatus(tournament.status);
                                    setDescription(tournament.description || '');
                                    setPrizeAmount(tournament.prize_amount?.toString() || '');
                                }} className="p-1.5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 text-xs font-bold px-3">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <p className="font-bold text-white text-sm">{tournament.name}</p>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand/10 text-brand">
                                    {tournament.game_type}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    tournament.status === 'pending' ? 'bg-emerald-500/10 text-emerald-400' :
                                    tournament.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                                    'bg-zinc-500/10 text-zinc-400'
                                }`}>
                                    {tournament.status.replace('_', ' ')}
                                </span>
                                {tournament.format && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-400">
                                        {tournament.format.replace('_', ' ')}
                                    </span>
                                )}
                                {tournament.prize_amount && (
                                    <span className="text-xs text-brand font-bold ml-2">Prize: QAR {tournament.prize_amount.toLocaleString()}</span>
                                )}
                                {tournament.start_date && (
                                    <span className="text-[10px] text-zinc-500 font-bold ml-2 uppercase tracking-widest">
                                        {new Date(tournament.start_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                    </span>
                                )}
                            </div>
                            {tournament.description && (
                                <p className="text-xs text-zinc-400">{tournament.description}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onSelect(tournament)} className="p-2 text-zinc-400 hover:text-brand transition-colors rounded-lg hover:bg-brand/10" title="Manage Participants">
                        <Users size={16} />
                    </button>
                    <button onClick={() => setIsEditing(!isEditing)} className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5" title="Edit Tournament">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(tournament.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10" title="Delete Tournament">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

interface AdminTournamentListProps {
    initialTournaments: Tournament[];
    onTournamentsChange: (tournaments: Tournament[]) => void;
    onSelectTournament: (tournament: Tournament) => void;
}

export default function AdminTournamentList({ initialTournaments, onTournamentsChange, onSelectTournament }: AdminTournamentListProps) {
    const [tournaments, setTournaments] = useState(initialTournaments);

    // Sync state if props change
    useEffect(() => {
        setTournaments(initialTournaments);
    }, [initialTournaments]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Handle Drag & Drop Reordering (Optimistic Update)
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = tournaments.findIndex((t) => t.id === active.id);
        const newIndex = tournaments.findIndex((t) => t.id === over.id);

        // Optimistic UI update
        const newOrder = arrayMove(tournaments, oldIndex, newIndex) as Tournament[];
        setTournaments(newOrder);
        onTournamentsChange(newOrder);

        // Prepare payload for Supabase
        const updates = newOrder.map((t, index) => ({ id: t.id, position: index }));

        // Server mutation (RLS protects this if not admin)
        // Note: we don't have position in tournaments table anymore, so we skip upserting position
        // const { error } = await (supabase.from('tournaments') as any).upsert(updates);
        const error = null;

        // Revert if failed
        if (error) {
            console.error('Failed to reorder:', error);
            setTournaments(tournaments); // Revert to previous state
            onTournamentsChange(tournaments);
        }
    };

    // Handle Inline Text Edit (Optimistic Update)
    const handleInlineUpdate = async (id: string, updates: Partial<Tournament>) => {
        const previous = [...tournaments];
        const newTournaments = tournaments.map(t => t.id === id ? { ...t, ...updates } : t);
        setTournaments(newTournaments);
        onTournamentsChange(newTournaments);

        const { error } = await (supabase.from('tournaments') as any).update(updates).eq('id', id);

        if (error) {
            console.error('Failed to update tournament:', error);
            setTournaments(previous); // Revert
            onTournamentsChange(previous);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this tournament?')) return;
        
        const previous = [...tournaments];
        const newTournaments = tournaments.filter(t => t.id !== id);
        setTournaments(newTournaments);
        onTournamentsChange(newTournaments);

        const { error } = await (supabase.from('tournaments') as any).delete().eq('id', id);
        if (error) {
            console.error('Failed to delete tournament:', error);
            setTournaments(previous);
            onTournamentsChange(previous);
        }
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tournaments.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="w-full">
                    {tournaments.map((tournament) => (
                        <SortableTournamentItem
                            key={tournament.id}
                            tournament={tournament}
                            onUpdate={handleInlineUpdate}
                            onDelete={handleDelete}
                            onSelect={onSelectTournament}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
