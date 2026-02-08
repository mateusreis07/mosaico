import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metric to track error rate
export const errorRate = new Rate('errors');

export const options = {
  // Scenario definitions
  scenarios: {
    // 1. Warm up: 500 users for 30s to populate cache
    warm_up: {
      executor: 'constant-vus',
      vus: 500,
      duration: '30s',
      gracefulStop: '5s',
    },
    // 2. Main Load: Ramp up to 25,000 users over 1 min, stay for 2 min
    // Note: 25k VUs on a single machine is very high.
    // You might need to adjust 'maxVUs' based on your machine's limits (CPU/RAM/File Descriptors).
    peak_load: {
      executor: 'ramping-vus',
      startVUs: 500,
      stages: [
        { duration: '1m', target: 25000 }, // Ramp up
        { duration: '2m', target: 25000 }, // Stay at peak
        { duration: '1m', target: 0 },     // Ramp down (Cooldown)
      ],
      gracefulRampDown: '30s',
      startTime: '35s', // Start after warm_up
    },
  },
  thresholds: {
    // Global thresholds
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    'errors': ['rate<0.01'],          // Error rate must be less than 1%
  },
};

const BASE_URL = 'http://localhost:3333'; // Ensure this matches your running API port

// Helper to generate seat IDs
// 80% chance to pick from "Popular" set (Cache Hits)
// 20% chance to pick from "Random" set (Cache Misses/New entries)
function getSeatId() {
  const isPopular = Math.random() < 0.8;

  if (isPopular) {
    // Popular set: A-1-1 to A-1-100 (High probability of being cached)
    const num = Math.floor(Math.random() * 100) + 1;
    return `A-1-${num}`;
  } else {
    // Random set: B-1-1 to B-1-10000 (Lower probability of being cached)
    const num = Math.floor(Math.random() * 10000) + 1;
    return `B-1-${num}`;
  }
}

export default function () {
  const seatId = getSeatId();

  const res = http.get(`${BASE_URL}/seat/${seatId}`);

  // Validate response
  const result = check(res, {
    'status is 200': (r) => r.status === 200,
    'latency is low': (r) => r.timings.duration < 500,
  });

  // Record metrics
  errorRate.add(!result);

  // Think time: Simulate user delay between 0.5s and 1.5s
  sleep(Math.random() * 1 + 0.5);
}
