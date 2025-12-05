# aaaa

Identify use cases

Creating an Account

- Actor: Student, Teacher
- Goal: Create a new account with email address and password

Login

- Actor: Student, Teacher
- Goal: Login to the ITS with email address and password and direct student and teachers to relevant main dashboards

Student Dashboard

- Actor: Student
- Goal: Have a place to view over all mastery of each subject in an at a glance way

Student starts an lesson set

- Actor: Student
- Goal: Begin a topic-specific lesson where difficulty adapts to performance.

Student requests a hint

- Actor: Student
- Goal: Receive context-aware hints tailored to current step and history.

Student submits an answer & receives feedback

- Actor: Student
- Goal: Get immediate correctness, explanation, and next-step guidance.

Student views lesson history

- Actor: Student
- Goal: See how you did on old lessons to learn from your mistakes

Teacher views class analytics

- Actor: Teacher
- Goal: View how the students are doing with the curriculum, with graphs, common errors, time on task…

Teacher looks at a single students performance

- Actor: Teacher
- Goal: Look into one student’s attempts, stats, and ML flags.

Teacher creates/edits a custom item

- Actor: Teacher
- Goal: Add or edit a problem with tags, rubric, and correct solution.

Paper Prototyping

**Creating an Account**

- Primary actors – Teacher, Student, System
- Secondary actors – None
- Pre-conditions – None
- Main flow
    - The user will be prompted to enter an email address and a password to create an account
    - The user is asked to specify whether their account is for a student or a teacher
    - System will send the user an email to verify their account
    - The system then stores the valid credentials that the user entered
- Alternate Flow
    - The system notifies the user of an incorrect email format
    - The system will warn the user that the password must meet a certain requirement and clear password field
    - The system will warn the user if an account with that email address already exists

**Logins**

- Primary Actors – Teacher, Student, System
- Secondary Actors – None
- Pre-conditions
    - System is stable
    - Either the teacher or student has created an account
- Main flow
    - Student will enter their username and password to the system
    - Program will verify their credentials in the system
    - The student then reaches the main menu in their account if the entered credentials match the system
- Alternate flow
    - Supports teacher logins
    - System determines an incorrect username/password and informs the user
    - System throws an error and informs the user if something happened (time out)
    - System will prompt the user to enter again and clear the fields
    - System will let the user reset their password if the user has forgotten it.
- Post-conditions – The system runs correctly, the student/teacher has logged into their account.

**Student** starts a lesson set

- Primary Actors – Student, System
- Secondary Actors – Teacher (indirect, if assignment is teacher-assigned)
- Pre-Conditions
    - System is stable and online
    - Student has logged into the system
    - At least one lesson set is available (assigned by teacher or recommended by system)
- Main Flow
    - Student navigates to their dashboard after login.
    - The system displays available lesson sets (assigned or recommended).
    - Student selects a lesson set.
    - The system loads an overview screen showing objectives, estimated time, and adaptive mode status.
    - Student confirms and clicks Start Lesson.
    - The system initializes the lesson attempt, creates a progress record, and loads the first problem at calibrated difficulty.
    - Student begins working on the lesson set.
- Alternate Flows
    - No lesson sets assigned -> The system recommends a lesson set based on student progress or allows browsing all topics.
    - Selected lesson set unavailable (e.g., removed by teacher) -> The system informs the student and returns them to dashboard.
    - Student cancels at overview screen -> The system discards the attempt and returns to dashboard.
- Post Conditions
    - The system is in a stable state.
    - The student is engaged in an active lesson set attempt.
    - Progress tracking for the attempt is started and linked to the student profile.

**Student requests a hint**

- Primary Actors
    - Student
- Secondary Actors
    - System
- Pre-Conditions
    - System is stable
    - Student is logged in
    - Student is engaged in a quiz or interactive activity.
- Main Flow
    1. User is in a quiz or interactive activity and presses the hint button
    2. The system verifies what content and question is currently being presented and uses machine learning algorithm to determine relevant hint
    3. System provides user with the hint
    4. System waits for next user input
- Alternative Flow
    
    2a. User is in a quiz or interactive activity and is inactive for 2 minutes
    
    2b. The systems determines through lack of user inputs that the user is stuck on a question
    
    2c. The system prompts the user and asks if the user would like a hint
    
    2d. Systems follows Main flow if user decides to accept hint
    
    2d. System will prompt user again in 2 minutes if user appears inactive for another 2 minutes
    
- Post Condition
    - System is in stable state
    - Student is engaged in a quiz or interactive activity
    - Hint is predetermined for the user based on current activity and performance in previous material

Student submits an answer & receives feedback

- Primary Actors – Student
- Secondary Actors – Teacher, System
- Pre-Condition
    - The system is stable
    - The student is logged into the system
    - The student has started a quiz and received questions
- Main flow
    - The student selects an answer to the question
    - The student submits the answer by clicking “submit”
    - The system processes the submitted answer
    - The system compares the student’s answer with the correct solution stored
    - The system generates feedback, either correct or incorrect with an explanation
    - The system updates the student’s progress with a result
    - The system displays the next question if available
- Alternate flow
    - Blank submission —- if student submits without selecting an answer the system prompts “Select an answer”
    - Invalid input —- if the answer format is unsupported (like special characters etc) the system displays “Invalid input”
    - Connection loss —- if system loses connection before submission, the system saves answers so student doesn’t lose progress
- Post Condition
    - The system is in stable state
    - The student received feedback on answer
    - The system updated students progress
