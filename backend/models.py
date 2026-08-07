from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    ForeignKey,
    Numeric,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class Student(Base):
    __tablename__ = "students"

    student_id = Column(Integer, primary_key=True)
    first_name = Column(String(50))
    last_name = Column(String(50))
    gender = Column(String(10))
    date_of_birth = Column(Date)
    phone = Column(String(20))
    email = Column(String(100))
    address = Column(String(255))
    registration_date = Column(Date)

    enrollments = relationship("Enrollment", back_populates="student")
    payments = relationship("Payment", back_populates="student")


class Course(Base):
    __tablename__ = "courses"

    course_id = Column(Integer, primary_key=True)
    course_name = Column(String(100))
    duration = Column(String(50))
    fee = Column(Numeric)

    enrollments = relationship("Enrollment", back_populates="course")


class Enrollment(Base):
    __tablename__ = "enrollments"

    enrollment_id = Column(Integer, primary_key=True)

    student_id = Column(Integer, ForeignKey("students.student_id"))
    course_id = Column(Integer, ForeignKey("courses.course_id"))

    enrollment_date = Column(Date)
    status = Column(String(20))

    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(Integer, primary_key=True)

    student_id = Column(Integer, ForeignKey("students.student_id"))

    amount = Column(Numeric)
    payment_date = Column(Date)
    payment_method = Column(String(30))

    student = relationship("Student", back_populates="payments")