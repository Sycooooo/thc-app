// === Client API centralisé ===
// Au lieu de réécrire fetch() partout, on utilise ces fonctions.
// Ca évite la répétition et les erreurs (oublier un header, etc.)

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function handleResponse(res: Response) {
  const data = await res.json()
  if (!res.ok) {
    throw new ApiError(res.status, data.error || 'Une erreur est survenue')
  }
  return data
}

export const api = {
  // Pour envoyer des données JSON (créer une tâche, s'inscrire, etc.)
  async post(url: string, body?: Record<string, unknown>) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    return handleResponse(res)
  },

  // Pour récupérer des données (lister les tâches, etc.)
  async get(url: string) {
    const res = await fetch(url)
    return handleResponse(res)
  },

  // Pour envoyer des fichiers (upload d'avatar, etc.)
  async upload(url: string, formData: FormData) {
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    })
    return handleResponse(res)
  },
}
