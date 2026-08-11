from sqlalchemy import create_engine, text
engine = create_engine("postgresql://postgres:Merengo%4020@localhost:5432/real3st_bi")
with engine.connect() as conn:
    result = conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='payments' ORDER BY ordinal_position"))
    print("\n".join(f"{row.column_name} {row.data_type}" for row in result))
