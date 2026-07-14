// ─────────────────────────────────────────────────────────────────────────────
// test_issue.js — A quick manual test script for the issue creation endpoint.
//
// This is a developer utility, not part of the running application. Run it
// locally while the server is up to verify that POST /api/issues is working:
//   node test_issue.js
//
// It sends a hardcoded test issue payload to the local server on port 5001
// and prints either the created issue or the error response to the console.
// Useful for sanity-checking the API without opening Postman or a browser.
// ─────────────────────────────────────────────────────────────────────────────

const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5001/api/issues', {
      title: "Test Issue 123",
      category: "Garbage",
      location: "Oslo",
      description: "This is a test description with more than 20 chars",
      amount: 500,
      email: "test@example.com",
      status: "Open"
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

test();
