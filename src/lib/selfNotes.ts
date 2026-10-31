/**
 * Self-explanation notes.
 *
 * Writing "why is this the answer" in your own words is one of the better
 * supported study moves (elaborative interrogation / self-explanation).
 * Reading the worked solution is passive; typing one line forces retrieval.
 *
 * Stored per question on the device — deliberately local, like the mistake
 * reasons, because these are notes-to-self rather than shareable content.
 */

export const SELF_NOTES_KEY = 'hsc28_self_notes_v1';
export const SELF_NOTE_LIMIT = 600;

export function loadSelfNotes(): Record<string, string> {
  try {
    const raw = localStorage.getItem(SELF_NOTES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, string> = {};
    Object.entries(parsed).forEach(([id, text]) => {
      if (typeof text === 'string' && text.trim().length > 0) out[id] = text.slice(0, SELF_NOTE_LIMIT);
    });
    return out;
  } catch {
    return {};
  }
}

export function saveSelfNote(questionId: string, text: string): Record<string, string> {
  const next = { ...loadSelfNotes() };
  const cleaned = text.slice(0, SELF_NOTE_LIMIT);
  if (cleaned.trim().length === 0) delete next[questionId];
  else next[questionId] = cleaned;
  try {
    localStorage.setItem(SELF_NOTES_KEY, JSON.stringify(next));
  } catch {
    /* storage blocked — the textarea still holds the text for this session */
  }
  return next;
}

export function selfNoteCount(): number {
  return Object.keys(loadSelfNotes()).length;
}
