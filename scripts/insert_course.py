from sqlalchemy import create_engine, text
engine = create_engine("postgresql://postgres:Merengo%4020@localhost:5432/real3st_bi")
with engine.begin() as conn:
    conn.execute(text("INSERT INTO courses (course_name, category, duration_days, price) VALUES ('Security D and G', 'Security', 68, 150.00);"))
print('Inserted successfully')
