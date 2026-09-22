export interface Env {
  RELAY_TOKEN: string;
  TG_BOT_TOKEN: string;
  TG_CHAT_ID: string;
}

interface RelayPayload {
  id: number;
  kind: string;
  priceLabel: string;
  panelUrl: string;
  summary?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const token = request.headers.get('X-Relay-Token');
    if (token !== env.RELAY_TOKEN) {
      return new Response('Unauthorized', { status: 401 });
    }

    const payload = await request.json<RelayPayload>();
    const text = payload.summary
      ? `${payload.summary}\n${payload.panelUrl}`
      : `Заявка №${payload.id} · ${payload.kind} · ${payload.priceLabel}\n${payload.panelUrl}`;

    const telegram = await fetch(`https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TG_CHAT_ID, text }),
    });
    if (!telegram.ok) return new Response('Telegram delivery failed', { status: 502 });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
