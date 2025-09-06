# Course Platform API Documentation

## Overview
This API provides comprehensive functionality for an educational course platform with mentorship features.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 🔐 Authentication (`/api/auth`)

#### Register User
- **POST** `/auth/register`
- **Body**: `{ firstName, lastName, email, password, role }`
- **Roles**: `educator`, `student`, `ta`

#### Login User
- **POST** `/auth/login`
- **Body**: `{ email, password }`

#### Get Profile
- **GET** `/auth/profile`
- **Auth**: Required

#### Update Profile
- **PUT** `/auth/profile`
- **Auth**: Required
- **Body**: `{ firstName, lastName, bio, profilePicture }`

#### Get All Students
- **GET** `/auth/students`
- **Auth**: Required (TAs and educators)

---

### 📚 Courses (`/api/courses`)

#### Create Course
- **POST** `/courses`
- **Auth**: Required (educators only)
- **Body**: `{ title, description, category, difficulty, price, thumbnail }`

#### Get All Courses
- **GET** `/courses`
- **Query**: `?category=<category>&difficulty=<level>&search=<term>`

#### Get Course by ID
- **GET** `/courses/:id`

#### Update Course
- **PUT** `/courses/:id`
- **Auth**: Required (course educator)

#### Enroll in Course
- **POST** `/courses/:id/enroll`
- **Auth**: Required (students only)

#### Assign TA to Course
- **POST** `/courses/:id/assign-ta`
- **Auth**: Required (course educator)
- **Body**: `{ taId, studentIds }`

#### Get Courses by Educator
- **GET** `/courses/educator/:educatorId`

#### Get Enrolled Courses
- **GET** `/courses/student/enrolled`
- **Auth**: Required (students only)

#### Publish/Unpublish Course
- **PATCH** `/courses/:id/publish`
- **Auth**: Required (course educator)

---

### 🎥 Lectures (`/api/lectures`)

#### Create Lecture
- **POST** `/lectures`
- **Auth**: Required (course educator)
- **Body**: `{ title, description, courseId, videoUrl, duration, order, transcript }`

#### Get Course Lectures
- **GET** `/lectures/course/:courseId`

#### Get All Course Lectures (including unpublished)
- **GET** `/lectures/course/:courseId/all`
- **Auth**: Required (course educator)

#### Get Single Lecture
- **GET** `/lectures/:id`

#### Update Lecture
- **PUT** `/lectures/:id`
- **Auth**: Required (course educator)

#### Delete Lecture
- **DELETE** `/lectures/:id`
- **Auth**: Required (course educator)

#### Publish/Unpublish Lecture
- **PATCH** `/lectures/:id/publish`
- **Auth**: Required (course educator)

#### Reorder Lectures
- **PATCH** `/lectures/course/:courseId/reorder`
- **Auth**: Required (course educator)
- **Body**: `{ lectureIds }`

---

### 📄 Documents (`/api/documents`)

#### Create Document
- **POST** `/documents`
- **Auth**: Required (course educator)
- **Body**: `{ title, description, courseId, fileUrl, fileType, fileSize, order }`

#### Get Course Documents
- **GET** `/documents/course/:courseId`

#### Get All Course Documents (including unpublished)
- **GET** `/documents/course/:courseId/all`
- **Auth**: Required (course educator)

#### Get Single Document
- **GET** `/documents/:id`

#### Update Document
- **PUT** `/documents/:id`
- **Auth**: Required (course educator)

#### Delete Document
- **DELETE** `/documents/:id`
- **Auth**: Required (course educator)

#### Publish/Unpublish Document
- **PATCH** `/documents/:id/publish`
- **Auth**: Required (course educator)

#### Reorder Documents
- **PATCH** `/documents/course/:courseId/reorder`
- **Auth**: Required (course educator)
- **Body**: `{ documentIds }`

---

### 🤝 Mentorship (`/api/mentorship`)

#### Create Session
- **POST** `/mentorship`
- **Auth**: Required (TA or student)
- **Body**: `{ taId, studentId, courseId, title, description, sessionType, scheduledAt, duration, meetingLink }`

#### Get My Sessions
- **GET** `/mentorship/my-sessions`
- **Auth**: Required (TA or student)
- **Query**: `?status=<status>&upcoming=true`

#### Get Course Sessions
- **GET** `/mentorship/course/:courseId`
- **Auth**: Required (course participants)

#### Get Single Session
- **GET** `/mentorship/:id`
- **Auth**: Required (session participants)

#### Update Session
- **PUT** `/mentorship/:id`
- **Auth**: Required (session participants)

#### Cancel Session
- **PATCH** `/mentorship/:id/cancel`
- **Auth**: Required (session participants)

#### Complete Session
- **PATCH** `/mentorship/:id/complete`
- **Auth**: Required (TA only)
- **Body**: `{ notes }`

#### Rate Session
- **PATCH** `/mentorship/:id/rate`
- **Auth**: Required (session participants)
- **Body**: `{ rating, feedback }`

#### Get TA Availability
- **GET** `/mentorship/ta/:taId/availability`
- **Query**: `?date=YYYY-MM-DD`

---

### 📊 Progress (`/api/progress`)

#### Get Course Progress
- **GET** `/progress/course/:courseId`
- **Auth**: Required (students only)

#### Update Lecture Watch Progress
- **POST** `/progress/lecture/:lectureId/watch`
- **Auth**: Required (students only)
- **Body**: `{ watchTime, isCompleted }`

#### Mark Document as Viewed
- **POST** `/progress/document/:documentId/view`
- **Auth**: Required (students only)

#### Get All Progress
- **GET** `/progress/my-progress`
- **Auth**: Required (students only)

#### Get Course Analytics
- **GET** `/progress/course/:courseId/analytics`
- **Auth**: Required (course educator)

---

### 📝 Assignments (`/api/assignments`)

#### Create Assignment
- **POST** `/assignments`
- **Auth**: Required (course educator)
- **Body**: `{ title, description, courseId, dueDate, maxMarks, instructions, attachments }`

#### Get Course Assignments
- **GET** `/assignments/course/:courseId`
- **Auth**: Required (course participants)

#### Get Single Assignment
- **GET** `/assignments/:id`
- **Auth**: Required (course participants)

#### Submit Assignment
- **POST** `/assignments/:id/submit`
- **Auth**: Required (students only)
- **Body**: `{ files }`

#### Grade Assignment
- **POST** `/assignments/:id/grade`
- **Auth**: Required (course educator)
- **Body**: `{ studentId, marks, feedback }`

#### Update Assignment
- **PUT** `/assignments/:id`
- **Auth**: Required (course educator)

#### Delete Assignment
- **DELETE** `/assignments/:id`
- **Auth**: Required (course educator)

#### Publish/Unpublish Assignment
- **PATCH** `/assignments/:id/publish`
- **Auth**: Required (course educator)

#### Get Assignment Submissions
- **GET** `/assignments/:id/submissions`
- **Auth**: Required (course educator)

---

## 🏥 Health Check
- **GET** `/api/health`
- Returns API status and timestamp

## Error Responses
All endpoints return errors in this format:
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
