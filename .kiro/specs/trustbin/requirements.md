# Requirements Document

## Introduction

Trustbin is a gamified recycling and sustainability web app built with Next.js that turns responsible waste disposal into an educational, competitive experience. Users scan items to classify them as trash, recycling, or compost; log disposal events at physical bins; and compete on a knowledge-based leaderboard scoped to the ASU (Arizona State University) community. The app builds a trust system that reduces friction for consistent users while maintaining integrity through decay and abuse detection. Smart bins are simulated as a demo dataset managed by an admin, serving as a proof-of-concept for software-layer intelligence added to existing waste infrastructure.

## Glossary

- **App**: The Trustbin Next.js web application
- **User**: A registered ASU community member using the App
- **Admin**: An authorized operator who manages Smart_Bin registrations and reviews flagged accounts
- **Item**: A physical object scanned or logged by the User for classification
- **Classification**: The AI-determined category of an Item — one of: Trash, Recycling, or Compost
- **Disposal_Event**: A logged record of a User disposing of an Item at a Bin
- **Bin**: A physical waste receptacle, either a Smart_Bin or a Standard_Bin
- **Smart_Bin**: A simulated Bin registered in the App's database by an Admin, associated with a QR code and a known ASU campus location
- **Standard_Bin**: A Bin not registered in the App's database, used in manual logging mode
- **QR_Scanner**: The in-app component that reads QR codes from Bins
- **AI_Classifier**: The component that analyzes camera images and returns a Classification for an Item
- **Trust_Score**: A numeric value representing a User's history of correct and consistent disposal behavior
- **Trust_Threshold**: The minimum Trust_Score of 100 points required to unlock tap-to-log mode, representing a knowledgeable and consistent user
- **Streak**: A record of a User meeting the weekly disposal activity minimum for consecutive calendar weeks
- **Streak_Bonus**: Additional Trust_Score points awarded when a User maintains an active Streak
- **Leaderboard**: A ranked list of ASU Users based on quiz performance and disposal activity
- **Quiz**: A set of questions testing a User's knowledge of waste classification, using images of logged Items as the primary format
- **Virtual_Trashcan**: A visual summary of all Items a User has logged, broken down by Classification
- **Impact_Score**: An estimated environmental contribution metric derived from a User's Disposal_Event history
- **Weekly_Minimum**: The minimum number of correct Disposal_Events required per week to maintain Streak eligibility and Leaderboard qualification
- **Flag**: A User-submitted report that an AI_Classifier result was incorrect


## Requirements

### Requirement 1: User Authentication

**User Story:** As a User, I want to create an account and log in with my email and password, so that my disposal history and trust score are saved and associated with my identity.

#### Acceptance Criteria

1. THE App SHALL allow a User to register an account using a valid email address and a password.
2. WHEN a User submits a registration form with a valid email and password, THE App SHALL create a new account and log the User in.
3. IF a User submits a registration form with an email address already associated with an existing account, THEN THE App SHALL display an error message indicating the email is already in use.
4. WHEN a registered User submits valid credentials on the login form, THE App SHALL authenticate the User and grant access to the App.
5. IF a User submits invalid credentials on the login form, THEN THE App SHALL display an error message and deny access.
6. WHEN a User logs out, THE App SHALL end the User's session and redirect to the login page.

---

### Requirement 2: Item Scanning and AI Classification

**User Story:** As a User, I want to scan an item with my camera, so that I know whether to dispose of it as trash, recycling, or compost.

#### Acceptance Criteria

1. WHEN a User activates the camera scan feature, THE AI_Classifier SHALL analyze the captured image and return a Classification of Trash, Recycling, or Compost.
2. WHEN the AI_Classifier returns a Classification, THE App SHALL display the Classification result and a brief explanation to the User within 5 seconds of image capture.
3. IF the AI_Classifier cannot determine a Classification with sufficient confidence, THEN THE App SHALL prompt the User to retake the photo or select a Classification manually.
4. WHEN a User submits a Flag on a Classification, THE App SHALL record the Flag, suspend any Trust_Score penalty for that Disposal_Event, and queue the Flag for Admin review.
5. THE AI_Classifier SHALL support classification of common household, food, and electronic waste item types.

---

### Requirement 3: Disposal Event Logging

**User Story:** As a User, I want to log a disposal event at a bin, so that my recycling activity is recorded and contributes to my progress.

#### Acceptance Criteria

1. WHEN a User scans a QR code on a Smart_Bin, THE App SHALL identify the Bin, cross-reference the Item's Classification with the Bin type, and record a Disposal_Event.
2. WHEN a Disposal_Event is recorded, THE App SHALL provide real-time feedback indicating whether the Item was disposed of in the correct Bin type.
3. WHERE a Smart_Bin location is registered, THE App SHALL display the nearest relevant sustainability resource (such as a water fountain or e-waste drop-off point) associated with that ASU campus location.
4. WHEN a User is not near a registered Smart_Bin, THE App SHALL offer manual logging mode using a Standard_Bin, requiring the User to select the Bin type manually.
5. THE App SHALL determine whether a User is near a Smart_Bin using device location data and the registered Smart_Bin location database.
6. WHEN a Disposal_Event is logged in manual logging mode, THE App SHALL require the User to confirm the Bin type before recording the event.

---

### Requirement 4: Trust Score and Verification System

**User Story:** As a User, I want to build a trust score through consistent correct disposal, so that I can eventually log disposals without needing to photograph every item.

#### Acceptance Criteria

1. THE App SHALL assign every new User a Trust_Score of 0 at account creation.
2. WHEN a User logs a correct Disposal_Event with photo verification, THE App SHALL increment the User's Trust_Score by 10 points.
3. WHEN a User's active Streak is 2 or more weeks, THE App SHALL award a Streak_Bonus of 2 additional Trust_Score points per correct Disposal_Event logged during that Streak period.
4. WHEN a User's Trust_Score reaches or exceeds the Trust_Threshold of 100 points, THE App SHALL unlock tap-to-log mode, removing the photo verification requirement for future Disposal_Events.
5. WHILE a User's Trust_Score is below the Trust_Threshold, THE App SHALL require photo verification for every Disposal_Event.
6. WHEN a User's account has no Disposal_Events recorded for 14 or more consecutive days, THE App SHALL apply a Trust_Score decay of 5 points per day of inactivity beyond that 14-day period, to a minimum Trust_Score of 0.
7. WHEN the App detects a disposal pattern consistent with abuse — defined as more than 20 identical Item classifications logged within a 24-hour period — THE App SHALL flag the account for Admin review and suspend Trust_Score increments until the review is resolved.
8. IF a User submits a Flag on a Classification, THEN THE App SHALL pause Trust_Score penalization for that specific Disposal_Event until the Flag is reviewed by an Admin.

---

### Requirement 5: Streak System

**User Story:** As a User, I want a streak system based on weekly activity, so that I am not penalized for being away from campus on weekends or holidays.

#### Acceptance Criteria

1. THE App SHALL define a Weekly_Minimum of 3 correct Disposal_Events per calendar week (Monday through Sunday).
2. WHEN a User meets the Weekly_Minimum within a calendar week, THE App SHALL increment the User's Streak by one week.
3. WHEN a User does not meet the Weekly_Minimum within a calendar week, THE App SHALL reset the User's Streak to zero.
4. THE App SHALL display the User's current Streak count and the number of correct Disposal_Events logged in the current week on the User's profile.
5. THE Streak system SHALL NOT require Disposal_Events to occur at a specific location to count toward the Weekly_Minimum.

---

### Requirement 6: Quiz and Leaderboard

**User Story:** As a User, I want to answer image-based quiz questions and compete on an ASU leaderboard, so that learning feels personal and competition is tied to real engagement.

#### Acceptance Criteria

1. WHEN a User has logged at least one Disposal_Event, THE App SHALL generate Quiz questions relevant to the Item types the User has scanned.
2. THE App SHALL present Quiz questions in image-based format as the primary quiz type, showing the User an image of a logged Item and asking whether it is Trash, Recycling, or Compost.
3. WHEN a User answers a Quiz question correctly, THE App SHALL increment the User's leaderboard score by 5 points.
4. THE Leaderboard SHALL only display ASU Users who have met the Weekly_Minimum for the current leaderboard period.
5. WHEN a User does not meet the Weekly_Minimum for a leaderboard period, THE App SHALL exclude that User from the Leaderboard ranking for that period.
6. THE App SHALL display the Leaderboard with User rankings, scores, and the current leaderboard period to all authenticated Users.
7. THE App SHALL generate Quiz questions using the classification category, material type, and disposal method associated with the User's logged Items.

---

### Requirement 7: Virtual Trashcan

**User Story:** As a User, I want a visual record of everything I've logged, so that I can see my disposal history broken down by category.

#### Acceptance Criteria

1. THE App SHALL maintain a Virtual_Trashcan for each User containing all logged Disposal_Events.
2. THE Virtual_Trashcan SHALL display logged Items grouped by Classification (Trash, Recycling, Compost).
3. WHEN a User views the Virtual_Trashcan, THE App SHALL display the total count of Items logged per Classification category.
4. THE Virtual_Trashcan SHALL persist across sessions and update in real time when a new Disposal_Event is recorded.

---

### Requirement 8: Impact Visualization

**User Story:** As a User, I want to see the estimated environmental impact of my disposal activity, so that my contribution feels tangible and personally meaningful.

#### Acceptance Criteria

1. THE App SHALL calculate an Impact_Score for each User based on the volume and type of correctly disposed Items.
2. WHEN a User views their Impact_Score, THE App SHALL display it using concrete equivalencies (for example: "You've recycled enough aluminum to make X cans").
3. THE App SHALL contextualize the User's Impact_Score against industrial waste scale to communicate the relationship between individual action and systemic impact.
4. WHEN a new Disposal_Event is recorded, THE App SHALL update the User's Impact_Score in real time.

---

### Requirement 9: Contextual Education

**User Story:** As a User, I want to receive sustainability tips and facts tied to items I've scanned, so that learning feels relevant rather than generic.

#### Acceptance Criteria

1. WHEN the App displays a loading screen, THE App SHALL surface an environmental tip or fact relevant to an Item the User has recently scanned.
2. WHEN a User scans an Item classified as a beverage container, THE App SHALL display the location of the nearest water fountain if one is registered near the User's current ASU campus location.
3. WHEN a User scans an Item classified as electronics or e-waste, THE App SHALL display the nearest registered e-waste drop-off location on ASU campus.
4. THE App SHALL generate educational content contextually from the Classification and material type of the scanned Item.

---

### Requirement 10: Admin — Smart Bin Management

**User Story:** As an Admin, I want to register and manage simulated Smart Bins in the system, so that the app has a demo dataset of campus bin locations without requiring physical hardware.

#### Acceptance Criteria

1. THE App SHALL provide an Admin interface for creating, updating, and deactivating Smart_Bin records.
2. WHEN an Admin creates a Smart_Bin record, THE App SHALL require a bin name, ASU campus location, bin type (Trash, Recycling, or Compost), and an associated QR code identifier.
3. WHEN an Admin deactivates a Smart_Bin, THE App SHALL prevent new Disposal_Events from being logged against that Bin.
4. THE App SHALL display all registered Smart_Bins and their status in the Admin interface.
5. WHEN an Admin reviews a flagged account, THE App SHALL allow the Admin to clear the flag and resume Trust_Score increments, or permanently suspend the account.

---

### Requirement 11: Anti-Abuse Safeguards

**User Story:** As a system operator, I want the scoring system to reward correct disposal decisions and knowledge rather than raw volume, so that the leaderboard reflects genuine engagement.

#### Acceptance Criteria

1. THE App SHALL NOT increment a User's leaderboard score for Disposal_Events that exceed the abuse detection threshold defined in Requirement 4.7.
2. THE Leaderboard SHALL require Users to meet the Weekly_Minimum to qualify, as defined in Requirement 6.4.
3. THE App SHALL apply Trust_Score decay for inactivity as defined in Requirement 4.6, preventing long-term abuse by previously trusted accounts.
4. THE App SHALL NOT award Impact_Score credit for Items classified as Trash when disposed of in a Trash Bin, as trash generation is not a positive environmental action.
5. WHEN a User's account is flagged for abuse review, THE App SHALL notify the User that their account is under review and suspend leaderboard score increments until the Admin resolves the review.
