// Quick test script to verify JSONBin credentials
const MASTER_KEY = "$2a$10$V7cxtZaMD/NAqEmmfPShr.3A3n5Gmi52qatpkCacaILG6g0EiDCbq";
const BIN_ID = "6a61552bda38895dfe81c30b";

async function test() {
  console.log("Testing Master Key length:", MASTER_KEY.length);
  console.log("Master Key:", MASTER_KEY);
  console.log("Bin ID:", BIN_ID);
  console.log("---");

  // Test 1: Read bin with Master Key
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { "X-Master-Key": MASTER_KEY }
    });
    const data = await res.json();
    console.log("GET bin result:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("GET bin error:", err.message);
  }
}

test();
