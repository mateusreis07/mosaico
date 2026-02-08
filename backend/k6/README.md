# Load Testing Guide (k6)

This directory contains a load testing script designed to simulate high-concurrency stadium traffic (25k users).

## Prerequisites

1. **Install k6**:
   - **Windows (Winget)**: `winget install k6`
   - **Windows (Chocolatey)**: `choco install k6`
   - **MacOS**: `brew install k6`
   - **Linux**: `sudo apt-get install k6`

2. **Ensure Backend is Running**:
   - `npm run dev` in the `backend` folder.
   - Server must be reachable at `http://localhost:3333`.

## Running the Test

Run the script from the command line:

```bash
k6 run k6/load-test.js
```

### Running a "Safe" Dry Run (Low Load)
To verify everything works without crashing your machine, override the VU count:

```bash
k6 run --vus 10 --duration 10s k6/load-test.js
```

## Interpreting Results

### Key Metrics to Watch

- **http_req_duration**: The total time for the request.
  - `p(95)`: 95% of requests should be faster than this. Target: **< 500ms**.
  - If `p(95)` spikes > 1000ms, the system is struggling.

- **http_req_failed**: Percentage of failed requests.
  - Target: **0% (or < 1%)**.
  - errors > 1% indicates server overload or timeouts.

- **vus**: Virtual Users currently active. Ensure it reaches 25,000 (or your machine's limit).

### Success Criteria
1. **Low Latency**: Even at 25k users, Cached requests (80% of traffic) should return in < 10ms.
2. **Stability**: No connection timeouts or 500 errors.
3. **Throughput**: The RPS (Requests Per Second) should be stable, not fluctuating wildly.

## Troubleshooting

- **"socket: too many open files"**: Your OS limit for open connections is too low. Increase ulimit or reduce VUs.
- **High CPU on Client**: Running 25k VUs requires significant CPU. If k6 uses 100% CPU, your results are invalid (client bottleneck). Consider running k6 on a separate machine or reducing VUs to 5,000.
