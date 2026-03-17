# Requirements Document: Seller Enhancements

## Introduction

This requirements document specifies the functional requirements for four critical enhancements to the Rebuy seller system: Payment Options System, Discounts and Promotions, Admin Approval Workflow, and Condition Verification System. These features will enable sellers to offer flexible payment methods, create promotional campaigns, ensure marketplace quality through administrative oversight, and build trust through buyer verification of product conditions.

## Glossary

- **System**: The Rebuy marketplace platform
- **Seller**: A registered user who lists products for sale
- **Admin**: An administrative user with approval and moderation privileges
- **Customer**: A buyer who purchases products from sellers
- **Product**: An item listed for sale by a seller
- **Payment_Option**: A method of payment accepted for a product (COD, eSewa, Khalti, card, online)
- **Discount**: A promotional price reduction with time-based validity
- **Trust_Score**: A calculated metric (0-100) representing seller reliability based on condition verifications
- **Condition_Verification**: A buyer's confirmation that a received product matches its description
- **Approval_Status**: The state of a seller or product in the admin review process (Pending, Approved, Rejected, Suspended)

## Requirements

### Requirement 1: Payment Options Management

**User Story:** As a seller, I want to configure multiple payment methods for my products, so that I can offer customers flexible payment choices and increase sales.

#### Acceptance Criteria

1. WHEN a seller creates or edits a product, THE System SHALL allow selection of one to four payment options from the available list
2. THE System SHALL validate that at least one payment option is selected for every product
3. THE System SHALL support the following payment options: COD, online, eSewa, Khalti, and card
4. WHEN a customer views a product, THE System SHALL display all available payment options for that product
5. THE System SHALL prevent duplicate payment options from being added to a single product

### Requirement 2: Discount and Promotion System

**User Story:** As a seller, I want to create time-limited discounts on my products, so that I can run promotional campaigns and attract more buyers.

#### Acceptance Criteria

1. WHEN a seller creates a discount, THE System SHALL require a percentage value between 0 and 100
2. WHEN a seller creates a discount, THE System SHALL require a start date that is before the end date
3. WHEN a discount is active and the current date is within the discount period, THE System SHALL calculate and display the discounted price
4. WHEN displaying a discounted product, THE System SHALL show both the original price and the discounted price
5. WHEN a discount period ends, THE System SHALL automatically revert to displaying the original price
6. THE System SHALL round all discounted prices to two decimal places
7. WHEN a customer adds a discounted product to cart, THE System SHALL use the discounted price in the order total

### Requirement 3: Seller Approval Workflow

**User Story:** As an admin, I want to review and approve new sellers before they can list products, so that I can maintain marketplace quality and prevent fraudulent sellers.

#### Acceptance Criteria

1. WHEN a new seller registers, THE System SHALL set their status to "pending"
2. WHILE a seller status is "pending", THE System SHALL prevent that seller from creating products
3. WHEN an admin approves a seller, THE System SHALL change the seller status to "approved" and initialize their trust score to 50
4. WHEN an admin rejects a seller, THE System SHALL change the seller status to "rejected" and record the rejection reason
5. WHEN an admin suspends a seller, THE System SHALL change the seller status to "suspended" and prevent them from creating new products
6. WHEN a seller status changes, THE System SHALL send an email notification to the seller with the status and any admin notes
7. THE System SHALL record the admin ID and timestamp for all approval actions

### Requirement 4: Product Approval Workflow

**User Story:** As an admin, I want to review and approve products before they appear in the marketplace, so that I can ensure product listings meet quality standards.

#### Acceptance Criteria

1. WHEN a seller creates a product, THE System SHALL set the product status to "Pending"
2. WHILE a product status is "Pending", THE System SHALL exclude that product from customer search results
3. WHEN a product is created, THE System SHALL send email notifications to admins and the seller
4. WHEN an admin approves a product, THE System SHALL change the product status to "Approved" and make it visible to customers
5. WHEN an admin rejects a product, THE System SHALL change the product status to "Rejected" and record the rejection reason
6. WHEN a product status changes, THE System SHALL send an email notification to the seller
7. THE System SHALL record the admin ID and timestamp for all product approval actions
8. IF a product status is not "Pending", THEN THE System SHALL prevent admin approval or rejection actions

### Requirement 5: Condition Verification System

**User Story:** As a customer, I want to verify that received products match their descriptions, so that I can provide feedback and help other buyers make informed decisions.

#### Acceptance Criteria

1. WHEN an order status is "Delivered", THE System SHALL allow the customer to submit a condition verification
2. THE System SHALL require the customer to indicate whether the product matches the description (yes, no, or partially)
3. THE System SHALL require a condition rating between 1 and 5
4. WHEN a customer submits a verification, THE System SHALL record the verification timestamp, rating, and feedback
5. IF an order is already verified, THEN THE System SHALL prevent duplicate verification submissions
6. IF an order status is not "Delivered", THEN THE System SHALL reject verification attempts
7. WHEN a verification is submitted, THE System SHALL send an email notification to the seller with the verification result

### Requirement 6: Trust Score Calculation

**User Story:** As a system administrator, I want seller trust scores to be automatically calculated based on condition verifications, so that buyers can assess seller reliability.

#### Acceptance Criteria

1. WHEN a seller is approved, THE System SHALL initialize their trust score to 50
2. WHEN a condition verification is submitted, THE System SHALL update the seller's trust score based on the verification result
3. THE System SHALL calculate trust score as: (positive × 1.0 + partial × 0.5 + negative × 0.0) / total × 100
4. THE System SHALL ensure trust scores remain between 0 and 100
5. THE System SHALL maintain counts of positive, partial, and negative verifications for each seller
6. THE System SHALL ensure total verifications equals the sum of positive, partial, and negative verifications
7. WHEN a trust score is updated, THE System SHALL record the update timestamp
8. WHEN displaying a seller profile, THE System SHALL show the current trust score

### Requirement 7: Dispute Management

**User Story:** As a customer, I want to raise a dispute when a product doesn't match its description, so that I can seek resolution for problematic orders.

#### Acceptance Criteria

1. WHEN a verification indicates the product doesn't match the description (no or partially), THE System SHALL allow the customer to raise a dispute
2. WHEN a customer raises a dispute, THE System SHALL require a reason and at least one piece of evidence
3. WHEN a dispute is created, THE System SHALL send email notifications to the admin and the seller
4. THE System SHALL record the dispute status as "pending" when created
5. THE System SHALL allow admins to update dispute status to "resolved" or "rejected"
6. WHEN a dispute is resolved, THE System SHALL send email notifications to the customer and seller with the resolution details
7. IF a verification result is "yes", THEN THE System SHALL not allow dispute creation

### Requirement 8: Email Notification System

**User Story:** As a user of the system, I want to receive email notifications for important events, so that I stay informed about status changes and actions requiring my attention.

#### Acceptance Criteria

1. WHEN a seller creates a product, THE System SHALL send an email to admins notifying them of a pending product
2. WHEN a seller creates a product, THE System SHALL send a confirmation email to the seller
3. WHEN an admin approves or rejects a seller, THE System SHALL send an email to the seller with the decision and any notes
4. WHEN an admin approves or rejects a product, THE System SHALL send an email to the seller with the decision and any notes
5. WHEN a customer submits a condition verification, THE System SHALL send an email to the seller with the verification result
6. WHEN a customer raises a dispute, THE System SHALL send emails to both the admin and the seller
7. IF email sending fails, THEN THE System SHALL log the error and continue with database operations
8. THE System SHALL implement a retry mechanism for failed email deliveries

### Requirement 9: Data Validation and Security

**User Story:** As a system administrator, I want all user inputs to be validated and sanitized, so that the system remains secure and data integrity is maintained.

#### Acceptance Criteria

1. THE System SHALL validate that payment options are from the allowed list before saving
2. THE System SHALL validate that discount percentages are between 0 and 100
3. THE System SHALL validate that discount start dates are before end dates
4. THE System SHALL validate that condition ratings are between 1 and 5
5. THE System SHALL sanitize all text inputs to prevent XSS attacks
6. THE System SHALL validate email addresses before sending notifications
7. THE System SHALL implement rate limiting on verification and dispute submissions
8. THE System SHALL validate that only approved sellers can create products

### Requirement 10: Admin Dashboard Interface

**User Story:** As an admin, I want a dashboard to view and manage pending sellers and products, so that I can efficiently perform approval tasks.

#### Acceptance Criteria

1. WHEN an admin accesses the dashboard, THE System SHALL display a list of pending sellers
2. WHEN an admin accesses the dashboard, THE System SHALL display a list of pending products
3. THE System SHALL display seller information including name, email, store name, and registration date
4. THE System SHALL display product information including name, seller, price, category, and submission date
5. WHEN an admin selects a pending seller, THE System SHALL provide options to approve, reject, or add notes
6. WHEN an admin selects a pending product, THE System SHALL provide options to approve, reject, or add notes
7. THE System SHALL implement pagination for pending items lists with 20 items per page
8. THE System SHALL sort pending items by creation date with newest first
