export const PRESET_POLICIES = [
  {
    id: 'it-security-policy',
    title: 'IT Security & Access Control Policy',
    fileName: 'IT_Security_Access_Control_v4.2.pdf',
    fileSize: '2.4 MB',
    pages: 18,
    version: 'v4.2',
    date: 'Oct 24, 2025',
    category: 'Cybersecurity',
    compliance: 'ISO 27001 / SOC 2 Type II',
    audience: 'Technical Support',
    format: 'Step-by-Step',
    sourceContent: {
      documentHeader: {
        org: 'Apex Enterprise Global Technologies',
        docRef: 'POL-SEC-2025-089',
        classification: 'Confidential // Internal Only',
        effectiveDate: 'November 1, 2025',
      },
      sections: [
        {
          id: 'sec-1-0',
          number: '1.0',
          title: 'Purpose & Guiding Principles',
          content: 'This policy mandates zero-trust security postures across all production infrastructure, corporate networks, and customer data repositories. All access requests must adhere to the principle of least privilege (PoLP) and segregation of duties (SoD).',
          isHighlighted: false,
        },
        {
          id: 'sec-2-1',
          number: '2.1',
          title: 'Multi-Factor Authentication (MFA) Mandate',
          badgeText: 'Sec 2.1',
          highlightLabel: 'Clause 2.1: Hardware Token / FIDO2 Requirement',
          content: 'All personnel accessing production environments, administrative consoles, or code deployment pipelines MUST authenticate using hardware-backed FIDO2 WebAuthn keys or enterprise-enrolled biometric authenticators. SMS and voice-call OTP verification are strictly prohibited for tier-1 and tier-2 administrative accounts.',
          isHighlighted: true,
          citationKey: 'sec-2-1',
          note: 'Strict enforcement: SMS OTP deprecated as of Q3 2025.'
        },
        {
          id: 'sec-3-2',
          number: '3.2',
          title: 'Elevated Privilege & Admin Role Delegation',
          badgeText: 'Sec 3.2',
          highlightLabel: 'Clause 3.2: Dual-Manager Approval Gate',
          content: 'Privileged identity assignments (including Cloud IAM Owner, Kubernetes Cluster Admin, and Production DB write roles) require written dual-manager authorization: one approval from the requester\'s direct Engineering Director and one approval from the on-duty SecOps Compliance Officer. Ephemeral role grants shall not exceed four (4) hours.',
          isHighlighted: true,
          citationKey: 'sec-3-2',
          note: 'Requires Jira Service Management ticket with ticket state APPROVED before IAM grant.'
        },
        {
          id: 'sec-4-4',
          number: '4.4',
          title: 'Session Inactivity & Automatic Token Revocation',
          badgeText: 'Sec 4.4',
          highlightLabel: 'Clause 4.4: 15-Minute TTL & Session Term',
          content: 'Privileged SSH, VPN, and console sessions must automatically terminate after fifteen (15) minutes of verified inactivity. Concurrent active sessions for an individual credential are capped at two (2) originating IP addresses within the corporate SD-WAN.',
          isHighlighted: true,
          citationKey: 'sec-4-4',
          note: 'Audit logs streamed continuously to Splunk SIEM with 365-day retention.'
        },
        {
          id: 'sec-6-1',
          number: '6.1',
          title: 'Emergency Break-Glass Credential Access',
          badgeText: 'Sec 6.1',
          highlightLabel: 'Clause 6.1: P1 Incident Break-Glass Protocol',
          content: 'In the event of a verified P1 Production Outage where normal approval chains cannot be completed within 10 minutes, the Incident Commander may trigger the Break-Glass Vault in HashiCorp Vault. Doing so simultaneously pages the VP of Engineering, emits a high-priority PagerDuty broadcast, and initiates automated screen recording.',
          isHighlighted: true,
          citationKey: 'sec-6-1',
          note: 'Post-mortem mandatory within 24 hours of break-glass invocation.'
        }
      ]
    },
    generatedProcedure: {
      meta: {
        docId: 'SOP-IAM-2025-014',
        title: 'SOP: Privileged Cloud IAM Access Request & Provisioning',
        version: '1.0-GENERATED',
        effectiveDate: 'Generated from Policy v4.2',
        targetAudience: 'Technical Support & Systems Engineering',
        estimatedDuration: '10 - 15 minutes',
        riskLevel: 'High (Production Impact)',
      },
      objective: 'Define the verified operational steps for requesting, approving, provisioning, and terminating ephemeral elevated privileges on Apex Enterprise cloud infrastructure in compliance with Zero Trust standards.',
      prerequisites: [
        'Enrolled FIDO2 hardware security key (YubiKey 5 Series or equivalent)',
        'Active VPN / SD-WAN tunnel connected to the Corporate Bastion',
        'Valid Jira Service Management ticket with valid project billing code',
        'Certified completion of Security Awareness Module SEC-201'
      ],
      steps: [
        {
          id: 1,
          stepNumber: '01',
          title: 'Verify Hardware Token & Authenticator Readiness',
          role: 'Requester / SysAdmin',
          description: 'Ensure hardware FIDO2 key is inserted and WebAuthn credentials are valid before launching the IAM portal.',
          substeps: [
            'Insert corporate YubiKey into workstation USB-C port.',
            'Open the Okta Enterprise Portal and confirm biometric or touch prompt.',
            'Confirm that SMS/Voice fallback options are explicitly disabled in your profile.'
          ],
          citation: 'sec-2-1',
          citationBadge: '[Sec 2.1]',
          tip: 'FIDO2 registration status can be verified at id.internal.apex.net/tokens.'
        },
        {
          id: 2,
          stepNumber: '02',
          title: 'Submit Ephemeral Access Request in Jira ITSM',
          role: 'Requester',
          description: 'Create an Access Request Ticket detailing the target cloud resource, IAM role level, business rationale, and requested duration (maximum 4 hours).',
          substeps: [
            'Navigate to Jira Service Management > Access Requests > Cloud Infrastructure.',
            'Select Target Environment (e.g., AWS Production, GCP Cloud-East).',
            'Specify Access Window: set TTL <= 4.0 hours.',
            'Attach business rationale or active customer incident ticket number.'
          ],
          citation: 'sec-3-2',
          citationBadge: '[Sec 3.2]',
          warning: 'Requests submitted with duration exceeding 4 hours will be automatically rejected by the automated validation webhook.'
        },
        {
          id: 3,
          stepNumber: '03',
          title: 'Obtain Dual-Manager Authorizations',
          role: 'Engineering Director & SecOps Officer',
          description: 'Route ticket for synchronized approvals before access tokens can be minted.',
          substeps: [
            'Primary approval: Direct Engineering Director confirms business necessity.',
            'Secondary approval: On-duty SecOps Officer verifies role boundaries and absence of conflicts.',
            'Both approvals must be timestamped within 60 minutes of request submission.'
          ],
          citation: 'sec-3-2',
          citationBadge: '[Sec 3.2]',
          tip: 'Escalate urgent approval bottlenecks via #secops-approvals Slack channel.'
        },
        {
          id: 4,
          stepNumber: '04',
          title: 'Initiate Cloud Session with 15-Minute Keep-Alive Watchdog',
          role: 'Requester / IAM Bot',
          description: 'Authenticate against Teleport or HashiCorp Vault to receive temporary STS credentials.',
          substeps: [
            'Execute `tsh login --proxy=bastion.apex.net --auth=okta` in terminal.',
            'Confirm session lock: verify timer indicates 15-minute inactivity timeout.',
            'Do not initiate concurrent connections from distinct network origins.'
          ],
          citation: 'sec-4-4',
          citationBadge: '[Sec 4.4]',
          warning: 'Inactivity exceeding 15 minutes terminates all active SSH pipes immediately without background state saving.'
        },
        {
          id: 5,
          stepNumber: '05',
          title: 'Execute Emergency Break-Glass (Outage Exception Only)',
          role: 'Incident Commander',
          description: 'If a critical P1 service degradation occurs and the dual-approval chain cannot respond within 10 minutes, utilize the emergency bypass vault.',
          substeps: [
            'Log into Vault Emergency Console: `vault-emergency.apex.net`.',
            'Provide active P1 Incident ID and verify automatic VP Engineering paging alert.',
            'Perform required production stabilization actions under screen recording.',
            'File mandatory post-incident security audit report within 24 hours of closure.'
          ],
          citation: 'sec-6-1',
          citationBadge: '[Sec 6.1]',
          tip: 'All command keystrokes executed under Break-Glass are mirrored to secure WORM compliance storage.'
        }
      ],
      governanceNotes: [
        'Annual Audit Requirement: All elevated session logs are retained for 365 days for SOC 2 Type II compliance.',
        'Zero Standing Privileges: No human operator retains permanent write access to production clusters.'
      ]
    }
  },
  {
    id: 'remote-work-guidelines',
    title: 'Remote Work & Data Protection Guidelines',
    fileName: 'Remote_Work_Data_Protection_v2.8.docx',
    fileSize: '1.8 MB',
    pages: 12,
    version: 'v2.8',
    date: 'Nov 12, 2025',
    category: 'Human Resources / InfoSec',
    compliance: 'GDPR / HIPAA Security Rule',
    audience: 'General Staff',
    format: 'Checklist',
    sourceContent: {
      documentHeader: {
        org: 'Apex Enterprise Global Technologies',
        docRef: 'POL-HR-2025-044',
        classification: 'Internal Use Only',
        effectiveDate: 'December 1, 2025',
      },
      sections: [
        {
          id: 'sec-1-3',
          number: '1.3',
          title: 'Workstation Storage Encryption & BitLocker',
          badgeText: 'Sec 1.3',
          highlightLabel: 'Clause 1.3: Full Disk AES-256 Encryption',
          content: 'All portable computing devices containing or processing corporate emails, customer records, or source code must have full-disk encryption (BitLocker with TPM 2.0 or macOS FileVault) enabled with AES-256 keys managed by corporate MDM.',
          isHighlighted: true,
          citationKey: 'sec-1-3',
          note: 'Encryption recovery keys stored in escrow in Microsoft Intune.'
        },
        {
          id: 'sec-2-4',
          number: '2.4',
          title: 'Public Wi-Fi & WireGuard / Zero Trust Network Access',
          badgeText: 'Sec 2.4',
          highlightLabel: 'Clause 2.4: Always-On ZTNA Tunnel',
          content: 'Connecting company laptops to open, unsecured, or hotel Wi-Fi networks without an active, encrypted WireGuard or ZTNA tunnel is prohibited. Split-tunneling is automatically disabled for all high-risk corporate SaaS domains.',
          isHighlighted: true,
          citationKey: 'sec-2-4',
          note: 'Cloudflare WARP client auto-connects upon network adapter state change.'
        },
        {
          id: 'sec-3-1',
          number: '3.1',
          title: 'Lost or Stolen Device Escalation SLA',
          badgeText: 'Sec 3.1',
          highlightLabel: 'Clause 3.1: 15-Minute Reporting Requirement',
          content: 'Any employee whose work laptop, mobile device, or security token is lost or stolen must notify the 24/7 Security Operations Center hotline (+1-800-555-APEX) within fifteen (15) minutes of discovering the loss to trigger remote cryptographic wipe.',
          isHighlighted: true,
          citationKey: 'sec-3-1',
          note: 'Remote wipe payload sent immediately via Apple APNs / Windows Push Notification Services.'
        }
      ]
    },
    generatedProcedure: {
      meta: {
        docId: 'SOP-REM-2025-009',
        title: 'Checklist: Remote Workstation Security & Incident Protocol',
        version: '1.0-CHECKLIST',
        effectiveDate: 'Generated from Policy v2.8',
        targetAudience: 'All Remote Employees & Contractors',
        estimatedDuration: 'Ongoing compliance',
        riskLevel: 'Medium',
      },
      objective: 'Ensure every distributed team member verifies device encryption, maintains secure transport connectivity, and knows immediate response steps if hardware is misplaced.',
      prerequisites: [
        'Company-issued laptop with MDM enrollment (Intune/Jamf)',
        'Installed Cloudflare WARP / Enterprise ZTNA client',
        'Saved 24/7 SOC Emergency phone number in personal mobile phone'
      ],
      steps: [
        {
          id: 1,
          stepNumber: '01',
          title: 'Verify Full-Disk Encryption Status on Laptop',
          role: 'Remote Employee',
          description: 'Confirm that BitLocker (Windows) or FileVault (macOS) displays an active encryption state before handling company documents.',
          substeps: [
            'On Windows: Check Control Panel > BitLocker Drive Encryption > Status: "BitLocker on".',
            'On macOS: System Settings > Privacy & Security > FileVault: "Turned On".',
            'Report any prompt requesting manual encryption keys to IT Helpdesk.'
          ],
          citation: 'sec-1-3',
          citationBadge: '[Sec 1.3]',
          tip: 'Do not disable automatic OS updates as they carry cryptographic security patches.'
        },
        {
          id: 2,
          stepNumber: '02',
          title: 'Enable Always-On ZTNA Tunnel on Public Networks',
          role: 'Remote Employee',
          description: 'Whenever working from co-working spaces, cafes, airports, or hotels, engage the enterprise tunnel.',
          substeps: [
            'Connect to the local Wi-Fi captive portal if required.',
            'Open Enterprise ZTNA / Cloudflare WARP app and verify status is green "Connected".',
            'Verify that sensitive internal URLs (e.g. intranet.apex.net) load successfully.'
          ],
          citation: 'sec-2-4',
          citationBadge: '[Sec 2.4]',
          warning: 'Never disable the VPN client to bypass bandwidth throttles on hotel connections.'
        },
        {
          id: 3,
          stepNumber: '03',
          title: 'Execute 15-Minute Lost Device Notification Protocol',
          role: 'Remote Employee',
          description: 'If your computer or hardware key is lost, stolen, or left unattended in a public area, notify Security immediately.',
          substeps: [
            'Immediately dial the 24/7 SOC Hotline: +1-800-555-APEX (toll-free).',
            'Provide your Employee ID, Serial Number (if known), and approximate time of loss.',
            'Confirm receipt of automated remote lock and wipe confirmation message via personal email.'
          ],
          citation: 'sec-3-1',
          citationBadge: '[Sec 3.1]',
          tip: 'Save the SOC Hotline in your personal contacts as "Apex Security Emergency".'
        }
      ],
      governanceNotes: [
        'Mandatory quarterly compliance audit checks MDM compliance across all remote assets.',
        'Zero tolerance for unencrypted customer data storage on local drives.'
      ]
    }
  },
  {
    id: 'vendor-risk-policy',
    title: 'Third-Party Vendor Risk & Procurement Policy',
    fileName: 'Vendor_Risk_Procurement_Policy_v3.0.pdf',
    fileSize: '3.1 MB',
    pages: 24,
    version: 'v3.0',
    date: 'Dec 05, 2025',
    category: 'Legal & Procurement',
    compliance: 'SOC 2 Type II / NIST SP 800-161',
    audience: 'Managers',
    format: 'Step-by-Step',
    sourceContent: {
      documentHeader: {
        org: 'Apex Enterprise Global Technologies',
        docRef: 'POL-VEN-2025-102',
        classification: 'Confidential // Commercial',
        effectiveDate: 'January 1, 2026',
      },
      sections: [
        {
          id: 'sec-2-2',
          number: '2.2',
          title: 'Third-Party SOC 2 Type II & Security Certification',
          badgeText: 'Sec 2.2',
          highlightLabel: 'Clause 2.2: Mandatory Independent Audit',
          content: 'Any third-party vendor handling Tier 1 (Customer PII/Financial) or Tier 2 (Proprietary source code/infrastructure) data must present an independent SOC 2 Type II report with an audit period within the past twelve (12) months, or an equivalent ISO 27001 certificate.',
          isHighlighted: true,
          citationKey: 'sec-2-2',
          note: 'Bridge letters required if audit period lapsed by more than 3 months.'
        },
        {
          id: 'sec-4-1',
          number: '4.1',
          title: 'Spend & Authorization Thresholds',
          badgeText: 'Sec 4.1',
          highlightLabel: 'Clause 4.1: Financial Approval Matrix',
          content: 'SaaS agreements exceeding $50,000 ARR require signature from the Department VP and Chief Financial Officer. Contracts over $250,000 ARR require Board Audit Committee notification and formal competitive RFPs with minimum three qualified bids.',
          isHighlighted: true,
          citationKey: 'sec-4-1',
          note: 'Splitting purchase orders to circumvent threshold limits is strictly prohibited.'
        }
      ]
    },
    generatedProcedure: {
      meta: {
        docId: 'SOP-VEN-2026-003',
        title: 'SOP: Vendor Onboarding & Security Due Diligence Workflow',
        version: '1.0-GENERATED',
        effectiveDate: 'Generated from Policy v3.0',
        targetAudience: 'Department Managers & Budget Holders',
        estimatedDuration: '2 - 3 weeks',
        riskLevel: 'Medium-High',
      },
      objective: 'Provide managers a standardized, compliance-backed roadmap to evaluate, vet, and contract third-party software and consulting vendors without creating security gaps or budget overruns.',
      prerequisites: [
        'Completed Vendor Assessment Intake Form in Coupa / Zip',
        'Vendor Point of Contact with authorization to share security reports',
        'Allocated departmental budget code confirmed in NetSuite'
      ],
      steps: [
        {
          id: 1,
          stepNumber: '01',
          title: 'Collect Security Audit Certifications & SOC 2 Report',
          role: 'Hiring Manager',
          description: 'Obtain required cryptographic and process security documentation from the vendor sales engineering team.',
          substeps: [
            'Request the vendor’s most recent SOC 2 Type II report (within past 12 months).',
            'Verify that all 5 Trust Services Criteria (Security, Availability, Processing Integrity, Confidentiality, Privacy) are covered.',
            'Submit documentation to SecOps through the Vendor Review Portal for automated parsing.'
          ],
          citation: 'sec-2-2',
          citationBadge: '[Sec 2.2]',
          tip: 'If vendor only provides SOC 3 or ISO 27001, request additional pen-test executive summary.'
        },
        {
          id: 2,
          stepNumber: '02',
          title: 'Route for Spend Approval Based on Threshold Limits',
          role: 'Manager & Finance Team',
          description: 'Trigger workflow in Coupa to secure required executive signatures based on Total Contract Value (TCV).',
          substeps: [
            'For contracts under $50K: Direct Department Director sign-off required.',
            'For contracts between $50K - $250K: Obtain formal VP & CFO digital signature in DocuSign.',
            'For contracts above $250K: Attach 3 competitive RFP bids and trigger Legal General Counsel review.'
          ],
          citation: 'sec-4-1',
          citationBadge: '[Sec 4.1]',
          warning: 'Never sign a vendor Order Form or Master Services Agreement without prior Legal & Finance workflow approval.'
        }
      ],
      governanceNotes: [
        'Annual Vendor Review: All contracted vendors are subjected to automated re-scoring every 12 months.',
        'Data Processing Addendum (DPA) containing Standard Contractual Clauses (SCC) is non-negotiable.'
      ]
    }
  }
];

export const AUDIENCE_OPTIONS = [
  { value: 'Technical Support', label: 'Technical Support & SysAdmins', desc: 'Detailed CLI commands, tool paths, and technical parameters' },
  { value: 'General Staff', label: 'General Staff & All Employees', desc: 'Clear, plain-language guidelines and everyday safety checks' },
  { value: 'Managers', label: 'Department Managers & Team Leads', desc: 'Approval gateways, oversight checklists, and SLA metrics' },
  { value: 'Compliance Officers', label: 'Compliance & Legal Auditors', desc: 'Regulatory citations, evidence trails, and retention mandates' },
];

export const FORMAT_OPTIONS = [
  { value: 'Step-by-Step', label: 'Step-by-Step SOP', icon: 'ListOrdered', desc: 'Sequenced procedures with roles, prerequisites, and callouts' },
  { value: 'Checklist', label: 'Operational Checklist', icon: 'CheckSquare', desc: 'Interactive tick-box items ideal for runbooks and shift handovers' },
  { value: 'Flowchart', label: 'Decision Logic / Flow View', icon: 'GitFork', desc: 'Structured conditional branches and escalation routes' },
];

export const RAG_SIMULATION_STEPS = [
  {
    id: 1,
    title: 'Parsing Document Structure',
    subtitle: 'Extracting headers, tables, legal clauses, and AST nodes',
    durationMs: 800,
    logMessage: 'Docling OCR engine parsed 18 pages. Found 44 semantic headers and 6 tables.',
  },
  {
    id: 2,
    title: 'Semantic Chunking & Embedding',
    subtitle: 'Generating 512-token chunks with 64-token sliding window',
    durationMs: 1000,
    logMessage: 'Computed 72 embeddings via text-embedding-3-large (dim=3072). Norm check passed.',
  },
  {
    id: 3,
    title: 'Retrieving Relevant Policy Clauses',
    subtitle: 'Cosine similarity ranking against target SOP objective',
    durationMs: 900,
    logMessage: 'Matched 4 high-confidence clauses (similarity >= 0.88): Sec 2.1, Sec 3.2, Sec 4.4, Sec 6.1.',
  },
  {
    id: 4,
    title: 'Synthesizing Actionable Steps',
    subtitle: 'Grounding instructions with strict inline citations',
    durationMs: 1100,
    logMessage: 'LLM generated 5 verifiable SOP actions with 100% citation grounding.',
  }
];
