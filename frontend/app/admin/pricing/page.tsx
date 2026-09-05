"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PricingPlan } from "@/types";

// ─── Form state ───────────────────────────────────────────────────────────────
interface FormState {
  name: string;
  price: string;
  billingCycle: "monthly" | "yearly";
  featuresRaw: string; // one feature per line for easy editing
  highlighted: boolean;
  displayOrder: string;
  published: boolean;
}

const emptyForm: FormState = {
  name: "",
  price: "0",
  billingCycle: "monthly",
  featuresRaw: "",
  highlighted: false,
  displayOrder: "0",
  published: true,
};

function planToForm(plan: PricingPlan): FormState {
  return {
    name: plan.name,
    price: String(plan.price),
    billingCycle: plan.billingCycle,
    featuresRaw: plan.features.join("\n"),
    highlighted: plan.highlighted,
    displayOrder: String(plan.displayOrder),
    published: plan.published,
  };
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ label, variant }: { label: string; variant: "green" | "yellow" | "teal" | "gray" }) {
  const cls = {
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    yellow: "bg-amber-50 text-amber-700 border border-amber-200/60",
    teal: "bg-teal/10 text-teal-dark border border-teal/20",
    gray: "bg-slate-100 text-slate-600 border border-slate-200/60",
  }[variant];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function AdminPricingPage() {
  const { token } = useAuth();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiRequest<PricingPlan[]>("/api/admin/pricing", { token });
      setPlans(data);
    } catch {
      setGlobalError("Failed to load pricing plans.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  function openCreate() {
    setEditingId(null);
    setFormState(emptyForm);
    setFormError({});
    setShowForm(true);
  }

  function openEdit(plan: PricingPlan) {
    setEditingId(plan._id);
    setFormState(planToForm(plan));
    setFormError({});
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormError({});
  }

  function flash(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError({});

    const body = {
      name: formState.name.trim(),
      price: Number(formState.price),
      billingCycle: formState.billingCycle,
      features: formState.featuresRaw.split("\n").map((s) => s.trim()).filter(Boolean),
      highlighted: formState.highlighted,
      displayOrder: Number(formState.displayOrder),
      published: formState.published,
    };

    try {
      if (editingId) {
        await apiRequest(`/api/admin/pricing/${editingId}`, { method: "PUT", body, token: token! });
        flash("Plan updated.");
      } else {
        await apiRequest("/api/admin/pricing", { method: "POST", body, token: token! });
        flash("Plan created.");
      }
      closeForm();
      fetchPlans();
    } catch (err) {
      if (err instanceof ApiRequestError && err.fieldErrors) {
        setFormError(err.fieldErrors);
      } else if (err instanceof ApiRequestError) {
        setFormError({ _global: err.message });
      }
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiRequest(`/api/admin/pricing/${id}`, { method: "DELETE", token: token! });
      flash("Plan deleted.");
      setDeleteId(null);
      fetchPlans();
    } catch {
      setGlobalError("Delete failed.");
    }
  }

  return (
    <AdminShell>
      <div className="max-w-5xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal">Pricing Tiers</span>
            <h1 className="mt-1 font-display text-3xl font-extrabold text-ink md:text-4xl">Pricing Plans</h1>
            <p className="mt-1 text-sm text-muted">Manage the subscription tiers shown on the public landing page.</p>
          </div>
          <button
            id="create-plan-btn"
            onClick={openCreate}
            className="rounded-full bg-teal px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-dark shadow-md shadow-teal/20"
          >
            + New plan
          </button>
        </div>

        {/* Messages */}
        {globalError && (
          <div role="alert" className="mt-4 rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700">
            {globalError}
          </div>
        )}
        {successMsg && (
          <div role="status" className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-sm text-emerald-700 font-semibold">
            ✓ {successMsg}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="mt-10 flex items-center gap-3 text-sm text-muted">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal border-t-transparent" />
            Loading pricing plans…
          </div>
        ) : plans.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-line bg-white/95 p-8 text-center backdrop-blur-md shadow-sm">
            <p className="text-sm font-medium text-muted">No pricing plans created yet.</p>
            <button
              onClick={openCreate}
              className="mt-4 rounded-full bg-teal px-5 py-2 text-xs font-semibold text-white hover:bg-teal-dark"
            >
              + Create First Plan
            </button>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white/95 backdrop-blur-md shadow-xl">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-surface/80 text-left text-xs uppercase tracking-wider font-bold text-muted">
                <tr>
                  {["Name", "Price", "Cycle", "Order", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {plans.map((plan) => (
                  <tr key={plan._id} className="transition-colors hover:bg-surface/60">
                    <td className="px-6 py-4 font-bold text-ink">
                      <div className="flex items-center gap-2">
                        <span>{plan.name}</span>
                        {plan.highlighted && (
                          <Badge label="★ Highlighted" variant="teal" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-ink">${plan.price}</td>
                    <td className="px-6 py-4 font-medium text-muted capitalize">{plan.billingCycle}</td>
                    <td className="px-6 py-4 font-medium text-muted">{plan.displayOrder}</td>
                    <td className="px-6 py-4">
                      <Badge
                        label={plan.published ? "Published" : "Unpublished"}
                        variant={plan.published ? "green" : "gray"}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(plan)}
                          className="rounded-full bg-teal/10 px-3.5 py-1 text-xs font-semibold text-teal-dark hover:bg-teal hover:text-white transition-all"
                          id={`edit-plan-${plan._id}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(plan._id)}
                          className="rounded-full bg-red-50 px-3.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-600 hover:text-white transition-all"
                          id={`delete-plan-${plan._id}`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete confirmation */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-md px-4">
            <div className="w-full max-w-md text-center rounded-2xl bg-white p-8 shadow-2xl border border-line">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                ⚠️
              </div>
              <h2 className="text-xl font-bold text-ink">Delete this plan?</h2>
              <p className="mt-2 text-sm text-muted">
                This action cannot be undone. The plan will be permanently removed.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 shadow-md"
                  id="confirm-delete-btn"
                >
                  Delete Plan
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  className="rounded-full border border-line px-6 py-2.5 text-sm font-medium text-ink hover:bg-surface"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-md px-4 py-8">
            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl border border-line">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <h2 className="text-xl font-bold text-ink">
                  {editingId ? "Edit Pricing Plan" : "New Pricing Plan"}
                </h2>
                <button
                  onClick={closeForm}
                  className="text-muted hover:text-ink text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              {formError._global && (
                <div role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError._global}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
                <Field label="Plan name" error={formError.name}>
                  <input
                    id="plan-name"
                    className={input(!!formError.name)}
                    value={formState.name}
                    onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                    required
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Price (USD)" error={formError.price}>
                    <input
                      id="plan-price"
                      type="number"
                      min={0}
                      className={input(!!formError.price)}
                      value={formState.price}
                      onChange={(e) => setFormState((s) => ({ ...s, price: e.target.value }))}
                    />
                  </Field>
                  <Field label="Billing cycle" error={formError.billingCycle}>
                    <select
                      id="plan-billing"
                      className={input(!!formError.billingCycle)}
                      value={formState.billingCycle}
                      onChange={(e) =>
                        setFormState((s) => ({
                          ...s,
                          billingCycle: e.target.value as "monthly" | "yearly",
                        }))
                      }
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </Field>
                </div>

                <Field
                  label="Features (one per line)"
                  error={formError.features}
                >
                  <textarea
                    id="plan-features"
                    rows={5}
                    className={input(!!formError.features)}
                    value={formState.featuresRaw}
                    onChange={(e) => setFormState((s) => ({ ...s, featuresRaw: e.target.value }))}
                    placeholder="Up to 5 team members&#10;Basic time tracking"
                  />
                </Field>

                <Field label="Display order" error={formError.displayOrder}>
                  <input
                    id="plan-order"
                    type="number"
                    className={input(!!formError.displayOrder)}
                    value={formState.displayOrder}
                    onChange={(e) => setFormState((s) => ({ ...s, displayOrder: e.target.value }))}
                  />
                </Field>

                <div className="flex gap-6 rounded-xl bg-surface p-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-ink cursor-pointer">
                    <input
                      id="plan-highlighted"
                      type="checkbox"
                      checked={formState.highlighted}
                      onChange={(e) => setFormState((s) => ({ ...s, highlighted: e.target.checked }))}
                      className="h-4 w-4 rounded accent-teal"
                    />
                    Highlighted (recommended)
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-ink cursor-pointer">
                    <input
                      id="plan-published"
                      type="checkbox"
                      checked={formState.published}
                      onChange={(e) => setFormState((s) => ({ ...s, published: e.target.checked }))}
                      className="h-4 w-4 rounded accent-teal"
                    />
                    Published
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-line">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink hover:bg-surface"
                  >
                    Cancel
                  </button>
                  <button
                    id="plan-save-btn"
                    type="submit"
                    className="rounded-full bg-teal px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark shadow-md"
                  >
                    {editingId ? "Save changes" : "Create plan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function input(hasError: boolean) {
  return `w-full rounded-lg border px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-teal transition-colors ${
    hasError ? "border-red-400" : "border-line"
  }`;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
