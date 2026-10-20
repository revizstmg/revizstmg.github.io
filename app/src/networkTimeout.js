// Une requête bloquée ne doit pas bloquer l’interface indéfiniment.
export async function withNetworkTimeout(request, timeoutMs = 15000) {
  const controller = new AbortController()
  let timer
  try {
    return await Promise.race([
      Promise.resolve().then(() => request(controller.signal)),
      new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('Le serveur ne répond pas. Vérifie ta connexion puis réessaie.')) }, timeoutMs) }),
    ])
  } finally { clearTimeout(timer) }
}
