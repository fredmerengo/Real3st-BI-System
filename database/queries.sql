-- View all students
SELECT * FROM Students;

-- View all courses
SELECT * FROM Courses;

-- Student enrollments
SELECT
    s.first_name,
    s.last_name,
    c.course_name
FROM Students s
JOIN Enrollments e
    ON s.student_id = e.student_id
JOIN Courses c
    ON e.course_id = c.course_id;

-- Active memberships
SELECT
    s.first_name,
    s.last_name,
    m.membership_type,
    m.expiry_date
FROM Students s
JOIN Memberships m
    ON s.student_id = m.student_id
WHERE m.status = 'Active';

-- Total revenue
SELECT SUM(amount) AS total_revenue
FROM Payments;

-- Instructor workload
SELECT
    i.full_name,
    COUNT(e.enrollment_id) AS students_assigned
FROM Instructors i
JOIN Enrollments e
    ON i.instructor_id = e.instructor_id
GROUP BY i.full_name;