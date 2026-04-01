'use client'

import Button from '@/components/ui/Button'

export function NewColocButton({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <Button variant="primary" size={size} href="/coloc/new">
      + Nouvelle coloc
    </Button>
  )
}

export function EmptyStateButtons() {
  return (
    <div className="flex gap-3 justify-center">
      <Button variant="primary" href="/coloc/new">
        Créer une coloc
      </Button>
      <Button variant="secondary" href="/coloc/join">
        Rejoindre avec un code
      </Button>
    </div>
  )
}
