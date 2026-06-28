// green-api.com — instância do WhatsApp Business
const INSTANCE  = process.env.GREEN_API_INSTANCE!
const TOKEN     = process.env.GREEN_API_TOKEN!
const BASE      = `https://api.green-api.com/waInstance${INSTANCE}`

export async function sendWhatsApp(phone: string, message: string): Promise<void> {
  if (!INSTANCE || !TOKEN) throw new Error('GREEN_API_INSTANCE ou GREEN_API_TOKEN não configurados')

  // Formato: 5511999999999 (sem + nem espaços)
  const chatId = phone.replace(/\D/g, '') + '@c.us'

  const res = await fetch(`${BASE}/sendMessage/${TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`green-api ${res.status}: ${text}`)
  }
}
