# Mock Test 3: Full-Stack MERN / PERN Senior Technical Assessment

> **Mock Test 3 | Total Questions: 23 | Completed: 0 | Needs Review: 5**
> 💡 *Check off the `- [ ]` checkboxes as you complete questions. You can fold/collapse any section or question using the arrows beside headings in Obsidian.*

## Section A: JavaScript & TypeScript Core (The "Bread & Butter" Round)
> *5 Questions | Focus: Execution context, closures, event loop microtasks, prototype inheritance, and TypeScript typing.*

### Q1: What are closures in JavaScript? Can you provide an example of how they are used, and why they can cause memory leaks?

- [ ] Completed (Q1)
> **Source:** `Interview Topics (Rename to prep).md / JavaScript.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Definition:** A closure is created when an inner function retains access to its outer lexical environment even after the outer function has completed execution.
- **Mechanics:** Functions in JavaScript maintain a hidden `[[Environment]]` reference to their enclosing scope. Local variables closed over are preserved in heap memory instead of being garbage-collected.
- **Use Cases:** Data privacy/encapsulation, factory functions, function memoization, partial application/currying.
- **Memory Leaks:** If long-lived objects (e.g., global event listeners, timers, singletons) hold closures referencing large data structures, those referenced variables cannot be garbage collected.

```javascript
function makeCounter() {
  let count = 0; // Private variable via closure
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}

const counter = makeCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.count); // undefined (encapsulated)
```

---

### Q2: What is the difference between parameters and arguments in JavaScript?

- [ ] Completed (Q2)
> **Source:** `CIPL.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Parameters:** The variable names listed in the function's declaration/definition signature. They act as named placeholders awaiting input.
- **Arguments:** The actual concrete values passed into the function when it is invoked.

```javascript
// 'a' and 'b' are parameters
function multiply(a, b) {
  return a * b;
}

// 5 and 10 are arguments
const result = multiply(5, 10);
```

---

### Q3: What is the difference between any, unknown, and never in TypeScript? How do you implement an exhaustiveness check in a switch statement?

- [ ] Completed (Q3)
> **Source:** `CIKLUM/Prep.md` | **Status:** ✅ Prepared

#### Technical Answer
- **`any`:** Disables all type checking. Bypasses compiler safety; allows any property access or method invocation.
- **`unknown`:** Type-safe counterpart of `any`. Represents any value, but you cannot perform operations on it without narrowing the type first (via `typeof`, `instanceof`, or custom type guards).
- **`never`:** Represents values that never occur. Used for functions that never return (throw errors, infinite loops) or unreachable code branches.
- **Exhaustiveness Check:**
```typescript
type Action = { type: "LOGIN" } | { type: "LOGOUT" };

function handleAction(action: Action) {
  switch (action.type) {
    case "LOGIN":
      return "Logging in";
    case "LOGOUT":
      return "Logging out";
    default: {
      const _exhaustiveCheck: never = action;
      throw new Error(`Unhandled action: ${_exhaustiveCheck}`);
    }
  }
}
```

---

### Q4: Explain the CSS Box Model. If an element has an ID, a Class, and an Inline Style, which one wins the specificity battle?

- [ ] Completed (Q4)
> **Source:** `EPAM.md` | **Status:** ✅ Prepared

#### Technical Answer
- **CSS Box Model:** Every element is represented as a rectangular box consisting of:
  1. **Content:** The actual text or media.
  2. **Padding:** Transparent space surrounding content.
  3. **Border:** Line surrounding padding and content.
  4. **Margin:** Transparent space outside the border separating neighboring elements.
  - `box-sizing: border-box` makes width and height include padding and border.
- **Specificity Battle:**
  - Inline style wins over ID selector, which wins over Class selector.
  - Order: **Inline Style (1000) > ID Selector (100) > Class / Attribute / Pseudo-class (10) > Element Selector (1)**.
  - (Note: `!important` overrides normal specificity rules).

---

### Q5: What is the difference between setInterval and setTimeout in JavaScript? What happens when a setInterval task takes longer to execute than its interval delay?

- [ ] Completed (Q5)
> **Source:** `MetaYB.md` | **Status:** ✅ Prepared

#### Technical Answer
- **`setTimeout(fn, delay)`:** Executes callback once after the specified delay has elapsed.
- **`setInterval(fn, interval)`:** Repeatedly schedules the callback every `interval` milliseconds.
- **Long Execution Problem:** If the callback takes longer to run than the interval delay, interval timers can queue up back-to-back with zero delay between executions, saturating the call stack.
- **Solution (Recursive setTimeout):** Use recursive `setTimeout` inside the callback to guarantee that the next execution only starts *after* the previous execution has completely finished + delay.

---

## Section B: React.js & Modern Frontend Architecture (Frontend Framework Round)
> *4 Questions | Focus: Component lifecycle, hooks, state management, Virtual DOM reconciliation, and Next.js App Router.*

### Q6: What are React hooks, and how do they differ fundamentally from class components?

- [ ] Completed (Q6)
> **Source:** `Learning React.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Definition:** Hooks are functions (`useState`, `useEffect`, `useContext`, `useRef`, `useMemo`, `useCallback`) that let functional components hook into React state and lifecycle mechanics without writing classes.
- **Key Differences:**
  - **Syntax & Simplicity:** Functional components with hooks use plain JavaScript functions, eliminating `this` binding confusion and class boilerplate.
  - **Logic Reuse:** Class components rely on HOCs or render props (leading to "wrapper hell"). Hooks allow extracting stateful logic cleanly into reusable **custom hooks**.
  - **Side-Effect Cohesion:** In class components, related logic (like setting up and tearing down a timer) was split across `componentDidMount` and `componentWillUnmount`. In hooks, it stays together in a single `useEffect` block.
  - **Bundle Size:** Functional components compile to smaller, more tree-shakeable JavaScript bundles than ES6 classes.

---

### Q7: How does Redux work, and what problems does it solve in React applications? What role do Redux Thunk and selectors play?

- [ ] Completed (Q7)
> **Source:** `Learning React.md / Zelevate.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Problems Solved:** Solves deeply nested prop drilling and unpredictable distributed state mutations across disconnected component trees.
- **Core Mechanics:**
  1. **Single Source of Truth:** Entire state lives in a single immutable store object.
  2. **State is Read-Only:** The only way to trigger a change is dispatching an **Action** (plain JS object with a `type`).
  3. **Pure Reducers:** Pure functions `(previousState, action) => newState` calculate next state without side-effects.
- **Redux Thunk:** Middleware that allows action creators to return a function `(dispatch, getState)` instead of a plain action object, enabling asynchronous API requests before dispatching.
- **Selectors:** Memoized functions (e.g. via `createSelector` in Reselect/RTK) that query specific slices of state, preventing components from re-rendering if their specific computed slice didn't change.

---

### Q8: Explain the 'Ghost Mutation' bug in Next.js App Router where a database row is updated/deleted, but the UI continues to show stale data. How do you resolve it?

- [ ] Completed (Q8)
> **Source:** `NextJS/Next.js Fast Track Plan.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Root Cause:** Next.js aggressively caches rendered Server Component payloads in the **Data Cache** and **Full Route Cache**. When a Server Action mutates the database without invalidating the cache, Next.js continues serving the existing cached representation to the client.
- **Solution:** Every Server Action that modifies database state must explicitly trigger cache revalidation:
```typescript
'use server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { db } from '@/lib/db';

export async function deleteProject(id: string) {
  await db.project.delete({ where: { id } });
  revalidatePath('/projects', 'page'); // or revalidateTag('projects');
}
```

---

### Q9: Distributor ordering portals are used daily by data-entry operators who prefer keyboard navigation and rapid workflows over flashy UI. How do you optimize a React frontend for high-density data views, extreme accessibility, and keyboard-only bulk inputs?

- [ ] Completed (Q9)
- [ ] ⚠️ Needs Answer Preparation
> **Source:** `Redington.md` | **Status:** ⚠️ Needs Personal Notes

#### Technical Answer
*[Needs to be filled]*

---

## Section C: Node.js, Express & Backend Architecture (Backend Engine Round)
> *5 Questions | Focus: libuv event loop, asynchronous non-blocking I/O, middleware pipelines, JWT auth, and Kafka event streaming.*

### Q10: Node.js is single-threaded for JavaScript execution. If you need to perform heavy data parsing (e.g., parsing a 500MB JSON/CSV or calculating hashes), compare Worker Threads vs. Clustering vs. Message Queues.

- [ ] Completed (Q10)
> **Source:** `CIKLUM/Prep.md` | **Status:** ✅ Prepared

#### Technical Answer
1. **Worker Threads (`worker_threads` module):**
   - Runs multiple threads inside the *same* Node.js process sharing memory via `SharedArrayBuffer` or transferring `ArrayBuffer`.
   - **Best for:** CPU-intensive in-process calculations (compression, parsing large CSVs, image resizing).
2. **Clustering (`cluster` module):**
   - Spawns multiple independent Node.js processes (typically one per CPU core) that share the same server port.
   - **Best for:** Scaling HTTP request throughput across multi-core servers for I/O-bound traffic. Does not solve an individual request that requires heavy CPU work.
3. **Offloading to Asynchronous Message Queue (BullMQ / Kafka / Lambda):**
   - Decouples heavy processing entirely from the API server. Emits a background job event and returns `202 Accepted` to the client.
   - **Best for:** Heavy background tasks (generating reports, processing videos, bulk emailing) where immediate synchronous HTTP responses are not required.

---

### Q11: What does it mean for an HTTP method to be Idempotent? Which HTTP methods are idempotent and which are not?

- [ ] Completed (Q11)
> **Source:** `EPAM.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Definition:** An HTTP method is idempotent if making multiple identical requests has the same effect on the server's state as making a single request.
- **Idempotent Methods:**
  - `GET`, `HEAD`, `OPTIONS`: Safe and idempotent (read-only; no state change).
  - `PUT`: Idempotent (replacing a resource with the same payload repeatedly leaves it in the same state).
  - `DELETE`: Idempotent (deleting resource ID 5 multiple times results in the resource being deleted; subsequent requests return 404 but state doesn't change).
- **Non-Idempotent Methods:**
  - `POST`: Non-idempotent (submitting a `POST /orders` multiple times creates multiple distinct order records unless an Idempotency-Key header is implemented).
  - `PATCH`: Generally non-idempotent if it applies relative transformations (e.g., `{ $inc: { balance: 10 } }`).

---

### Q12: What are the primary testing strategies for a Node.js / Express backend? Differentiate Unit, Integration, and E2E testing with tools.

- [ ] Completed (Q12)
> **Source:** `Node JS - Backend Cheat Sheet.md` | **Status:** ✅ Prepared

#### Technical Answer
1. **Unit Testing:** Tests individual functions in isolation with all external dependencies mocked.
   - Tools: **Jest**, **Mocha**, **Sinon** (spies/stubs/mocks). Fast, cheap execution.
2. **Integration Testing:** Tests interactions between routes, controllers, and actual databases or cache layers.
   - Tools: **Supertest** (HTTP assertions), **Testcontainers** (spinning up real disposable PostgreSQL/Redis in Docker).
3. **End-to-End (E2E) & Load Testing:** Tests complete application flows and system throughput under simulated load.
   - Tools: **Cypress** or **Playwright** for full user flows; **Autocannon** or **Artillery** for performance/load benchmarking.
4. **Code Coverage:** Enforced using **Istanbul/nyc** to ensure critical business logic paths are tested.

---

### Q13: Cloud Subscription Distribution: How would you architect a portal that automatically provisions SaaS licenses or cloud infrastructure subscriptions via third-party vendor APIs (like Microsoft Partner Center) instantly upon checkout?

- [ ] Completed (Q13)
- [ ] ⚠️ Needs Answer Preparation
> **Source:** `Redington.md` | **Status:** ⚠️ Needs Personal Notes

#### Technical Answer
*[Needs to be filled]*

---

### Q14: What are the primary disadvantages and architectural trade-offs of Microservices compared to a Modular Monolith?

- [ ] Completed (Q14)
> **Source:** `Justo Global.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Operational Complexity:** Requires container orchestration (Kubernetes), distributed service discovery, API gateways, and sophisticated CI/CD pipelines.
- **Distributed Data Consistency:** ACID transactions across services are impossible without complex Saga patterns or 2-Phase Commit.
- **Network Latency & Failure Modes:** In-memory function calls are replaced by network hops (REST/gRPC), introducing network latency, timeouts, and cascading failure risks (requiring Circuit Breakers).
- **Debugging & Observability Overhead:** Tracing bugs across 15 microservices requires distributed tracing (OpenTelemetry, trace IDs) and centralized logging infrastructure.

---

## Section D: Databases & Data Layer: PostgreSQL, MongoDB & Redis (DB & Caching Round)
> *4 Questions | Focus: Relational SQL joins/CTEs, indexing & query planners, MongoDB schemas, and Redis caching strategies.*

### Q15: A critical query is running slow on a massive table. We added an index on user_id, but the query planner is still performing a Sequence Scan instead of an Index Scan. What are the key reasons why an index is ignored?

- [ ] Completed (Q15)
> **Source:** `Interview Rounds.md` | **Status:** ✅ Prepared

#### Technical Answer
1. **High Percentage Row Retrieval (Low Selectivity):** If the query returns a large fraction of the table (>20-30%), sequentially scanning raw disk blocks is cheaper than jumping between the B-Tree index and random heap block lookups.
2. **Column Wrapped in a Function:** Running `WHERE LOWER(user_id) = 'alice'` or `WHERE DATE(created_at) = '2026-10-10'` invalidates the B-Tree index because the engine must calculate the function on every single row. (Fix: Create a functional/expression index).
3. **Data Type Mismatch / Implicit Conversion:** Querying a `VARCHAR` column with an unquoted integer literal (`WHERE phone = 12345`) forces the database to convert every string row to an integer before comparison.
4. **Outdated Optimizer Statistics:** If the query planner's catalog statistics are stale, it may misestimate row counts. Running `ANALYZE table_name;` updates table statistics.

---

### Q16: What are prepared statements in SQL? Explain their dual benefits for performance and security.

- [ ] Completed (Q16)
> **Source:** `MetaYB.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Security (SQL Injection Elimination):**
  - In a prepared statement, the SQL query structure and the user parameter values are transmitted separately to the database engine.
  - The database treats parameters strictly as literal data, never as executable SQL commands, rendering SQL injection attacks completely impossible.
- **Performance Optimization:**
  - When a query is prepared (`PREPARE stmt AS SELECT ...`), the database compiles, parses, and creates an optimal query execution plan once.
  - Subsequent executions with different parameters (`EXECUTE stmt('param')`) bypass the parsing and query optimization phases entirely, saving significant CPU overhead on repeated queries.

---

### Q17: How do you safely execute database migrations during zero-downtime rolling deployments without breaking active production traffic?

- [ ] Completed (Q17)
> **Source:** `CIKLUM/Prep.md / Mobile Programming Company - Samsung.md` | **Status:** ✅ Prepared

#### Technical Answer
- **The Rule: Never make breaking schema changes in a single deployment.**
- **Use the Expand and Contract (Parallel Run) Pattern:**
  1. **Expand Phase (Migration 1):** Add the new column/table as nullable or with a default value. Do NOT delete or rename old columns.
  2. **Deploy Application (Version 2):** Deploy updated code that writes to BOTH the old and new columns, but reads from the new column.
  3. **Backfill:** Run a background script to backfill historical data from the old column into the new column.
  4. **Deploy Application (Version 3):** Deploy code that reads and writes exclusively to the new column.
  5. **Contract Phase (Migration 2):** Drop the deprecated old column safely. At no point was the database schema incompatible with active running code.

---

### Q18: Rebates and Market Development Funds (MDF): Brands provide rebates based on performance milestones to offset future purchases. How would you design a secure financial ledger system within the portal to track accrued partner credits and promotional balances?

- [ ] Completed (Q18)
- [ ] ⚠️ Needs Answer Preparation
> **Source:** `Redington.md` | **Status:** ⚠️ Needs Personal Notes

#### Technical Answer
*[Needs to be filled]*

---

## Section E: System Design, Live Coding / DSA & Techno-Managerial Leadership (High-Level & Culture Round)
> *5 Questions | Focus: High-concurrency ticket systems, array manipulation algorithms, SOLID principles, and engineering leadership.*

### Q19: Write an optimal O(n) algorithm in JavaScript to compress a string of repeated characters, e.g., 'aabbbcddddee' into 'a2b3c1d4e2'.

- [ ] Completed (Q19)
> **Source:** `CIPL.md` | **Status:** ✅ Prepared

#### Technical Answer
```javascript
function compressString(str) {
  if (!str) return "";
  let compressed = "";
  let count = 1;

  for (let i = 0; i < str.length; i++) {
    if (str[i] === str[i + 1]) {
      count++;
    } else {
      compressed += str[i] + count;
      count = 1;
    }
  }
  return compressed;
}

// Example usage:
console.log(compressString("aabbbcddddee")); // "a2b3c1d4e2"
```
- **Complexity:** Time Complexity: $O(n)$ single-pass loop. Space Complexity: $O(n)$ for the returned string.

---

### Q20: Given an array of distinct elements and a number X, find if there is a pair with product equal to X. Compare Brute Force, Hash Set, and Two-Pointer approaches.

- [ ] Completed (Q20)
> **Source:** `Programming & Data Structures.md` | **Status:** ✅ Prepared

#### Technical Answer
1. **Brute Force ($O(n^2)$ time, $O(1)$ space):** Two nested loops checking every combination.
2. **Hash Set Approach ($O(n)$ time, $O(n)$ space):**
```javascript
function hasPairWithProduct(arr, x) {
  const seen = new Set();
  for (const num of arr) {
    if (num !== 0 && x % num === 0) {
      if (seen.has(x / num)) return true;
    }
    seen.add(num);
  }
  return false;
}
```
3. **Sorting & Two-Pointer Approach ($O(n \log n)$ time, $O(1)$ space):** Sort array first. Place left pointer at index 0, right pointer at $n-1$. If product equals $x$, return true; if product $< x$, increment left; if product $> x$, decrement right.

---

### Q21: Explain the 3 Pillars of Observability (Logs, Metrics, Traces) in microservices and the core stages of an automated CI/CD pipeline.

- [ ] Completed (Q21)
> **Source:** `DevOps & CI-CD.md` | **Status:** ✅ Prepared

#### Technical Answer
- **3 Pillars of Observability:**
  1. **Logs:** Discrete event records with structured JSON metadata (Winston/Pino) detailing specific application events and errors.
  2. **Metrics:** Aggregated numeric telemetry over time (CPU/RAM usage, request latency, throughput, error rates) queried via Prometheus/Grafana.
  3. **Distributed Tracing:** Injects a unique `Trace-ID` and `Span-ID` into HTTP and Kafka headers that propagates across every downstream microservice, visualizing latency bottlenecks across distributed hops.
- **CI/CD Pipeline Stages:**
  `Pull Request -> Linting -> Unit Tests -> Integration Tests -> Docker Multi-Stage Build -> Security Scan -> Deploy Staging -> Automated Smoke Tests -> Production Canary / Rolling Update`.

---

### Q22: B2B customers frequently place orders by uploading large Excel spreadsheets containing thousands of line-item SKUs. How would you architect an asynchronous bulk-order processing system that validates inventory, applies custom pricing, and provides real-time progress updates to the frontend?

- [ ] Completed (Q22)
- [ ] ⚠️ Needs Answer Preparation
> **Source:** `Redington.md` | **Status:** ⚠️ Needs Personal Notes

#### Technical Answer
*[Needs to be filled]*

---

### Q23: Split Shipments & Partial Deliveries: An order for 500 routers might be split across 3 different warehouses. How do you design an order-tracking state machine that handles split shipments, partial fulfillments, and independent back-order tracking for a single corporate invoice?

- [ ] Completed (Q23)
- [ ] ⚠️ Needs Answer Preparation
> **Source:** `Redington.md` | **Status:** ⚠️ Needs Personal Notes

#### Technical Answer
*[Needs to be filled]*

---
