'use client'

import * as React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

type MotionButtonProps = HTMLMotionProps<'button'>

type MotionCardProps = HTMLMotionProps<'div'>

export const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ className, whileHover, whileTap, transition, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={whileHover ?? { y: -3, scale: 1.01 }}
        whileTap={whileTap ?? { scale: 0.98 }}
        transition={transition ?? { type: 'spring', stiffness: 320, damping: 20 }}
        className={cn('will-change-transform', className)}
        {...props}
      />
    )
  }
)

MotionButton.displayName = 'MotionButton'

export const MotionCard = React.forwardRef<HTMLDivElement, MotionCardProps>(
  ({ className, whileHover, transition, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={whileHover ?? { y: -4, scale: 1.01 }}
        transition={transition ?? { type: 'spring', stiffness: 250, damping: 22 }}
        className={cn('will-change-transform', className)}
        {...props}
      />
    )
  }
)

MotionCard.displayName = 'MotionCard'
