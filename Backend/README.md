# ProQuire

## AI-Assisted Technical Service Marketplace

ProQuire is a web-based technical service marketplace designed to connect clients with skilled technicians and registered service agencies through a centralized digital platform.

The platform aims to make it easier for clients to find, compare, and request technical services while helping technicians and service agencies manage their profiles, service requests, and professional activities.

ProQuire also incorporates AI-assisted document verification using Optical Character Recognition (OCR) and document analysis to support administrators in reviewing identification documents, professional certificates, and business documents.

---

## Project Overview

Finding reliable technical service providers can be difficult when clients depend on referrals, social media, advertisements, or informal communication channels. These methods may provide limited information about a provider's qualifications, experience, availability, and previous work.

ProQuire addresses these challenges by providing a centralized platform where clients can discover technical service providers and where technicians and agencies can manage their services digitally.

The system supports four main user roles:

- **Client**
- **Technician**
- **Service Agency**
- **Administrator**

---

## Main Features

### 1. User Registration and Authentication
- User registration and login
- Secure authentication using JWT
- Role-based access control
- Separate functionality for clients, technicians, agencies, and administrators

### 2. Technician Management
- Technician profile management
- Specialization and service categories
- Location information
- Portfolio management
- Service request management
- Ratings and reviews

### 3. Service Agency Management
- Agency registration and profile management
- Agency portfolio
- Technician registration and management
- Assignment of technicians to jobs
- Service request management
- Service records

### 4. Service Discovery
Clients can search for service providers based on:

- Service category
- Specialization
- Location
- Ratings and reviews
- Provider profiles

### 5. Service Requests
Clients can:

- Submit service requests
- View request status
- Track service requests
- Review completed services

Technicians and agencies can:

- View service requests
- Accept/manage requests
- Update request status
- Manage assigned jobs

### 6. AI-Assisted Document Verification

ProQuire uses OCR and document analysis to assist administrators in reviewing submitted documents.

Possible documents include:

- Identification documents
- Professional certificates
- Business documents
- Registration documents

The verification process includes:

1. User uploads a document.
2. The backend receives and processes the document.
3. OCR extracts relevant information.
4. The system analyzes the extracted information.
5. Extracted information can be compared with the user's submitted profile information.
6. Potential inconsistencies are flagged.
7. The verification result is stored in the database.
8. The administrator reviews the result.
9. The administrator makes the final approval or rejection decision.

> **Note:** AI is used to assist the verification process. Final verification decisions remain under administrator control.

### 7. Subscription and Payment

Technicians and service agencies can access subscription-based services.

The module provides:

- Subscription plans
- Premium service subscriptions
- Payment processing
- Subscription status management
- Subscription start and expiry dates
- Payment transaction records

### 8. Reports and Analytics

Administrators can monitor platform activity through reports and analytics.

The system can provide information about:

- User registrations
- Technicians
- Service agencies
- Service requests
- Subscriptions
- Payments
- Document verification
- System usage

These reports help administrators monitor the platform and support informed administrative decision-making.

### 9. Ratings and Reviews

Clients can rate and review service providers after receiving services.

This helps provide additional information about service providers and their previous work.

### 10. Administrator Dashboard

The administrator dashboard provides access to major system functions, including:

- User management
- Technician management
- Agency management
- Document verification
- Subscription and payment management
- Service request monitoring
- Reports and analytics
- System settings

---

## System Architecture

ProQuire follows a three-tier architecture.

```text
+-------------------------------+
|       Presentation Layer      |
|                               |
|        React.js Frontend      |
+---------------+---------------+
                |
                | REST API
                |
+---------------v---------------+
|        Application Layer      |
|                               |
|      Node.js + Express.js     |
|                               |
| Authentication & Authorization|
| User Management               |
| Technician Management         |
| Agency Management             |
| Service Requests              |
| Reviews & Ratings             |
| AI Document Verification     |
| Subscription & Payments       |
| Reports & Analytics           |
+---------------+---------------+
                |
                |
+---------------v---------------+
|           Data Layer          |
|                               |
|            MySQL              |
|                               |
| Users                         |
| Profiles                      |
| Service Requests              |
| Portfolios                    |
| Reviews                       |
| Documents                     |
| Verification Records          |
| Subscriptions                 |
| Payments                      |
+-------------------------------+
