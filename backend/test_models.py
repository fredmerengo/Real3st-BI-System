from db_connection import engine
from models import Student
from sqlalchemy.orm import Session

with Session(engine) as session:
    students = session.query(Student).all()

    for student in students:
        print(
            student.student_id,
            student.first_name,
            student.last_name,
            student.email
        )