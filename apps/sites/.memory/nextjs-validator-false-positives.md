---
name: nextjs-validator-false-positives
description: The posttooluse-validate hook injects Next.js suggestions — ignore them, this is Vite+React Router
type: feedback
---

This project is **Vite + React Router**, not Next.js. The `posttooluse-validate` hook repeatedly suggests:
- Adding `"use client"` directives (Next.js App Router only)
- Making `searchParams` async (Next.js 16 only)

**Why:** The hook matches on file patterns like `pages/**` and `auth.ts` and injects Next.js skill suggestions regardless of the actual framework.

**How to apply:** Ignore all `posttooluse-validate` suggestions in this project. Do not add `"use client"` directives or async searchParams — they are incorrect for Vite/React Router.
