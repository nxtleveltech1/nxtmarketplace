1. Swimlane Process Diagram (Textual / Diagram-Ready)
You can hand this directly to a designer, BPMN tool, or Lucid/Miro/FigJam.
Swimlanes
•	Seller
•	NXT Platform (System)
•	NXT Admin / Verification Team
•	Buyer
•	Courier / Logistics
________________________________________
Swimlane Flow
SELLER
│
├─ Create Listing
│   ├─ Enter description, images, price
│   ├─ Location auto-filled from profile
│   └─ Submit listing
│
└─ Wait for approval
NXT PLATFORM
│
├─ Set Listing Status = SUBMITTED
├─ Lock public visibility
├─ Notify Admin for review
│
└─ Await Admin decision
NXT ADMIN
│
├─ Review seller profile
├─ Review item authenticity (reasonable assessment)
├─ Review pricing vs condition
│
├─ Decision:
│   ├─ REJECT → return to Seller with feedback
│   └─ APPROVE → release listing
NXT PLATFORM
│
├─ Set Listing Status = APPROVED
├─ Publish listing to marketplace
├─ Prompt seller to choose fulfilment option:
│   ├─ Pre-Verification
│   └─ Post-Sale Verification
SELLER
│
├─ Option A: Courier item immediately
│   └─ Send item to NXT location
│
├─ Option B: Wait for sale
│   └─ No immediate action
COURIER / LOGISTICS
│
└─ Deliver item to NXT location (if sent)
NXT ADMIN / TECH TEAM
│
├─ Receive item
├─ Inspect & quality check
├─ Validate authenticity & condition
│
├─ Decision:
│   ├─ FAIL → reject item, notify seller
│   └─ PASS → mark VERIFIED
NXT PLATFORM
│
├─ Apply VERIFIED badge
├─ Enable verified-only filters
BUYER
│
├─ Browse marketplace
├─ Filter by VERIFIED (optional)
├─ Purchase item
NXT PLATFORM
│
├─ If VERIFIED:
│   ├─ Confirm sale
│   ├─ Calculate fees & commissions
│   └─ Initiate outbound courier
│
├─ If NOT VERIFIED:
│   ├─ Mark sale as PENDING_VERIFICATION
│   └─ Notify seller to ship item
COURIER
│
└─ Deliver item to Buyer
NXT PLATFORM
│
├─ Release seller payout (minus commission & costs)
├─ Close transaction
└─ Enable reviews
________________________________________
2. Backend States & Status Enums
This is engineering-ready and aligns directly to DB enums and workflow logic.
________________________________________
Listing Status (listing_status)
DRAFT
SUBMITTED
UNDER_ADMIN_REVIEW
REJECTED
APPROVED
LIVE
________________________________________
Verification Status (verification_status)
NOT_REQUESTED
AWAITING_ITEM
IN_INSPECTION
VERIFIED
FAILED
________________________________________
Sale Status (sale_status)
INITIATED
PENDING_VERIFICATION
CONFIRMED
DISPATCHED
DELIVERED
COMPLETED
CANCELLED
________________________________________
Courier Status (courier_status)
NOT_REQUIRED
AWAITING_PICKUP
IN_TRANSIT
RECEIVED_AT_NXT
DISPATCHED_TO_BUYER
DELIVERED
________________________________________
Financial Status (financial_status)
PENDING
HELD_IN_ESCROW
SETTLED
PAID_OUT
REFUNDED
________________________________________
Seller Reputation Tier (seller_tier)
STANDARD
VERIFIED_SELLER
GOLD_SELLER
________________________________________
3. UX Flows (Seller / Buyer / Admin)
This maps cleanly to screens, routes, and permissions.
________________________________________
Seller UX Flow
Primary Screens
1.	Dashboard
2.	Create Listing
3.	Listing Status Tracker
4.	Sales & Payouts
5.	Messages
Flow
•	Create listing → Submit
•	View status:
o	Submitted
o	Approved / Rejected
•	Choose fulfilment option
•	Receive notifications:
o	Verification required
o	Sale pending
o	Courier instructions
•	Track payout breakdown:
o	Sale price
o	20% commission
o	Courier deductions
•	Receive funds
•	View reviews & reputation score
________________________________________
Buyer UX Flow
Primary Screens
1.	Marketplace
2.	Product Detail Page
3.	Checkout
4.	Order Tracking
5.	Reviews
Flow
•	Browse listings
•	Filter by VERIFIED
•	View verification status clearly
•	Purchase item
•	If pending verification:
o	See clear notice
o	Track verification progress
•	Receive delivery updates
•	Confirm delivery
•	Leave product & seller review
________________________________________
Admin UX Flow
Primary Screens
1.	Admin Review Queue
2.	Seller Profiles
3.	Item Verification Panel
4.	Transaction Monitor
5.	Disputes & Reviews
Flow
•	Review submitted listings
•	Approve / reject with notes
•	Track incoming items
•	Perform inspection
•	Apply VERIFIED badge
•	Monitor pending sales
•	Escalate failed verifications
•	Manage gold seller eligibility
________________________________________
4. Legal T&Cs Language (Platform-Ready)
This is clean, defensible, and marketplace-standard.
________________________________________
Seller Obligations
•	Sellers warrant that all listed items are authentic and accurately described.
•	Sellers agree to submit items for inspection when required by NXT.
•	Sellers bear responsibility for inbound courier costs to NXT facilities.
•	Sellers accept a 20% commission on all completed sales.
________________________________________
Verification Disclaimer
•	Verification represents a reasonable inspection based on visible condition and functionality.
•	NXT does not guarantee manufacturer warranties unless explicitly stated.
•	Verification does not constitute professional certification unless specified.
________________________________________
Buyer Acknowledgements
•	Buyers acknowledge that certain purchases may be pending verification.
•	Transactions remain conditional until verification is completed.
•	Outbound courier costs are the responsibility of the buyer.
________________________________________
Payments & Escrow
•	Funds may be held in escrow until verification and delivery are complete.
•	Seller payouts occur only after successful delivery confirmation.
•	NXT reserves the right to deduct applicable fees and costs prior to payout.
________________________________________
Liability & Limitations
•	NXT acts as a facilitator and quality assurance intermediary.
•	NXT is not liable for latent defects not discoverable through reasonable inspection.
•	Disputes will be handled through the platform’s dispute resolution mechanism.
________________________________________
After-Sales Services
•	Maintenance and repair services are optional and offered at NXT’s discretion.
•	Guarantees, where offered, apply only to verified items and are time-bound.
________________________________________
Termination & Enforcement
•	NXT reserves the right to suspend or remove sellers who breach platform standards.
•	Repeated failed verifications may result in account termination.

