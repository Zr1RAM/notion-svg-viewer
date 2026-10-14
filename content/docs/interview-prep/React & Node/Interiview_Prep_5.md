# Mock Test 5: Full-Stack MERN / PERN Senior Technical Assessment

> **Mock Test 5 | Total Questions: 21 | Completed: 0 | Needs Review: 3**
> 💡 *Check off the `- [ ]` checkboxes as you complete questions. You can fold/collapse any section or question using the arrows beside headings in Obsidian.*

## Section A: JavaScript & TypeScript Core (The "Bread & Butter" Round)
> *4 Questions | Focus: Execution context, closures, event loop microtasks, prototype inheritance, and TypeScript typing.*

### Q1: Event Loop Phases & Microtasks: Walk through the phases of the Node.js event loop. What is the execution precedence between process.nextTick(), Promise.then(), and setImmediate()?

- [ ] Completed (Q1)
> **Source:** `CIKLUM.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Node.js Event Loop Phases:**
  1. **Timers:** Executes callbacks scheduled by `setTimeout()` and `setInterval()`.
  2. **Pending Callbacks:** Executes deferred I/O callbacks (e.g., TCP error reports).
  3. **Idle, Prepare:** Internal Node.js housekeeping.
  4. **Poll:** Retrieves new I/O events, executes I/O-related callbacks, blocks if queue is empty.
  5. **Check:** Executes callbacks scheduled by `setImmediate()`.
  6. **Close Callbacks:** Cleanup handlers like `socket.on('close', ...)`.

- **Microtask Precedence:**
  Between every phase of the event loop and after synchronous operations:
  1. `process.nextTick()` Queue (**Highest priority**): Runs before any other microtask or loop phase.
  2. Promise Microtask Queue (**Second priority**): Runs `Promise.then()`, `queueMicrotask()`, and `async/await` continuations after `nextTickQueue` is drained.
  3. Macrotasks (`setImmediate()`): Runs only when the loop reaches the **Check** phase.

---

### Q2: Compare Function Declarations vs. Function Expressions in JavaScript. Cover syntax, hoisting, naming, and use cases.

- [ ] Completed (Q2)
> **Source:** `CIPL.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Function Declaration:**
  - `function greet() { ... }`
  - Hoisted completely with its body to the top of the enclosing scope. Can be invoked before its declaration in code.
  - Must have an identifier name.
- **Function Expression:**
  - `const greet = function() { ... };` or `const greet = () => { ... };`
  - The variable declaration is hoisted, but the function assignment is NOT. Invoking before assignment throws `ReferenceError` or `TypeError`.
  - Can be anonymous or named.
  - Suitable for callbacks, conditional assignments, and closures.

---

### Q3: Explain the difference between Shallow Copy and Deep Copy in JavaScript. Provide practical methods to achieve both.

- [ ] Completed (Q3)
> **Source:** `Zelevate.md / JavaScript.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Shallow Copy:** Copies only top-level properties. Any nested objects or arrays retain their original memory references. Modifying a nested property in the copy mutates the original object.
  - Methods: `Object.assign({}, obj)`, spread operator `{ ...obj }`, array slice `arr.slice()`.
- **Deep Copy:** Recursively copies all properties and nested objects, creating completely independent memory allocations.
  - Modern native method: `structuredClone(obj)` (handles dates, regex, circular references).
  - Legacy/primitive method: `JSON.parse(JSON.stringify(obj))` (loses functions, undefined, dates become strings, fails on circular references).
  - Third-party: `lodash.cloneDeep(obj)`.

---

### Q4: What is the difference between async and defer attributes in HTML script tags?

- [ ] Completed (Q4)
> **Source:** `EPAM.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Standard `<script>`:** HTML parsing pauses while the script is fetched and executed immediately.
- **`<script async>`:** The script is fetched asynchronously in parallel with HTML parsing. As soon as download completes, HTML parsing is paused to execute the script. Execution order between multiple async scripts is unpredictable.
- **`<script defer>`:** The script is fetched in parallel with HTML parsing, but execution is deferred until HTML parsing is completely finished (right before `DOMContentLoaded`). Defer scripts execute in the exact order they appear in the document.

---

## Section B: React.js & Modern Frontend Architecture (Frontend Framework Round)
> *4 Questions | Focus: Component lifecycle, hooks, state management, Virtual DOM reconciliation, and Next.js App Router.*

### Q5: Explain the concept of Higher-Order Components (HOCs) in React. Provide an example use case like withAuthentication.

- [ ] Completed (Q5)
> **Source:** `Learning React.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Definition:** A Higher-Order Component is a pure function that takes a component as an argument and returns an enhanced component: `const EnhancedComponent = higherOrderComponent(WrappedComponent)`.
- **Purpose:** Cross-cutting concerns such as authentication guards, logging, theme injection, and conditional rendering.

```jsx
import React from 'react';
import { Redirect } from 'react-router-dom';

const withAuthentication = (WrappedComponent) => {
  return function WithAuth(props) {
    const isAuthenticated = Boolean(localStorage.getItem('token'));
    if (!isAuthenticated) {
      return <Redirect to="/login" />;
    }
    return <WrappedComponent {...props} />;
  };
};

export default withAuthentication;
```

---

### Q6: Explain the differences between React.memo, React.lazy, and useMemo.

- [ ] Completed (Q6)
> **Source:** `Learning React.md` | **Status:** ✅ Prepared

#### Technical Answer
- **`React.memo(Component)`:** Higher-Order Component that wraps a component to memoize its rendered output. Skips rendering if its props have not changed by shallow comparison.
- **`React.lazy(() => import('./Component'))`:** Enables dynamic code splitting by lazy-loading components only when they are rendered. Must be rendered inside a `<Suspense fallback={<Spinner />}>` boundary.
- **`useMemo(() => compute(), [deps])`:** Hook that memoizes the **result of a calculation** within a component body so it is only re-computed when specified dependencies change.

---

### Q7: How do you detect and fix unintentional sequential data waterfalls inside Next.js Server Components?

- [ ] Completed (Q7)
> **Source:** `NextJS/Next.js Fast Track Plan.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Problem:**
```typescript
// Each line waits for the previous line to finish, taking (time1 + time2)
const user = await getUser();
const metrics = await getSystemMetrics(); // Independent of user!
```
- **Solution:** Use `Promise.all` or `Promise.allSettled` to execute independent queries concurrently in parallel:
```typescript
const [user, metrics] = await Promise.all([
  getUser(),
  getSystemMetrics()
]);
```

---

### Q8: Accessibility in HTML: How do you ensure accessible web applications for screen readers and keyboard navigation?

- [ ] Completed (Q8)
> **Source:** `EPAM.md / Learning HTML, CSS and JS/HTML Notes.md` | **Status:** ✅ Prepared

#### Technical Answer
- Use semantic HTML tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`) instead of generic `<div>` containers.
- Ensure all interactive elements (`<button>`, `<a>`, `<input>`) are keyboard focusable with visible focus rings.
- Provide descriptive `alt` attributes for images (`alt="Company logo"`).
- Use ARIA attributes (`aria-label`, `aria-expanded`, `aria-live="polite"`) when custom interactive components (dropdowns, modals) cannot be represented by native HTML5 elements.
- Maintain proper heading hierarchies (`<h1>` through `<h6>`) and ensure high color contrast ratios (WCAG AA standard).

---

## Section C: Node.js, Express & Backend Architecture (Backend Engine Round)
> *5 Questions | Focus: libuv event loop, asynchronous non-blocking I/O, middleware pipelines, JWT auth, and Kafka event streaming.*

### Q9: How do you detect, profile, and fix a memory leak in a Node.js production service? What are common culprits?

- [ ] Completed (Q9)
> **Source:** `CIKLUM/Prep.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Detection:**
  - Monitor memory trends using Prometheus metrics (`process_resident_memory_bytes`, `nodejs_heap_size_used_bytes`). A steady sawtooth pattern is normal; an uninterrupted upward line indicates a leak.
- **Profiling Tools:**
  - Take heap snapshots using Node's inspector (`--inspect`) via Chrome DevTools or programmatically using `v8.writeHeapSnapshot()`.
  - Compare two heap snapshots taken 10 minutes apart under load to see which constructors or closures are growing uncontrollably.
  - Use `clinic.js flame` / `clinic.js bubbleprof` to visualize event loop delays and memory usage.
- **Common Culprits:**
  1. **Uncleared Event Listeners:** Attaching listeners to global emitters without removing them (`emitter.on()`).
  2. **Global Maps / Caches without TTL:** Storing user session data in a global JavaScript object without eviction policies.
  3. **Closures:** Inner functions holding references to large outer scopes in persistent variables.

---

### Q10: Differentiate between At-most-once, At-least-once, and Exactly-once delivery semantics in Kafka. How do you implement an Idempotent Consumer in Node.js?

- [ ] Completed (Q10)
> **Source:** `CIKLUM/Prep.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Delivery Semantics:**
  - **At-most-once:** Offsets committed before processing. If consumer crashes during processing, message is lost. (No duplicates, potential loss).
  - **At-least-once (Default):** Offsets committed *after* successful processing. If consumer crashes mid-processing, message is re-delivered on restart. (No loss, potential duplicates).
  - **Exactly-once:** Requires Kafka transactional producers and consumer read_committed state.
- **Implementing an Idempotent Consumer in Node.js:**
  - Because distributed networks experience duplicate deliveries, consumers must be idempotent.
  - Store processed `messageId` or `orderId` in a unique table or Redis set inside the same database transaction.
  - Before processing, check if `messageId` exists. If yes, skip processing and commit offset immediately:
```typescript
await db.transaction(async (trx) => {
  const existing = await trx('processed_events').where({ event_id: message.eventId }).first();
  if (existing) return; // Deduplicated!

  await processOrder(message.payload, trx);
  await trx('processed_events').insert({ event_id: message.eventId });
});
```

---

### Q11: Channel partner portals often require complex, multi-level corporate account hierarchies (e.g., Corporate Admin, Procurement Manager, Junior Buyer). How would you model and enforce this hierarchical Role-Based Access Control (RBAC) in your backend?

- [ ] Completed (Q11)
- [ ] ⚠️ Needs Answer Preparation
> **Source:** `Redington.md` | **Status:** ⚠️ Needs Personal Notes

#### Technical Answer
*[Needs to be filled]*

---

### Q12: What are the primary factors to look for during a code review on a Senior Full Stack pull request?

- [ ] Completed (Q12)
> **Source:** `EPAM.md` | **Status:** ✅ Prepared

#### Technical Answer
1. **Correctness & Edge Cases:** Does the logic solve the business requirement? Are boundary conditions, null/undefined checks, and empty arrays handled?
2. **Security:** Are inputs sanitized? Any SQL/NoSQL injection risks? Are authorization checks enforced at the route and service layers?
3. **Performance & Scalability:** Any database N+1 query problems? Are indexes utilized? Are expensive loops or memory leaks present?
4. **Architecture & Design:** Does the change respect layer boundaries (Controller -> Service -> Repository)? Are abstractions cohesive?
5. **Testing & Maintainability:** Are unit and integration tests present and meaningful? Is code readable and self-documenting?

---

### Q13: What is WSS (WebSocket Secure)? How does the WebSocket handshake upgrade from HTTP work?

- [ ] Completed (Q13)
> **Source:** `TCS.md` | **Status:** ✅ Prepared

#### Technical Answer
- **WSS (WebSocket Secure):** An encrypted WebSocket connection running over TLS/SSL (port 443), equivalent to HTTPS for standard web requests. Protects traffic from eavesdropping and man-in-the-middle attacks.
- **Handshake Upgrade Workflow:**
  1. Client sends a standard HTTP GET request with upgrade headers:
     `Connection: Upgrade`
     `Upgrade: websocket`
     `Sec-WebSocket-Key: <base64-random-key>`
  2. Server responds with HTTP status `101 Switching Protocols` and `Sec-WebSocket-Accept` header.
  3. The TCP connection remains open, switching from request-response HTTP to full-duplex, bidirectional WebSocket frame streaming.

---

## Section D: Databases & Data Layer: PostgreSQL, MongoDB & Redis (DB & Caching Round)
> *3 Questions | Focus: Relational SQL joins/CTEs, indexing & query planners, MongoDB schemas, and Redis caching strategies.*

### Q14: Write a SQL query using Users (user_id, user_name) and Orders (order_id, user_id, product) to find all users who have never placed an order.

- [ ] Completed (Q14)
> **Source:** `Interview Rounds.md` | **Status:** ✅ Prepared

#### Technical Answer
```sql
SELECT 
    u.user_id, 
    u.user_name
FROM 
    Users u
LEFT JOIN 
    Orders o ON u.user_id = o.user_id
WHERE 
    o.user_id IS NULL;
```
- **Why this works:** The `LEFT JOIN` preserves all users. For users without orders, `o.user_id` evaluates to `NULL`. The `WHERE o.user_id IS NULL` clause filters out all users who have orders, leaving only non-purchasing users. It is typically faster than `NOT IN (SELECT user_id FROM Orders)` on large datasets with null values.

---

### Q15: Discuss the different types of indexes in MongoDB and their trade-offs. What is a compound index and how do indexes impact write performance?

- [ ] Completed (Q15)
> **Source:** `Interview Topics (Rename to prep).md / MongoDB.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Index Types:**
  - **Single Field Index:** Default index on `_id` or custom single field (`{ email: 1 }`).
  - **Compound Index:** Index across multiple fields (`{ category: 1, price: -1 }`). Follows the Equality, Sort, Range (ESR) rule.
  - **Multikey Index:** Automatically created when indexing an array field (indexes every array element).
  - **Text Index:** Supports full-text search across strings (`{ name: 'text', description: 'text' }`).
  - **TTL Index:** Automatically deletes documents after a specified timestamp (great for sessions and temporary OTP tokens).
- **Trade-Offs & Write Performance:**
  - Every index accelerates read queries (`COLLSCAN` $\rightarrow$ `IXSCAN`).
  - However, **every write operation (`insert`, `update`, `delete`) must update every single index on the collection**. Having too many indexes degrades write throughput and increases RAM consumption.

---

### Q16: In a B2B setup, pricing is rarely fixed; it depends on the distributor's tier, volume contract, and geographic region. How would you design a database schema and caching strategy to handle dynamic, contract-based pricing for millions of SKUs without killing API performance?

- [ ] Completed (Q16)
- [ ] ⚠️ Needs Answer Preparation
> **Source:** `Redington.md` | **Status:** ⚠️ Needs Personal Notes

#### Technical Answer
*[Needs to be filled]*

---

## Section E: System Design, Live Coding / DSA & Techno-Managerial Leadership (High-Level & Culture Round)
> *5 Questions | Focus: High-concurrency ticket systems, array manipulation algorithms, SOLID principles, and engineering leadership.*

### Q17: Given a JSON response of user records containing nested address.city properties, write a JavaScript function using reduce() to group all users by city name.

- [ ] Completed (Q17)
> **Source:** `Mobile Programming Company - Integra.md` | **Status:** ✅ Prepared

#### Technical Answer
```javascript
function groupByCity(users) {
  return users.reduce((acc, user) => {
    const city = user.address.city;
    if (!acc[city]) {
      acc[city] = [];
    }
    acc[city].push(user);
    return acc;
  }, {});
}
```

---

### Q18: Compare the core Rate Limiting algorithms used in API Gateways: Token Bucket, Leaky Bucket, Fixed Window, and Sliding Window Counter.

- [ ] Completed (Q18)
> **Source:** `System Design - HLD.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Token Bucket:** Tokens are added to a bucket of fixed capacity at a constant rate. Requests consume a token. Allows bursts of traffic up to bucket capacity while maintaining an average rate.
- **Leaky Bucket:** Requests enter a queue and are processed at a strictly constant smooth rate (FIFO). Excess requests overflow and are dropped. Smooths out traffic spikes completely.
- **Fixed Window Counter:** Divides time into fixed windows (e.g. 1 minute). Counts requests per window. *Flaw:* A traffic burst at window boundary (end of minute 1 and start of minute 2) can allow double the allowed rate.
- **Sliding Window Counter:** Blends the count of the previous window with the current window percentage to provide a smooth, accurate sliding rate limit with low memory overhead.

---

### Q19: How do you manage a project and ensure code quality and maintainability in a team building a MERN stack application?

- [ ] Completed (Q19)
> **Source:** `Tech Lead - Team Lead.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Coordination across the Stack:** Clear milestone planning with Git branching strategies (feature branches, PR reviews with mandatory approvals).
- **Code Quality Guardrails:**
  - Enforce ESLint, Prettier, and TypeScript strict mode in pre-commit git hooks (Husky).
  - Automated CI test runners (Jest unit tests, Supertest API tests).
  - API documentation using OpenAPI/Swagger.
- **Performance Optimization Strategy:**
  - DB: Indexing, connection pooling.
  - Node: Async non-blocking operations, PM2/cluster management.
  - React: Lazy loading, code splitting, memoization, avoiding state colocation traps.

---

### Q20: A distributor ordering portal must display accurate stock levels, but inventory actually lives in legacy enterprise systems like SAP or Oracle ERP. How do you handle real-time vs. near-real-time inventory synchronization to prevent a partner from buying stock that was just sold offline?

- [ ] Completed (Q20)
- [ ] ⚠️ Needs Answer Preparation
> **Source:** `Redington.md` | **Status:** ⚠️ Needs Personal Notes

#### Technical Answer
*[Needs to be filled]*

---

### Q21: Which Agile ceremonies do you participate in as a Senior Developer, and what is your role in Sprint Estimation?

- [ ] Completed (Q21)
> **Source:** `EPAM.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Agile Ceremonies:** Sprint Planning, Daily Standup, Backlog Refinement, Sprint Review/Demo, and Retrospective.
- **Sprint Estimation Role:**
  - Break down ambiguous epic tickets into concrete technical subtasks.
  - Use Planning Poker (Story Points based on complexity, uncertainty, and effort rather than raw hours).
  - Call out architectural risks, dependencies on external teams, and identify technical debt spikes before committing to sprint deliverables.

---
