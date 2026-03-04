// Supabase Edge Function — Invio email con Resend
// Deploy: supabase functions deploy send-email
// Secrets: supabase secrets set RESEND_API_KEY=re_xxxxx

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'Logintel <noreply@logintel.it>'

interface EmailRequest {
  to: string
  type: 'welcome' | 'notification' | 'custom'
  data?: Record<string, string>
}

const templates: Record<string, (data: Record<string, string>) => { subject: string; html: string }> = {
  welcome: (data) => ({
    subject: 'Benvenuto su Logintel',
    html: `
      <div style="font-family: 'Outfit', system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px 24px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 28px; font-weight: 700; background: linear-gradient(to right, #34d399, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">Logintel</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Logistic Intelligence Platform</p>
        </div>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px;">
          <h2 style="color: #fff; font-size: 20px; margin: 0 0 12px 0;">Benvenuto, ${data.name || 'utente'}!</h2>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
            Il tuo account Logintel è stato creato con successo. Ora puoi accedere alla piattaforma e iniziare a ottimizzare le tue rotte con l'intelligenza artificiale.
          </p>
          <a href="${data.appUrl || 'https://app.logintel.it'}" style="display: inline-block; background: linear-gradient(to right, #10b981, #047857); color: #fff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 600;">
            Accedi a Logintel
          </a>
        </div>
        <p style="text-align: center; color: #475569; font-size: 12px; margin-top: 24px;">
          &copy; 2026 Logintel — Logistic Intelligence Platform
        </p>
      </div>
    `,
  }),

  notification: (data) => ({
    subject: data.subject || 'Notifica Logintel',
    html: `
      <div style="font-family: 'Outfit', system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px 24px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 28px; font-weight: 700; background: linear-gradient(to right, #34d399, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">Logintel</h1>
        </div>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px;">
          <h2 style="color: #fff; font-size: 18px; margin: 0 0 12px 0;">${data.title || 'Notifica'}</h2>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
            ${data.message || ''}
          </p>
        </div>
        <p style="text-align: center; color: #475569; font-size: 12px; margin-top: 24px;">
          &copy; 2026 Logintel — Logistic Intelligence Platform
        </p>
      </div>
    `,
  }),
}

Deno.serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'RESEND_API_KEY non configurata' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { to, type, data = {} } = (await req.json()) as EmailRequest

    let subject: string
    let html: string

    if (type === 'custom') {
      subject = data.subject || 'Logintel'
      html = data.html || ''
    } else {
      const template = templates[type]
      if (!template) {
        return new Response(
          JSON.stringify({ error: `Template "${type}" non trovato` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
      const result = template(data)
      subject = result.subject
      html = result.html
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    })

    const resData = await res.json()

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: 'Errore invio email', details: resData }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, id: resData.id }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Errore interno', message: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
