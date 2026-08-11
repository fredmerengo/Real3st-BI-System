from sqlalchemy import create_engine, text
engine = create_engine("postgresql://postgres:Merengo%4020@localhost:5432/real3st_bi")
with engine.connect() as conn:
    try:
        result = conn.execute(text("SELECT p.payment_id, p.course_id, c.course_name, p.student_id, s.first_name, s.last_name, p.amount, p.payment_date, p.payment_method FROM payments p JOIN students s ON p.student_id = s.student_id LEFT JOIN courses c ON p.course_id = c.course_id ORDER BY p.payment_id"))
        rows = list(result)
        print('OK', len(rows))
        for row in rows[:5]:
            print(dict(row._mapping))
    except Exception as e:
        print('ERROR', type(e).__name__, e)
