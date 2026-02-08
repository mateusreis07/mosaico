import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metric to track error rate
export const errorRate = new Rate('errors');

export const options = {
  scenarios: {
    // Scenario: Realistic Game Day Traffic
    // Executor: ramping-arrival-rate (Open Model)
    // We define the target RPS (Requests Per Second) we want to achieve.
    // k6 will spawn as many VUs as needed (up to maxVUs) to hit this rate.
    game_day_traffic: {
      executor: 'ramping-arrival-rate',

      // Start at 0 RPS
      startRate: 0,

      // Time unit for "rate" is 1 second (stats per second)
      timeUnit: '1s',

      // VUs to initialize (save startup time)
      preAllocatedVUs: 200,

      // Cap VUs to prevent local machine crash if system halts
      maxVUs: 2000,

      stages: [
        // 1. Warm-up: Ramp to 300 RPS over 10s and hold for 30s
        { target: 300, duration: '10s' },
        { target: 300, duration: '30s' },

        // 2. Peak: Ramp to 2,500 RPS over 30s and hold for 2m
        { target: 2500, duration: '30s' },
        { target: 2500, duration: '2m' }, // Main Game Time

        // 3. Light Stress: Ramp to 5,000 RPS over 30s and hold for 1m
        { target: 5000, duration: '30s' }, // Goal moment?
        { target: 5000, duration: '1m' },

        // 4. Cooldown: Ramp down to 0
        { target: 0, duration: '30s' },
      ],
    },
  },

  thresholds: {
    // Real-world targets
    // 95% of requests must be served within 200ms (Cache Hit speed)
    http_req_duration: ['p(95)<200'],

    // Fail if more than 1% of requests error out
    'errors': ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:3333'; // Ensure matches your API port

// Helper to generate seat IDs
// 80% chance to pick from "Popular" set (Cache Hits)
// 20% chance to pick from "Random" set (Cache Misses/New entries)
function getSeatId() {
  const isPopular = Math.random() < 0.8;

  if (isPopular) {
    // Popular set: A-1-1 to A-1-400 (High probability of being cached)
    const num = Math.floor(Math.random() * 400) + 1;
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
  });

  // Record metrics
  errorRate.add(!result);

  // Note: usage of sleep() in arrival-rate executor affects VU lifespan,
  // not the throughput directly, but we keep it minimal or remove it
  // to ensure VUs are recycled quickly for this high-throughput test.
}
