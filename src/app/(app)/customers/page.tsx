import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createCustomer, updateCustomer, deleteCustomer } from '@/lib/actions/jobs'
import { redirect } from 'next/navigation'
import { DeleteCustomerButton } from '@/components/customers/DeleteCustomerButton'
import styles from './customers.module.css'

interface CustomersPageProps {
  searchParams?: Promise<{ status?: string; message?: string }>
}

function getErrorMessage(caught: unknown) {
  if (caught instanceof Error && caught.message) return caught.message
  return 'Something went wrong'
}

function readField(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

function redirectWithStatus(status: 'success' | 'error', message: string) {
  redirect(`/customers?status=${status}&message=${encodeURIComponent(message)}`)
}

function getCustomerFormPayload(formData: FormData) {
  return {
    id: readField(formData, 'id'),
    name: readField(formData, 'name').trim(),
    company: readField(formData, 'company'),
    email: readField(formData, 'email'),
    phone: readField(formData, 'phone'),
    password: readField(formData, 'password'),
  }
}

function redirectFromError(caught: unknown) {
  redirectWithStatus('error', getErrorMessage(caught))
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const resolvedSearchParams = await searchParams
  const status = resolvedSearchParams?.status
  const message = resolvedSearchParams?.message

  async function handleCreateCustomer(formData: FormData) {
    'use server'

    const { name, company, email, phone } = getCustomerFormPayload(formData)

    if (!name) {
      redirectWithStatus('error', 'Customer name is required')
    }

    try {
      await createCustomer({ name, company, email, phone })
    } catch (caught) {
      redirectFromError(caught)
    }

    redirectWithStatus('success', 'Customer created')
  }

  async function handleUpdateCustomer(formData: FormData) {
    'use server'

    const { id, name, company, email, phone } = getCustomerFormPayload(formData)

    if (!id || !name) {
      redirectWithStatus('error', 'Customer name is required')
    }

    try {
      await updateCustomer({ id, name, company, email, phone })
    } catch (caught) {
      redirectFromError(caught)
    }

    redirectWithStatus('success', 'Customer updated')
  }

  async function handleDeleteCustomer(formData: FormData) {
    'use server'

    const { id, password } = getCustomerFormPayload(formData)
    if (!id) {
      redirectWithStatus('error', 'Missing customer id')
    }

    try {
      await deleteCustomer(id, password)
    } catch (caught) {
      redirectFromError(caught)
    }

    redirectWithStatus('success', 'Customer deleted')
  }

  const supabase = await createServerSupabaseClient()

  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, company, email, phone')
    .order('name')

  return (
    <div>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold tracking-tight ${styles.pageTitle}`}>
          Customers
        </h1>
        <p className={`mt-1 text-sm ${styles.pageSubtitle}`}>
          {customers?.length ?? 0} total
        </p>
      </div>

      {message && (
        <p
          className={`${styles.feedback} ${status === 'error' ? styles.feedbackError : styles.feedbackSuccess}`}
        >
          {message}
        </p>
      )}

      <section className={`mb-6 rounded-2xl p-4 ${styles.createCard}`}>
        <h2 className={`text-sm font-semibold ${styles.pageTitle}`}>Add customer</h2>
        <form action={handleCreateCustomer} className={styles.customerForm}>
          <div className={styles.formGrid}>
            <label className="text-sm">
              <span className={styles.fieldLabel}>Name</span>
              <input
                name="name"
                required
                className="input-field w-full rounded-lg px-3 py-2 text-sm"
                placeholder="Customer name"
              />
            </label>
            <label className="text-sm">
              <span className={styles.fieldLabel}>Company</span>
              <input
                name="company"
                className="input-field w-full rounded-lg px-3 py-2 text-sm"
                placeholder="Company (optional)"
              />
            </label>
            <label className="text-sm">
              <span className={styles.fieldLabel}>Email</span>
              <input
                name="email"
                type="email"
                className="input-field w-full rounded-lg px-3 py-2 text-sm"
                placeholder="email@example.com"
              />
            </label>
            <label className="text-sm">
              <span className={styles.fieldLabel}>Phone</span>
              <input
                name="phone"
                className="input-field w-full rounded-lg px-3 py-2 text-sm"
                placeholder="+355..."
              />
            </label>
          </div>

          <div className={styles.actionRow}>
            <button type="submit" className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold">
              Create customer
            </button>
          </div>
        </form>
      </section>

      {!customers?.length && (
        <div
          className={`flex flex-col items-center justify-center rounded-2xl py-16 text-center ${styles.emptyCard}`}
        >
          <svg
            className={`mb-3 w-10 h-10 ${styles.emptyIcon}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          <p className={`text-sm font-medium ${styles.emptyText}`}>
            No customers yet
          </p>
        </div>
      )}

      <ul className="space-y-2.5">
        {customers?.map((c) => (
          <li
            key={c.id}
            className={`rounded-2xl px-5 py-4 ${styles.customerCard}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p
                  className={`font-semibold text-sm ${styles.customerName}`}
                >
                  {c.name}
                </p>
                {c.company && (
                  <p className={`mt-0.5 text-sm ${styles.customerCompany}`}>
                    {c.company}
                  </p>
                )}
              </div>

              {/* Avatar initial */}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${styles.avatar}`}
              >
                {c.name.charAt(0).toUpperCase()}
              </div>
            </div>

            {(c.email || c.phone) && (
              <div
                className={`mt-3 flex flex-wrap gap-3 pt-3 ${styles.contactDivider}`}
              >
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="link-muted flex items-center gap-1.5 text-sm"
                  >
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    {c.email}
                  </a>
                )}
                {c.phone && (
                  <a
                    href={`tel:${c.phone}`}
                    className="link-muted flex items-center gap-1.5 text-sm"
                  >
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {c.phone}
                  </a>
                )}
              </div>
            )}

            <div className={styles.customerActions}>
              <details className={styles.editDetails}>
                <summary className={styles.editSummary}>Edit</summary>

                <form action={handleUpdateCustomer} className={styles.customerForm}>
                  <input type="hidden" name="id" value={c.id} />

                  <div className={styles.formGrid}>
                    <label className="text-sm">
                      <span className={styles.fieldLabel}>Name</span>
                      <input
                        name="name"
                        required
                        defaultValue={c.name}
                        className="input-field w-full rounded-lg px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-sm">
                      <span className={styles.fieldLabel}>Company</span>
                      <input
                        name="company"
                        defaultValue={c.company ?? ''}
                        className="input-field w-full rounded-lg px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-sm">
                      <span className={styles.fieldLabel}>Email</span>
                      <input
                        name="email"
                        type="email"
                        defaultValue={c.email ?? ''}
                        className="input-field w-full rounded-lg px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-sm">
                      <span className={styles.fieldLabel}>Phone</span>
                      <input
                        name="phone"
                        defaultValue={c.phone ?? ''}
                        className="input-field w-full rounded-lg px-3 py-2 text-sm"
                      />
                    </label>
                  </div>

                  <div className={styles.actionRow}>
                    <button type="submit" className="btn-ghost rounded-lg px-4 py-2 text-sm font-semibold">
                      Save changes
                    </button>
                  </div>
                </form>
              </details>

              <DeleteCustomerButton customerId={c.id} action={handleDeleteCustomer} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
