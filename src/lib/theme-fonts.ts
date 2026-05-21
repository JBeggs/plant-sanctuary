import { Inter, Playfair_Display } from 'next/font/google'
import type { Theme } from '@/contexts/theme-config'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' })

/** Plant themes share the same font pair in globals. */
export function themeFontClasses(_theme: Theme): { htmlVariables: string; bodyClassName: string } {
  return { htmlVariables: `${inter.variable} ${playfair.variable}`, bodyClassName: inter.className }
}
