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
