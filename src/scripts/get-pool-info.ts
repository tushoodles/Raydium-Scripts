import WebSocket from "ws";


const WS_URL = "wss://pumpportal.fun/api/data";

function setupWebSocket() {
  const ws = new WebSocket(WS_URL);

  ws.on("open", () => {
    console.log("✅ Connected to PumpPortal WebSocket");

    const subscriptions = [
      { method: "subscribeNewToken" },
      { method: "subscribeMigration" },
      {
        method: "subscribeAccountTrade",
        keys: ["AArPXm8JatJiuyEffuC1un2Sc835SULa4uQqDcaGpAjV"],
      },
      {
        method: "subscribeTokenTrade",
        keys: ["91WNez8D22NwBssQbkzjy4s2ipFrzpmn5hfvWVe2aY5p"],
      },
    ];

    subscriptions.forEach((sub) => ws.send(JSON.stringify(sub)));
  });

  ws.on("message", async (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      console.log("📩 Message received:", parsed);
     // await buytoken(parsed.mint);
    } catch (err) {
      console.error("❌ Failed to parse message:", data);
    }
  });

  ws.on("error", (err) => {
    console.error("🚨 WebSocket error:", err.message);
  });

  ws.on("close", () => {
    console.warn("🔌 WebSocket disconnected. Reconnecting...");
    setTimeout(setupWebSocket, 2000); // Reconnect after delay
  });
}

// Initialize WebSocket
setupWebSocket();
