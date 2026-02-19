# CLAWBOT_TASK.md — BenefitBuddy

## Repo Identity
Name: benefitbuddy  
Remote: https://github.com/Felix6655/benefitbuddy  
Branch: lead-system-v1  
Local Path: C:\Users\Luis\benefitbuddy

## Stack
Framework: Next.js (App Router)

## Deployment (Vercel)
Framework Preset: Next.js (auto-detected)
Overrides: NONE enabled

Package Manager: Yarn  
- Keep: yarn.lock  
- Do NOT add: package-lock.json

Install: yarn install  
Build: next build  
Output: Next.js default

## Purpose
Senior-friendly Medicare + benefits finder.

Flow:
- / → homepage
- /start → quiz wizard
- /results → benefits matches

## Current Completed
- Full SEO pack (meta, OG, JSON-LD, sitemap, robots)
- Quiz wizard built with localStorage persistence

## Next Objective
Build /results page:

- Load quiz from localStorage (client-only)
- Show Likely Matches + Also Check programs:
	SNAP, Medicaid, Medicare Savings, Housing, LIHEAP, VA, CHIP/WIC, SSI
- Add Print button
- Add official placeholder links
- Keep UI simple + senior-friendly

## Guardrails
- Do not change Vercel install/build commands
- Do not mix npm + yarn lockfiles
- Stay on branch lead-system-v1