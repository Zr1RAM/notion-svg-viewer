# Mock Test 2: Full-Stack MERN / PERN Senior Technical Assessment

> **Mock Test 2 | Total Questions: 23 | Completed: 0 | Needs Review: 3**
> 💡 *Check off the `- [ ]` checkboxes as you complete questions. You can fold/collapse any section or question using the arrows beside headings in Obsidian.*

## Section A: JavaScript & TypeScript Core (The "Bread & Butter" Round)
> *5 Questions | Focus: Execution context, closures, event loop microtasks, prototype inheritance, and TypeScript typing.*

### Q1: Explain the difference between var, let, and const. In what situations would you use each?

- [ ] Completed (Q1)
> **Source:** `Interview Topics (Rename to prep).md` | **Status:** ✅ Prepared

#### Technical Answer
- **`var`:**
  - Function-scoped.
  - Hoisted and initialized to `undefined`.
  - Can be re-declared and updated within the same scope.
  - Considered legacy and avoided in modern JavaScript.
- **`let`:**
  - Block-scoped (`{ ... }`).
  - Hoisted into the Temporal Dead Zone (TDZ) without initialization.
  - Cannot be re-declared within the same scope, but can be reassigned.
  - Use when the variable's value needs to change over time (e.g., loop counters, mutable state).
- **`const`:**
  - Block-scoped.
  - Hoisted into TDZ; must be initialized upon declaration.
  - Identifier cannot be reassigned. However, properties of objects and elements of arrays declared with `const` remain mutable.
  - Use by default for all identifiers to ensure immutability of bindings.

---

### Q2: Explain immutable data types in JavaScript. How do primitive types differ from reference types regarding immutability, and how can you make objects immutable?

- [ ] Completed (Q2)
> **Source:** `CIPL.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Primitive Types are Immutable:** Strings, Numbers, Booleans, Null, Undefined, Symbols, and BigInt cannot be modified in-place. Operations like `str.toUpperCase()` return a brand new string in memory without changing the original.
- **Reference Types are Mutable:** Objects, Arrays, and Functions are stored by reference in the heap and can be mutated unless protected.
- **Making Objects Immutable:**
  - `Object.freeze(obj)`: Shallowly freezes an object—prevents adding, deleting, or reassigning existing properties.
  - Deep Freeze: Recursively apply `Object.freeze` to nested objects.
  - Immutable Libraries: Libraries like `Immutable.js` provide persistent immutable data structures (Maps, Lists) using structural sharing for high performance.

---

### Q3: Explain the difference between Pick<T, K> and Omit<T, K> in TypeScript. Write a generic wrapInArray<T> function.

- [ ] Completed (Q3)
> **Source:** `EPAM.md / Zelevate.md` | **Status:** ✅ Prepared

#### Technical Answer
- **`Pick<T, K>`:** Constructs a type by picking the set of properties `K` from type `T`.
- **`Omit<T, K>`:** Constructs a type by picking all properties from `T` and removing the specified keys `K`.

```typescript
type Person = {
  name: string;
  age: number;
  address: string;
};

// Pick only name and age:
type NameAndAge = Pick<Person, "name" | "age">;

// Omit address:
type PersonWithoutAddress = Omit<Person, "address">;

// Generic wrapInArray function:
function wrapInArray<T>(value: T): T[] {
  return [value];
}

const numArr = wrapInArray(42);       // number[]
const strArr = wrapInArray("hello");  // string[]
```

---

### Q4: What is the difference between DOMContentLoaded and window.onload event? Which one is triggered first?

- [ ] Completed (Q4)
> **Source:** `EPAM.md` | **Status:** ✅ Prepared

#### Technical Answer
- **`DOMContentLoaded`:**
  - Fires when the initial HTML document has been completely parsed and the DOM tree is built, **without** waiting for stylesheets, images, subframes, or async scripts to finish loading.
  - Fires **first**.
- **`window.onload`:**
  - Fires only after the entire page has loaded, including all external resources such as stylesheets, images, fonts, and scripts.
  - Fires **second**.

---

### Q5: What is the Browser Object Model (BOM) in JavaScript? How does it differ from the Document Object Model (DOM)?

- [ ] Completed (Q5)
> **Source:** `EPAM.md` | **Status:** ✅ Prepared

#### Technical Answer
- **DOM (Document Object Model):** Represents the content of the HTML document as a structured tree of nodes (`document.getElementById`, `document.body`).
- **BOM (Browser Object Model):** Represents the browser environment itself outside the page content. Includes `window`, `navigator` (browser info, geolocation), `screen` (display dimensions), `location` (URL manipulation), and `history` (browser session history).

---

## Section B: React.js & Modern Frontend Architecture (Frontend Framework Round)
> *4 Questions | Focus: Component lifecycle, hooks, state management, Virtual DOM reconciliation, and Next.js App Router.*

### Q6: How do you handle state management in React applications? Compare Local State, Context API, Redux Toolkit, and Server State (TanStack Query).

- [ ] Completed (Q6)
> **Source:** `Learning React.md` | **Status:** ✅ Prepared

#### Technical Answer
1. **Local State (`useState`, `useReducer`):** Best for isolated, component-specific UI state (form inputs, toggles, modals). Immutable.
2. **Context API:** Eliminates prop drilling for low-frequency global data (current authenticated user, theme, locale). Not suited for high-frequency updates due to all consuming components re-rendering.
3. **Client Global Store (Redux Toolkit / Zustand / MobX):** Predictable unidirectional data flow with centralized store, actions, and pure reducers. Ideal for complex multi-screen client UI workflows and offline sync.
4. **Server State (TanStack Query / RTK Query):** Specialized for asynchronous remote data. Handles background refetching, caching, deduplication, cache invalidation, and pagination. Avoids anti-pattern of duplicating API responses into global Redux state.

---

### Q7: Describe the differences between React Router and traditional server-side routing.

- [ ] Completed (Q7)
> **Source:** `Learning React.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Traditional Routing:** Every link click triggers a new HTTP GET request to the server, resulting in a full-page reload, tearing down and rebuilding the DOM, and re-downloading assets.
- **React Router (Client-Side Routing in SPAs):** Intercepts browser URL changes using the HTML5 History API (`pushState`, `replaceState`). Dynamically swaps components inside the existing page without reloading the HTML document, providing instantaneous transitions and maintaining client state.

---

### Q8: What happens if you import a database client (e.g. Prisma or pg) directly inside a Next.js 'use client' component? How must mutations be architected?

- [ ] Completed (Q8)
> **Source:** `NextJS/Next.js Fast Track Plan.md` | **Status:** ✅ Prepared

#### Technical Answer
- **What Happens:** The client bundler (Webpack/Turbopack) fails to compile with errors like `Module not found: Can't resolve 'net'` or `'fs'`. Database drivers require native Node.js TCP sockets and C++ bindings which cannot run in a browser, and doing so leaks database credentials to client source maps.
- **Correct Architecture:**
  - Database queries and mutations must live in **Server Components** or **Server Actions** (`'use server'`).
  - Move the mutation into a separate file `actions/issues.ts` marked with `'use server'` and invoke that Server Action from the client component's event handler.

---

### Q9: When designing a custom React hook for WebSocket connections or polling, how do you prevent memory leaks when a component unmounts?

- [ ] Completed (Q9)
> **Source:** `CIKLUM/Prep.md` | **Status:** ✅ Prepared

#### Technical Answer
- Always return a cleanup function from `useEffect`.
- Use `AbortController` to cancel pending fetch requests.
- Close WebSocket sockets and clear any `setInterval` / `setTimeout` timers:

```typescript
import { useEffect, useState } from 'react';

export function useWebSocketFeed(url: string) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    ws.onmessage = (event) => setData(JSON.parse(event.data));

    return () => {
      // Cleanup runs on unmount or before dependency re-runs
      ws.close();
    };
  }, [url]);

  return data;
}
```

---

## Section C: Node.js, Express & Backend Architecture (Backend Engine Round)
> *5 Questions | Focus: libuv event loop, asynchronous non-blocking I/O, middleware pipelines, JWT auth, and Kafka event streaming.*

### Q10: How does Node.js handle asynchronous non-blocking I/O operations behind the scenes?

- [ ] Completed (Q10)
> **Source:** `Node JS - Backend Cheat Sheet.md` | **Status:** ✅ Prepared

#### Technical Answer
- Node.js utilizes the **libuv** C library to achieve non-blocking I/O.
- **Workflow:**
  1. When an async I/O function (e.g., `fs.readFile()` or database query) is called, Node.js offloads the operation either to the underlying OS kernel (via non-blocking socket interfaces like `epoll` on Linux, `kqueue` on macOS) or to libuv's internal **Thread Pool** (default: 4 worker threads for file system, DNS, crypto).
  2. The main JavaScript thread immediately continues executing subsequent code without waiting.
  3. When the background operation completes, the OS/thread pool signals libuv, and the corresponding callback is placed onto the Event Loop's callback queue.
  4. Once the call stack is clear, the Event Loop pulls the callback from the queue and executes it on the main thread.

---

### Q11: Explain the three parts of a JSON Web Token (JWT). How is signature verification performed, and what are best practices for securing JWTs?

- [ ] Completed (Q11)
> **Source:** `Zelevate.md / JWT Basics (JSON Web Tokens).md` | **Status:** ✅ Prepared

#### Technical Answer
- **Three Parts (Separated by dots `header.payload.signature`):**
  1. **Header:** Base64Url-encoded JSON containing the token type (`"JWT"`) and signing algorithm (`"HS256"` or `"RS256"`).
  2. **Payload:** Base64Url-encoded JSON containing claims (e.g. `userId`, `roles`, expiration `exp`). *Note: Base64Url is NOT encryption; sensitive secrets must never be placed here.*
  3. **Signature:** Generated by taking `HMACSHA256(base64Url(header) + "." + base64Url(payload), secretKey)`.
- **Verification:** The server recalculates the signature using its private secret. If the calculated signature matches the incoming token's signature, the token has not been tampered with.
- **Best Practices:**
  - Short-lived Access Tokens (15 mins) paired with rotating Refresh Tokens.
  - Store tokens in `HttpOnly`, `Secure`, `SameSite=Strict` cookies to prevent XSS theft.
  - Always validate `exp` (expiration) and reject tokens with `"none"` algorithm.

---

### Q12: What is the difference between a Forward Proxy and a Reverse Proxy? Which one is used for Load Balancing and SSL Termination?

- [ ] Completed (Q12)
> **Source:** `EPAM.md / Nginx.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Forward Proxy:** Sits in front of client devices (users) and mediates requests to the internet. Protects client identity, enforces corporate firewalls, and filters outgoing traffic. (Clients are aware of the proxy; servers only see the proxy).
- **Reverse Proxy (e.g. NGINX, HAProxy):** Sits in front of backend servers and intercepts incoming client requests from the internet, routing them to internal backend services.
- **Load Balancing & SSL Termination:** Always handled by a **Reverse Proxy**.
  - **Load Balancing:** Distributes incoming traffic across multiple application servers.
  - **SSL Termination:** Decrypts HTTPS traffic at the edge, freeing backend Node.js processes from computing TLS handshakes.

---

### Q13: Massive Document & Statement Generation: B2B partners require monthly account ledgers, tax certificates, and shipping manifests exported as PDFs or CSVs with tens of thousands of rows. How do you handle resource-heavy background document generation without locking up the server?

- [ ] Completed (Q13)
- [ ] ⚠️ Needs Answer Preparation
> **Source:** `Redington.md` | **Status:** ⚠️ Needs Personal Notes

#### Technical Answer
*[Needs to be filled]*

---

### Q14: What is the difference between REST and GraphQL? Why would you choose GraphQL for a complex frontend like a dashboard?

- [ ] Completed (Q14)
> **Source:** `EPAM.md` | **Status:** ✅ Prepared

#### Technical Answer
- **REST:** Fixed URL endpoints returning fixed JSON structures. Can lead to **Over-fetching** (receiving unnecessary fields) or **Under-fetching** (requiring 5 sequential HTTP calls to assemble a single screen).
- **GraphQL:** Single endpoint (`/graphql`) where the client sends a query specifying the exact fields requested.
- **Why GraphQL for Dashboards:** A dashboard aggregating user profile, order history, financial metrics, and notifications can fetch all required nested data in a **single round-trip HTTP request**, eliminating client waterfalls and reducing mobile bandwidth.

---

## Section D: Databases & Data Layer: PostgreSQL, MongoDB & Redis (DB & Caching Round)
> *4 Questions | Focus: Relational SQL joins/CTEs, indexing & query planners, MongoDB schemas, and Redis caching strategies.*

### Q15: How do B-Tree indexes work in relational databases (PostgreSQL/MySQL)? Explain Composite Indexes and the Leftmost Prefix Rule.

- [ ] Completed (Q15)
> **Source:** `CIKLUM/Prep.md` | **Status:** ✅ Prepared

#### Technical Answer
- **B-Tree Index Mechanics:**
  - A self-balancing search tree that keeps data sorted and allows search, sequential access, insertions, and deletions in $O(\log n)$ logarithmic time.
  - Nodes contain keys and page pointers. Supports equality (`=`), range queries (`<`, `<=`, `>`, `>=`), and sorting (`ORDER BY`).
- **Composite Indexes (Multi-Column Indexes):**
  - An index created on multiple columns: `CREATE INDEX idx_user_status_created ON orders (user_id, status, created_at);`
- **Leftmost Prefix Rule:**
  - The database optimizer can only use a composite index if the query filters include the **leftmost column** of the index definition.
  - A query filtering by `user_id` OR `user_id AND status` uses the index.
  - A query filtering strictly by `status` or `created_at` **cannot** use the index and will fall back to a full table sequential scan.

---

### Q16: What happens when multiple Node.js worker processes or serverless functions connect directly to PostgreSQL? How does connection pooling (PgBouncer / AWS RDS Proxy) solve this?

- [ ] Completed (Q16)
> **Source:** `CIKLUM/Prep.md` | **Status:** ✅ Prepared

#### Technical Answer
- **The Problem:**
  - PostgreSQL creates a dedicated OS process for each client connection (~10MB RAM per connection).
  - When Node.js clusters or autoscaling AWS Lambda functions spin up hundreds of instances, each opening its own connection pool, PostgreSQL quickly exhausts max connections (`FATAL: sorry, too many clients already`), thrashing CPU memory with context switching.
- **The Solution: External Connection Pooler (PgBouncer / AWS RDS Proxy):**
  - Sits between application servers and the PostgreSQL database cluster.
  - Maintains a small, efficient pool of persistent connections to the database (e.g., 50 connections).
  - Uses **Transaction Pooling**: An application process only leases a physical database connection for the exact duration of a single SQL transaction, then immediately returns it to the pool for other requests. Supports tens of thousands of client connections with zero database strain.

---

### Q17: Compare Caching Patterns: Cache-Aside (Lazy Loading), Write-Through, and Write-Behind. What are common eviction policies (LRU, LFU)?

- [ ] Completed (Q17)
> **Source:** `System Design - HLD.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Cache-Aside (Lazy Loading):**
  - Application checks cache first. On miss, it reads from database, populates the cache with a TTL, and returns data.
  - *Pros:* Only requested data is cached. Cache failures don't bring down the system.
  - *Cons:* Cache miss penalty on first request; potential stale data until TTL expires.
- **Write-Through:**
  - Application writes to the cache and database simultaneously in a single transaction.
  - *Pros:* Cache is never stale.
  - *Cons:* Higher write latency; caches data that may never be read.
- **Write-Behind (Write-Back):**
  - Application writes to cache immediately; background worker asynchronously batches writes to the database. High write speed, risk of data loss on crash.
- **Eviction Policies:**
  - **LRU (Least Recently Used):** Evicts keys that haven't been accessed for the longest time.
  - **LFU (Least Frequently Used):** Evicts keys with the lowest access frequency count.

---

### Q18: B2B Search & Compatibility Filtering: A partner ordering hardware searches for part numbers (e.g., WS-C2960X-24PD-L). How would you implement an optimized Elasticsearch or OpenSearch catalog that supports partial matches, specifications filtering, and product compatibility checks?

- [ ] Completed (Q18)
- [ ] ⚠️ Needs Answer Preparation
> **Source:** `Redington.md` | **Status:** ⚠️ Needs Personal Notes

#### Technical Answer
*[Needs to be filled]*

---

## Section E: System Design, Live Coding / DSA & Techno-Managerial Leadership (High-Level & Culture Round)
> *5 Questions | Focus: High-concurrency ticket systems, array manipulation algorithms, SOLID principles, and engineering leadership.*

### Q19: Implement an asynchronous TaskRunner class in TypeScript with a concurrency limit and configurable retry strategies (immediate, delayed exponential backoff, back-of-queue, and abort).

- [ ] Completed (Q19)
> **Source:** `AI Mock Interview.md` | **Status:** ✅ Prepared

#### Technical Answer
```typescript
type RetryAction = 
  | { type: "abort" }
  | { type: "retry_immediate" }
  | { type: "retry_later"; delayMs: number }
  | { type: "retry_back_of_queue" };

type RetryStrategy = (error: any, retryCount: number) => RetryAction;

interface QueueItem<T> {
  task: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  retryCount: number;
  retryStrategy?: RetryStrategy;
}

class TaskRunner {
  private queue: QueueItem<any>[] = [];
  private activeCount: number = 0;
  private defaultStrategy: RetryStrategy = (err, count) => 
    count < 3 ? { type: "retry_immediate" } : { type: "abort" };

  constructor(private concurrencyLimit: number) {}

  async push<T>(task: () => Promise<T>, retryStrategy?: RetryStrategy): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ task, resolve, reject, retryCount: 0, retryStrategy });
      this.next();
    });
  }

  private next() {
    if (this.activeCount >= this.concurrencyLimit || this.queue.length === 0) return;
    const item = this.queue.shift()!;
    this.activeCount++;
    this.executeTask(item);
    this.next();
  }

  private async executeTask(item: QueueItem<any>) {
    try {
      const result = await item.task();
      item.resolve(result);
    } catch (error) {
      this.handleFailure(item, error);
    } finally {
      this.activeCount--;
      this.next();
    }
  }

  private handleFailure(item: QueueItem<any>, error: any) {
    const strategy = item.retryStrategy || this.defaultStrategy;
    const action = strategy(error, item.retryCount);
    item.retryCount++;

    switch (action.type) {
      case "retry_immediate":
        this.queue.unshift(item);
        break;
      case "retry_back_of_queue":
        this.queue.push(item);
        break;
      case "retry_later":
        setTimeout(() => {
          this.queue.unshift(item);
          this.next();
        }, action.delayMs);
        break;
      case "abort":
      default:
        item.reject(error);
        break;
    }
  }
}
```

---

### Q20: Given a string, return the count of each character using a JavaScript/TypeScript hash map (object). What is its time and space complexity?

- [ ] Completed (Q20)
> **Source:** `TCS.md` | **Status:** ✅ Prepared

#### Technical Answer
```typescript
function getCharacterCounts(str: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const char of str) {
    counts[char] = (counts[char] || 0) + 1;
  }
  return counts;
}

console.log(getCharacterCounts("hello world"));
// { h: 1, e: 1, l: 3, o: 2, ' ': 1, w: 1, r: 1, d: 1 }
```
- **Complexity:** Time Complexity: $O(n)$ where $n$ is string length. Space Complexity: $O(k)$ where $k$ is the number of distinct characters in the alphabet.

---

### Q21: Compare running Node.js microservices on AWS ECS (Fargate vs EC2) versus Amazon EKS. How is autoscaling triggered?

- [ ] Completed (Q21)
> **Source:** `Networking Concepts (Really )/Cloud Computing Infrastructure/AWS.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Orchestration:**
  - **AWS ECS:** AWS-native, zero management overhead for Kubernetes control planes. Ideal for teams wanting simple container orchestration integrated directly with ALB and IAM roles.
  - **AWS EKS:** Full Kubernetes standard. Ideal for enterprise multi-cloud portability, Helm charts, and CNCF service meshes (Istio).
- **Compute:**
  - **Fargate (Serverless):** AWS manages underlying VMs; you pay strictly for container CPU/RAM per second. Zero OS patching.
  - **EC2:** You manage the underlying EC2 instances. Ideal for 24/7 steady-state workloads using Reserved/Spot instances for maximum cost efficiency.
- **Autoscaling:**
  - Horizontal container autoscaling is triggered by Target Tracking policies based on CPU utilization or Application Load Balancer Request Count per Target.

---

### Q22: Say a page or report is loading with significant delay in production. Walk me through the step-by-step diagnostic workflow across the entire stack (Browser, Network, API, Database) to identify the root cause.

- [ ] Completed (Q22)
> **Source:** `Mobile Programming Company - Integra.md / CIKLUM.md` | **Status:** ✅ Prepared

#### Technical Answer
1. **Browser / Frontend Inspection:**
   - Open Chrome DevTools Network Tab: Check **TTFB (Time to First Byte)** vs Content Download time.
   - If TTFB is fast but UI is laggy, use the **Performance Tab** to inspect JavaScript execution, long tasks (>50ms), and React component render profiling.
2. **Network / CDN Layer:**
   - Inspect DNS lookup, TLS handshake, and CDN cache hit status (`CF-Cache-Status: HIT` vs `MISS`).
3. **Backend / API Service:**
   - Inspect distributed traces (OpenTelemetry / AWS X-Ray) to see which service span took the most time.
   - Check Node.js Event Loop Lag metrics; high lag indicates CPU blocking (synchronous loops or heavy crypto).
4. **Database Layer:**
   - Inspect database query execution plans (`EXPLAIN ANALYZE` in PostgreSQL or `.explain('executionStats')` in MongoDB).
   - Check for table sequence scans (`COLLSCAN`), missing indexes, lock contention, or connection pool exhaustion.

---

### Q23: B2B Reverse Logistics (RMA Workflow): If a partner receives defective items, they trigger an RMA process involving warranty verification, repair staging, or credit notes. How would you design a state-machine backend to handle a complex RMA and Return Workflow?

- [ ] Completed (Q23)
- [ ] ⚠️ Needs Answer Preparation
> **Source:** `Redington.md` | **Status:** ⚠️ Needs Personal Notes

#### Technical Answer
*[Needs to be filled]*

---
