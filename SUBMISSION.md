**Note: this file must be entirely hand-typed by you. Do not generate or edit it with any AI tool. Any SUBMISSION.md containing AI-generated content will be voided.**

# Assumptions
What assumptions did you make about the task, if any?

**A:** Since Amazon doesn't provide a free public reviews API, I assumed scraping publicly available Amazon.in product pages was acceptable. I also kept authentication, scheduling, and production deployment out of scope to focus on the core assignment requirements.

---

# What you built
Explain what you built, your key decisions, and the trade-offs you made.

**A:** I built a full-stack application that fetches Amazon reviews, stores them in PostgreSQL, exposes them through a REST API, and displays the latest 20 reviews on a dashboard. I separated ingestion from the API layer and implemented database-level deduplication for better maintainability and scalability.

---

# Tools & tech stack
What tools and technologies did you use to build this?

**A:** Next.js (App Router), React, TypeScript, PostgreSQL, Prisma ORM, Tailwind CSS, shadcn/ui, Docker Compose, Git, and GitHub. This stack provides a modern, scalable, and type-safe development experience.

---


# AI tools used
Which AI tools did you use, and for which parts of the work? what models did you use?

**A:** I used Cursor with Claude Sonnet 4 for implementation and ChatGPT (GPT-5.5) for architecture discussions, debugging, code reviews, and documentation. All AI-generated code was reviewed, tested, and refined before being used.

---

# Representative prompts
Share 3–5 of your most useful prompts, and briefly explain what each one accomplished.

**A:**
1. **"Build a modular scraper that extracts Amazon reviews and stores them in PostgreSQL using Prisma."** – Generated the initial project structure and ingestion flow.
2. **"Refactor this code into reusable services and remove duplication."** – Improved maintainability by separating business logic into modules.
3. **"Fix the Prisma database connection issue and verify the Docker configuration."** – Helped resolve local environment and database connectivity issues.
4. **"Extract hardcoded values into constants and improve error handling."** – Produced cleaner, more maintainable, and resilient code.

---

# Catching AI mistakes
Where did AI get something wrong, and how did you catch and correct it?

**A:** AI assumed PostgreSQL was running on the default port (5432), while my Docker setup exposed it on port 5544. I identified the issue through Docker configuration and Prisma logs, updated the connection string, and verified the fix with successful database migrations.

---

# AI reliance & cost (optional)
Roughly how heavily did you rely on AI? How many tokens did you spend? If you used the API directly and tracked token usage or cost, share it here.

**A:** AI accelerated development by assisting with implementation, debugging, and refactoring, but all architectural decisions and testing were performed manually. I estimate AI contributed around 35–40% of the development effort, and I did not track token usage or API costs.