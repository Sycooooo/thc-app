'use client'

import Button from '@/components/ui/Button'

export default function HomeButtons() {
  return (
    <div className="flex gap-4 justify-center">
      <Button variant="primary" size="lg" href="/login">
        Se connecter
      </Button>
      <Button variant="outline" size="lg" href="/register">
        S&apos;inscrire
      </Button>
    </div>
  )
}
