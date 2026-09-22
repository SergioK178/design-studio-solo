export interface RelayPayload {
  id: number;
  kind: string;
  priceLabel: string;
  panelUrl: string;
  /** Человекочитаемая сводка задачи — вместо сырого JSON в Telegram. */
  summary?: string;
}

export async function sendRelay(payload: RelayPayload): Promise<void> {
  const relayUrl = process.env.RELAY_URL;
  const relayToken = process.env.RELAY_TOKEN;
  if (!relayUrl) return;

  try {
    const response = await fetch(relayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Relay-Token': relayToken ?? '',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) console.warn(`Relay notification failed with HTTP ${response.status}.`);
  } catch {
    // relay failures never block lead submission
  }
}
