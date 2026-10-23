# GO HUB
## Requirements Document (RD)
### Church Management & Digital Engagement Platform

**Organization:** Greenville Oaks Church  
**Congregations:** English Campus & GO ReNova (Spanish)  
**Project Name:** GO Hub  
**Repository / Directory:** `go-hub`  
**Document Version:** 1.0  
**Status:** Initial Requirements — Planning  
**Initial Deployment:** Akamai / Linode VPS  
**Primary Languages:** English / Spanish

---

# 1. Executive Summary

GO Hub is a unified digital platform designed to support the operational, administrative, communication, and ministry needs of Greenville Oaks Church and its English-speaking and Spanish-speaking congregations.

The platform will provide a centralized environment for managing membership information, families, ministry teams, events, church communications, digital resources, and eventually mobile engagement.

GO Hub will serve two primary audiences:

1. Church administrators and ministry leaders who need tools to manage people, ministries, and church operations.
2. Church members and visitors who need convenient access to church information, events, resources, and communication.

The system will begin as a web-based application with a secure membership directory.

Its architecture must support expansion into a comprehensive church engagement platform without requiring a complete redesign.

## Product Vision

**One Church. Two Congregations. One Connected Platform.**

GO Hub will provide a unified digital experience while respecting the distinct language, ministry structure, and operational needs of each congregation.

The platform must be modular, secure, bilingual, accessible, and extensible.

---

# 2. Business Problem

Church information and ministry operations often exist across multiple disconnected systems.

Current and potential systems include:

- Google Sheets membership directories.
- Church Community Builder (CCB).
- Pushpay.
- Planning Center.
- WordPress.
- Email and messaging services.
- Livestream and video platforms.

These systems serve different purposes but may create fragmented experiences for administrators, leaders, and members.

GO Hub aims to provide a unified interface for essential church information and workflows.

It is not intended to replace every existing service immediately.

Instead, the platform should consolidate access, simplify common tasks, and integrate existing systems when technically and operationally appropriate.

## Key Challenges

- Duplicate membership records across multiple sources.
- Inconsistent or incomplete contact information.
- Difficulty searching and organizing people and households.
- Different administrative needs across congregations.
- Limited visibility into ministry participation.
- Fragmented event and communication workflows.
- Multiple platforms with inconsistent user experiences.
- Need for secure access to sensitive membership information.

---

# 3. Project Objectives

## Primary Objectives

1. Create a unified membership directory.
2. Establish a relational database for people and households.
3. Provide a modern administrative dashboard.
4. Support both English and Spanish congregations.
5. Implement secure authentication and role-based authorization.
6. Establish a modular API for future web and mobile applications.
7. Enable controlled imports from existing church data sources.
8. Provide a foundation for future ministry, event, and communication modules.

## Long-Term Objectives

- Improve administrative efficiency.
- Simplify member engagement.
- Support ministry leaders and volunteers.
- Reduce duplicate data entry.
- Provide a unified church experience.
- Improve communication between ministries and congregations.
- Enable future mobile applications.
- Maintain flexibility to integrate or replace third-party services.

---

# 4. Organizational Structure

GO Hub will support Greenville Oaks Church as the parent organization.

### Organization

Greenville Oaks Church

### Congregations

**English Campus**
- Primary language: English.
- Congregation-specific events, ministries, communications, and member affiliations.

**GO ReNova**
- Primary language: Spanish.
- Congregation-specific events, ministries, communications, and member affiliations.

## Shared Identity Model

A person may participate in more than one congregation.

The system should maintain one canonical person record while supporting multiple congregation affiliations.

For example:

A person may attend the English Campus and volunteer with GO ReNova.

This should not require two separate identities.

However, users must only access records and information authorized for their roles and congregation scope.

---

# 5. User Types and Permissions

The platform will support role-based access control (RBAC).

| Role | Responsibilities |
|---|---|
| Super Administrator | Global platform configuration and access |
| Church Administrator | Church-wide membership and operational management |
| Congregation Administrator | Administration within assigned congregation |
| Ministry Leader | Manage authorized ministry teams and participants |
| Volunteer | Access assigned schedules and relevant resources |
| Member | View and manage permitted personal information |
| Visitor | Access public information and permitted registration features |

Permissions must be enforced by the backend, not solely by the frontend.

Users may have different roles in different congregations or ministries.

---

# 6. Functional Modules

## Module 1 — Membership Directory

**Priority: Critical — MVP**

This is the first module to implement.

### Requirements

- Import membership records from CSV.
- Store unique person records.
- Preserve source-system identifiers.
- Search by name, ID, email, and phone.
- Filter by membership status and congregation.
- Display individual profiles.
- Associate people with households.
- Detect possible duplicate records.
- Support controlled record updates.
- Preserve import and modification history.

### Initial Data Source

An existing Google Sheets workbook contains the following tabs:

- `visitors`
- `group`
- `members`
- `Consolidated`
- `Directory`

The application must support importing data from this workbook.

### Source Fields

- Group Name
- Individual ID
- First Name
- Last Name
- Status
- Email
- Mobile Phone
- Home Phone
- Work Phone
- Street
- City
- State
- Postal Code
- Country
- Carrier Route

### Data Matching

Matching must distinguish between:

- Exact external ID match.
- Potential name match.
- Potential email match.
- Potential phone match.
- Unique record.

Potential matches must be reviewed rather than automatically merged.

Blank fields must not overwrite existing nonempty values.

Conflicting source values must be preserved or flagged for review.

### Acceptance Criteria

- Administrators can import a valid CSV.
- Records are validated before import.
- Exact duplicates are handled safely.
- Possible duplicates are identified.
- The directory displays unique people.
- Search supports partial and case-insensitive matching.
- Unauthorized users cannot access private directory information.

---

## Module 2 — Households and Families

**Priority: High**

### Requirements

- Create household records.
- Associate multiple people with a household.
- Define relationships.
- Maintain household addresses.
- Support individual and household contact information.
- Display household members within a person profile.

Shared surnames or addresses must not automatically establish family relationships.

---

## Module 3 — Administrative Dashboard

**Priority: High**

### Requirements

Display relevant information such as:

- Total people.
- Active members.
- Visitors.
- Households.
- Congregation distribution.
- Records requiring review.
- Recent imports.
- Data quality indicators.

All metrics must be generated from real application data.

---

## Module 4 — Ministries and Volunteers

**Priority: Future**

### Requirements

- Define ministries.
- Assign ministry leaders.
- Register volunteers.
- Associate volunteers with multiple ministries.
- Track ministry participation.
- Support ministry-specific permissions.
- Provide volunteer directories.

Potential ministries include worship, audio/video, children's ministry, hospitality, and small groups.

Future integrations may include Planning Center.

---

## Module 5 — Events and Calendar

**Priority: Future**

### Requirements

- Create congregation-specific events.
- Create church-wide events.
- Support bilingual event descriptions.
- Publish event schedules.
- Support registration and RSVP.
- Associate events with ministries.
- Provide calendar views.

Potential integration with existing WordPress event systems.

---

## Module 6 — Communications

**Priority: Future**

### Requirements

- Publish church announcements.
- Target communications by congregation or ministry.
- Support email notifications.
- Support push notifications.
- Maintain communication preferences.
- Support English and Spanish messaging.

SMS functionality may be introduced later, subject to service selection, consent, and compliance requirements.

---

## Module 7 — Sermons and Digital Media

**Priority: Future**

### Requirements

- Display sermon series.
- Provide sermon descriptions and outlines.
- Link to livestreams.
- Display recorded services.
- Support media categories.
- Provide congregation-specific content.

Potential integrations include YouTube and BoxCast.

---

## Module 8 — Giving Integration

**Priority: Future**

GO Hub should integrate with the church's existing giving provider rather than initially building its own payment-processing infrastructure.

Potential provider: Pushpay.

### Requirements

- Provide secure giving navigation.
- Support congregation-specific giving destinations if required.
- Avoid storing payment card information.
- Use official provider integration mechanisms.

---

## Module 9 — Member Portal

**Priority: Future**

### Requirements

- Secure member login.
- Personal profile.
- Household information where authorized.
- Event registrations.
- Volunteer schedules.
- Church announcements.
- Communication preferences.
- Access to church resources.

---

# 7. User Interface Requirements

## Design Principles

- Clean and professional.
- Responsive.
- Accessible.
- Easy to navigate.
- Consistent across modules.
- English and Spanish support.
- Minimal visual clutter.

## Initial Navigation

- Dashboard
- Directory
- Households
- Imports
- Administration
- Settings

Future modules should be added without restructuring the entire application.

## Membership Directory Interface

The directory should support:

- Search input.
- Filter controls.
- Sortable columns.
- Pagination.
- Person profile navigation.
- Duplicate indicators.
- Import actions.
- Permission-based edit controls.

## Person Profile

The profile should display:

- Name.
- Membership status.
- Contact details.
- Address.
- Household.
- Congregation affiliations.
- Ministry participation when available.
- Source identifiers.
- Record modification history.

---

# 8. Technical Architecture

## Proposed Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + TypeScript + Express |
| Database | PostgreSQL |
| API | REST |
| Validation | Zod |
| Reverse Proxy | Caddy |
| Process Management | systemd |
| Hosting | Akamai / Linode |
| Version Control | Git / GitHub |
| Future Mobile | React Native |

The stack may be refined after infrastructure analysis.

## Initial Deployment Infrastructure

- Ubuntu Server 24.04 LTS.
- 1 vCPU.
- 1 GB RAM.
- 25 GB storage.
- Public IP: 198.58.114.26.

The infrastructure must be evaluated for resource constraints.

Avoid unnecessary services.

A server upgrade may be required before broader production deployment.

## Application Layers

**Presentation Layer**

React-based web application.

**Application Layer**

Node.js API implementing business logic, validation, authentication, and authorization.

**Data Layer**

PostgreSQL storing people, households, affiliations, memberships, and administrative records.

**Integration Layer**

Adapters for CSV, Google Sheets, CCB, Pushpay, and other approved systems.

---

# 9. Database Requirements

The database must support:

- Unique internal identifiers.
- External source identifiers.
- Person and household relationships.
- Multiple congregation affiliations.
- Ministry associations.
- Role and permission assignments.
- Import history.
- Audit logs.
- Data provenance.
- Duplicate review workflows.

### Initial Entities

- organizations
- congregations
- people
- person_external_ids
- households
- household_members
- addresses
- person_addresses
- congregation_memberships
- users
- roles
- user_role_assignments
- import_batches
- import_records
- duplicate_candidates
- audit_logs

Relationships and constraints must be documented before migrations are finalized.

---

# 10. Security and Privacy Requirements

Membership information is private.

### Mandatory Controls

1. HTTPS for authenticated application traffic.
2. Secure authentication.
3. Server-side role and congregation authorization.
4. Password hashing through established libraries or a trusted identity provider.
5. Protection against SQL injection.
6. Input validation.
7. Secure session management.
8. Rate limiting.
9. Audit logging.
10. Least-privilege database access.
11. Database backups.
12. Tested restoration procedures.
13. No public exposure of PostgreSQL.
14. No private data in Git repositories or application logs.
15. Controlled import and export permissions.

The platform must provide an appropriate privacy notice and define retention, deletion, and access policies before production use.

Any use of children's or minors' data requires additional review and safeguards.

---

# 11. Integration Requirements

## Initial Integration

CSV import from Google Sheets.

## Potential Future Integrations

**Google Sheets**
- Controlled import or synchronization.

**Church Community Builder**
- Membership and church-management data where authorized API access exists.

**Pushpay**
- Giving and relevant account integration.

**Planning Center**
- Volunteer scheduling and ministry coordination.

**WordPress**
- Events and content integration.

**YouTube / BoxCast**
- Livestream and media content.

Integrations must use supported authentication mechanisms and respect API permissions and rate limits.

No integration should be considered available until access and technical feasibility are verified.

---

# 12. Nonfunctional Requirements

## Performance

- Responsive directory searches.
- Efficient database queries.
- Pagination for large datasets.
- Minimal server memory usage.
- Avoid unnecessary background processes.

## Reliability

- Restartable services.
- Application health checks.
- Structured logging.
- Recoverable database backups.
- Documented deployment procedures.

## Scalability

- Modular architecture.
- Independent API.
- Ability to increase server resources.
- Future separation of database and application hosting.
- Support for mobile clients.

## Maintainability

- TypeScript.
- Consistent coding standards.
- Database migrations.
- Automated tests.
- API documentation.
- Environment-specific configuration.
- Version-controlled infrastructure scripts.

## Accessibility

- Keyboard navigation.
- Semantic interfaces.
- Accessible form controls.
- Adequate contrast.
- Mobile-responsive layouts.

## Localization

- English and Spanish translations.
- Language selection.
- Congregation-specific defaults.
- Centralized translation resources.

---

# 13. Implementation Roadmap

## Phase 0 — Infrastructure

**Goal:** Establish a secure and reliable server environment.

Deliverables:

- Server audit.
- SSH security.
- Non-root administrator.
- Firewall configuration.
- OS updates.
- Resource assessment.
- Backup strategy.

## Phase 1 — Application Foundation

**Goal:** Establish the core application architecture.

Deliverables:

- Repository structure.
- React application.
- Node.js API.
- PostgreSQL database.
- Environment configuration.
- Local development environment.
- Initial deployment scripts.

## Phase 2 — Identity and Authorization

**Goal:** Secure administrative access.

Deliverables:

- Login.
- Sessions.
- Roles.
- Congregation-specific permissions.
- Protected routes.
- Audit logging.

## Phase 3 — Membership Data

**Goal:** Establish the membership database.

Deliverables:

- Database schema.
- Migrations.
- CSV import.
- Data validation.
- Duplicate review.
- Import reporting.

## Phase 4 — Membership Directory

**Goal:** Deliver the first functional administrative module.

Deliverables:

- Directory UI.
- Search and filters.
- Person profiles.
- Household associations.
- Authorized editing.
- Dashboard metrics.

## Phase 5 — Production Readiness

**Goal:** Prepare for controlled church use.

Deliverables:

- HTTPS.
- Deployment automation.
- Security testing.
- Backup restoration testing.
- Performance review.
- User acceptance testing.
- Administrator documentation.

## Phase 6 — Expansion

**Goal:** Add additional ministry and member-facing functionality.

Potential modules:

- Ministries.
- Volunteers.
- Events.
- Communications.
- Sermons.
- Member portal.
- Mobile application.
- Third-party integrations.

---

# 14. MVP Definition

The Minimum Viable Product will be considered complete when:

1. GO Hub is accessible through a secure HTTPS endpoint.
2. Authorized administrators can log in.
3. The database supports people and households.
4. Administrators can import membership data from CSV.
5. Duplicate candidates are detected and reviewed.
6. A searchable directory displays imported records.
7. Person profiles show available contact and household information.
8. Congregation-based permissions are enforced.
9. Administrative changes are audited.
10. Database backups can be successfully restored.
11. The application is documented and deployable.

The MVP does not require mobile applications, SMS, payment processing, or full CCB integration.

---

# 15. Out of Scope for Initial MVP

The following will not be implemented in the first release:

- Native iOS or Android applications.
- Direct payment processing.
- Automated SMS campaigns.
- Advanced analytics or AI.
- Full church accounting.
- Volunteer scheduling automation.
- Livestream hosting infrastructure.
- Full replacement of CCB.
- Full replacement of Planning Center.

These capabilities may be considered in future phases.

---

# 16. Risks and Dependencies

## Infrastructure Capacity

The existing 1 GB VPS may be insufficient for all production services under heavier workloads.

Mitigation: Monitor usage and scale when required.

## Data Quality

Source spreadsheets contain duplicate or incomplete records.

Mitigation: Preserve provenance and implement controlled reconciliation.

## Third-Party Integrations

API access and capabilities may be limited.

Mitigation: Use modular adapters and verify feasibility before implementation.

## Privacy

Membership data contains personal information.

Mitigation: Authentication, authorization, encryption, audit logging, and operational controls.

## Project Scope

A full church-management platform is substantially larger than the initial directory.

Mitigation: Develop through independently deliverable milestones.

---

# 17. Success Criteria

GO Hub will be successful when:

- Administrators can locate accurate membership information efficiently.
- Duplicate records are reduced without losing source information.
- Both congregations can operate within a shared platform.
- Users see only information they are authorized to access.
- The platform is stable, secure, and maintainable.
- New modules can be added without major architectural changes.
- Existing church systems can be integrated where practical.

---

# 18. Cursor Implementation Instructions

This Requirements Document is the authoritative initial product scope for GO Hub.

Cursor must:

1. Review the requirements before implementing features.
2. Create an architecture plan.
3. Identify ambiguities and dependencies.
4. Maintain a phased implementation roadmap.
5. Start with infrastructure discovery.
6. Request approval before destructive or security-sensitive changes.
7. Implement functionality incrementally.
8. Write tests for critical behavior.
9. Keep documentation synchronized with implementation.
10. Report completed work and remaining tasks accurately.

**Immediate instruction:**

Begin with Phase 0.

Verify SSH connectivity to the existing Linode, inspect the Ubuntu environment, and produce an infrastructure audit and hardening plan.

Do not deploy application code or import real membership information until the server security baseline has been approved.

---

**End of Requirements Document — GO Hub v1.0**
