'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

type ActiveLinkProps = {
  children: ReactNode
  href: string
  className?: string
  activeClassName: string
  inactiveClassName: string
  exact?: boolean
}

export function ActiveLink({ 
  children, 
  href, 
  className = '',
  activeClassName,
  inactiveClassName,
  exact = false
}: ActiveLinkProps) {
  const pathname = usePathname()
  const isActive = exact 
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`)

  const combinedClassName = `${className} ${isActive ? activeClassName : inactiveClassName}`
  
  return (
    <Link href={href} className={combinedClassName}>
      {children}
    </Link>
  )
}