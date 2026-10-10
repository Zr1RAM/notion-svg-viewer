# Mock Test 6: Full-Stack MERN / PERN Senior Technical Assessment

> **Mock Test 6 | Total Questions: 21 | Completed: 0 | Needs Review: 3**
> 💡 *Check off the `- [ ]` checkboxes as you complete questions. You can fold/collapse any section or question using the arrows beside headings in Obsidian.*

## Section A: JavaScript & TypeScript Core (The "Bread & Butter" Round)
> *4 Questions | Focus: Execution context, closures, event loop microtasks, prototype inheritance, and TypeScript typing.*

### Q1: Give a scenario where misusing process.nextTick() starves I/O, and explain how to safely refactor it using setImmediate().

- [ ] Completed (Q1)
> **Source:** `CIKLUM.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Scenario:** Because `process.nextTick()` microtasks drain completely before the event loop can advance to any subsequent phase, a recursively scheduled `process.nextTick()` starves all incoming I/O:

```javascript
let count = 0;
function recursiveTick() {
  count++;
  process.nextTick(recursiveTick); // Infinitely starves the event loop
}

require('fs').readFile(__filename, () => {
  console.log('This will NEVER execute due to I/O starvation!');
});

recursiveTick();
```

- **Safe Refactoring:** Replace `process.nextTick(recursiveTick)` with `setImmediate(recursiveTick)`. Because `setImmediate` queues into the **Check** phase, each execution allows the event loop to cycle through Timers and Poll phases, servicing file system and network I/O smoothly.

---

### Q2: When should you use arrow functions versus regular functions in JavaScript? How does this binding differ?

- [ ] Completed (Q2)
> **Source:** `EPAM.md` | **Status:** ✅ Prepared

#### Technical Answer
- **`this` Binding:**
  - Regular functions determine `this` dynamically based on **how they are invoked** (call-site).
  - Arrow functions do not have their own `this`; they inherit `this` **lexically** from their enclosing scope at declaration time.
- **Arguments Object:**
  - Regular functions have access to the local `arguments` object.
  - Arrow functions do not have `arguments` (use Rest parameters `...args` instead).
- **Constructors:**
  - Regular functions can be used with `new` to instantiate objects.
  - Arrow functions lack `[[Construct]]` and prototype properties; calling with `new` throws `TypeError`.
- **When to use Arrow:** Callbacks, array operations (`.map()`, `.filter()`), Promises, React functional components.
- **When to use Regular:** Object methods needing dynamic `this`, prototype methods, constructor functions.

---

### Q3: Explain Debouncing in JavaScript. How does it differ from Throttling, and how would you implement a debounce function?

- [ ] Completed (Q3)
> **Source:** `MetaYB.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Debouncing:** Delays execution until a specified delay has passed since the *last* time the function was invoked. If invoked again before the delay expires, the timer resets. Ideal for search autocomplete inputs, window resize end events.
- **Throttling:** Ensures the function executes at most once every *X* milliseconds, regardless of how many times it is triggered. Ideal for infinite scroll handlers, game loop input polling.

```javascript
function debounce(fn, delayMs) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delayMs);
  };
}

// Usage:
const handleSearch = debounce((query) => {
  console.log("Searching for:", query);
}, 300);
```

---

### Q4: What is the difference between Flexbox and CSS Grid? When would you choose one over the other?

- [ ] Completed (Q4)
> **Source:** `EPAM.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Flexbox (One-Dimensional):** Designed for laying out items in a single dimension at a time—either in a row or in a column. Excellent for distributing space, aligning navigation bars, badges, form controls, and linear components.
- **CSS Grid (Two-Dimensional):** Designed for laying out items across rows AND columns simultaneously. Excellent for full page layouts, multi-column dashboard card grids, image galleries, and complex asymmetric interfaces.

---

## Section B: React.js & Modern Frontend Architecture (Frontend Framework Round)
> *4 Questions | Focus: Component lifecycle, hooks, state management, Virtual DOM reconciliation, and Next.js App Router.*

### Q5: What are the primary techniques to optimize performance in a large-scale React application?

- [ ] Completed (Q5)
> **Source:** `Learning React.md` | **Status:** ✅ Prepared

#### Technical Answer
1. **Preventing Re-renders:** Use `React.memo` for memoizing pure presentational components, `useCallback` to maintain function reference stability, and `useMemo` for expensive computations.
2. **Code Splitting & Lazy Loading:** Use `React.lazy()` and `Suspense` to split code into on-demand bundles for routes and heavy dialogs.
3. **Windowing / Virtualization:** Use `react-window` or `react-virtualized` for rendering massive lists (only rendering items currently inside viewport).
4. **Optimizing State Colocation:** Push state down as close as possible to the components that need it to prevent re-rendering the entire parent tree.
5. **Image & Asset Optimization:** WebP formats, responsive sizing, CDN caching.
6. **Concurrent Features:** Use `useTransition` to mark non-urgent state updates as interruptible.

---

### Q6: How does Server-Side Rendering (SSR) work in React, and what are its advantages over pure Client-Side Rendering (CSR)?

- [ ] Completed (Q6)
> **Source:** `Learning React.md` | **Status:** ✅ Prepared

#### Technical Answer
- **How it works:**
  1. When a user requests a URL, the server executes React component code to produce a fully rendered HTML string (`renderToString`).
  2. The server sends this HTML to the browser, displaying content immediately (Fast First Contentful Paint).
  3. The browser downloads the client JavaScript bundle, and React attaches event listeners to the server-rendered HTML in a process called **Hydration** (`hydrateRoot`).
- **Advantages:**
  - **SEO Optimization:** Search engine bots immediately receive complete crawlable HTML without executing JavaScript.
  - **Faster Initial Page Load:** Users on slow mobile networks see content instantly without waiting for a large JS bundle to download and execute.

---

### Q7: Why does importing Prisma or a SQL client into Next.js middleware.ts crash the application? How should session authentication be handled in middleware?

- [ ] Completed (Q7)
> **Source:** `NextJS/Next.js Fast Track Plan.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Root Cause:** Next.js `middleware.ts` runs on the V8 **Edge Runtime** (lightweight Web Worker environment) that does not support raw TCP sockets or Node.js native C++ bindings required by relational database drivers.
- **Solution:**
  - Keep Edge middleware lightweight and stateless: verify authentication using cryptographically signed **stateless JWTs** (using libraries like `jose`) or encrypted session cookies.
  - Perform full database lookups and user profile hydrations inside Server Components or Route Handlers in the Node.js runtime.

---

### Q8: Explain CSS Pseudo-Classes versus Pseudo-Elements with examples.

- [ ] Completed (Q8)
> **Source:** `EPAM.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Pseudo-Class (`:` single colon):** Selects an element based on its dynamic state or document tree structure.
  - Examples: `:hover`, `:focus`, `:active`, `:disabled`, `:first-child`, `:nth-child(2n)`.
- **Pseudo-Element (`::` double colon):** Creates or styles a specific abstraction of an element not present in the DOM tree.
  - Examples: `::before`, `::after` (inserting decorative content), `::first-line`, `::placeholder`.

---

## Section C: Node.js, Express & Backend Architecture (Backend Engine Round)
> *5 Questions | Focus: libuv event loop, asynchronous non-blocking I/O, middleware pipelines, JWT auth, and Kafka event streaming.*

### Q9: What is the difference between uncaughtException and unhandledRejection? Why must a process gracefully shut down after an uncaughtException?

- [ ] Completed (Q9)
> **Source:** `CIKLUM/Prep.md / Node JS - Backend Cheat Sheet.md` | **Status:** ✅ Prepared

#### Technical Answer
- **`uncaughtException`:** Synchronous JavaScript exception was thrown and not caught by any `try...catch` block.
- **`unhandledRejection`:** A Promise was rejected and lacked a `.catch()` handler.
- **Why Graceful Shutdown is Mandatory for `uncaughtException`:**
  - By definition, an uncaught exception leaves the application in an **undefined, corrupt state**. Database connections might be halfway through a transaction, memory references broken, and sockets dangling. Attempting to continue running will corrupt subsequent user requests.
  - **Graceful Shutdown Pattern:**
    1. Log the critical error with stack trace.
    2. Stop accepting new HTTP traffic: `server.close()`.
    3. Finish processing ongoing requests within a timeout (e.g. 10s).
    4. Release database and Redis connections.
    5. Exit with failure: `process.exit(1)`.
    6. Let the orchestrator (Kubernetes / Docker) spin up a fresh, clean container instance.

---

### Q10: If a Node.js service needs to write to PostgreSQL and publish an event to Kafka in the same request, how do you prevent dual-write inconsistencies? Explain the Transactional Outbox Pattern.

- [ ] Completed (Q10)
> **Source:** `CIKLUM/Prep.md` | **Status:** ✅ Prepared

#### Technical Answer
- **The Dual-Write Problem:** If you write to PostgreSQL and then publish to Kafka, the Kafka network call can fail or the service can crash, leaving the database updated without notifying downstream systems. If you publish to Kafka first, the database write could fail, emitting false events.
- **Transactional Outbox Pattern Solution:**
  1. In the same ACID database transaction, write your business entity (e.g. `Orders`) AND insert an event record into an `outbox` table.
  2. Because both writes share a single local database transaction, either both succeed or both roll back atomically.
  3. A separate asynchronous process reads the `outbox` table and publishes events to Kafka.
  4. **Change Data Capture (CDC with Debezium):** Connect Debezium directly to PostgreSQL's Write-Ahead Log (WAL). Debezium captures outbox row insertions and streams them to Kafka with zero application-level polling latency.

---

### Q11: When an order is placed on the channel portal, it must be injected into an external ERP system. If the ERP system goes down or suffers from high latency, how do you ensure reliable order delivery and fault tolerance so orders are never dropped?

- [ ] Completed (Q11)
- [ ] ⚠️ Needs Answer Preparation
> **Source:** `Redington.md` | **Status:** ⚠️ Needs Personal Notes

#### Technical Answer
*[Needs to be filled]*

---

### Q12: Compare Serverless architecture (e.g. AWS Lambda) with Serverful containerized architecture (e.g. ECS/Docker).

- [ ] Completed (Q12)
> **Source:** `EPAM.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Serverless (AWS Lambda + API Gateway):**
  - *Pros:* Zero server management, instant autoscaling from 0 to thousands of requests, pay strictly per execution millisecond.
  - *Cons:* Cold starts on idle functions, 15-minute execution limit, stateless (requires external connection pooling like RDS Proxy for relational DBs), difficult local debugging.
- **Serverful / Containers (AWS ECS / Docker / Kubernetes):**
  - *Pros:* Persistent memory, long-running connections (WebSockets), steady connection pooling, predictable latency with no cold starts.
  - *Cons:* Requires managing cluster provisioning, autoscaling rules, OS security patching, and paying for idle VM compute.

---

### Q13: Compare JWT token-based authentication with OAuth2. When is OAuth2 required over simple JWT authentication?

- [ ] Completed (Q13)
> **Source:** `SphereIT Global - ENBD (Client).md` | **Status:** ✅ Prepared

#### Technical Answer
- **JWT Token-Based Authentication:** An authentication mechanism where a server issues a signed token directly to a client upon successful credential validation. Simple, stateless, self-contained. Ideal for 1st-party single-page apps communicating with their own backend.
- **OAuth2:** An open authorization framework designed for delegated access without sharing user credentials.
  - *When OAuth2 is required:* When third-party applications need limited access to user resources (e.g. "Log in with Google / GitHub", or granting an external accounting tool access to your Stripe account).

---

## Section D: Databases & Data Layer: PostgreSQL, MongoDB & Redis (DB & Caching Round)
> *3 Questions | Focus: Relational SQL joins/CTEs, indexing & query planners, MongoDB schemas, and Redis caching strategies.*

### Q14: What is a Common Table Expression (CTE) in SQL? When would you use a CTE over subqueries or temporary tables?

- [ ] Completed (Q14)
> **Source:** `Interview Rounds.md / MetaYB.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Definition:** A CTE (`WITH` clause) creates a temporary named result set defined within the scope of a single SQL statement.
- **Why use CTE over Subqueries:**
  - **Readability & Maintenance:** Replaces complex, deeply nested subqueries with clean, sequential top-to-bottom logic.
  - **Reusability:** A CTE can be joined multiple times in the main query without duplicating subquery code.
  - **Recursive Operations:** Supports `WITH RECURSIVE` for hierarchical data (organizational trees, category parent-child hierarchies).
- **When to use Temporary Tables instead:**
  - When the intermediate result set is massive, needs custom B-Tree indexes, or must be queried across multiple separate transactions.

---

### Q15: How do you approach optimizing a MongoDB Aggregation Pipeline? Which pipeline stages should always be placed first?

- [ ] Completed (Q15)
> **Source:** `Mobile Programming Company - Integra.md / MongoDB.md` | **Status:** ✅ Prepared

#### Technical Answer
1. **Filter Early with `$match`:** Always place `$match` and `$sort` stages at the very beginning of the pipeline before any `$project`, `$unwind`, or `$group` stages. Early `$match` leverages indexes and filters out the majority of documents immediately.
2. **Limit Projections (`$project`):** Pass only the fields required for downstream stages to reduce memory transfer between pipeline stages.
3. **Avoid Unnecessary `$unwind`:** Unwinding massive arrays multiplies the document count in memory. Filter before unwinding.
4. **Use `allowDiskUse: true` with Caution:** If an aggregation stage exceeds the 100MB RAM limit, disk spilling prevents failure but slows execution; optimize queries with indexes instead.
5. **Analyze with `explain('executionStats')`:** Inspect execution stages to verify whether the pipeline utilized index scans (`IXSCAN`).

---

### Q16: In a B2B environment, many transactions happen on credit terms (e.g., Net-30 or Net-60 days). How would you implement a synchronous Credit Limit Verification Check during checkout that locks the partner's credit limit while preventing race conditions from concurrent buyers in the same company?

- [ ] Completed (Q16)
- [ ] ⚠️ Needs Answer Preparation
> **Source:** `Redington.md` | **Status:** ⚠️ Needs Personal Notes

#### Technical Answer
*[Needs to be filled]*

---

## Section E: System Design, Live Coding / DSA & Techno-Managerial Leadership (High-Level & Culture Round)
> *5 Questions | Focus: High-concurrency ticket systems, array manipulation algorithms, SOLID principles, and engineering leadership.*

### Q17: Given two arrays containing duplicate numbers (e.g. [1,2,4,5,6,7,9,1,3] and [1,2,2,5,8,7,5,2,9,1]), write a function to return all unique common elements present in both arrays in O(n) time.

- [ ] Completed (Q17)
> **Source:** `Mobile Programming Company - Integra.md` | **Status:** ✅ Prepared

#### Technical Answer
```javascript
function findCommonElements(arr1, arr2) {
  const set1 = new Set(arr1);
  const common = new Set();

  for (const num of arr2) {
    if (set1.has(num)) {
      common.add(num);
    }
  }

  return Array.from(common);
}

// Example usage:
const a = [1, 2, 4, 5, 6, 7, 9, 1, 3];
const b = [1, 2, 2, 5, 8, 7, 5, 2, 9, 1];
console.log(findCommonElements(a, b)); // [1, 2, 5, 7, 9]
```

---

### Q18: Explain the Circuit Breaker Pattern in distributed microservices. What are its three states (Closed, Open, Half-Open)?

- [ ] Completed (Q18)
> **Source:** `System Design - HLD.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Purpose:** Prevents cascading network failures when a downstream microservice or third-party API is failing or timing out.
- **Three States:**
  1. **Closed (Normal):** Requests pass through to downstream service. If failure rate exceeds a threshold (e.g. 50% failures over 10 seconds), the circuit trips to **Open**.
  2. **Open (Failing):** All incoming requests fail immediately or execute a local fallback function without making any network calls, protecting server threads. A timer is started (e.g. 30 seconds).
  3. **Half-Open (Testing Recovery):** Once timer expires, the breaker allows a limited trial number of requests through. If they succeed, it transitions back to **Closed**; if any fail, it resets to **Open**.

---

### Q19: How do you handle technical disagreements or conflicts within a development team, and what is your approach to mentoring junior developers?

- [ ] Completed (Q19)
> **Source:** `Tech Lead - Team Lead.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Handling Technical Disagreements:**
  - Focus on data and architectural trade-offs rather than opinions.
  - Build quick Proof-of-Concepts (POCs) and benchmark performance or maintenance implications.
  - Align decisions with project constraints (time-to-market, team familiarity, scalability requirements).
- **Mentoring Junior Developers:**
  - Pair programming sessions on complex architectural tickets.
  - Constructive code reviews explaining the *why* behind design patterns rather than just prescribing changes.
  - Establishing clear growth milestones and granting progressive ownership of end-to-end features.

---

### Q20: In B2B commerce, orders above a certain monetary threshold often require manual workflow approvals from an internal credit manager or account representative. How would you design a flexible, state-driven Order Approval Workflow Engine?

- [ ] Completed (Q20)
- [ ] ⚠️ Needs Answer Preparation
> **Source:** `Redington.md` | **Status:** ⚠️ Needs Personal Notes

#### Technical Answer
*[Needs to be filled]*

---

### Q21: Given a hybrid setup where a serverless checkout system needs to communicate an order confirmation back to a serverful live-chat system instantly, what communication protocol or messaging pattern would you implement?

- [ ] Completed (Q21)
> **Source:** `EPAM.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Architecture Solution:** Use an asynchronous Pub/Sub message broker (**Amazon SNS/SQS**, **Redis Pub/Sub**, or **RabbitMQ**):
  1. When serverless checkout completes on AWS Lambda, publish an `ORDER_CONFIRMED` event to an SNS topic / SQS queue.
  2. The serverful live-chat cluster (holding persistent WebSocket connections with active users) consumes the message from the queue.
  3. The chat server identifies the user's active WebSocket connection ID and pushes the instant confirmation message down the open socket to the client.
  - Decouples serverless execution from long-running socket connections reliably.

---
