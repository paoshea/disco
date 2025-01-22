# Disco Platform User Flows

This document outlines the various user flows and interactions available on the Disco platform, providing a comprehensive guide to the user journey and available features.

Here's how the user matching/hookup flow works in the MVP:

- Location Tracking:
Users start on the /matching page
Location tracking begins automatically
Users can toggle background tracking on/off
Location data is cached and updated periodically
- Match Finding:
System uses MatchingService to find potential matches
Matches are found based on:
Location proximity (using Redis for caching)
User preferences (age range, distance, interests)
Verification status
Activity compatibility
Time window compatibility
- Match Presentation:
Users can view matches in two ways:
List view (default)
Map view
Each match shows:
Basic user info
Distance
Compatibility score
Verification status
- Match Actions:
Users can:
Accept matches
Decline matches
Block users
When a match is accepted:
Both users are notified
Chat becomes available
Match status is updated
- Real-time Updates:
WebSocket connection maintains real-time updates
New matches appear instantly
Match status changes are reflected immediately
Location updates are synced in real-time


## 1. Authentication Flows

### 1.1 Sign Up
1. User visits the signup page (`/signup`)
2. Fills out the registration form with:
   - Email address
   - Password (must contain at least 8 characters, one uppercase, one lowercase, and one number)
   - First Name
   - Last Name
3. Upon successful submission:
   - Account is created
   - Verification email is sent
   - User is redirected to the chat page
   - Success notification is displayed

### 1.2 Login
1. User visits the login page (`/login`)
2. Enters their credentials:
   - Email address
   - Password
3. Upon successful login:
   - User is authenticated
   - Redirected to the chat page
   - Success notification is displayed

### 1.3 Password Reset
1. User clicks "Forgot Password" on the login page
2. Enters their email address
3. Receives a password reset link via email
4. Clicks the link and sets a new password
5. Can then log in with the new password

### 1.4 Email Verification
1. After signup, user receives a verification email
2. Clicks the verification link
3. Email is marked as verified in the system
4. Can access all platform features

## 2. Profile Management

### 2.1 View Profile
1. User navigates to profile page
2. Can view their:
   - Profile information
   - Account settings
   - Emergency contacts

### 2.2 Edit Profile
1. User can update:
   - First and Last name
   - Profile picture
   - Other personal information
2. Changes are saved immediately
3. Success notification is displayed

### 2.3 Emergency Contacts
1. User can add emergency contacts with:
   - Name
   - Email
   - Phone number
2. Can edit or remove existing contacts
3. Changes are confirmed with notifications

## 3. Chat Features

### 3.1 Chat Interface
1. User accesses the chat page
2. Can view:
   - List of conversations
   - Active chat window
   - Online status of other users

### 3.2 Starting a Chat

1. User can:
   - Select an existing conversation
   - Start a new conversation
   - Search for other users
2. Messages are delivered in real-time
3. Notifications for new messages

## 4. Safety Features

### 4.1 Safety Check-ins
1. User can set up regular safety check-ins
2. Receives reminders at scheduled times
3. Must respond to confirm safety
4. Emergency contacts are notified if no response

### 4.2 Emergency Alert
1. User can trigger emergency alert
2. Immediately notifies:
   - Emergency contacts
   - Platform support
   - Provides location data (if enabled)

## 5. Matching System

### 5.1 Finding Matches
1. User fills out matching preferences
2. Views potential matches based on:
   - Interests
   - Location
   - Other compatibility factors

### 5.2 Connection Requests
1. User can:
   - Send connection requests
   - Accept/decline incoming requests
   - Block users if needed
2. Notifications for all connection activities

## 6. Privacy and Security

### 6.1 Privacy Settings
1. User can control:
   - Profile visibility
   - Contact information sharing
   - Location sharing preferences

### 6.2 Account Security
1. Can enable/disable:
   - Two-factor authentication
   - Login notifications
   - Device management

## 7. Support and Help

### 7.1 Help Center
1. Access to:
   - FAQs
   - User guides
   - Safety resources
   - Contact support

### 7.2 Reporting Issues
1. Can report:
   - Technical problems
   - User concerns
   - Safety issues
2. Receives confirmation and follow-up

## 8. Account Management

### 8.1 Account Settings
1. User can:
   - Update email
   - Change password
   - Manage notifications
   - Set communication preferences

### 8.2 Account Deactivation
1. Option to:
   - Temporarily deactivate account
   - Permanently delete account
2. Data handling preferences
3. Confirmation process

## 9. Notifications

### 9.1 In-App Notifications
- New messages
- Connection requests
- Safety check-in reminders
- System announcements

### 9.2 Email Notifications
- Account security alerts
- Important updates
- Safety check-in reminders
- Marketing communications (optional)

## 10. Mobile Experience

### 10.1 Mobile Web
- Responsive design
- Touch-friendly interface
- Push notifications
- Location services

## 11. Accessibility

### 11.1 Accessibility Features
- Screen reader support
- Keyboard navigation
- High contrast mode
- Font size adjustment

Note: This document will be updated as new features are added or existing ones are modified. Users should refer to the in-app help center for the most current information and detailed guides for each feature.
