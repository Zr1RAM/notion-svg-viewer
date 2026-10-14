# MERN / PERN Full-Stack Interview Preparation Vault

> **Master Progress: 6 Mock Tests | Total Questions: 135 | 100% Native Markdown**

## 📊 Mock Test Dashboard

| File | Questions | Needs Review | Focus Areas |
| :--- | :---: | :---: | :--- |
| [[Interiview_Prep_1]] | 24 | 3 | JS/TS, React/Next.js, Node/Express, PostgreSQL/Mongo/Redis, System Design/DSA |
| [[Interiview_Prep_2]] | 23 | 3 | JS/TS, React/Next.js, Node/Express, PostgreSQL/Mongo/Redis, System Design/DSA |
| [[Interiview_Prep_3]] | 23 | 5 | JS/TS, React/Next.js, Node/Express, PostgreSQL/Mongo/Redis, System Design/DSA |
| [[Interiview_Prep_4]] | 23 | 2 | JS/TS, React/Next.js, Node/Express, PostgreSQL/Mongo/Redis, System Design/DSA |
| [[Interiview_Prep_5]] | 21 | 3 | JS/TS, React/Next.js, Node/Express, PostgreSQL/Mongo/Redis, System Design/DSA |
| [[Interiview_Prep_6]] | 21 | 3 | JS/TS, React/Next.js, Node/Express, PostgreSQL/Mongo/Redis, System Design/DSA |

## ⚡ Dynamic Dataview Progress Tracker (WIP)

> [!NOTE] Dataview Integration
> If you have the **Dataview** community plugin installed, the query below automatically tracks your live checkmark completion across all mock tests in real time:

```dataview
TABLE length(file.tasks) AS "Total Tasks",
      length(filter(file.tasks, (t) => t.completed)) AS "Completed",
      round(length(filter(file.tasks, (t) => t.completed)) / length(file.tasks) * 100, 1) + "%" AS "Progress"
FROM "InterviewPreps"
WHERE file.name != "README"
SORT file.name ASC
```

