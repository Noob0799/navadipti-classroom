# Nava Dipti Classroom
## Introduction
Nava Dipti Classroom is a responsive Webapp built using the PERN (Postgres-ExpressJS-ReactJS-NodeJS) stack with Firebase for storing images and Heroku for deployment and hosting. Aim of this app is to provide the teachers and students of Nava Dipti School an application for exchanging classworks, homeworks, syllabus and announcements as part of the Work-From-Home or even Hybrid education model.
## Overview
- The webapp has 3 main users, hence 3 specified roles - Principal, Teacher and Student. The app uses JWT token for authorization purpose.
- The app has 4 major components:
  1. Task - This component is used to set, view and submit classworks and/or homeworks
  2. Syllabus - This component is used to set, view syllabus
  3. Announcement - This component is used to set, view announcements
  4. Register - This component is used to register new users like teachers and/or students as well as to view and/or delete existing users except the principal. This component can only be accessed by the principal
- Each component has Create and View tabs for creating and viewing respectively. The view screen has filter features as well to filter through the responses.
- Attached below are few screens of the app viewed through web browser.  
### Welcome page
![image](https://user-images.githubusercontent.com/47937826/183489736-c039014a-ad89-4dd0-879a-2d0a74952981.png)
### Teacher Login Modal
![image](https://user-images.githubusercontent.com/47937826/183492001-9db722b7-efb4-4dbb-a945-3fae1a29593e.png)
### Successful login
![image](https://user-images.githubusercontent.com/47937826/183492108-f0bc0472-4b8f-4c44-afdc-e197ccee0311.png)
### Landing page showing the available components
![image](https://user-images.githubusercontent.com/47937826/183492185-9ca11c87-cbb9-4f38-a334-4fe480154438.png)
### Syllabus Create screen
![image](https://user-images.githubusercontent.com/47937826/183492359-80965781-2c1a-411c-9adb-f31b7a8c3134.png)
### Task View screen showing task list with delete option available to only teacher/principal
![image](https://user-images.githubusercontent.com/47937826/183492487-d89d7c04-8c1d-4dfd-be01-20532158913d.png)
### Task View screen with open Accordion showing the Images button
![image](https://user-images.githubusercontent.com/47937826/183492988-7a824fcf-1201-48f4-a3fd-79423e356be2.png)
### Modal showing uploaded images as part of task on clicking on the Images button
![image](https://user-images.githubusercontent.com/47937826/183493159-18c6b7fd-8b0f-4fc0-a710-778f928cd820.png)
### Student Task View screen showing Submit button for the Task and the image upload and submission modal that opens up on clicking it
![image](https://user-images.githubusercontent.com/47937826/183493464-1a9ea2e9-e71f-422d-9c28-107ea8557738.png)
### Submitted button shows the images submitted by the student
![image](https://user-images.githubusercontent.com/47937826/183493608-0814272a-141e-48c9-8096-be2893d2bce1.png)
### Students can see only their submissions but teacher/principal can see everybody's submissions
![image](https://user-images.githubusercontent.com/47937826/183493801-8c4394e8-667d-406c-ae58-18206f6bf36f.png)
### Filter screen
![image](https://user-images.githubusercontent.com/47937826/183492674-407fc229-e346-4d60-908e-d71f602ee0aa.png)
