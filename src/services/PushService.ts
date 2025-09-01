// ./PushService.ts
export async function sendPush(deviceToken: string, message: string): Promise<void> {
  // Simulate sending a push notification
  console.log(`Push sent to ${deviceToken}: ${message}`);
}
