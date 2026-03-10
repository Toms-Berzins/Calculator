import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createCustomer, updateCustomer, deleteCustomer } from '@/lib/actions/jobs'
import { redirect } from 'next/navigation'
import { getDict } from '@/i18n/server'
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
  const t = await getDict()

  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, company, email, phone')
    .order('name')

  const stats = {
    total:       customers?.length ?? 0,
    withCompany: customers?.filter((c) => c.company).length ?? 0,
    withEmail:   customers?.filter((c) => c.email).length ?? 0,
    withPhone:   customers?.filter((c) => c.phone).length ?? 0,
  }

  return (
    <div className={styles.shell}>

      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t.customers.title}</h1>
          <p className={styles.pageSubtitle}>{t.customers.total(stats.total)}</p>
        </div>
      </div>

      {message && (
        <p className={`${styles.feedback} ${status === 'error' ? styles.feedbackError : styles.feedbackSuccess}`}>
          {message}
        </p>
      )}

      {/* ── Stats strip ── */}
      {!!stats.total && (
        <div className={styles.statsStrip}>
          {([
            { value: stats.total,       label: t.customers.statTotal },
            { value: stats.withCompany, label: t.customers.statCompany },
            { value: stats.withEmail,   label: t.customers.statEmail },
            { value: stats.withPhone,   label: t.customers.statPhone },
          ] as const).map(({ value, label }) => (
            <div key={label} className={styles.statCard}>
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Add customer (collapsible) ── */}
      <details className={styles.createDetails}>
        <summary className={styles.createSummary}>
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {t.customers.addCustomer}
        </summary>
        <div className={styles.createCard}>
          <form action={handleCreateCustomer} className={styles.customerForm}>
            <div className={styles.formGrid}>
              <label className="text-sm">
                <span className={styles.fieldLabel}>{t.customers.name}</span>
                <input name="name" required className="input-field w-full rounded-lg px-3 py-2 text-sm" placeholder={t.customers.namePlaceholder} />
              </label>
              <label className="text-sm">
                <span className={styles.fieldLabel}>{t.customers.company}</span>
                <input name="company" className="input-field w-full rounded-lg px-3 py-2 text-sm" placeholder={t.customers.companyPlaceholder} />
              </label>
              <label className="text-sm">
                <span className={styles.fieldLabel}>{t.customers.email}</span>
                <input name="email" type="email" className="input-field w-full rounded-lg px-3 py-2 text-sm" placeholder={t.customers.emailPlaceholder} />
              </label>
              <label className="text-sm">
                <span className={styles.fieldLabel}>{t.customers.phone}</span>
                <input name="phone" className="input-field w-full rounded-lg px-3 py-2 text-sm" placeholder={t.customers.phonePlaceholder} />
              </label>
            </div>
            <div className={styles.actionRow}>
              <button type="submit" className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold">{t.customers.createCustomer}</button>
            </div>
          </form>
        </div>
      </details>

      {/* ── Empty state ── */}
      {!customers?.length && (
        <div className={`flex flex-col items-center justify-center rounded-2xl py-16 text-center ${styles.emptyCard}`}>
          <svg className={`mb-3 w-10 h-10 ${styles.emptyIcon}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          <p className={`text-sm font-medium ${styles.emptyText}`}>{t.customers.noCustomers}</p>
        </div>
      )}

      {/* ── Customers table ── */}
      {!!customers?.length && (
        <div className={styles.tableWrap}>
          {customers.map((c) => (
            <div key={c.id} className={styles.tableRow}>
              <div className={styles.rowMain}>
                {/* Avatar */}
                <div className={styles.avatar} aria-hidden>
                  {c.name.charAt(0).toUpperCase()}
                </div>

                {/* Identity */}
                <div className={styles.rowInfo}>
                  <span className={styles.rowName}>{c.name}</span>
                  {c.company && <span className={styles.rowCompany}>{c.company}</span>}
                </div>

                {/* Contact links */}
                <div className={styles.rowContact}>
                  {c.email && (
                    <a href={`mailto:${c.email}`} className={styles.contactLink}>
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      {c.email}
                    </a>
                  )}
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className={styles.contactLink}>
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      {c.phone}
                    </a>
                  )}
                </div>

                {/* Delete + Edit toggle */}
                <div className={styles.rowActions}>
                  <DeleteCustomerButton customerId={c.id} action={handleDeleteCustomer} />
                  {/* Edit toggle — panel is a full-width sibling below, shown via CSS :has() */}
                  <details className={styles.editDetails}>
                    <summary className={styles.editSummary}>
                      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      {t.customers.edit}
                    </summary>
                  </details>
                </div>
              </div>

              {/* Edit panel: full-width, shown via CSS :has(.editDetails[open]) */}
              <div className={styles.editPanel}>
                <form action={handleUpdateCustomer} className={styles.customerForm}>
                  <input type="hidden" name="id" value={c.id} />
                  <div className={styles.formGrid}>
                    <label className="text-sm">
                      <span className={styles.fieldLabel}>{t.customers.name}</span>
                      <input name="name" required defaultValue={c.name} className="input-field w-full rounded-lg px-3 py-2 text-sm" />
                    </label>
                    <label className="text-sm">
                      <span className={styles.fieldLabel}>{t.customers.company}</span>
                      <input name="company" defaultValue={c.company ?? ''} className="input-field w-full rounded-lg px-3 py-2 text-sm" />
                    </label>
                    <label className="text-sm">
                      <span className={styles.fieldLabel}>{t.customers.email}</span>
                      <input name="email" type="email" defaultValue={c.email ?? ''} className="input-field w-full rounded-lg px-3 py-2 text-sm" />
                    </label>
                    <label className="text-sm">
                      <span className={styles.fieldLabel}>{t.customers.phone}</span>
                      <input name="phone" defaultValue={c.phone ?? ''} className="input-field w-full rounded-lg px-3 py-2 text-sm" />
                    </label>
                  </div>
                  <div className={styles.actionRow}>
                    <button type="submit" className="btn-ghost rounded-lg px-4 py-2 text-sm font-semibold">{t.customers.saveChanges}</button>
                  </div>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
