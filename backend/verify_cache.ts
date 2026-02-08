
import { seatService } from './src/services/seatService';

async function runTest() {
  console.log("--- Starting RAM Cache Verification ---\n");

  const seatId = "A-1-1";

  // 1. First Call - Should be MISS
  console.log("1. Fetching seat (Expect MISS)...");
  const start1 = Date.now();
  const res1 = await seatService.getSeatColor(seatId);
  const end1 = Date.now();
  console.log(`Response 1: ${JSON.stringify(res1)}`);
  console.log(`Time: ${end1 - start1}ms\n`);

  // 2. Second Call - Should be HIT
  console.log("2. Fetching seat again (Expect HIT)...");
  const start2 = Date.now();
  const res2 = await seatService.getSeatColor(seatId);
  const end2 = Date.now();
  console.log(`Response 2: ${JSON.stringify(res2)}`);
  console.log(`Time: ${end2 - start2}ms`);

  if ((end2 - start2) < (end1 - start1)) {
    console.log("SUCCESS: Cache hit was faster.\n");
  } else {
    console.log("WARNING: Cache hit was not significantly faster (could be local DB speed).\n");
  }

  // 3. Invalidate
  console.log("3. Invalidating seat...");
  seatService.invalidateSeat(seatId);
  console.log("Invalidated.\n");

  // 4. Third Call - Should be MISS
  console.log("4. Fetching seat again (Expect MISS)...");
  const start3 = Date.now();
  const res3 = await seatService.getSeatColor(seatId);
  const end3 = Date.now();
  console.log(`Response 3: ${JSON.stringify(res3)}`);
  console.log(`Time: ${end3 - start3}ms`);

  console.log("\n--- Verification Complete ---");
}

runTest().catch(console.error);
