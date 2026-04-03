"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepperProps {
  currentStep: number
  steps: string[]
  className?: string
}

export function Stepper({ currentStep, steps, className }: StepperProps) {
  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = stepNumber < currentStep
        const isCurrent = stepNumber === currentStep
        const isUpcoming = stepNumber > currentStep

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                  isCompleted && "bg-blue-600 border-blue-600 text-white",
                  isCurrent && "bg-blue-600 border-blue-600 text-white",
                  isUpcoming && "bg-transparent border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{stepNumber}</span>
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium text-center",
                  (isCompleted || isCurrent) && "text-blue-600 dark:text-blue-400",
                  isUpcoming && "text-gray-400 dark:text-gray-500"
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 transition-colors",
                  isCompleted ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

