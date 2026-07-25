/**
 * Cloudflare Worker Proxy for ABIA TECHRISE 3.0 REMEMBRANCE VILLA
 * Securely proxies GET and POST requests between index.html and JSONBin.io v3.
 * 
 * Required Cloudflare Worker Environment Secrets:
 * - JSONBIN_BIN_ID : Your JSONBin Bin ID
 * - JSONBIN_API_KEY : Your JSONBin Master API Key
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Content-Type": "application/json"
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS OPTIONS preflight request
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }

    const binId = env.JSONBIN_BIN_ID || "6a61552bda38895dfe81c30b";
    const apiKey = env.JSONBIN_API_KEY || "$2a$10$V7cxtZaMD/NAqEmmfPShr.3A3n5Gmi52qatpkCacaILG6g0EiDCbq";

    if (!binId || !apiKey) {
      return new Response(
        JSON.stringify({
          error: "Worker Configuration Error: JSONBIN_BIN_ID and JSONBIN_API_KEY secrets must be set in Cloudflare Worker environment."
        }),
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const jsonbinUrl = `https://api.jsonbin.io/v3/b/${binId}`;

    try {
      if (request.method === "GET") {
        const jsonbinRes = await fetch(`${jsonbinUrl}/latest`, {
          method: "GET",
          headers: {
            "X-Master-Key": apiKey
          }
        });

        if (!jsonbinRes.ok) {
          const errText = await jsonbinRes.text();
          return new Response(
            JSON.stringify({ error: `JSONBin GET Error (${jsonbinRes.status}): ${errText}` }),
            { status: jsonbinRes.status, headers: CORS_HEADERS }
          );
        }

        const data = await jsonbinRes.json();
        const records = Array.isArray(data.record) ? data.record : [];
        
        return new Response(JSON.stringify(records), {
          status: 200,
          headers: CORS_HEADERS
        });
      }

      if (request.method === "POST") {
        const newMember = await request.json();

        // 1. Fetch current bin contents
        const getRes = await fetch(`${jsonbinUrl}/latest`, {
          method: "GET",
          headers: {
            "X-Master-Key": apiKey
          }
        });

        let currentRecords = [];
        if (getRes.ok) {
          const currentData = await getRes.json();
          if (Array.isArray(currentData.record)) {
            currentRecords = currentData.record;
          }
        }

        // 2. Prepend new member entry
        const updatedRecords = [newMember, ...currentRecords];

        // 3. Put updated array back to JSONBin
        const putRes = await fetch(jsonbinUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Master-Key": apiKey
          },
          body: JSON.stringify(updatedRecords)
        });

        if (!putRes.ok) {
          const errText = await putRes.text();
          return new Response(
            JSON.stringify({ error: `JSONBin PUT Error (${putRes.status}): ${errText}` }),
            { status: putRes.status, headers: CORS_HEADERS }
          );
        }

        return new Response(JSON.stringify(updatedRecords), {
          status: 200,
          headers: CORS_HEADERS
        });
      }

      return new Response(
        JSON.stringify({ error: `Method ${request.method} not allowed.` }),
        { status: 405, headers: CORS_HEADERS }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: `Worker Exception: ${err.message || err.toString()}` }),
        { status: 500, headers: CORS_HEADERS }
      );
    }
  }
};
