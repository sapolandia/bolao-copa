// green-api.com — instância do WhatsApp Business
const INSTANCE  = process.env.GREEN_API_INSTANCE!
const TOKEN     = process.env.GREEN_API_TOKEN!
const BASE      = `https://api.green-api.com/waInstance${INSTANCE}`

async function send(chatId: string, message: string): Promise<void> {
  if (!INSTANCE || !TOKEN) throw new Error('GREEN_API_INSTANCE ou GREEN_API_TOKEN não configurados')

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

export async function sendWhatsApp(phone: string, message: string): Promise<void> {
  const chatId = phone.replace(/\D/g, '') + '@c.us'
  await send(chatId, message)
}

export async function sendWhatsAppGroup(groupId: string, message: string): Promise<void> {
  const chatId = groupId.replace(/\D/g, '') + '@g.us'
  await send(chatId, message)
}
