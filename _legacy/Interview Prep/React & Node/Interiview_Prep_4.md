# Mock Test 4: Full-Stack MERN / PERN Senior Technical Assessment

> **Mock Test 4 | Total Questions: 23 | Completed: 0 | Needs Review: 2**
> 💡 *Check off the `- [ ]` checkboxes as you complete questions. You can fold/collapse any section or question using the arrows beside headings in Obsidian.*

## Section A: JavaScript & TypeScript Core (The "Bread & Butter" Round)
> *5 Questions | Focus: Execution context, closures, event loop microtasks, prototype inheritance, and TypeScript typing.*

### Q1: Describe how you would implement asynchronous operations in JavaScript. What are Promises, async/await, and how do they differ from callbacks?

- [ ] Completed (Q1)
> **Source:** `Interview Topics (Rename to prep).md` | **Status:** ✅ Prepared

#### Technical Answer
- **Callbacks:** Functions passed as arguments to be invoked once an async operation finishes. Disadvantage: Leads to deeply nested "Callback Hell" and difficult error propagation.
- **Promises:** Objects representing the eventual completion (or failure) of an asynchronous operation and its resulting value. States: `pending`, `fulfilled`, `rejected`. Chained using `.then()`, `.catch()`, `.finally()`.
- **Async/Await:** Syntactic sugar built on top of Promises and Generators. Makes asynchronous code read synchronously with standard `try...catch` blocks.
- **Comparison:**
  - Callbacks use inversion of control; Promises return control to the caller.
  - Async/await simplifies error handling and eliminates promise chaining boilerplate.

---

### Q2: Compare the Rest operator and the Spread operator in JavaScript. They share the same syntax (...); how do their purposes and contexts differ?

- [ ] Completed (Q2)
> **Source:** `CIPL.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Rest Operator (`...`):** Gathers multiple individual elements together into a single array.
  - Used in function parameter declarations (`function sum(...numbers)`) or destructuring patterns (`const [head, ...tail] = [1, 2, 3]`).
- **Spread Operator (`...`):** Expands an iterable (array, string, object) into individual elements or properties.
  - Used in function calls (`sum(...nums)`), array literals (`[...arr1, ...arr2]`), or object cloning (`{ ...user, active: true }`).

```javascript
// Gathers arguments using Rest
function logAll(prefix, ...items) {
  // Expands items into console.log using Spread
  console.log(prefix, ...items);
}
```

---

### Q3: What is the difference between Event Bubbling, Event Capturing, and Event Delegation in the browser DOM?

- [ ] Completed (Q3)
> **Source:** `EPAM.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Event Bubbling:** An event triggers on the innermost target element and then bubbles up through its ancestors in the DOM tree.
- **Event Capturing (Trickling):** The event travels down from the `window`/`document` through ancestors to the target before bubbling begins.
- **Event Delegation:** Attaching a single event listener to a common parent element rather than attaching individual listeners to multiple child elements. It leverages event bubbling and inspects `event.target` to determine which child triggered the event.
  - **Benefits:** Drastically reduces memory usage, simplifies dynamically inserted elements without needing to attach new listeners.

---

### Q4: Explain how prototypal inheritance works in JavaScript. What is the prototype chain?

- [ ] Completed (Q4)
> **Source:** `EPAM.md / Zelevate.md` | **Status:** ✅ Prepared

#### Technical Answer
- Every JavaScript object has a private internal link to another object called its **prototype** (`[[Prototype]]`, accessible via `Object.getPrototypeOf(obj)` or `__proto__`).
- When accessing a property on an object, JavaScript first looks at the object's own properties. If not found, it traverses up the **prototype chain** to the object's prototype, then that prototype's prototype, until it reaches `Object.prototype` (whose prototype is `null`).
- ES6 `class` syntax is syntactic sugar over prototypal inheritance using constructor functions and `prototype` references.

---

### Q5: What is the difference between Hashing and Encryption? When would you use each in user authentication?

- [ ] Completed (Q5)
> **Source:** `SphereIT Global - ENBD (Client).md` | **Status:** ✅ Prepared

#### Technical Answer
- **Hashing (One-Way):**
  - Transforms an input of any length into a fixed-length string using a mathematical algorithm (e.g. bcrypt, Argon2, SHA-256).
  - Computationally infeasible to reverse. Irreversible.
  - *Usage:* User passwords. Always hash with salt before storing in databases.
- **Encryption (Two-Way):**
  - Transforms plaintext into ciphertext using an encryption algorithm and key (AES-256, RSA).
  - Can be decrypted back into original plaintext using the secret decryption key.
  - *Usage:* Encrypting sensitive data at rest (credit cards, personal identification numbers) or data in transit (TLS).

---

## Section B: React.js & Modern Frontend Architecture (Frontend Framework Round)
> *4 Questions | Focus: Component lifecycle, hooks, state management, Virtual DOM reconciliation, and Next.js App Router.*

### Q6: Can you compare and contrast React's Virtual DOM with the real DOM?

- [ ] Completed (Q6)
> **Source:** `Learning React.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Real DOM:**
  - The actual browser tree representation of the HTML document.
  - Direct manipulation causes expensive browser reflows (layout recalculations) and repaints, creating UI bottlenecks on frequent updates.
- **Virtual DOM (VDOM):**
  - A lightweight, in-memory JavaScript object tree mirroring the actual DOM.
  - When state changes, React generates a new VDOM snapshot, runs a diffing algorithm (Reconciliation) against the previous VDOM snapshot to find the minimal delta, and batches updates to the real DOM in a single pass.
- **Summary:** The Virtual DOM acts as a performance buffer that minimizes direct, slow browser layout calculations.

---

### Q7: Why is the key prop required in React lists, and why is using the array index as a key considered an anti-pattern when items are dynamic?

- [ ] Completed (Q7)
> **Source:** `Learning React.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Purpose of `key`:** Provides a unique identity to each element so React's reconciliation diffing algorithm can determine which items were added, removed, reordered, or modified across renders.
- **Why Index as Key is Dangerous:**
  - If items are reordered, inserted at the top, or deleted, their array index changes.
  - React matches elements by key; if keys are indices, React incorrectly preserves the internal state (e.g., input values, animations) of the wrong components, causing visual bugs and unnecessary re-renders.
  - **Rule:** Always use a stable, unique ID (e.g., database ID or UUID) as the key.

---

### Q8: Why does Next.js throw an error if a Server Component passes a function (e.g., a date formatter) as a prop to a Client Component? What data types are allowed across the RSC boundary?

- [ ] Completed (Q8)
> **Source:** `NextJS/Next.js Fast Track Plan.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Root Cause:** Props passed from a Server Component to a Client Component cross the network as a serialized JSON-compatible stream known as the **React Server Component (RSC) Payload**. JavaScript functions cannot be serialized into JSON.
- **Allowed Data Types:** Plain objects, arrays, strings, numbers, booleans, `null`, `undefined`, and typed arrays.
- **Solution:**
  - Execute formatting entirely on the server and pass the formatted string (e.g. `"Oct 10, 2026"`).
  - Pass raw ISO strings or timestamps and let the Client Component format them locally.
  - Or explicitly expose the function as a Server Action (`'use server'`).

---

### Q9: Because prices and catalog visibility change depending on who logs into the channel partner portal, standard global CDN caching is ineffective. How do you approach frontend state management and localized caching for heavily personalized B2B user sessions?

- [ ] Completed (Q9)
- [ ] ⚠️ Needs Answer Preparation
> **Source:** `Redington.md` | **Status:** ⚠️ Needs Personal Notes

#### Technical Answer
*[Needs to be filled]*

---

## Section C: Node.js, Express & Backend Architecture (Backend Engine Round)
> *5 Questions | Focus: libuv event loop, asynchronous non-blocking I/O, middleware pipelines, JWT auth, and Kafka event streaming.*

### Q10: How do you stream a multi-gigabyte file without exhausting server RAM? What is stream backpressure, and how does stream.pipeline() handle it?

- [ ] Completed (Q10)
> **Source:** `CIKLUM/Prep.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Streaming Multi-Gigabyte Files:**
  - Instead of loading the entire file into memory using `fs.readFile()`, create a readable stream using `fs.createReadStream()` and pipe it into a transform stream or HTTP response (`res`). Memory usage remains flat (typically a few megabytes per chunk).
- **Backpressure:**
  - Occurs when the **readable stream** produces data faster than the **writable stream** (e.g., slow client network or disk) can consume and write it. Unhandled, the excess data piles up in RAM buffer memory, leading to out-of-memory crashes.
- **Handling with `stream.pipeline()`:**
  - Safely pipes streams together while automatically handling backpressure (pausing the readable stream when the writable buffer is full and resuming when drained).
  - Handles error propagation and automatically cleans up/destroys all streams in the chain if any stream fails:
```javascript
const { pipeline } = require('stream/promises');
const fs = require('fs');

async function streamFile(sourcePath, res) {
  res.setHeader('Content-Type', 'application/octet-stream');
  await pipeline(
    fs.createReadStream(sourcePath),
    res
  );
}
```

---

### Q11: Explain the relationship between Kafka Topics, Partitions, Consumer Groups, and Offsets. How does Kafka ensure message ordering, and what are its limitations?

- [ ] Completed (Q11)
> **Source:** `CIKLUM/Prep.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Topic:** A named logical stream to which producers publish events.
- **Partitions:** Topics are split into ordered, immutable sequences of records called partitions. Partitions enable horizontal parallelism across a cluster.
- **Offsets:** A sequential integer assigned to each record within a partition that uniquely identifies it. Consumers track their progress by committing offsets.
- **Consumer Groups:** A set of consumers collaborating to read a topic. Each partition is consumed by exactly ONE consumer instance within a group at a time.
- **Message Ordering Guarantees & Limitations:**
  - Kafka guarantees **strict ordering ONLY within a single partition**, NOT across the entire topic.
  - To maintain ordering for a specific entity (e.g. orders for Customer 101), assign that entity's ID as the **Partition Key**. Kafka hashes the key to route all events for that entity to the exact same partition.

---

### Q12: Explain Cross-Origin Resource Sharing (CORS) and key security measures against OWASP Top 10 vulnerabilities in a MERN/PERN application.

- [ ] Completed (Q12)
> **Source:** `EPAM.md / Interview Topics (Rename to prep).md` | **Status:** ✅ Prepared

#### Technical Answer
- **CORS:** A browser security mechanism that restricts web pages from making AJAX requests to a different domain, port, or protocol than the one that served the page. Configured on the Express server via headers (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`).
- **OWASP Protections:**
  1. **SQL / NoSQL Injection:** Use parameterized queries or ORM/ODM query builders (Knex, Prisma, Mongoose). Never concatenate raw user input into SQL or MongoDB filters.
  2. **Cross-Site Scripting (XSS):** Sanitize inputs using DOMPurify, store tokens in `HttpOnly` cookies, enforce Content Security Policy (CSP) headers using `helmet`.
  3. **Cross-Site Request Forgery (CSRF):** Use `SameSite=Strict` cookies and CSRF tokens for mutating requests.
  4. **Rate Limiting:** Protect login and public endpoints using `express-rate-limit` with Redis to prevent brute-force attacks.

---

### Q13: Explain Node.js architecture and how the libuv thread pool interacts with the event loop.

- [ ] Completed (Q13)
> **Source:** `EPAM.md` | **Status:** ✅ Prepared

#### Technical Answer
- Node.js architecture consists of:
  1. **V8 Engine:** Compiles and executes JavaScript code.
  2. **Node.js Core API:** Built-in JavaScript modules (`fs`, `http`, `crypto`, `stream`).
  3. **Node.js Bindings:** C++ wrappers exposing V8 and libuv features to JS.
  4. **libuv:** Cross-platform C library providing the event loop and asynchronous I/O thread pool (default 4 threads for file I/O, DNS lookup, and crypto).

---

### Q14: What is Dependency Injection (DI) and how does it improve testability in backend frameworks like NestJS?

- [ ] Completed (Q14)
> **Source:** `Justo Global.md / Nest.js.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Core Concept:** Instead of a class instantiating its own dependencies internally (`const db = new Database()`), dependencies are provided externally—typically injected into the constructor by an IoC (Inversion of Control) container.
- **Testability Benefit:** In unit tests, you can easily pass mock/stub implementations of dependencies (e.g. `MockUserRepository`) into the service constructor without establishing real database connections or network sockets.

---

## Section D: Databases & Data Layer: PostgreSQL, MongoDB & Redis (DB & Caching Round)
> *4 Questions | Focus: Relational SQL joins/CTEs, indexing & query planners, MongoDB schemas, and Redis caching strategies.*

### Q15: Explain the differences between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN in PostgreSQL/SQL with practical scenarios.

- [ ] Completed (Q15)
> **Source:** `Databases.md / Interview Rounds.md` | **Status:** ✅ Prepared

#### Technical Answer
- **`INNER JOIN`:** Returns only rows where there is a matching key in BOTH tables. Rows with no match are completely omitted.
- **`LEFT JOIN` (LEFT OUTER JOIN):** Returns all rows from the left table, along with matching rows from the right table. If no match exists, the right table columns return `NULL`.
  - *Scenario:* Finding all customers and their orders, including customers who haven't ordered yet.
- **`RIGHT JOIN`:** Returns all rows from the right table and matching rows from the left table (rarely used; usually rewritten as a `LEFT JOIN`).
- **`FULL OUTER JOIN`:** Returns all rows when there is a match in either the left or right table. Unmatched records on either side are filled with `NULL`.
  - *Scenario:* Reconciling data between two independent accounting ledgers to find unmatched entries on both sides.

---

### Q16: How would you design a MongoDB schema for a social media platform with users, posts, comments, and likes? When should you embed vs. reference?

- [ ] Completed (Q16)
> **Source:** `Interview Topics (Rename to prep).md` | **Status:** ✅ Prepared

#### Technical Answer
- **Embedding (1-to-Few):**
  - Store child data inside the parent document. Single read retrieves entire hierarchy with zero joins.
  - *Application:* Store likes as an array of user IDs `[ObjectId, ObjectId]` or embed the top 3 preview comments.
  - *Limitation:* MongoDB has a 16MB document size limit; embedding unbounded lists is an anti-pattern.
- **Referencing (1-to-Many / Many-to-Many):**
  - Store separate collections and link via `ObjectId`.
  - *Application:* Posts and Comments collections. Comments reference `postId`.
- **Recommended Schema Design:**
  - **Users Collection:** `_id`, `username`, `email`, `followerCount`, `createdAt`.
  - **Posts Collection:** `_id`, `authorId`, `content`, `mediaUrls[]`, `likeCount`, `commentCount`, `recentLikes[userId]`, `createdAt`.
  - **Comments Collection:** `_id`, `postId` (indexed), `authorId`, `text`, `createdAt` (supports paginated queries without hitting document size limits).

---

### Q17: Compare Offset-based pagination vs. Keysets (Cursor-based) pagination in large datasets.

- [ ] Completed (Q17)
> **Source:** `SphereIT Global - ENBD (Client).md` | **Status:** ✅ Prepared

#### Technical Answer
- **Offset-based Pagination (`OFFSET 100000 LIMIT 20` / `.skip(100000).limit(20)`):**
  - The database must scan and count past 100,000 rows in memory before returning the 20 requested rows. Performance degrades exponentially on deep pages ($O(n)$).
  - Prone to pagination drift (duplicate or missed records when items are inserted while browsing).
- **Cursor-based (Keyset) Pagination (`WHERE id > last_seen_id ORDER BY id ASC LIMIT 20`):**
  - Leverages the B-Tree index on `id` directly. The query jumps instantly to the cursor position in $O(\log n)$ time regardless of whether you are on page 1 or page 10,000.
  - Immune to pagination drift. Ideal for infinite scroll feeds.

---

### Q18: In an e-commerce database with millions of products, how do you retrieve distinct category names efficiently without caching and without causing high query latency?

- [ ] Completed (Q18)
> **Source:** `MetaYB.md` | **Status:** ✅ Prepared

#### Technical Answer
- In relational databases (PostgreSQL): Use `SELECT DISTINCT category FROM products;` or if categories are heavily duplicated in a large table, an indexed Loose Index Scan / Recursive CTE over the index:
```sql
WITH RECURSIVE t AS (
   (SELECT category FROM products ORDER BY category LIMIT 1)
   UNION ALL
   SELECT (SELECT category FROM products WHERE category > t.category ORDER BY category LIMIT 1)
   FROM t WHERE t.category IS NOT NULL
)
SELECT category FROM t WHERE category IS NOT NULL;
```
- In MongoDB: Use `db.products.distinct("category")` backed by an index on `{ category: 1 }`.

---

## Section E: System Design, Live Coding / DSA & Techno-Managerial Leadership (High-Level & Culture Round)
> *5 Questions | Focus: High-concurrency ticket systems, array manipulation algorithms, SOLID principles, and engineering leadership.*

### Q19: Given an array of product objects with ID, SKU, and SKUDESC, group them by SKU using Array.prototype.reduce().

- [ ] Completed (Q19)
> **Source:** `MetaYB.md` | **Status:** ✅ Prepared

#### Technical Answer
```javascript
const items = [
  { ID: 1, SKU: "mobile", SKUDESC: "Android mobile phone" },
  { ID: 2, SKU: "mobile", SKUDESC: "iOS mobile phone" },
  { ID: 3, SKU: "laptop", SKUDESC: "Gaming laptop" }
];

const groupedBySKU = items.reduce((acc, item) => {
  const key = item.SKU;
  if (!acc[key]) {
    acc[key] = [];
  }
  acc[key].push(item);
  return acc;
}, {});

console.log(groupedBySKU);
/* Output:
{
  mobile: [
    { ID: 1, SKU: "mobile", SKUDESC: "Android mobile phone" },
    { ID: 2, SKU: "mobile", SKUDESC: "iOS mobile phone" }
  ],
  laptop: [
    { ID: 3, SKU: "laptop", SKUDESC: "Gaming laptop" }
  ]
}
*/
```

---

### Q20: Given two sorted integer arrays nums1 (of size m + n) and nums2 (of size n), merge nums2 into nums1 in-place in sorted order in O(m + n) time.

- [ ] Completed (Q20)
> **Source:** `Programming & Data Structures/Programming Problems.md` | **Status:** ✅ Prepared

#### Technical Answer
```javascript
function merge(nums1, m, nums2, n) {
  let p1 = m - 1;       // Pointer for end of elements in nums1
  let p2 = n - 1;       // Pointer for end of nums2
  let p = m + n - 1;    // Pointer for end of buffer in nums1

  // Work backwards from largest to smallest to avoid overwriting elements
  while (p2 >= 0) {
    if (p1 >= 0 && nums1[p1] > nums2[p2]) {
      nums1[p--] = nums1[p1--];
    } else {
      nums1[p--] = nums2[p2--];
    }
  }
}
```

---

### Q21: Explain how the SOLID principles apply specifically to a MERN/PERN stack application with code patterns.

- [ ] Completed (Q21)
> **Source:** `Interview Topics (Rename to prep).md` | **Status:** ✅ Prepared

#### Technical Answer
1. **Single Responsibility (SRP):** Controllers handle HTTP transport; Services handle business domain logic; Repositories handle database queries.
2. **Open/Closed (OCP):** Express route middleware (e.g. Joi/Zod validation middleware) can extend validation logic without modifying route handler code.
3. **Liskov Substitution (LSP):** Different database repository adapters (e.g. `MongoRepository` and `PostgresRepository`) share the same interface and can be substituted without breaking business services.
4. **Interface Segregation (ISP):** Splitting monolithic API routers into focused domain route modules (`authRoutes`, `productRoutes`) rather than forcing clients to depend on bloated interfaces.
5. **Dependency Inversion (DIP):** Services accept repository interfaces in their constructor (Dependency Injection) rather than importing raw database models directly, facilitating unit testing with mock repositories.

---

### Q22: How would you design a B2B Marketplace architecture that allows third-party vendors to list their own inventory alongside core inventory while maintaining isolation in ordering pipelines?

- [ ] Completed (Q22)
- [ ] ⚠️ Needs Answer Preparation
> **Source:** `Redington.md` | **Status:** ⚠️ Needs Personal Notes

#### Technical Answer
*[Needs to be filled]*

---

### Q23: Explain the Singleton Pattern and Observer Pattern. Where are they utilized in Node.js and React?

- [ ] Completed (Q23)
> **Source:** `EPAM.md / Nest.js.md` | **Status:** ✅ Prepared

#### Technical Answer
- **Singleton Pattern:** Ensures a class has only one instance and provides a global access point to it.
  - *Node.js:* CommonJS module caching natively caches modules (`require('./db')`); subsequent `require` calls return the exact same singleton instance.
- **Observer Pattern:** Defines a 1-to-many dependency where when one object changes state, all registered observers are notified automatically.
  - *Node.js:* Node's `EventEmitter` (`emitter.on('event', callback)`).
  - *React:* Redux store subscriptions, React Context, RxJS in NestJS.

---
