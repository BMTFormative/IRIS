Plan overview & priorities
High priority (do first): Auth & RBAC, Core Data + Migrations, Jobs, Candidates, Applications, Attachments (storage).
Medium priority: Pipeline (Kanban), Search indexing, Background workers, Notifications.
Lower priority (after MVP): Integrations & Adapters, Interviews calendar advanced features, Reporting/Analytics, Admin/Operational features.
For each module below I give:

1. Purpose & scope
2. Backend tasks (APIs / services / domain)
3. Frontend tasks (components / flows)
4. DB / migration tasks
5. Background jobs & async work (if applicable)
6. Tests & quality gates
7. Acceptance criteria & operational notes

---

1 — Auth & RBAC (foundation)
Purpose: Secure access, per-role permissions (admin, recruiter, hiring_manager, viewer).
Backend
• Decide auth method (JWT vs session + refresh tokens vs OAuth SSO). Add token issuance, refresh, logout, token revocation.
• Implement user model + roles and a fine-grained permission model (CRUD on Jobs/Candidates/Applications, manage integrations, view logs).
• Create decorators / dependency to check permissions in FastAPI endpoints.
• Add endpoints to manage users, roles, role assignments.
Frontend
• Login / logout flows, secure storage of tokens.
• An Admin > Users & Roles page to create/manage users and assign roles.
• UI components should honor permission checks (hide/disable actions the user lacks).
DB / Migrations
• Create users table, roles table, user_roles mapping, permission table or role capability mapping.
Background
• Short-lived tokens: worker auth for background jobs to call private APIs.
Tests
• Unit tests for permission checks.
• Integration tests verifying endpoints blocked/unblocked for roles.
Acceptance
• Only authorized roles can perform sensitive operations; demo that a restricted user cannot access Admin pages.
Ops
• Plan for SSO (optional), secure passwords, password reset flows, rate limiting on auth endpoints.

---

2 — Core Data & Migrations (canonical models)
Purpose: Implement canonical entities used across modules.
Backend
• Define domain services/repositories for: Job, Candidate, Application, Stage, Attachment, Note, Interview, Audit, IntegrationMetadata.
• Implement create/read/update/delete with validation and business rules (e.g., application must link to job & candidate).
Frontend
• Build generic data forms and displays that map to canonical fields (reusable form components).
DB / Migrations
• Add migrations for all core entities with constraints, foreign keys and indices.
• Add created_at, updated_at, and soft-delete (deleted_at) support.
Background
• Add integration metadata table to store external IDs and last sync timestamps.
Tests
• Unit tests for repository behavior and basic CRUD flows.
Acceptance
• All core entities exist in DB and have API endpoints; basic CRUD flows pass tests.
Ops
• Migration strategy: Alembic or similar; establish safe migration process (pre-deploy migration step).

---

3 — Jobs Module (job postings & public apply page)
Purpose: Manage openings and public application intake.
Backend
• Job CRUD endpoints, publish/unpublish flag, job visibility.
• Public apply endpoint that accepts an application with candidate data + attachments (resume).
• Emit application.created event after successful apply.
Frontend
• Job list (admin) and job editor form (Material UI).
• Public Job board page with job detail and apply form (file upload) — responsive.
• Recruiter dashboard cards for open positions and counts.
DB
• Job table fields (title, description, location, dept, status, job_number/reference, tags).
• Index for job_number and status.
Background
• Queue incoming applications for virus-scan and attachment processing.
Tests
• E2E tests: public apply flow posts data + attachment; recruiter sees new application.
• Unit tests for validation rules on job publishing.
Acceptance
• Public job pages work and create application records; basic spam protection present (e.g., rate limit / captcha placeholder).
Ops
• Rate limit public apply endpoint; set lifecycle policy for attachments.

---

4 — Candidates Module (profiles + contact info)
Purpose: Candidate canonical profile, contact, source, skills.
Backend
• Candidate CRUD, merge/dedupe logic (detect same email/phone).
• Endpoint to add notes, tags, skills and links to social profiles.
• Store integration metadata (external IDs) for deduping with connectors.
Frontend
• Candidate list, candidate detail/profile UI with timeline of activity, quick edit inline forms.
• Import CSV flow stub (for future bulk imports).
DB
• Candidate table with arrays for emails/phones/skills or normalized contact table. Add unique indices on normalized email when present.
• tsvector column for searchable concatenated candidate text (name, company, skills).
Background
• Candidate dedupe worker (queue candidate imports or creates and attempt dedupe/match).
Tests
• Unit tests for dedupe rules; integration tests for profile CRUD.
Acceptance
• Can create, edit, and view a candidate profile; duplicate prevention works for common cases.
Ops
• Ensure PII handling: encryption at rest (DB) or column-level encryption for sensitive fields if required.

---

5 — Applications Module (linking candidates → jobs)
Purpose: Track applications, status, owner, score, source.
Backend
• Application create endpoint linking candidate & job; update stage/status endpoint.
• Business rules: cannot apply to closed job, stage transitions validation, record who moved stage.
• Publish events on stage change: application.stage_changed.
Frontend
• Application list scoped by job or candidate.
• Application detail UI with change-stage control and small activity sidebar.
DB
• Application table with foreign keys to candidate_id and job_id; stage, status, applied_at, owner_id.
• Add indices for job_id and stage for quick pipeline queries.
Background
• Stage-change triggers: notifications, scheduling interview tasks.
Tests
• Unit tests for stage transition rules; integration tests for create + move.
Acceptance
• Recruiter can change stages and history is recorded; events are emitted and projection updates reflect changes.

---

6 — Pipeline & Stage (Kanban)
Purpose: Visual pipeline (drag/drop columns) and stage metadata.
Backend
• Endpoints for listing stages and reordering stages, and an endpoint for moving an application to a new stage (with audit).
• Business events on move: application.stage_changed.
Frontend
• Implement Kanban board with drag-and-drop (Material UI list + DnD lib).
• On drag-drop, call backend change-stage endpoint and show optimistic UI.
DB
• Stage table for configurable pipeline per job or globally. Stage order integer.
Background
• Worker to process side effects of stage change (email, slack notification).
Tests
• E2E drag/drop test that moves an application and verifies state change & event published.
Acceptance
• Pipeline visually updates; drag/drop persisted; audit shows who moved candidate & when.

---

7 — Interviews & Calendar
Purpose: Schedule interviews, collect feedback and outcomes.
Backend
• Interview CRUD endpoints; attach interviewer IDs; store feedback and outcome.
• Optionally integrate calendar invites via a connector or notify hiring manager.
Frontend
• Interview scheduling UI with date/time picker, interviewer multi-select, feedback form.
• Show upcoming interviews in candidate profile and recruiter dashboard.
DB
• Interview table linked to application_id; scheduled_at, duration, location (virtual/in-person), status.
Background
• Worker to send reminders and to post calendar invites (if configured).
Tests
• Integration tests for schedule creation and feedback capture.
Acceptance
• Interviews can be scheduled, notifications queued, feedback recorded and visible.
Ops
• Timezone handling rules and UI timezone settings.

---

8 — Attachments & Storage (MinIO)
Purpose: Store resumes, offer letters, attachments reliably and securely.
Backend
• Design flow: frontend requests presigned upload URL → upload to MinIO → notify backend with resulting object metadata → backend stores attachment record.
• Endpoint(s) for presigned upload and presigned download (short expiry).
• Attachment metadata includes s3_key, filename, content_type, size, uploaded_by.
Frontend
• File uploader component for resume/upload with progress bar using presigned URL.
• Resume preview (PDF preview or download link).
DB
• Attachment table associated with candidate/application; store MinIO key and extraction status.
Background
• Worker to virus-scan newly uploaded files (optional external scanner), extract text for indexing (OCR/text extraction), and update tsvector for search.
• Queue DLQ and retry on failure.
Tests
• Integration tests for presigned URL flows (using MinIO test instance).
Acceptance
• Files upload via presigned URL; backend receives metadata and worker processes file text to populate search index.
Ops
• MinIO lifecycle policies, encryption at rest, limited presigned URL expiry, object storage quotas.

---

9 — Search & Indexing (Postgres full-text)
Purpose: Enable fast candidate/job search using Postgres full-text.
Backend
• Decide searchable fields per entity (Candidate: name, skills, resume_text, company; Job: title, description, tags).
• Backfill process: for existing records extract searchable text and populate tsvector fields.
• Create API search endpoint (query string + filters) that uses tsvector search and ranks hits.
Frontend
• Search bar and advanced filters; highlight keywords in results.
DB
• Add tsvector columns for Candidate and Job, set up index (GIN) on tsvector.
• Create triggers (or worker) to update tsvector when relevant fields or resume_text change.
Background
• Worker to process attachments and append extracted resume_text to candidate record, then update tsvector.
• Periodic reindex job (maintenance).
Tests
• Search integration tests: index creation, query rank ordering, and filters.
Acceptance
• Search returns relevant results for sample queries and updates within expected time window after upload.
Ops
• Monitor index bloat and plan vacuum/analyze; reindex strategy.

---

10 — Background Workers & Jobs
Purpose: Offload long-running and async operations.
Backend
• Choose worker/broker (decision task: Celery + Redis/RabbitMQ, or RQ, or Dramatiq).
• Define core tasks: process_attachments, extract_text, send_emails, run_sync_adapter, retry_deadletter.
• Implement idempotency keys for tasks and safe retries.
Frontend
• Sync dashboard UI showing queue depth, last run times, errors and ability to replay.
DB
• Store job audit (job_id, payload, status, attempts, last_error).
Ops
• Setup worker scaling rules, DLQ policy, and backpressure monitoring.
Tests
• Unit tests for task handlers; integration tests using test broker.
Acceptance
• Queue jobs processed reliably, retries/exponential backoff work, failures visible in dashboard.

---

11 — Notifications & Emails
Purpose: Notify recruiters/candidates on key events (application received, stage change, interview reminders).
Backend
• Template system for transactional emails (templating engine) and endpoints to send notifications.
• Notification events for application.created, application.stage_changed, interview.scheduled.
• Configure worker to send email via SMTP or external provider.
Frontend
• Notification settings UI per user (email on/off, which events).
• In-app notification center (bell icon) listing recent notifications.
DB
• Notification table for sent notifications and in-app notifications.
Tests
• Integration tests with a sandboxed email provider or SMTP capture.
Acceptance
• Email templates send correctly; notification preferences are respected.
Ops
• Email deliverability monitoring and retry/delivery status.

---

12 — Integrations & Connectors (adapter layer)
Purpose: Make future synchronization with external CRMs possible.
Backend
• Define adapter interface & per-connector config model (credentials, sync mode, authoritative source).
• Implement connector lifecycle: configure → authorize (if OAuth) → initial backfill (ETL) → incremental sync (webhook/poll).
• Implement idempotent change handling using external_id mapping.
• Provide webhook receiver endpoint to accept external events.
Frontend
• Integration management page: connect/disconnect, set sync direction, map fields/stages (mapping UI), view last sync status & errors.
DB
• Store connector settings securely (encrypted secrets), external_id mapping table, and last_synced_at.
Background
• Worker processes sync jobs, handles retries, writes to DLQ on power failure.
Tests
• Contract tests for adapters using mock external APIs; test conflict resolution rules.
Acceptance
• Able to configure at least one test connector or CSV import/CSV-based adapter and run a reliable one-way sync.
Ops
• Access controls for storing credentials and manual replay tools for failed syncs.

---

13 — Admin UI & Settings
Purpose: Manage app-level config, feature flags, and connectors.
Backend
• Settings endpoints for global feature flags, email provider, quota limits, stage templates, and audit log retrieval.
• Secure endpoints for exporting data.
Frontend
• Admin dashboard: metrics, connector management, feature flags toggle, manage pipeline templates, job templates.
DB
• Settings/config table, feature_flags table with rollout rules.
Tests
• Unit tests for admin flows.
Acceptance
• Admin can toggle ATS features and manage mappings without redeploy.
Ops
• Consider feature flag provider or simple DB-driven flags; include audit for flag changes.

---

14 — Audit, Compliance & Data Management
Purpose: GDPR / data retention / export / audit trail.
Backend
• Implement audit log for entity changes (who, when, what diff).
• Endpoints for data export (full candidate export) and data erasure (deletion or anonymization) per GDPR rules.
• Retention policy jobs to purge/archive old data.
Frontend
• Admin tools to request export or delete a candidate, and show audit history in candidate profile.
DB
• Audit table to store JSON diffs and metadata; retention rules for audit logs.
Background
• Worker to handle export generation and notify when ready.
Tests
• Security tests to ensure only authorized users can perform exports/deletes; functional tests for export format.
Acceptance
• Demonstrate data export for a candidate and deletion path with audit logged.
Ops
• Document runbooks for data access requests, legal holds, and deletion.

---

15 — Observability, Logging & Monitoring
Purpose: Operate reliably, detect and respond to incidents.
Backend
• Instrument APIs with request IDs and structured logs.
• Expose Prometheus metrics for key counters: applications/day, queue depth, sync failures, error rates.
• Add distributed tracing spans for long flows (apply → attachment processing → indexing).
Frontend
• Error reporting (Sentry/bug tracker) for user-facing errors.
DB
• Monitor DB connections, long queries, and replication lag if any.
Background
• Create dashboards for worker throughput and DLQ size.
Tests
• Alert-trigger simulations to validate runbooks.
Acceptance
• Dashboards created; alerts fire on test thresholds; runbook for common incidents exists.
Ops
• Define SLAs/SLOs for queue backlog and API latency.

---

16 — Testing & CI/CD
Purpose: Ensure quality and safe deployments.
CI
• Setup pipelines to run linting, unit tests, integration tests (using ephemeral Postgres + MinIO), contract tests for adapters, and build artifacts.
• Gate merges on successful test suite and code review.
CD
• Containerize services (backend, workers, frontend). Set staged deployments: dev → staging → prod. Include migration step.
• Feature flag controlled rollouts (canary).
Tests
• Unit, integration, contract, E2E (Playwright/Cypress) and load tests (k6/locust) for apply spikes.
Acceptance
• All merges run CI; staging deployment exercises smoke tests; ability to rollback.
Ops
• Run security scans (SCA) and SAST in pipeline.

---

17 — Deployment & Infrastructure (what to prepare)
Purpose: Production-ready infra.
Tasks
• Decide deployment target (Kubernetes, cloud services, or VM). Create Terraform/Helm for infra.
• Setup Postgres with backups & PITR, MinIO (replication if needed), Redis/RabbitMQ for broker, and persistent storage.
• Secrets manager (Vault / cloud secret manager).
• Configure DNS, TLS, and ingress for the frontend and backend.
• Setup CI to push images to registry and deploy via manifests.
Acceptance
• Blue/green or canary deployment process works; backups and monitoring enabled.
