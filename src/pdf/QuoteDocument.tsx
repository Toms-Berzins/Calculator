import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { QuoteWithRelations } from '@/types/database'

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#111' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  brandName: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#1d4ed8' },
  brandSub: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  quoteTitle: { fontSize: 16, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  section: { marginBottom: 20 },
  label: { fontSize: 9, color: '#6b7280', marginBottom: 2, textTransform: 'uppercase' },
  value: { fontSize: 10 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: '6 8',
    borderRadius: 4,
    marginBottom: 2,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: '5 8',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: 'right' },
  colPrice: { flex: 1, textAlign: 'right' },
  colTotal: { flex: 1, textAlign: 'right' },
  totalsBox: { alignItems: 'flex-end', marginTop: 12 },
  totalsRow: { flexDirection: 'row', gap: 24, marginBottom: 4 },
  totalsLabel: { width: 80, color: '#6b7280', textAlign: 'right' },
  totalsValue: { width: 80, textAlign: 'right', fontFamily: 'Helvetica-Bold' },
  grandTotal: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#1d4ed8' },
  notes: { marginTop: 24, padding: 12, backgroundColor: '#f9fafb', borderRadius: 4 },
  notesLabel: { fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#9ca3af', fontSize: 8 },
})

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n)
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}

interface Props {
  quote: QuoteWithRelations
}

export function QuoteDocument({ quote }: Props) {
  const customer = quote.jobs?.customers
  const job = quote.jobs

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.brandName}>QuoteCalc</Text>
            <Text style={s.brandSub}>Professional Quote</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.quoteTitle}>Quote</Text>
            <Text style={{ color: '#6b7280' }}>Date: {fmtDate(quote.created_at)}</Text>
            <Text style={{ color: '#6b7280', marginTop: 2 }}>
              Ref: {quote.id.slice(0, 8).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Customer / Job info */}
        <View style={{ flexDirection: 'row', gap: 24, marginBottom: 24 }}>
          <View style={s.section}>
            <Text style={s.label}>Prepared for</Text>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>{customer?.name ?? '—'}</Text>
            {customer?.company && <Text style={s.value}>{customer.company}</Text>}
            {customer?.email && <Text style={s.value}>{customer.email}</Text>}
            {customer?.phone && <Text style={s.value}>{customer.phone}</Text>}
          </View>
          <View style={s.section}>
            <Text style={s.label}>Job</Text>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>{job?.title ?? '—'}</Text>
            {job?.description && (
              <Text style={{ ...s.value, color: '#6b7280', marginTop: 2 }}>{job.description}</Text>
            )}
          </View>
        </View>

        {/* Items table */}
        <View style={s.tableHeader}>
          <Text style={s.colDesc}>Description</Text>
          <Text style={s.colQty}>Qty</Text>
          <Text style={s.colPrice}>Unit Price</Text>
          <Text style={s.colTotal}>Total</Text>
        </View>

        {quote.quote_items
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((item) => (
            <View key={item.id} style={s.tableRow}>
              <Text style={s.colDesc}>{item.description}</Text>
              <Text style={s.colQty}>{item.quantity}</Text>
              <Text style={s.colPrice}>{fmt(item.unit_price)}</Text>
              <Text style={s.colTotal}>{fmt(item.subtotal)}</Text>
            </View>
          ))}

        {/* Totals */}
        <View style={s.totalsBox}>
          <View style={s.totalsRow}>
            <Text style={s.totalsLabel}>Subtotal</Text>
            <Text style={s.totalsValue}>{fmt(quote.subtotal)}</Text>
          </View>
          {quote.tax_rate > 0 && (
            <View style={s.totalsRow}>
              <Text style={s.totalsLabel}>VAT ({quote.tax_rate}%)</Text>
              <Text style={s.totalsValue}>{fmt(quote.subtotal * (quote.tax_rate / 100))}</Text>
            </View>
          )}
          <View style={{ ...s.totalsRow, marginTop: 4 }}>
            <Text style={{ ...s.totalsLabel, ...s.grandTotal }}>Total</Text>
            <Text style={{ ...s.totalsValue, ...s.grandTotal }}>{fmt(quote.total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {quote.notes && (
          <View style={s.notes}>
            <Text style={s.notesLabel}>Notes</Text>
            <Text>{quote.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={s.footer}>
          This quote is valid for 30 days from the date of issue.
        </Text>
      </Page>
    </Document>
  )
}
