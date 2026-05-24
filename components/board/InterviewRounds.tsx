"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";
import type { InterviewRound } from "@/lib/mock-data";

interface InterviewRoundsProps {
  rounds: InterviewRound[];
  applicationId: string;
  onChange: (rounds: InterviewRound[]) => void;
}

type EditingRound = { label: string; date: string };

export function InterviewRounds({ rounds, applicationId, onChange }: InterviewRoundsProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EditingRound>({ label: "", date: "" });

  function startAdd() {
    setAdding(true);
    setEditingId(null);
    setForm({ label: "", date: "" });
  }

  function startEdit(round: InterviewRound) {
    setEditingId(round.id);
    setAdding(false);
    setForm({
      label: round.label,
      date: round.date ? new Date(round.date).toISOString().split("T")[0] : "",
    });
  }

  function cancelEdit() {
    setAdding(false);
    setEditingId(null);
    setForm({ label: "", date: "" });
  }

  function commitAdd() {
    if (!form.label.trim()) return;
    const newRound: InterviewRound = {
      id: crypto.randomUUID(),
      applicationId,
      label: form.label.trim(),
      date: form.date ? new Date(form.date) : null,
      createdAt: new Date(),
    };
    onChange([...rounds, newRound]);
    setAdding(false);
    setForm({ label: "", date: "" });
  }

  function commitEdit(id: string) {
    if (!form.label.trim()) return;
    onChange(
      rounds.map((r) =>
        r.id === id
          ? { ...r, label: form.label.trim(), date: form.date ? new Date(form.date) : null }
          : r
      )
    );
    setEditingId(null);
  }

  function deleteRound(id: string) {
    onChange(rounds.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Interview rounds</label>
        <button
          type="button"
          onClick={startAdd}
          className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
        >
          <Plus className="w-3 h-3" />
          Add round
        </button>
      </div>

      <div className="space-y-1.5">
        {rounds.map((round, i) => (
          <div key={round.id}>
            {editingId === round.id ? (
              <RoundForm
                form={form}
                onChange={setForm}
                onCommit={() => commitEdit(round.id)}
                onCancel={cancelEdit}
              />
            ) : (
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg group">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-semibold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{round.label}</p>
                    {round.date && (
                      <p className="text-xs text-gray-400">{formatDate(round.date)}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => startEdit(round)}
                    className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-orange-600 hover:bg-orange-50"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteRound(round.id)}
                    className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {adding && (
          <RoundForm
            form={form}
            onChange={setForm}
            onCommit={commitAdd}
            onCancel={cancelEdit}
          />
        )}

        {rounds.length === 0 && !adding && (
          <p className="text-xs text-gray-400 px-1">No rounds logged yet.</p>
        )}
      </div>
    </div>
  );
}

function RoundForm({
  form,
  onChange,
  onCommit,
  onCancel,
}: {
  form: EditingRound;
  onChange: (f: EditingRound) => void;
  onCommit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex gap-2 items-end p-2 bg-orange-50 rounded-lg border border-orange-100">
      <div className="flex-1">
        <Input
          placeholder="e.g. Technical"
          value={form.label}
          onChange={(e) => onChange({ ...form, label: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && onCommit()}
          autoFocus
        />
      </div>
      <div className="w-36">
        <Input
          type="date"
          value={form.date}
          onChange={(e) => onChange({ ...form, date: e.target.value })}
        />
      </div>
      <div className="flex gap-1 pb-0.5">
        <button
          type="button"
          onClick={onCommit}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-orange-600 text-white hover:bg-orange-700"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
