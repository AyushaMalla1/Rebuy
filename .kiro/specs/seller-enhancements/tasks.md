# Implementation Plan: Seller Enhancements

## Overview

This implementation plan breaks down the seller enhancements feature into discrete coding tasks. The feature adds four critical capabilities: Payment Options System, Discounts and Promotions, Admin Approval Workflow, and Condition Verification System. Each task builds incrementally on previous work, with testing integrated throughout to ensure correctness.

## Tasks

- [ ] 1. Enhance database models with new fields
  - [x] 1.1 Update Product model with payment options, discount, and approval fields
    - Add paymentOptions array field with validation
    - Add discount object with percentage, dates, and active flag
    - Add status field (Pending/Approved/Rejected) with default 'Pending'
    - Add adminNotes, approvedBy, approvedAt, rejectionReason fields
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 4.1, 4.2_
  
  - [x] 1.2 Update Seller model with trust score and approval data
    - Add trustScore object with score, verification counts, and lastUpdated
    - Add approvalData object with approvedBy, approvedAt, rejectionReason, suspensionReason, adminNotes
    - Update status field to include 'suspended' option
    - _Requirements: 3.1, 3.3, 6.1, 6.5_
  
  - [x] 1.3 Update Order model with condition verification fields
    - Add conditionVerification object with verified, verifiedAt, matchesDescription, conditionRating, customerFeedback, verificationImages
    - Add dispute fields: disputeRaised, disputeReason, disputeEvidence, disputeStatus, disputeResolution, resolvedAt
    - _Requirements: 5.1, 5.2, 5.3, 7.1, 7.2_

- [ ] 2. Implement payment options management
  - [x] 2.1 Create payment options validation functions
    - Write validatePaymentOptions() to check array length (1-4) and valid types
    - Write getAvailableOptions() to return allowed payment types
    - _Requirements: 1.1, 1.2, 9.1_

  - [ ]* 2.2 Write property test for payment options validation
    - **Property 1: Payment Options Validity**
    - **Validates: Requirements 1.1, 1.2, 1.5**
  
  - [x] 2.3 Update product creation endpoint to accept payment options
    - Modify POST /api/products to validate and save paymentOptions
    - Return 400 error if validation fails
    - _Requirements: 1.1, 1.2, 9.1_
  
  - [x] 2.4 Update product display to show payment options
    - Modify product detail page to display available payment methods
    - Update product cards to show payment icons
    - _Requirements: 1.4_

- [ ] 3. Implement discount and promotion system
  - [x] 3.1 Create discount validation and calculation functions
    - Write validateDiscount() to check percentage range and date validity
    - Write calculateDiscountedPrice() to compute final price
    - Write isDiscountActive() to check if discount is currently valid
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 9.2, 9.3_
  
  - [ ]* 3.2 Write property tests for discount calculations
    - **Property 2: Discount Validity**
    - **Property 6: Discount Price Reduction**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.6**
  
  - [x] 3.3 Update product endpoints to handle discounts
    - Modify POST /api/products to accept discount configuration
    - Modify GET /api/products/:id to return calculated discounted price
    - Add validation for discount fields
    - _Requirements: 2.1, 2.2, 9.2, 9.3_
  
  - [x] 3.4 Update product display to show discounts
    - Display original price with strikethrough when discount is active
    - Display discounted price prominently
    - Show discount percentage badge
    - Display discount validity period
    - _Requirements: 2.4, 2.5_
  
  - [x] 3.5 Update cart and checkout to use discounted prices
    - Modify cart calculation to use discounted prices for active discounts
    - Update order creation to record discounted prices
    - _Requirements: 2.7_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement seller approval workflow
  - [ ] 5.1 Create seller approval API endpoints
    - Create GET /api/admin/sellers/pending to fetch pending sellers
    - Create PATCH /api/admin/sellers/:id/approve to approve seller
    - Create PATCH /api/admin/sellers/:id/reject to reject seller
    - Create PATCH /api/admin/sellers/:id/suspend to suspend seller
    - Add admin authentication middleware
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.7_
  
  - [ ] 5.2 Implement seller approval logic
    - Write approveSeller() to update status, initialize trust score to 50
    - Write rejectSeller() to update status and record reason
    - Write suspendSeller() to update status and record reason
    - Validate seller is in correct status before approval/rejection
    - _Requirements: 3.3, 3.4, 3.5, 6.1, 9.8_
  
  - [ ]* 5.3 Write property test for seller approval
    - **Property 3: Seller Approval Prerequisite**
    - **Validates: Requirements 3.1, 3.3, 9.8**
  
  - [ ] 5.4 Update seller registration to set status to 'pending'
    - Modify POST /api/auth/seller-signup to set status: 'pending'
    - Prevent product creation for non-approved sellers
    - _Requirements: 3.1, 3.2_
  
  - [ ] 5.5 Integrate email notifications for seller approval
    - Send email when seller status changes to approved/rejected/suspended
    - Include admin notes and reasons in email
    - _Requirements: 3.6, 8.3_

- [ ] 6. Implement product approval workflow
  - [ ] 6.1 Create product approval API endpoints
    - Create GET /api/admin/products/pending to fetch pending products
    - Create PATCH /api/admin/products/:id/approve to approve product
    - Create PATCH /api/admin/products/:id/reject to reject product
    - Add admin authentication middleware
    - _Requirements: 4.1, 4.4, 4.5, 4.7_
  
  - [ ] 6.2 Implement product approval logic
    - Write approveProduct() to update status, record admin and timestamp
    - Write rejectProduct() to update status and record reason
    - Validate product is in 'Pending' status before approval
    - Validate seller is approved before allowing product approval
    - _Requirements: 4.4, 4.5, 4.8, 9.8_
  
  - [ ]* 6.3 Write property test for product approval
    - **Property 7: Admin Action Traceability**
    - **Validates: Requirements 4.7**
  
  - [ ] 6.4 Update product creation to set status to 'Pending'
    - Modify POST /api/products to set status: 'Pending' by default
    - Return error if seller is not approved
    - _Requirements: 4.1, 9.8_
  
  - [ ] 6.5 Update product queries to filter by status
    - Modify GET /api/products to only return 'Approved' products for customers
    - Allow sellers to see their own products regardless of status
    - _Requirements: 4.2_
  
  - [ ] 6.6 Integrate email notifications for product approval
    - Send email to admin when product is created
    - Send email to seller when product is created (confirmation)
    - Send email to seller when product status changes
    - _Requirements: 4.3, 4.6, 8.1, 8.2, 8.4_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement condition verification system
  - [ ] 8.1 Create condition verification API endpoint
    - Create POST /api/orders/:id/verify-condition endpoint
    - Validate order exists and belongs to authenticated customer
    - Validate order status is 'Delivered'
    - Validate order is not already verified
    - _Requirements: 5.1, 5.5, 5.6_
  
  - [ ] 8.2 Implement condition verification logic
    - Write submitConditionVerification() to save verification data
    - Validate matchesDescription is valid enum value
    - Validate conditionRating is between 1 and 5
    - Record verification timestamp
    - _Requirements: 5.2, 5.3, 5.4, 9.4_
  
  - [ ]* 8.3 Write property test for verification timing
    - **Property 5: Verification Timing**
    - **Validates: Requirements 5.1, 5.6**
  
  - [ ] 8.4 Integrate email notification for verification
    - Send email to seller with verification result
    - Include customer feedback and rating in email
    - _Requirements: 5.7, 8.5_

- [ ] 9. Implement trust score calculation
  - [ ] 9.1 Create trust score calculation function
    - Write calculateTrustScore() using weighted formula
    - Positive verifications: weight 1.0
    - Partial verifications: weight 0.5
    - Negative verifications: weight 0.0
    - Ensure score stays between 0 and 100
    - _Requirements: 6.2, 6.3, 6.4_
  
  - [ ]* 9.2 Write property tests for trust score
    - **Property 4: Trust Score Bounds**
    - **Validates: Requirements 6.3, 6.4, 6.6**
  
  - [ ] 9.3 Update verification endpoint to calculate trust score
    - Call calculateTrustScore() after verification is saved
    - Update seller's trustScore object with new counts and score
    - Record lastUpdated timestamp
    - _Requirements: 6.2, 6.5, 6.7_
  
  - [ ] 9.4 Display trust score on seller profile
    - Show trust score prominently on seller profile page
    - Display verification counts (positive, partial, negative)
    - Show last updated timestamp
    - _Requirements: 6.8_

- [ ] 10. Implement dispute management system
  - [ ] 10.1 Create dispute API endpoints
    - Create POST /api/orders/:id/dispute to raise dispute
    - Create GET /api/admin/disputes to fetch pending disputes
    - Create PATCH /api/admin/disputes/:id/resolve to resolve dispute
    - Add authentication middleware
    - _Requirements: 7.1, 7.5_
  
  - [ ] 10.2 Implement dispute creation logic
    - Write handleDispute() to create dispute record
    - Validate verification result is 'no' or 'partially'
    - Validate reason and evidence are provided
    - Set dispute status to 'pending'
    - _Requirements: 7.1, 7.2, 7.4, 7.7_
  
  - [ ]* 10.3 Write property test for dispute prerequisite
    - **Property 8: Dispute Prerequisite**
    - **Validates: Requirements 7.1, 7.7**
  
  - [ ] 10.4 Integrate email notifications for disputes
    - Send email to admin when dispute is raised
    - Send email to seller when dispute is raised
    - Send email to customer and seller when dispute is resolved
    - _Requirements: 7.3, 7.6, 8.6_

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement admin dashboard interface
  - [ ] 12.1 Create admin dashboard page component
    - Create AdminDashboard component with tabs for sellers and products
    - Add navigation to admin dashboard in App.js
    - Implement admin route protection
    - _Requirements: 10.1, 10.2_
  
  - [ ] 12.2 Implement pending sellers list view
    - Fetch and display pending sellers with pagination
    - Show seller information: name, email, store name, registration date
    - Add approve, reject, and add notes actions
    - Implement sorting by creation date (newest first)
    - _Requirements: 10.1, 10.3, 10.5, 10.8_
  
  - [ ] 12.3 Implement pending products list view
    - Fetch and display pending products with pagination
    - Show product information: name, seller, price, category, submission date
    - Add approve, reject, and add notes actions
    - Implement sorting by creation date (newest first)
    - _Requirements: 10.2, 10.4, 10.6, 10.8_
  
  - [ ] 12.4 Implement pagination for admin lists
    - Add pagination controls with 20 items per page
    - Implement page navigation (previous, next, page numbers)
    - _Requirements: 10.7_

- [ ] 13. Update seller dashboard with new features
  - [ ] 13.1 Add payment options selector to product form
    - Create multi-select component for payment options
    - Display available options: COD, online, eSewa, Khalti, card
    - Validate at least one option is selected
    - _Requirements: 1.1, 1.2_
  
  - [ ] 13.2 Add discount configuration to product form
    - Create discount form fields: percentage, start date, end date, active toggle
    - Add validation for percentage range and date validity
    - Show preview of discounted price
    - _Requirements: 2.1, 2.2_
  
  - [ ] 13.3 Display product approval status
    - Show status badge (Pending/Approved/Rejected) on product list
    - Display admin notes and rejection reason if applicable
    - Show approval timestamp and admin name
    - _Requirements: 4.1, 4.2_
  
  - [ ] 13.4 Display trust score on seller dashboard
    - Show trust score prominently with visual indicator
    - Display verification breakdown (positive, partial, negative)
    - Show recent verifications list
    - _Requirements: 6.8_

- [ ] 14. Update customer-facing pages
  - [ ] 14.1 Update product detail page with payment options
    - Display available payment methods with icons
    - Show payment options in checkout flow
    - _Requirements: 1.4_
  
  - [ ] 14.2 Update product display with discount information
    - Show original price with strikethrough when discount is active
    - Display discounted price prominently
    - Show discount percentage badge
    - Display discount validity period
    - _Requirements: 2.4, 2.5_
  
  - [ ] 14.3 Create condition verification form
    - Add verification form to order detail page for delivered orders
    - Include fields: matches description, condition rating, feedback, image upload
    - Show form only for delivered, unverified orders
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 14.4 Create dispute form
    - Add dispute button to verification form when condition doesn't match
    - Include fields: reason, evidence upload, requested resolution
    - Show only when verification result is 'no' or 'partially'
    - _Requirements: 7.1, 7.2_
  
  - [ ] 14.5 Display seller trust score on product pages
    - Show seller trust score on product detail page
    - Display trust score on seller profile page
    - Add trust score badge to product cards
    - _Requirements: 6.8_

- [ ] 15. Implement email notification service
  - [ ] 15.1 Create email templates
    - Create template for product submission (admin notification)
    - Create template for product submission (seller confirmation)
    - Create template for seller approval/rejection
    - Create template for product approval/rejection
    - Create template for condition verification
    - Create template for dispute notifications
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [ ] 15.2 Implement email sending functions
    - Write sendProductSubmissionEmail() for admin and seller
    - Write sendSellerApprovalEmail() with status and notes
    - Write sendProductApprovalEmail() with status and notes
    - Write sendVerificationEmail() to seller with result
    - Write sendDisputeEmail() to admin and seller
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [ ] 15.3 Implement error handling and retry mechanism
    - Add try-catch blocks for email sending
    - Log errors without blocking database operations
    - Implement retry queue for failed emails
    - _Requirements: 8.7, 8.8_

- [ ] 16. Add validation and security measures
  - [ ] 16.1 Implement input validation middleware
    - Add express-validator rules for all new endpoints
    - Validate payment options against whitelist
    - Validate discount percentage and dates
    - Validate condition rating range
    - Sanitize all text inputs
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ] 16.2 Implement rate limiting
    - Add rate limiting to verification endpoint
    - Add rate limiting to dispute endpoint
    - Add rate limiting to approval endpoints
    - _Requirements: 9.7_
  
  - [ ] 16.3 Add authorization checks
    - Verify only approved sellers can create products
    - Verify only admins can access approval endpoints
    - Verify customers can only verify their own orders
    - Verify sellers can only edit their own products
    - _Requirements: 9.8_

- [ ] 17. Final checkpoint and integration testing
  - [ ] 17.1 Test complete product creation and approval flow
    - Create product as approved seller
    - Verify admin receives notification
    - Approve product as admin
    - Verify product appears in customer search
    - _Requirements: All from Req 1, 2, 4_
  
  - [ ] 17.2 Test seller approval workflow
    - Register new seller
    - Verify status is 'pending'
    - Approve seller as admin
    - Verify trust score initialized
    - Create product as newly approved seller
    - _Requirements: All from Req 3, 6_
  
  - [ ] 17.3 Test condition verification and trust score flow
    - Place order and mark as delivered
    - Submit condition verification
    - Verify trust score updated
    - Verify seller receives notification
    - _Requirements: All from Req 5, 6_
  
  - [ ] 17.4 Test dispute flow
    - Submit negative verification
    - Raise dispute with evidence
    - Verify admin and seller receive notifications
    - Resolve dispute as admin
    - _Requirements: All from Req 7_
  
  - [ ] 17.5 Test discount application
    - Create product with active discount
    - Verify discounted price displayed
    - Add to cart and checkout
    - Verify order uses discounted price
    - _Requirements: All from Req 2_

- [ ] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property tests validate universal correctness properties from the design document
- Integration tests in task 17 validate complete workflows across all components
- All email notifications include error handling to prevent blocking database operations
- Trust score calculation uses weighted formula: (positive × 1.0 + partial × 0.5 + negative × 0.0) / total × 100
