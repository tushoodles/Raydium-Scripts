

const fetchLatestDexData = async () => {
    try {
      console.log("Fetching latest token data...");
      const response = await fetch('https://api.dexscreener.com/token-profiles/latest/v1', {
        method: 'GET',
      });
  
      const data = await response.json();
      await buytoken(data.mint)
      console.log("data", data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };
  
  // Run every 5 seconds
  setInterval(fetchLatestDexData, 5000);