"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import type { ROICalculationInput } from "@/lib/api/roi-api"
import { filterDisplayablePlans } from "@/lib/api/plan-filters"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useROICalculator() {
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationResult, setCalculationResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: plansData, error: plansError } = useSWR("/api/roi/plans", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
    shouldRetryOnError: true,
    errorRetryCount: 3,
  })

  // Calculate ROI
  const calculate = useCallback(async (input: ROICalculationInput, saveToDatabase = false, userId?: string) => {
    setIsCalculating(true)
    setError(null)

    try {
      const response = await fetch("/api/roi/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...input,
          saveToDatabase,
          userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Calculation failed")
      }

      setCalculationResult(data.calculation)
      return { success: true, data: data.calculation }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsCalculating(false)
    }
  }, [])

  // Get industry benchmark
  const getBenchmark = useCallback(async (industry: string) => {
    try {
      const response = await fetch(`/api/roi/benchmark?industry=${encodeURIComponent(industry)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch benchmark")
      }

      return { success: true, data: data.benchmark }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      return { success: false, error: errorMessage }
    }
  }, [])

  const filteredPlans = filterDisplayablePlans(plansData?.plans || [])

  return {
    calculate,
    getBenchmark,
    isCalculating,
    calculationResult,
    error,
    subscriptionPlans: filteredPlans,
    plansError,
  }
}

// Hook for user's saved calculations
export function useUserCalculations(userId?: string) {
  const { data, error, mutate } = useSWR(userId ? `/api/roi/calculations?userId=${userId}` : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // 30 seconds
  })

  return {
    calculations: data?.calculations || [],
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  }
}
