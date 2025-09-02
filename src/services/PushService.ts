// FILE: src/services/PushService.ts
export async function sendPush(deviceToken: string, message: string): Promise<void> {
  try {
    // TODO: integrate with FCM/OneSignal/APNs as needed
    console.log(`[PushService] Push sent to ${deviceToken}: ${message}`);
  } catch (err: any) {
    console.error('[PushService] push send failed', { message: err?.message, stack: err?.stack });
    // swallow to avoid crashing callers
  }
}
