"use client";

import { useCallback, useEffect, useState } from "react";
import { parseBffErrorMessage } from "../../lib/api/bff-json";
import type { SuperadminResourceKind } from "../../lib/superadmin/types";
import { SuperadminShell } from "./SuperadminShell";
import styles from "./superadmin.module.css";

type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "email" | "textarea";
  required?: boolean;
};

type ColumnDef = {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => string;
};

type SuperadminResourceClientProps = {
  kind: SuperadminResourceKind;
  title: string;
  subtitle: string;
  listKey: string;
  listPath: string;
  itemPath: (id: string) => string;
  columns: ColumnDef[];
  fields: FieldDef[];
  /** List-only (e.g. GET /users) */
  readOnly?: boolean;
  /** Shown above the table */
  apiNote?: string;
};

function pickRows(payload: Record<string, unknown>, listKey: string): Record<string, unknown>[] {
  const raw = payload[listKey];
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
}

function emptyForm(fields: FieldDef[]): Record<string, string> {
  return Object.fromEntries(fields.map((f) => [f.key, ""]));
}

function rowToForm(row: Record<string, unknown>, fields: FieldDef[]): Record<string, string> {
  const out = emptyForm(fields);
  for (const f of fields) {
    const v = row[f.key];
    if (typeof v === "string") out[f.key] = v;
    else if (v != null) out[f.key] = String(v);
  }
  if (fields.some((f) => f.key === "domain") && !out.domain && typeof row.description === "string") {
    out.domain = row.description;
  }
  return out;
}

export function SuperadminResourceClient({
  kind,
  title,
  subtitle,
  listKey,
  listPath,
  itemPath,
  columns,
  fields,
  readOnly = false,
  apiNote,
}: SuperadminResourceClientProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiPending, setApiPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>(() => emptyForm(fields));
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(listPath, { credentials: "same-origin", cache: "no-store" });
      if (res.status === 503 || res.status === 501) {
        setApiPending(true);
        setRows([]);
        if (res.status === 501) {
          const j = (await res.json().catch(() => ({}))) as { message?: string };
          setError(typeof j.message === "string" ? j.message : "Not available on the API yet.");
        }
        return;
      }
      if (!res.ok) {
        throw new Error(await parseBffErrorMessage(res, `Could not load ${kind}.`));
      }
      setApiPending(false);
      const data = (await res.json()) as Record<string, unknown>;
      setRows(pickRows(data, listKey));
    } catch (e) {
      setError(e instanceof Error ? e.message : `Could not load ${kind}.`);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [kind, listKey, listPath]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm(fields));
    setModalOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    const id = typeof row.id === "string" ? row.id : "";
    setEditingId(id || null);
    setForm(rowToForm(row, fields));
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, string> = {};
      for (const f of fields) {
        body[f.key] = form[f.key]?.trim() ?? "";
      }
      const url = editingId ? itemPath(editingId) : listPath;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 503) {
        setApiPending(true);
        throw new Error("Backend API is not connected yet.");
      }
      if (!res.ok) {
        throw new Error(await parseBffErrorMessage(res, "Save failed."));
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!globalThis.confirm("Delete this record?")) return;
    setError(null);
    try {
      const res = await fetch(itemPath(id), { method: "DELETE", credentials: "same-origin" });
      if (res.status === 503) {
        setApiPending(true);
        throw new Error("Backend API is not connected yet.");
      }
      if (!res.ok) {
        throw new Error(await parseBffErrorMessage(res, "Delete failed."));
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    }
  };

  return (
    <SuperadminShell title={title} subtitle={subtitle}>
      {apiNote ? <div className={`${styles.banner} ${styles.bannerWarn}`}>{apiNote}</div> : null}
      {apiPending ? (
        <div className={`${styles.banner} ${styles.bannerWarn}`}>
          Connect <code>NEXT_PUBLIC_BACKEND_API_BASE_URL</code> (e.g. http://localhost:3000) and sign in with an{" "}
          <code>ADMIN</code> account.
        </div>
      ) : null}
      {error ? (
        <div className={styles.banner} role="alert">
          {error}
        </div>
      ) : null}

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <strong>{title}</strong>
          {!readOnly ? (
            <button type="button" className={styles.btnPrimary} onClick={openCreate}>
              Add new
            </button>
          ) : null}
        </div>

        {loading ? (
          <p className={styles.loading}>Loading…</p>
        ) : rows.length === 0 ? (
          <p className={styles.empty}>No records yet{apiPending ? " (API pending)" : ""}.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                  {!readOnly ? <th>Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const id = typeof row.id === "string" ? row.id : "";
                  return (
                    <tr key={id || String(Math.random())}>
                      {columns.map((c) => {
                        let cell: string;
                        if (c.render) {
                          cell = c.render(row);
                        } else if (typeof row[c.key] === "string") {
                          cell = row[c.key] as string;
                        } else if (row[c.key] != null) {
                          cell = String(row[c.key]);
                        } else {
                          cell = "—";
                        }
                        return <td key={c.key}>{cell}</td>;
                      })}
                      {!readOnly ? (
                        <td>
                          <div className={styles.rowActions}>
                            <button type="button" className={styles.btnSm} onClick={() => openEdit(row)} disabled={!id}>
                              Edit
                            </button>
                            <button
                              type="button"
                              className={`${styles.btnSm} ${styles.btnSmDanger}`}
                              onClick={() => void remove(id)}
                              disabled={!id}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen ? (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <h3>{editingId ? "Edit" : "Create"} {title.slice(0, -1)}</h3>
            {fields.map((f) => (
              <label key={f.key} className={styles.field}>
                <span>{f.label}</span>
                {f.type === "textarea" ? (
                  <textarea
                    value={form[f.key] ?? ""}
                    required={f.required}
                    rows={3}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  />
                ) : (
                  <input
                    type={f.type === "email" ? "email" : "text"}
                    value={form[f.key] ?? ""}
                    required={f.required}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  />
                )}
              </label>
            ))}
            <div className={styles.modalActions}>
              <button type="button" className={styles.btnGhost} onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className={styles.btnPrimary} disabled={saving} onClick={() => void save()}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </SuperadminShell>
  );
}
