 # Module 3: Candidate Outreach & Initial Interview Scheduling

 ## Table of Contents
1. [Introduction](#introduction)
2. [High-Level Architecture](#high-level-architecture)
3. [Data Sources & Prerequisites](#data-sources--prerequisites)
4. [Outreach Workflow](#outreach-workflow)
   - 4.1 [Multi-Channel Sequence](#multi-channel-sequence)
   - 4.2 [Retry Policy & Rate Limits](#retry-policy--rate-limits)
5. [Message Templates & Contact Scripts](#message-templates--contact-scripts)
   - 5.1 [Email](#email)
   - 5.2 [SMS & WhatsApp](#sms--whatsapp)
   - 5.3 [Phone Call Script](#phone-call-script)
6. [Integration Components](#integration-components)
   - 6.1 [Calendar & Scheduling Engine](#calendar--scheduling-engine)
   - 6.2 [Communication Gateways](#communication-gateways)
   - 6.3 [CRM/ATS Synchronization](#crmat-synchronization)
   - 6.4 [Logging & Analytics](#logging--analytics)
7. [Interview Scheduling Mechanics](#interview-scheduling-mechanics)
   - 7.1 [Slot Discovery](#slot-discovery)
   - 7.2 [Invite Generation & Delivery](#invite-generation--delivery)
   - 7.3 [Automated Reminders](#automated-reminders)
8. [Monitoring & Reporting](#monitoring--reporting)
   - 8.1 [Real-Time Dashboard](#real-time-dashboard)
   - 8.2 [Alerts & Escalations](#alerts--escalations)
   - 8.3 [Key Metrics](#key-metrics)
9. [Compliance & Best Practices](#compliance--best-practices)
   - 9.1 [Data Privacy & GDPR](#data-privacy--gdpr)
   - 9.2 [Consent & Opt-Out](#consent--opt-out)
   - 9.3 [Personalization & Tone](#personalization--tone)
   - 9.4 [Time Zone Handling](#time-zone-handling)
10. [Operational Considerations](#operational-considerations)
   - 10.1 [Error Handling & Retries](#error-handling--retries)
   - 10.2 [Scalability & Performance](#scalability--performance)
   - 10.3 [Security & Access Control](#security--access-control)
11. [Conclusion & Next Steps](#conclusion--next-steps)

## Introduction
Building on Module 2 (Job Matching), this module orchestrates candidate outreach across multiple channels (email, SMS, phone, WhatsApp, etc.) and automates initial interview scheduling. Contact details are reused from Module 2 to minimize token usage and ensure data consistency.

## High-Level Architecture
The solution comprises the following components:
- **Outreach Engine**: Manages channel selection, template rendering, and message dispatch.
- **Scheduler Service**: Interfaces with calendar APIs to fetch availability and create invites.
- **Integration Layer**: Connects to Email/SMS/WhatsApp providers and CRM/ATS systems.
- **Notification & Retry Queue**: Handles retries, backoff, and error management.
- **Dashboard & Analytics**: Presents real-time status, metrics, and alerts.

Inter-component communication uses RESTful APIs and event-driven webhooks. All data flows through a secured API gateway to enforce authentication and logging.

## Data Sources & Prerequisites
- **Candidate Data** (Module 2): Name, role applied, contact methods (email, phone, WhatsApp), timezone.
- **HR Consultant Profile**: Availability calendar (Google/Outlook), contact identity.
- **Messaging Gateways**: API keys for SMTP (SendGrid), SMS/WhatsApp (Twilio).
- **Booking Portal**: Preconfigured scheduling URLs (Calendly, Microsoft Bookings).

## Outreach Workflow
### 4.1 Multi-Channel Sequence
1. **Day 0**: Send personalized email invitation with booking link.
2. **Day 2**: If no email open/response, send SMS reminder.
3. **Day 4**: If still no response, send WhatsApp message.
4. **Day 6**: Auto-escalate to recruiter dashboard for manual follow-up.
5. **Day 7**: Recruiter performs phone call; outcome logged.

### 4.2 Retry Policy & Rate Limits
- Max 3 automated outreach attempts per candidate.
- Adhere to channel-specific rate limits and local compliance.
- Provide clear opt-out instructions in SMS/WhatsApp.

## Message Templates & Contact Scripts
### 5.1 Email
```text
Subject: Interview Invitation – [Job Title] at [Company]

Hello [Candidate Name],

We reviewed your profile for the [Job Title] role at [Company]. We’d like to invite you to an initial interview. Please select a convenient slot using this link:
  [Booking Link]

Feel free to reply directly if you have any questions.

Best regards,
[HR Consultant Name]
```  

### 5.2 SMS & WhatsApp
```text
Hi [Candidate Name], this is [Consultant] from [Company]. Please book your interview here: [Link]
```  

### 5.3 Phone Call Script
- Greet and confirm identity.
- Explain purpose: initial interview scheduling.
- Propose top 3 slots pulled from consultant’s calendar.
- Confirm slot and send calendar invite in real time.
- Close call and log details in CRM.

## Integration Components
### 6.1 Calendar & Scheduling Engine
- Use Google Calendar API or Microsoft Graph to read/write
- Fetch next 5 available slots, respecting business hours.
- Generate ICS invite with conferencing link (Zoom/Teams).

### 6.2 Communication Gateways
- Email via SMTP/SendGrid.
- SMS/WhatsApp via Twilio Programmable APIs.
- LinkedIn DM via LinkedIn API (optional).

### 6.3 CRM/ATS Synchronization
- Update candidate status (Contacted, Invited, Booked).
- Webhooks trigger on message delivery and booking events.

### 6.4 Logging & Analytics
- Centralized logs (ELK stack or cloud logging).
- Metrics exported to Grafana or BI dashboard.

## Interview Scheduling Mechanics
### 7.1 Slot Discovery
- Query calendar.raw availability in JSON.
- Exclude weekends and holidays via business calendar.

### 7.2 Invite Generation & Delivery
- Create ICS attachments, include meeting URLs.
- Send invites via email API and calendar integration.

### 7.3 Automated Reminders
- Schedule email reminder 24h before.
- Send SMS reminder 1h before interview.

## Monitoring & Reporting
### 8.1 Real-Time Dashboard
- Visualize outreach pipeline and interview slots.

### 8.2 Alerts & Escalations
- Unresponsive candidates flagged after Day 7.
- Interview cancellations trigger auto-reschedule flow.

### 8.3 Key Metrics
- Contact rate, response rate, booking conversion.
- Avg time-to-book, no-show rate, channel ROI.

## Compliance & Best Practices
### 9.1 Data Privacy & GDPR
- Encrypt PII in transit/at rest.
- Store data only as long as needed.

### 9.2 Consent & Opt-Out
- Explicit opt-in for SMS/WhatsApp.
- Handle unsubscribe requests automatically.

### 9.3 Personalization & Tone
- Adapt formality to seniority and sector.
- Leverage dynamic templates for personalization.

### 9.4 Time Zone Handling
- Detect candidate locale; display local times.
- Convert all timestamps accordingly.

## Operational Considerations
### 10.1 Error Handling & Retries
- Exponential backoff for transient failures.
- Dead-letter queue for manual resolution.

### 10.2 Scalability & Performance
- Async workers for outreach tasks.
- Horizontal scaling of API and worker pods.

### 10.3 Security & Access Control
- OAuth2 or API key authentication for all services.
- RBAC for recruiter vs. admin access.

## Conclusion & Next Steps
Module 3 transforms matched candidates into real interview bookings via a robust, scalable, and compliant outreach system. In Module 4, we will focus on interview feedback ingestion and next-stage evaluation automation.

## 1. Objectives and Scope
- Transform pre-screened candidates into confirmed interview appointments
- Support multiple outreach channels: phone call, SMS, email, WhatsApp, and others
- Automate and track scheduling against the HR consultant’s calendar
- Monitor key metrics: contact rate, confirmation rate, scheduling lead time

## 2. Contact Workflow
1. **Initial Outreach**: Send a personalized email with interview invitation
2. **First Reminder**: If no response within 48 hours, send SMS follow-up
3. **Second Reminder**: If still no response after another 48 hours, send WhatsApp message
4. **Escalation**: Notify recruiter if no reply after all outreach attempts
5. **Manual Call**: Attempt direct phone call if digital outreach fails

## 3. Message Templates and Scripts
- **Email Template**:
  - Subject: “Interview Invitation for [Position] at [Company]”
  - Body: Introduction, role summary, proposed time slots, booking link
- **SMS/WhatsApp Script**:
  - Brief greeting, reminder of email, direct booking link
- **Phone Call Script**:
  - Opening lines, role overview, ask for availability, confirm details, log notes

## 4. Tools & Integrations
- **Calendar Integration**: Google Calendar / Outlook API to read/write availability
- **Booking Links**: Embedded Calendly or Microsoft Bookings links in messages
- **CRM/ATS Sync**: Update candidate status (Contacted, Confirmed, No-Show)
- **Notification Engine**: Email/SMS/WhatsApp gateways for automated delivery

## 5. Interview Scheduling
- **Interview Types**: Phone screen, video conference, or in-person
- **Availability Sync**: Fetch HR consultant slots and propose top 3 timeframes
- **Invitation Generation**: Create calendar invites (ICS) with conferencing links
- **Automated Reminders**: Send reminders 24 h and 1 h before the interview

## 6. Follow-up & Reporting
- **Dashboard**: Real-time view of outreach status and upcoming interviews
- **Alerts**: Trigger notifications for unconfirmed or rescheduled interviews
- **Metrics**: Track time-to-schedule, no-show rate, and channel effectiveness

## 7. Compliance & Best Practices
- **Data Privacy**: Handle personal contact data per GDPR and local regulations
- **Consent Management**: Ensure candidates consent to SMS/WhatsApp outreach
- **Tone & Personalization**: Adjust messaging style according to role and seniority
- **Time Zone Handling**: Automatically convert and display times in candidate’s locale

---
*Module 3 builds on the prescreened candidate set and contact info from Module 2, ensuring an efficient, consistent, and compliant process for converting top talent into scheduled interviews.*