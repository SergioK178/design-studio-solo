import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import worker from '../src/index.ts';

const env = {
  RELAY_TOKEN: 'secret-token',
  TG_BOT_TOKEN: 'bot-token',
  TG_CHAT_ID: '12345',
};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function post(body: unknown, token?: string) {
  return worker.fetch(
    new Request('https://relay.example/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-Relay-Token': token } : {}),
      },
      body: JSON.stringify(body),
    }),
    env as any,
  );
}

test('valid token forwards a message to the Telegram Bot API without PII', async () => {
  const res = await post({ id: 42, kind: 'start', priceLabel: '30 000 ₽', panelUrl: 'https://panel.example/admin/leads#42' }, env.RELAY_TOKEN);
  expect(res.status).toBe(200);

  expect(fetch).toHaveBeenCalledTimes(1);
  const [url, init] = (fetch as any).mock.calls[0];
  expect(url).toBe(`https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`);
  const sentBody = JSON.parse(init.body);
  expect(sentBody.chat_id).toBe(env.TG_CHAT_ID);
  expect(sentBody.text).toContain('42');
  expect(sentBody.text).toContain('start');
  expect(sentBody.text).toContain('30 000 ₽');
  expect(sentBody.text).toContain('https://panel.example/admin/leads#42');
});

test('invalid token is rejected without calling the Bot API', async () => {
  const res = await post({ id: 1, kind: 'start', priceLabel: '1 ₽', panelUrl: 'https://panel.example/' }, 'wrong-token');
  expect(res.status).toBe(401);
  expect(fetch).not.toHaveBeenCalled();
});

test('Telegram failure is observable to the API relay client', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 500 })));
  const res = await post({ id: 1, kind: 'start', priceLabel: '1 ₽', panelUrl: 'https://panel.example/' }, env.RELAY_TOKEN);
  expect(res.status).toBe(502);
});
