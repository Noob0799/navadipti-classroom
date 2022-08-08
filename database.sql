CREATE DATABASE navadipticlassroom;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE student(
    student_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_name VARCHAR(255) NOT NULL,
    student_class VARCHAR(255) NOT NULL,
    student_roll SMALLINT NOT NULL,
    student_phone BIGINT NOT NULL UNIQUE,
    student_password VARCHAR(255) NOT NULL
);

CREATE TABLE teacher(
    teacher_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_role VARCHAR(255) NOT NULL,
    teacher_name VARCHAR(255) NOT NULL,
    teacher_phone BIGINT NOT NULL UNIQUE,
    teacher_password VARCHAR(255) NOT NULL
);

CREATE TABLE images(
    image_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_name VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL
);

CREATE TABLE syllabus(
    syllabus_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    class VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    term VARCHAR(255) NOT NULL,
    instructions text NOT NULL
);

CREATE TABLE syllabusimages(
    syllabus_image_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    syllabus_id uuid NOT NULL references syllabus(syllabus_id) ON DELETE CASCADE,
    image_id uuid NOT NULL references images(image_id) ON DELETE CASCADE
);

CREATE TABLE task(
    task_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    class VARCHAR(255) NOT NULL,
    task_type VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    term VARCHAR(255) NOT NULL,
    due_date date NOT NULL,
    instructions text NOT NULL
);

CREATE TABLE taskimages(
    task_image_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id uuid NOT NULL references task(task_id) ON DELETE CASCADE,
    image_id uuid NOT NULL references images(image_id) ON DELETE CASCADE
);

CREATE TABLE completedtaskimages(
    task_image_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id uuid NOT NULL references task(task_id) ON DELETE CASCADE,
    image_id uuid NOT NULL references images(image_id) ON DELETE CASCADE,
    student_id uuid NOT NULL references student(student_id) ON DELETE CASCADE
);

CREATE TABLE announcement(
    announcement_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    class VARCHAR(255) NOT NULL,
    announcement_date date NOT NULL,
    announcement_time time NOT NULL,
    instructions text NOT NULL
);

CREATE TABLE announcementimages(
    announcement_image_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id uuid NOT NULL references announcement(announcement_id) ON DELETE CASCADE,
    image_id uuid NOT NULL references images(image_id) ON DELETE CASCADE
);