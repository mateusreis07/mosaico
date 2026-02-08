
import axios from 'axios';

async function runWarmupTest() {
  const API_URL = 'http://localhost:3333';
  // Use an existing event ID or one that will be created
  // If no event exists, this might fail unless we create one first.
  // For now, let's assume we can try to warmup "active-event" or a dummy ID to see if it handles errors.

  // 1. Create a dummy event first to ensure we have data
  console.log("Creating/Updating Active Event for Test...");
  try {
    const createRes = await axios.post(`${API_URL}/admin/event`, {
      name: "Warmup Test Event",
      fallbackColor: "#FF00FF"
    });
    const eventId = createRes.data.id;
    console.log(`Event Created/Active: ${eventId}`);

    // 2. Trigger Warmup
    console.log(`\nTriggering Warmup for ${eventId}...`);
    const start = Date.now();
    const warmupRes = await axios.post(`${API_URL}/seat/admin/events/${eventId}/warmup`);
    const end = Date.now();

    console.log("Warmup Response:", warmupRes.data);
    console.log(`Total Time (Request): ${end - start}ms`);

    if (warmupRes.status === 200 && warmupRes.data.cached >= 0) {
      console.log("\nSUCCESS: Warmup endpoint executed successfully.");
    } else {
      console.log("\nFAILED: Warmup did not return expected data.");
    }

  } catch (error: any) {
    console.error("Error running test:", error.response ? error.response.data : error.message);
  }
}

runWarmupTest();
