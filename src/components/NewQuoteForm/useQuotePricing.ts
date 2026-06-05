import { useMemo } from 'react'
import { calculate3DPrintPrice } from '@/hooks/useQuoteCalculator'
import type { BulkDiscountTier } from '@/types/database'
import type { JobConstantKey } from './NewQuoteForm.types'

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100
}

function isMatchingTier(tier: BulkDiscountTier, qty: number) {
  if (qty < tier.min_qty) {
    return false
  }

  if (tier.max_qty !== null && tier.max_qty < tier.min_qty) {
    return false
  }

  return tier.max_qty === null || qty <= tier.max_qty
}

function normalizeDiscountPercent(discountPercent: number) {
  if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 100) {
    return 0
  }

  return discountPercent
}

export function findMatchingTier(tiers: BulkDiscountTier[], qty: number): BulkDiscountTier | null {
  const matchingTiers = tiers.filter((tier) => isMatchingTier(tier, qty))

  return matchingTiers.length === 1 ? matchingTiers[0] : null
}

function buildPriceCalculationInput(input: UseQuotePricingInput) {
  return {
    materialWeightGrams: input.materialWeightGrams,
    materialPricePerKg: input.jobConstants.material_price_per_kg,
    materialOverheadPercent: input.jobConstants.material_overhead_percent,
    printTimeHours: input.printTimeHours,
    machineRatePerHour: input.jobConstants.machine_rate_per_hour,
    setupTimeHours: input.setupTimeHours,
    laborRatePerHour: input.jobConstants.labor_rate_per_hour,
    powerConsumptionKw: input.jobConstants.power_consumption_kw,
    electricityRatePerKwh: input.jobConstants.electricity_rate_per_kwh,
    postProcessingCost: input.postProcessingCost,
    packagingCost: input.jobConstants.packaging_cost,
    shippingCost: input.jobConstants.shipping_cost,
    failureRatePercent: input.jobConstants.failure_rate_percent,
    marginPercent: input.jobConstants.margin_percent,
  }
}

function calculateUnitPricing(
  unitPrice: number,
  difficultyMultiplierPercent: number,
  discountPercent: number,
) {
  const difficultyMultiplier = difficultyMultiplierPercent / 100
  const preDiscountUnitPrice = roundCurrency(unitPrice * difficultyMultiplier)
  const calculatedUnitPrice =
    discountPercent > 0
      ? roundCurrency(preDiscountUnitPrice * (1 - discountPercent / 100))
      : preDiscountUnitPrice

  return {
    preDiscountUnitPrice,
    calculatedUnitPrice,
    discountAmount: roundCurrency(preDiscountUnitPrice - calculatedUnitPrice),
  }
}

function calculateQuoteTotals(subtotal: number, taxRate: number, lineSubtotal: number) {
  const quoteSubtotal = roundCurrency(subtotal + lineSubtotal)
  const quoteTaxAmount = roundCurrency(quoteSubtotal * (taxRate / 100))

  return {
    quoteSubtotal,
    quoteTaxAmount,
    quoteTotal: roundCurrency(quoteSubtotal + quoteTaxAmount),
  }
}

interface UseQuotePricingInput {
  partName: string
  partQuantity: number
  materialWeightGrams: number
  printTimeHours: number
  setupTimeHours: number
  postProcessingCost: number
  subtotal: number
  taxRate: number
  jobConstants: Record<JobConstantKey, number>
  bulkDiscountTiers: BulkDiscountTier[]
}

export function useQuotePricing(input: UseQuotePricingInput) {
  const pricing = useMemo(
    () => calculate3DPrintPrice(buildPriceCalculationInput(input)),
    [
      input.materialWeightGrams,
      input.printTimeHours,
      input.setupTimeHours,
      input.postProcessingCost,
      input.jobConstants.packaging_cost,
      input.jobConstants.shipping_cost,
      input.jobConstants.material_price_per_kg,
      input.jobConstants.material_overhead_percent,
      input.jobConstants.machine_rate_per_hour,
      input.jobConstants.labor_rate_per_hour,
      input.jobConstants.power_consumption_kw,
      input.jobConstants.electricity_rate_per_kwh,
      input.jobConstants.failure_rate_percent,
      input.jobConstants.margin_percent,
    ],
  )

  const matchedTier = useMemo(
    () => findMatchingTier(input.bulkDiscountTiers, input.partQuantity),
    [input.bulkDiscountTiers, input.partQuantity],
  )
  const discountPercent = normalizeDiscountPercent(
    matchedTier ? Number(matchedTier.discount_percent) : 0,
  )
  const { preDiscountUnitPrice, calculatedUnitPrice, discountAmount } = calculateUnitPricing(
    pricing.unitPrice,
    input.jobConstants.difficulty_multiplier_percent,
    discountPercent,
  )
  const calculatedDescription = input.partName.trim() || '3D print job'
  const calculatedLineSubtotal = roundCurrency(calculatedUnitPrice * input.partQuantity)
  const { quoteSubtotal, quoteTaxAmount, quoteTotal } = calculateQuoteTotals(
    input.subtotal,
    input.taxRate,
    calculatedLineSubtotal,
  )

  return {
    pricing,
    preDiscountUnitPrice,
    calculatedUnitPrice,
    discountPercent,
    discountAmount,
    matchedTier,
    calculatedDescription,
    calculatedLineSubtotal,
    quoteSubtotal,
    quoteTaxAmount,
    quoteTotal,
  }
}
