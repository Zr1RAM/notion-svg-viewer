# Mock Test 1: Full-Stack MERN / PERN Senior Technical Assessment

> **Mock Test 1 | Total Questions: 24 | Completed: 0 | Needs Review: 3**
> 💡 *Check off the `- [ ]` checkboxes as you complete questions. You can fold/collapse any section or question using the arrows beside headings in Obsidian.*

## Section A: JavaScript & TypeScript Core (The "Bread & Butter" Round)
> *5 Questions | Focus: Execution context, closures, event loop microtasks, prototype inheritance, and TypeScript typing.*

### Q1: Explain what hoisting is in JavaScript. Specifically, how does the engine handle hoisting differently for a function declaration vs. a let/const variable? What is the Temporal Dead Zone (TDZ)?

- [ ] Completed (Q1)
> **Source:** `Interview Rounds.md` | **Status:** ✅ Prepared

#### Technical Answer
- Hoisting is JavaScript's compilation-phase behavior where memory is allocated for variable and function declarations before executing code.
- `var` declarations are hoisted and initialized to `undefined`.
- `let` and `const` declarations are hoisted into the **Temporal Dead Zone (TDZ)**. They remain completely uninitialized until code execution reaches the line where they are declared. Accessing them before that throws a `ReferenceError`.
- Function declarations are hoisted with their complete function definition. Function expressions assigned to variables follow the variable's hoisting rules.

```javascript
console.log(x); // undefined
var x = 10;

add(4, 5); // Works: 9
function add(a, b) {
  return a + b;
}

subtract(5, 3); // TypeError or ReferenceError: subtract is not initialized
const subtract = (a, b) => {
  return a - b;
};
```

---

### Q2: What are the output values for the following JavaScript expressions, and why? typeof [1, 2, 3]; {id:1}.map(); and object equality comparison between obj1, obj2, and obj3 (where obj3 = obj1)?

- [ ] Completed (Q2)
> **Source:** `CIKLUM.md` | **Status:** ✅ Prepared

#### Technical Answer
```javascript
var arr = [1, 2, 3];
console.log(typeof arr); // 'object' (Arrays are objects in JS; use Array.isArray(arr) to distinguish)

var myvar = { id: 1, name: "abc" };
console.log(myvar.map(i => i.id + 1)); // TypeError: myvar.map is not a function (Objects do not have .map)

const obj1 = { name: "John" };
const obj2 = { name: "John" };
const obj3 = obj1;
obj3.city = "xyz";

console.log(obj1 == obj2);  // false (Different memory references in heap)
console.log(obj1 === obj2); // false (Different memory references)
console.log(obj1 == obj3);  // true  (Identical memory reference)
console.log(obj1 === obj3); // true  (Identical memory reference)
console.log(obj1.city);     // 'xyz' (Mutating obj3 mutated obj1 because they point to same object)
```

---

### Q3: Explain the difference between call(), apply(), and bind() in JavaScript with code examples.

- [ ] Completed (Q3)
> **Source:** `SphereIT Global - ENBD (Client).md` | **Status:** ✅ Prepared

#### Technical Answer
All three methods explicitly set the `this` context of a function:
- **`call(thisArg, arg1, arg2, ...)`:** Invokes the function immediately, passing arguments individually as a comma-separated list.
- **`apply(thisArg, [argsArray])`:** Invokes the function immediately, passing arguments as a single array.
- **`bind(thisArg, arg1, arg2, ...)`:** Does **not** invoke the function immediately; returns a new bound function with the fixed `this` context and preset arguments for later execution.

```javascript
const person = { name: "Alice" };
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

console.log(greet.call(person, "Hello", "!"));         // "Hello, Alice!"
console.log(greet.apply(person, ["Hi", "?"]));         // "Hi, Alice?"
const boundGreet = greet.bind(person, "Hey");
console.log(boundGreet("."));                          // "Hey, Alice."
```

---

### Q4: What is the difference between find and filter array methods in JavaScript/TypeScript? Which one returns a new array?

- [ ] Completed (Q4)
> **Source:** `TCS.md / MetaYB.md` | **Status:** ✅ Prepared

#### Technical Answer
- **`filter(predicate)`:**
  - Iterates through the entire array.
  - Returns a **brand new array** containing all elements that satisfy the condition. If none match, returns an empty array `[]`.
- **`find(predicate)`:**
  - Iterates through the array and stops immediately at the **first** element that satisfies the condition.
  - Returns the **element itself** (not an array). If no elements match, returns `undefined`.

---

### Q5: Explain the 4 pillars of Object-Oriented Programming (OOP) and how they are implemented in modern JavaScript/TypeScript.

- [ ] Completed (Q5)
> **Source:** `EPAM.md` | **Status:** ✅ Prepared

#### Technical Answer
1. **Encapsulation:** Bundling data and methods operating on that data inside a class; hiding internal state using `#privateFields` in JS or `private`/`protected` in TS.
2. **Abstraction:** Exposing high-level interfaces while hiding low-level implementation details (using abstract classes and interfaces in TypeScript).
3. **Inheritance:** Enabling child classes to inherit properties and methods from parent classes (`class Dog extends Animal`).
4. **Polymorphism:** Allowing different classes to define the same method with different underlying behavior (`animal.speak()`).

---

## Section B: React.js & Modern Frontend Architecture (Frontend Framework Round)
> *5 Questions | Focus: Component lifecycle, hooks, state management, Virtual DOM reconciliation, and Next.js App Router.*

### Q6: Can you explain the component lifecycle methods in React (Mounting, Updating, Unmounting, and Error Handling)? How do hooks map to them?

- [ ] Completed (Q6)
> **Source:** `Learning React.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Mounting:**
  - `constructor()`: Initializes local state, binds event handlers (Class components).
  - `getDerivedStateFromProps()`: Syncs state with props right before rendering.
  - `render()`: Returns JSX representing UI (must be pure).
  - `componentDidMount()`: Invoked immediately after insertion into DOM. Ideal for API calls, subscriptions, event listeners. (Hooks equivalent: `useEffect(() => {}, [])`).
- **Updating:**
  - `shouldComponentUpdate(nextProps, nextState)`: Controls whether to re-render based on prop/state changes. (Hooks equivalent: `React.memo` custom comparator).
  - `render()`: Re-executes JSX creation.
  - `getSnapshotBeforeUpdate(prevProps, prevState)`: Captures DOM state (e.g. scroll position) before mutation commits.
  - `componentDidUpdate(prevProps, prevState)`: Runs immediately after DOM mutations commit. (Hooks equivalent: `useEffect(() => {}, [deps])`).
- **Unmounting:**
  - `componentWillUnmount()`: Cleanup timers, subscriptions, AbortControllers. (Hooks equivalent: `useEffect` cleanup return function).
- **Error Handling:**
  - `componentDidCatch(error, info)` & `static getDerivedStateFromError(error)`: Used in Error Boundaries to render fallback UI.

---

### Q7: What are controlled and uncontrolled components in React forms? How would you implement an uncontrolled input using useRef that displays its value on button click?

- [ ] Completed (Q7)
> **Source:** `Learning React.md / EPAM.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Controlled Component:** Input value is driven by React state (`value={state}` and `onChange={e => setState(e.target.value)}`). Offers immediate validation, but every keystroke re-renders the component.
- **Uncontrolled Component:** Input value is managed natively by the DOM. Accessed imperatively using `useRef`. Great for high-performance forms with 50+ fields to eliminate typing lag.

```jsx
import React, { useRef, useState } from 'react';

const UncontrolledForm = () => {
  const inputRef = useRef(null);
  const [submittedText, setSubmittedText] = useState('');

  const handleCapture = () => {
    if (inputRef.current) {
      setSubmittedText(inputRef.current.value);
    }
  };

  return (
    <div>
      <input ref={inputRef} type="text" placeholder="Type here..." />
      <button onClick={handleCapture}>Capture Value</button>
      {submittedText && <p>Captured: {submittedText}</p>}
    </div>
  );
};

export default UncontrolledForm;
```

---

### Q8: In Next.js App Router, why does accessing window or localStorage at the top level of a 'use client' component cause a 'window is not defined' error during build or SSR? How do you fix it?

- [ ] Completed (Q8)
> **Source:** `NextJS/Next.js Fast Track Plan.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Root Cause:** In Next.js, the `"use client"` directive does **not** mean "execute only in the browser." It means "render on the server during the initial SSR pass, then hydrate on the client." Because Node.js has no `window` or `localStorage` object, executing them during SSR crashes the build.
- **Correct Solution:**
  1. Access browser-only globals inside `useEffect` (which strictly runs on the client after mounting):
  ```tsx
  'use client';
  import { useEffect, useState } from 'react';

  export function ThemeToggle() {
    const [theme, setTheme] = useState('light');
    useEffect(() => {
      const stored = localStorage.getItem('theme');
      if (stored) setTheme(stored);
    }, []);
    return <div>Current theme: {theme}</div>;
  }
  ```
  2. Or use `useSyncExternalStore` for reactive local storage subscriptions.

---

### Q9: Explain Concurrent Rendering in React 18/19. When would you use useTransition instead of a standard debounced state update?

- [ ] Completed (Q9)
> **Source:** `CIKLUM/Prep.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Concurrent Rendering:** React can pause, resume, or abandon rendering updates to keep the main thread responsive to urgent user interactions (typing, clicking).
- **`useTransition` vs Debounce:**
  - **Debouncing:** Delays triggering the state update by *X* ms. It introduces an artificial, fixed latency before anything happens.
  - **`useTransition`:** Immediately starts rendering the expensive update in the background with low priority. If the user types another character, React interrupts the ongoing background render, updates the input immediately, and restarts the transition.
  - **Use `useTransition` when:** Filtering large data tables or charting views where you want instant keystroke response without artificial fixed delays.

---

### Q10: Explain the bundling process for a modern React application (Webpack / Vite / Turbopack). What does a bundler do?

- [ ] Completed (Q10)
> **Source:** `EPAM.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Core Responsibilities:**
  1. **Dependency Graph Construction:** Recursively resolves all `import` and `require` statements starting from an entry point (`index.tsx`).
  2. **Transpilation:** Passes code through loaders/compilers (Babel, SWC, esbuild) to convert JSX and TypeScript into browser-compatible JavaScript.
  3. **Module Concatenation & Scoping:** Bundles modules into optimized chunks.
  4. **Minification & Tree Shaking:** Removes dead code and minifies identifiers (Terser).
  5. **Code Splitting:** Generates separate asynchronous bundles for dynamic `import()` routes to optimize initial bundle size.

---

## Section C: Node.js, Express & Backend Architecture (Backend Engine Round)
> *5 Questions | Focus: libuv event loop, asynchronous non-blocking I/O, middleware pipelines, JWT auth, and Kafka event streaming.*

### Q11: What are the core advantages and disadvantages of using Node.js for backend development? For what workloads is it NOT suitable?

- [ ] Completed (Q11)
> **Source:** `Node JS - Backend Cheat Sheet.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Advantages:**
  - **Asynchronous & Non-Blocking I/O:** High concurrency on a single thread using libuv, ideal for I/O-heavy workloads (REST APIs, chat apps, streaming).
  - **Single Language (JS/TS):** Shared code, types, and validation models between client and server.
  - **V8 Engine Performance:** Fast JIT compilation to native machine code.
  - **Ecosystem:** Rich npm registry with enterprise modules.
- **Disadvantages & Unsuitable Workloads:**
  - **CPU-Intensive Tasks:** Heavy computations (image processing, cryptographic hashing, massive matrix math) block the single-threaded event loop, starving all concurrent HTTP requests.
  - **Not ideal for:** High-performance machine learning, data science, or heavy multi-threaded numerical computing (where Rust, Go, or Python are better suited).
  - **Callback/Async Management:** Unhandled promise rejections can crash processes if not handled with disciplined async architecture.

---

### Q12: Explain how middleware works in Express.js. How do you implement centralized error-handling middleware?

- [ ] Completed (Q12)
> **Source:** `Interview Topics (Rename to prep).md / Node JS - Backend Cheat Sheet.md` | **Status:** ✅ Prepared

#### Technical Answer
- **How Middleware Works:** Middleware functions are functions that have access to the request object (`req`), the response object (`res`), and the `next` function in the application's request-response cycle. They execute sequentially in the order registered.
- **Centralized Error-Handling Middleware:** Defined with **four arguments** `(err, req, res, next)`. Express recognizes four parameters specifically as an error handler:

```javascript
// routes/users.js
app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await findUser(req.params.id);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    res.json(user);
  } catch (error) {
    next(error); // Passes error down the middleware pipeline
  }
});

// Centralized error middleware (must be registered LAST after all routes)
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  console.error(`[Error] ${status}: ${err.message}`, err.stack);
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});
```

---

### Q13: When a Node.js message consumer fails, how do you implement exponential backoff retries and a Dead Letter Queue (DLQ)?

- [ ] Completed (Q13)
> **Source:** `CIKLUM/Prep.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Transient Errors vs Poison Pills:**
  - **Transient Errors (e.g. database timeout, downstream 503):** Retry with exponential backoff and jitter (e.g., 1s, 2s, 4s).
  - **Poison Pills (e.g. invalid JSON, missing required schema field):** Retrying will never succeed and blocks the consumer partition forever.
- **Dead Letter Queue (DLQ) Implementation:**
  1. Route failed messages to a retry topic with a delay header.
  2. If the message exceeds the maximum retry threshold (e.g. 3 attempts), divert it directly into a **Dead Letter Queue (`topic-dlq`)**.
  3. Commit the offset on the primary partition to allow normal processing to resume.
  4. Set up CloudWatch/Prometheus alerts on the DLQ topic and build an admin reprocessing tool for manual inspection.

---

### Q14: When dealing with distributors across different countries, you encounter differing tax structures (VAT, GST), localized currencies, and distinct regional compliance rules. How do you design your backend modules to be internationally extensible without writing completely separate codebases for each country?

- [ ] Completed (Q14)
- [ ] ⚠️ Needs Answer Preparation
> **Source:** `Redington.md` | **Status:** ⚠️ Needs Personal Notes

#### Technical Answer
*[Needs to be filled]*

---

### Q15: When a service reaches production, how can we monitor it in real-time? Differentiate logging, metrics, alerting, and APM tools.

- [ ] Completed (Q15)
> **Source:** `EPAM.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Structured Logging:** Centralized logging with JSON formatting using Winston/Pino shipped to ELK (Elasticsearch/Logstash/Kibana) or AWS CloudWatch.
- **Metrics Telemetry:** Prometheus scraping Node metrics (`prom-client`), visualized on Grafana dashboards for CPU, RAM, Event Loop latency, and HTTP request throughput.
- **Application Performance Monitoring (APM):** New Relic, Datadog, or Sentry for distributed tracing, slowest database queries, and automatic stack trace capture on crashes.
- **Health Checks & Alerting:** PagerDuty / Opsgenie integrated with Prometheus alerts triggering on 5xx error spikes or latency breaches.

---

## Section D: Databases & Data Layer: PostgreSQL, MongoDB & Redis (DB & Caching Round)
> *4 Questions | Focus: Relational SQL joins/CTEs, indexing & query planners, MongoDB schemas, and Redis caching strategies.*

### Q16: Can you compare SQL (Relational) and NoSQL (Document/Key-Value) databases? When would you choose each type in a modern application?

- [ ] Completed (Q16)
> **Source:** `Interview Topics (Rename to prep).md / Databases.md` | **Status:** ✅ Prepared

#### Technical Answer
- **SQL (e.g. PostgreSQL, MySQL):**
  - **Structure:** Strict, predefined tabular schema with tables, rows, columns, foreign keys.
  - **Guarantees:** Full ACID (Atomicity, Consistency, Isolation, Durability) transactions.
  - **Strengths:** Complex relational queries, multi-table joins, financial integrity, strict consistency.
  - **Scaling:** Scales vertically (more CPU/RAM); horizontal scaling requires complex sharding or read replicas.
- **NoSQL (e.g. MongoDB, Redis):**
  - **Structure:** Schema-flexible JSON-like documents, key-values, or graphs.
  - **Guarantees:** BASE model (Basically Available, Soft state, Eventual consistency).
  - **Strengths:** Rapid schema evolution, hierarchical/nested data, high write throughput.
  - **Scaling:** Scales horizontally out of the box via built-in sharding and replica sets.
- **When to choose:**
  - Choose **PostgreSQL** for e-commerce checkouts, ledgers, order management, and interconnected domain models.
  - Choose **MongoDB** for polymorphic product catalogs, content management, real-time activity feeds, and semi-structured events.

---

### Q17: Explain Pessimistic Locking (SELECT FOR UPDATE) vs. Optimistic Locking. Where would you choose each in a high-concurrency transactional system?

- [ ] Completed (Q17)
> **Source:** `CIKLUM/Prep.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Pessimistic Locking (`SELECT FOR UPDATE`):**
  - **Mechanism:** Locks the row at the database level the moment it is read, preventing all other concurrent transactions from modifying or locking that row until the current transaction commits or rolls back.
  - **Best for:** High contention with critical transactional risk where collisions are frequent and rollbacks are unacceptable (e.g. reserving limited concert tickets or bank balance transfers).
- **Optimistic Locking:**
  - **Mechanism:** No database locks are held during reading. Each record maintains a `version` integer or `updated_at` timestamp. When updating, the query checks:
    `UPDATE products SET stock = stock - 1, version = version + 1 WHERE id = 101 AND version = 5;`
    If zero rows were updated, a concurrent transaction updated it first; the application catches the conflict and retries.
  - **Best for:** Low-to-moderate contention, high read volumes, long user think times (e.g. editing a collaborative wiki document or updating user profile details).

---

### Q18: Explain how Redis functions as an In-Memory Database. How does it differ from traditional databases, and what are its two persistence mechanisms (RDB vs AOF)?

- [ ] Completed (Q18)
> **Source:** `Mobile Programming Company - Samsung.md / Redis.md` | **Status:** ✅ Prepared

#### Technical Answer
- **In-Memory Architecture:**
  - Stores all dataset records directly in RAM, bypassing disk I/O latency entirely. Delivers sub-millisecond read/write speeds (>100,000 ops/sec).
  - Single-threaded event loop eliminates lock contention on data structures.
- **Persistence Mechanisms:**
  1. **RDB (Redis Database Snapshots):**
     - Takes point-in-time snapshots of the entire memory dataset at specified intervals (e.g., every 5 minutes if 100 keys changed).
     - Compact, fast restarts, but potential data loss for writes between snapshots if the server crashes.
  2. **AOF (Append-Only File):**
     - Logs every write command received by the server to an append-only log on disk (`fsync` every second).
     - Maximum durability, but larger file sizes and slower restart load times.
  - **Production Standard:** Combine RDB snapshots with AOF for fast recovery and minimal data loss.

---

### Q19: Serial Number Tracking & Traceability: For warranty and anti-counterfeiting purposes, every electronic item shipped must have its unique Serial Number tracked from the warehouse to end customer. How would you design the data layer to handle high-throughput queries for tracking product serial numbers across millions of orders?

- [ ] Completed (Q19)
- [ ] ⚠️ Needs Answer Preparation
> **Source:** `Redington.md` | **Status:** ⚠️ Needs Personal Notes

#### Technical Answer
*[Needs to be filled]*

---

## Section E: System Design, Live Coding / DSA & Techno-Managerial Leadership (High-Level & Culture Round)
> *5 Questions | Focus: High-concurrency ticket systems, array manipulation algorithms, SOLID principles, and engineering leadership.*

### Q20: Design a real-time, high-volume Ticket Booking System (similar to Ticketmaster) for high-demand concert events. Detail Functional & Non-Functional requirements, seat reservation hot path via Redis Lua scripts, and asynchronous checkout.

- [ ] Completed (Q20)
> **Source:** `AI Mock Interview.md / High-volume Ticket Booking System.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Core Paradigm: CP (Consistency over Availability for inventory):** Seat allocation must be 100% consistent; zero double-selling is permitted. We separate the *Seat Reservation (Hot Path)* from the *Final Booking & Payment (Cold Path)*.
- **Architectural Flow:**
  1. **Virtual Waiting Room (Edge Traffic Shaping):** CDN/Cloudflare routes incoming flash-sale traffic into a token-bucket queue, trickling users progressively into application servers (flattening 1,000,000 RPS spikes into a steady 10,000 RPS).
  2. **The Hot Path (Atomic Inventory Allocation via Redis):**
     - Available tickets are preloaded into Redis: `concert:101:seats_available = 50000`.
     - When a user requests 2 seats, NestJS executes an **Atomic Redis Lua script**. Redis executes Lua atomically on a single thread:
       ```lua
       local available = tonumber(redis.call('get', KEYS[1]))
       local requested = tonumber(ARGV[1])
       if available >= requested then
           redis.call('decrby', KEYS[1], requested)
           return 1
       else
           return 0
       end
       ```
     - On success, the user receives a **Temporary Reservation Token** with a 10-minute TTL.
  3. **The Cold Path (Asynchronous Checkout & DB Persistence):**
     - The user completes payment via Stripe/Adyen.
     - On payment success, an event is published to **Apache Kafka**.
     - Background worker services consume the event and persist the permanent booking into **PostgreSQL** in an isolated transaction.
     - If the 10-minute TTL expires without payment, an automated worker increments the Redis counter back up, returning seats to the public pool.

---

### Q21: Write a JavaScript snippet using Array.prototype.reduce() to generate the sequence of triangular numbers [1, 3, 6, 10, 15, 21].

- [ ] Completed (Q21)
> **Source:** `TCS.md` | **Status:** ✅ Prepared

#### Technical Answer
```javascript
const steps = [1, 2, 3, 4, 5, 6];

const result = steps.reduce((acc, curr) => {
  const lastTotal = acc[acc.length - 1] || 0;
  acc.push(lastTotal + curr);
  return acc;
}, []);

console.log(result); // [1, 3, 6, 10, 15, 21]
```

---

### Q22: What is the difference between a Layer 4 (Transport) and Layer 7 (Application) Load Balancer? Which algorithms are used to distribute traffic?

- [ ] Completed (Q22)
> **Source:** `System Design - HLD.md / Load Balancer.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Layer 4 Load Balancer (TCP/UDP):**
  - Routes traffic purely based on network IP address and TCP/UDP ports without inspecting packet payload or HTTP headers.
  - Extremely fast and lightweight.
- **Layer 7 Load Balancer (HTTP/HTTPS):**
  - Inspects HTTP headers, cookies, URL paths, and request payloads.
  - Can route traffic intelligently (e.g. `/api/auth` to Auth Service, `/images` to CDN/Static servers). Handles SSL termination and sticky sessions.
- **Algorithms:** Round Robin, Weighted Round Robin, Least Connections, IP Hash / Consistent Hashing.

---

### Q23: What is Git cherry-picking? When should you use it, how do you handle conflicts, and why should it be used sparingly compared to merging?

- [ ] Completed (Q23)
> **Source:** `Zelevate.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Definition:** Applying a specific commit from one branch onto another branch: `git cherry-pick <commit-hash>`.
- **When to use:** Cherry-picking a critical bug fix from a `feature-branch` or `develop` directly onto the `main` release branch without merging uncompleted features.
- **Handling Conflicts:** Git pauses the operation; resolve conflicts in files, stage them (`git add .`), and run `git cherry-pick --continue` (or abort via `git cherry-pick --abort`).
- **Why use sparingly:** Cherry-picking generates a **duplicate commit with a new SHA hash**, creating duplicate histories that can cause merge conflicts when the branches are eventually merged together.

---

### Q24: Multi-Tier Channel Management: How would you architect a multi-tenant data model where a Tier-1 partner can manage and view the order history of their own sub-resellers (Tier-2) within the same portal?

- [ ] Completed (Q24)
- [ ] ⚠️ Needs Answer Preparation
> **Source:** `Redington.md` | **Status:** ⚠️ Needs Personal Notes

#### Technical Answer
*[Needs to be filled]*

---
