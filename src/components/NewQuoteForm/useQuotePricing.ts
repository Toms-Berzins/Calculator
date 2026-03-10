import { useMemo } from 'react'
import { calculate3DPrintPrice } from '@/hooks/useQuoteCalculator'
import type { JobConstantKey } from './NewQuoteForm.types'

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100
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
}

export function useQuotePricing(input: UseQuotePricingInput) {
  const pricing = useMemo(
    () =>
      calculate3DPrintPrice({
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
      }),
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

  const difficultyMultiplier = input.jobConstants.difficulty_multiplier_percent / 100
  const calculatedUnitPrice = roundCurrency(pricing.unitPrice * difficultyMultiplier)
  const calculatedDescription = input.partName.trim() || '3D print job'
  const calculatedLineSubtotal = calculatedUnitPrice * input.partQuantity
  const quoteSubtotal = input.subtotal + calculatedLineSubtotal
  const quoteTaxAmount = quoteSubtotal * (input.taxRate / 100)
  const quoteTotal = quoteSubtotal + quoteTaxAmount

  return {
    pricing,
    calculatedUnitPrice,
    calculatedDescription,
    calculatedLineSubtotal,
    quoteSubtotal,
    quoteTaxAmount,
    quoteTotal,
  }
}
