let apiKeys = {
    apikey: {
      "genius_gen9": {
        apiKeyID: "lord001",
        expired: "12/12/2037",
        apiKeyType: "DEV"
      },
      "free_tesst": {
        apiKeyID: "lord002",
        expired: "11/03/2026",
        apiKeyType: "FREE"
      },
      // "premium-key-1": {
      //   apiKeyID: "lord003",
      //   expired: "30/11/2024",
      //   apiKeyType: "PREMIUM"
      // }
    },
    api_total: 2 // Update this when you add more keys
  };
  
  // Hardcoded apiWebs (empty for now, add data if needed)
  let apiWebs = {
    apiweb: []
  };
  
  // Listen for fetch events (replaces Express app.listen)
  addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });
  
  // Main request handler
  async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname;
  
    // Helper: Format dates as dd/mm/yyyy
    function formatDate(date) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  
    // Helper: Calculate time left
    function calculateTimeLeft(expiryDate) {
      const currentTime = new Date();
      const timeLeftMillis = Math.max(expiryDate - currentTime, 0);
      if (timeLeftMillis >= 24 * 60 * 60 * 1000) {
        const daysLeft = Math.floor(timeLeftMillis / (24 * 60 * 60 * 1000));
        return `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
      } else {
        const hoursLeft = Math.floor(timeLeftMillis / (60 * 60 * 1000));
        return `${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}`;
      }
    }
  
    // API key validation (replaces middleware)
    async function checkAPIKey(request) {
      const apiKeyHex = request.headers.get('apikey') || url.searchParams.get('apikey');
      if (!apiKeyHex || !apiKeys.apikey[apiKeyHex]) {
        return new Response(JSON.stringify({ status: 404, error: 'APIKEY_UNVERIFIED' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const { expired } = apiKeys.apikey[apiKeyHex];
      const [day, month, year] = expired.split('/');
      const expiryDate = new Date(`${year}-${month}-${day}`);
      if (expiryDate <= new Date()) {
        return new Response(JSON.stringify({ status: 403, error: 'APIKEY_EXPIRED' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return null; // Valid key
    }
  
    // /api/getkey/free/create - Gives a predefined free key
    if (path === '/api/getkey/free/create') {
      const errorResponse = await checkAPIKey(request);
      if (errorResponse) return errorResponse;
  
      const apiKeyHex = url.searchParams.get('apikey') || request.headers.get('apikey');
      if (apiKeys.apikey[apiKeyHex].apiKeyType !== 'DEV') {
        return new Response(JSON.stringify({ status: 403, message: 'UNAUTHORIZED_API_KEY' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      const newApiKeyHex = "free-key-1";
      const { apiKeyID, expired, apiKeyType } = apiKeys.apikey[newApiKeyHex];
      const expiryDate = new Date(expired.split('/').reverse().join('-'));
      const timeleft = calculateTimeLeft(expiryDate);
  
      const response = {
        status: 200,
        creator: 'Yoshino',
        result: {
          apikey: newApiKeyHex,
          apiKeyID: apiKeyID.toUpperCase(),
          expired: expired,
          timeleft: timeleft,
          Type: apiKeyType
        }
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  
    // /api/getkey/premium/create - Gives a predefined premium key
    if (path === '/api/getkey/premium/create') {
      const errorResponse = await checkAPIKey(request);
      if (errorResponse) return errorResponse;
  
      const apiKeyHex = url.searchParams.get('apikey') || request.headers.get('apikey');
      if (apiKeys.apikey[apiKeyHex].apiKeyType !== 'DEV') {
        return new Response(JSON.stringify({ status: 403, message: 'UNAUTHORIZED_API_KEY' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      const newApiKeyHex = "premium-key-1";
      const { apiKeyID, expired, apiKeyType } = apiKeys.apikey[newApiKeyHex];
      const expiryDate = new Date(expired.split('/').reverse().join('-'));
      const timeleft = calculateTimeLeft(expiryDate);
  
      const response = {
        status: 200,
        creator: 'Yoshino',
        result: {
          apikey: newApiKeyHex,
          apiKeyID: apiKeyID.toUpperCase(),
          expired: expired,
          timeleft: timeleft,
          Type: apiKeyType
        }
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  
    // Disabled endpoints (need dynamic updates)
    if (path === '/api/getkey/premium/custom' || 
        path.startsWith('/api/addmonth/') || 
        path.startsWith('/api/addyear/') || 
        path.startsWith('/api/setdate/')) {
      return new Response(JSON.stringify({ status: 501, error: 'NOT_IMPLEMENTED_IN_HARDCODED_MODE' }), {
        status: 501,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  
    // /api/status - Check key by apiKeyID
    if (path === '/api/status') {
      const apiKeyID = url.searchParams.get('ids');
      if (!apiKeyID) {
        return new Response(JSON.stringify({ status: 400, error: 'MISSING_APIKEY_ID' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      for (const key in apiKeys.apikey) {
        if (apiKeys.apikey[key].apiKeyID === apiKeyID) {
          const { expired, apiKeyType } = apiKeys.apikey[key];
          const expiryDate = new Date(expired.split('/').reverse().join('-'));
          const timeleft = calculateTimeLeft(expiryDate);
          const response = {
            status: 200,
            creator: "Yoshino",
            result: {
              apikeyID: apiKeyID,
              expired: expired,
              timeleft: timeleft,
              type: apiKeyType
            }
          };
          return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      return new Response(JSON.stringify({ status: 404, error: 'APIKEY_NOT_FOUND' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  
    // /api/timeleft - Check key by apikey
    if (path === '/api/timeleft') {
      const apiKey = url.searchParams.get('apikey');
      const apiKeyData = apiKeys.apikey[apiKey];
      if (!apiKeyData) {
        return new Response(JSON.stringify({ status: 404, error: 'APIKEY_NOT_FOUND' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const { apiKeyID, expired, apiKeyType } = apiKeyData;
      const expiryDate = new Date(expired.split('/').reverse().join('-'));
      const timeleft = calculateTimeLeft(expiryDate);
      const response = {
        status: 200,
        creator: "Yoshino",
        result: {
          apikey: apiKey,
          apikeyID: apiKeyID,
          expired: expired,
          timeleft: timeleft,
          type: apiKeyType
        }
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  
    // /api/checking - Placeholder (apiWebs is empty)
    if (path === '/api/checking') {
      const userId = url.searchParams.get('userId');
      for (const apiKeyData of apiWebs.apiweb) {
        if (apiKeyData.userId === userId) {
          const { apiKeyID, expired, type, displayName, timeLeft } = apiKeyData;
          const response = {
            status: 200,
            creator: "Yoshino",
            result: {
              apikeyID: apiKeyID.toUpperCase(),
              expired: expired,
              timeleft: timeLeft,
              type: type,
              displayName: displayName
            }
          };
          return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      return new Response(JSON.stringify({ status: 404, error: 'USER_NOT_FOUND' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  
    // /api/hello - Simple health check
    if (path === '/api/hello') {
      return new Response('Hello, system is running!', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  
    // 404 for anything else
    return new Response('Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
