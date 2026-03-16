'use client'

import { useT } from '@/i18n/context'
import type { LineItem } from '@/hooks/useQuoteCalculator'
import { formatCurrency } from '@/lib/utils/format'
import styles from './QuoteEditor.module.css'

interface Props {
  items: LineItem[]
  onUpdate: (tempId: string, field: keyof LineItem, value: string | number) => void
  onRemove: (tempId: string) => void
  onAdd: () => void
}

export function LineItemsTable({ items, onUpdate, onRemove, onAdd }: Props) {
  const t = useT()

  return (
    <section className={styles.itemsCard}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{t.quote.lineItems}</h2>
        <span className={styles.sectionMeta}>{t.quote.items(items.length)}</span>
      </div>

      {items.length === 0 ? (
        <p className={styles.itemsEmpty}>{t.table.itemDescriptionPlaceholder}</p>
      ) : (
        <div className={styles.itemsTable}>
          <div className={styles.itemsHeader}>
            <span>{t.table.description}</span>
            <span>{t.table.qtyShort}</span>
            <span>{t.table.unitPriceShort}</span>
            <span>{t.table.totalShort}</span>
            <span />
          </div>

          {items.map((item) => (
            <div key={item.tempId} className={styles.itemsRow}>
              <input
                type="text"
                value={item.description}
                onChange={(e) => onUpdate(item.tempId, 'description', e.target.value)}
                placeholder={t.table.itemDescriptionPlaceholder}
                className={`input-field ${styles.itemsInput}`}
                aria-label={t.table.description}
              />
              <input
                type="number"
                min={1}
                step={1}
                value={item.quantity}
                onChange={(e) =>
                  onUpdate(item.tempId, 'quantity', Math.max(1, Number(e.target.value) || 1))
                }
                className={`input-field tabular-nums ${styles.itemsInputNarrow}`}
                aria-label={t.table.qtyShort}
              />
              <input
                type="number"
                min={0}
                step={0.01}
                value={item.unit_price}
                onChange={(e) =>
                  onUpdate(item.tempId, 'unit_price', Number(e.target.value))
                }
                className={`input-field tabular-nums ${styles.itemsInputNarrow}`}
                aria-label={t.table.unitPriceShort}
              />
              <span className={`tabular-nums ${styles.itemsSubtotal}`}>
                {formatCurrency(item.subtotal)}
              </span>
              <button
                type="button"
                onClick={() => onRemove(item.tempId)}
                className={styles.itemsDeleteBtn}
                aria-label={t.table.removeItem}
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onAdd}
        className={`btn-ghost ${styles.addLineBtn}`}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        {t.table.addItem}
      </button>
    </section>
  )
}
