# ERP Amazonia — Guía de instalación

## Requisitos
- Node.js 18 o superior
- PostgreSQL 14 o superior

---

## 1. Instalar dependencias

```bash
npm install
```

---

## 2. Configurar la base de datos (PostgreSQL)

### En Windows
1. Descargar e instalar PostgreSQL desde https://www.postgresql.org/download/windows/
2. Durante la instalación, anotar la contraseña que le pones al usuario `postgres`
3. Abrir **pgAdmin** o **SQL Shell (psql)** y crear la base de datos:
   ```sql
   CREATE DATABASE erp_amazonia;
   ```

### En Linux/Mac
```bash
pg_ctlcluster 16 main start   # o: sudo service postgresql start
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'erp123';"
sudo -u postgres psql -c "CREATE DATABASE erp_amazonia;"
```

---

## 3. Crear el archivo .env

Copiar `.env.example` como `.env` y completar con tus datos:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux / Mac
cp .env.example .env
```

Luego editar `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=la_contraseña_que_pusiste_al_instalar
DB_NAME=erp_amazonia
PORT=3001
```

---

## 4. Crear las tablas e insertar datos iniciales

```bash
npm run setup:db
```

---

## 5. Ejecutar la aplicación

Necesitas **dos terminales**:

```bash
# Terminal 1 — Backend (API)
npm run server:dev

# Terminal 2 — Frontend
npm run dev
```

Abrir en el navegador: http://localhost:3000

**Usuario demo:** admin@empresa.com / admin123

---

## Si PostgreSQL se apaga (reinicio del PC)

```bash
# Windows: abrir Services y reiniciar "postgresql-x64-16"
# O desde PowerShell como administrador:
net start postgresql-x64-16

# Linux:
pg_ctlcluster 16 main start
```
