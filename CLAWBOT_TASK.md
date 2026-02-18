# CLAWBOT_TASK.md — BenefitBuddy

## Repo Identity
Name: benefitbuddy  
Remote: https://github.com/Felix6655/benefitbuddy  
Current Branch: lead-system-v1  
Local Path: C:\Users\Luis\benefitbuddy

## Project Purpose
BenefitBuddy is a senior-friendly Medicare + benefits finder web app.

Core flow:
- Homepage (/)
- Quiz wizard (/start)
- Results page (/results)

## Tech Stack
Framework: Next.js (App Router)

Main folders:
- /app → routes + layouts
- /components → UI blocks
- /lib → helpers/utilities

Theme:
- Warm paper design
- Background: #F8F1E9
- Text: #2E2A26
- Simple, large, senior-friendly UI

## Deployment (Do NOT Guess)
Before changing install/build commands:
1. Check Vercel Project Settings
2. Confirm Root Directory + Install Command
3. Use ONLY the detected package manager (npm OR yarn)

Never mix lockfiles without verifying deployment settings.

## Current Completed Work
- SEO pack implemented:
	- Meta tags
	- OpenGraph + Twitter cards
	- JSON-LD structured data
	- sitemap.xml + robots.txt

- Quiz wizard built at `/start`
- Quiz saves to localStorage key:
	`benefitbuddy_quiz`

## Current Objective (Next Work)
Build `/results` page:

1. Load quiz data safely from localStorage (client-only)
2. Display:

### Likely Matches
- SNAP
- Medicaid
- Medicare Savings Programs

### Also Check
- Housing assistance
- LIHEAP (utility help)
- CHIP/WIC
- SSI
- VA benefits (if veteran)

3. Add:
- Print button
- Official placeholder links
- Clear “No SSN required” trust message

## Guardrails
- Keep UI simple and senior-friendly
- Avoid breaking routing or theme
- Do not add new env vars unless required
- Always work on branch: lead-system-v1