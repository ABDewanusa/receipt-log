# ReceiptLog — Database Schema (MVP)

This document defines the **authoritative database schema** for the ReceiptLog MVP.

* Database: PostgreSQL (Supabase)
* Scope: MVP only
* Changes to this file must reflect actual schema changes in Supabase

---

## Overview

The database contains **two tables**:

* `users` — maps Telegram users to internal IDs
* `expenses` — stores structured receipt data

Telegram is the only client in MVP. There is no separate authentication system.

---

## Table: `users`

Purpose:
Map a Telegram user to a stable internal UUID used throughout the system.

### Columns

| Column           | Type        | Constraints                              | Description        |
| ---------------- | ----------- | ---------------------------------------- | ------------------ |
| id               | uuid        | primary key, default `gen_random_uuid()` | Internal user ID   |
| telegram_user_id | bigint      | unique, not null                         | Telegram `from.id` |
| created_at       | timestamptz | default `now()`                          | Row creation time  |

### Notes

* One Telegram account = one user
* No Supabase Auth is used in MVP

### SQL

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  telegram_user_id bigint not null unique,
  created_at timestamptz not null default now()
);
```

---

## Table: `expenses`

Purpose:
Store structured data extracted from receipt images.

### Columns

| Column         | Type        | Constraints                              | Description                |
| -------------- | ----------- | ---------------------------------------- | -------------------------- |
| id             | uuid        | primary key, default `gen_random_uuid()` | Expense ID                 |
| user_id        | uuid        | not null, foreign key → `users.id`       | Owner of the expense       |
| merchant       | text        | nullable                                 | Merchant name (best guess) |
| total_amount   | numeric     | nullable                                 | Extracted total amount     |
| currency       | text        | default `'IDR'`                          | Currency code              |
| date           | date        | nullable                                 | Receipt date               |
| raw_extraction | jsonb       | nullable                                 | Raw AI extraction output   |
| image_path     | text        | nullable                                 | R2 object path             |
| created_at     | timestamptz | default `now()`                          | Insert time                |

### Notes

* `total_amount` may be NULL if extraction fails
* `raw_extraction` may be NULL; store when available
* Currency conversion is explicitly out of scope for MVP

### SQL

```sql
create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  merchant text,
  total_amount numeric,
  currency text default 'IDR',
  date date,
  raw_extraction jsonb,
  image_path text,
  created_at timestamptz default now(),
  constraint expenses_user_id_fkey
    foreign key (user_id) references users(id)
);
```

---

## Indexes

Indexes included implicitly:

* `users.telegram_user_id` (unique)
* `users.id` (primary key)
* `expenses.id` (primary key)

Additional indexes are intentionally omitted for MVP.

---

## Referential Integrity

* Every `expenses.user_id` must reference a valid `users.id`
* Deleting a user requires handling dependent `expenses` rows (no cascade)

---

## Explicit Non-Goals (Schema)

* No soft deletes
* No audit tables
* No multi-currency normalization
* No tagging or categorization
* No schema for dashboards or analytics

---

## Change Policy

* Schema changes require updating this file
* Backward compatibility is not guaranteed during MVP
* Migrations may be manual during MVP phase

---

## Status

* Schema version: MVP v1
* Last updated: Initial MVP

This file is intentionally minimal.
