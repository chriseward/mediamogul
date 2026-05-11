"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type MediaStatus } from "@prisma/client";

const STATUSES: { value: MediaStatus; label: string }[] = [
  { value: "PLANNED", label: "Planned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "DROPPED", label: "Dropped" },
];

type Props = {
  entryId: string;
  initial: {
    status: MediaStatus;
    rating: number | null;
    notes: string | null;
    startedAt: string | null;
    completedAt: string | null;
  };
};

export function EntryEditor({ entryId, initial }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<MediaStatus>(initial.status);
  const [rating, setRating] = useState<string>(initial.rating?.toString() ?? "");
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [startedAt, setStartedAt] = useState(initial.startedAt?.slice(0, 10) ?? "");
  const [completedAt, setCompletedAt] = useState(initial.completedAt?.slice(0, 10) ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch(`/api/entry/${entryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        rating: rating !== "" ? parseFloat(rating) : null,
        notes,
        startedAt: startedAt || null,
        completedAt: completedAt || null,
      }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Remove this from your tracked items?")) return;
    setDeleting(true);
    await fetch(`/api/entry/${entryId}`, { method: "DELETE" });
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Status */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">Status</label>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                status === s.value
                  ? "bg-white text-black border-white"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">
          Rating{" "}
          <span className="text-zinc-500">
            {rating !== "" ? `(${rating}/10)` : "(0–10)"}
          </span>
        </label>
        <input
          type="number"
          min={0}
          max={10}
          step={0.5}
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          placeholder="—"
          className="w-28 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition-colors"
        />
      </div>

      {/* Dates */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-zinc-400">Started</label>
          <input
            type="date"
            value={startedAt}
            onChange={(e) => setStartedAt(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-zinc-400">Completed</label>
          <input
            type="date"
            value={completedAt}
            onChange={(e) => setCompletedAt(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Add your thoughts..."
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-white text-black font-medium px-6 py-2.5 rounded-full hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {saved && <span className="text-sm text-green-400">Saved</span>}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="ml-auto text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
        >
          {deleting ? "Removing..." : "Remove from library"}
        </button>
      </div>
    </div>
  );
}
