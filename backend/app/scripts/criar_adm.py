
# scripts/criar_admin.py
from app.db.database import SessionLocal
from app.models.database_models import Usuario
from app.core.security import hash_password

db = SessionLocal()
admin = Usuario(name="João", email="joao@gmail.com", role="admin", hashed_password=hash_password("admin123"))
db.add(admin)
db.commit()
db.close()

print("Admin criado!")