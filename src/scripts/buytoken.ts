const buytoken = async (token: any) => {
  try {
    const response = await fetch("https://pumpportal.fun/api/create-wallet", {
      method: "GET",
    });

    // JSON Object with keys for a newly generated wallet and the linked API key
    const data = await response.json();
    console.log("data...", data);
  } catch (error) {
    console.log("error...", error);
  }
};

buytoken(null);
