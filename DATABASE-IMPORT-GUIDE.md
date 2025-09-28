# LostnLocal Database Setup via phpMyAdmin

## Step-by-Step Database Import

### Option 1: File Import (Recommended)

1. **Start XAMPP Services**
   - Open XAMPP Control Panel
   - Start Apache and MySQL services

2. **Open phpMyAdmin**
   - Go to: `http://localhost/phpmyadmin`
   - Username: `root`
   - Password: (leave empty for default XAMPP)

3. **Create Database**
   - Click "New" in the left sidebar
   - Database name: `lostnlocal_db`
   - Collation: `utf8mb4_unicode_ci`
   - Click "Create"

4. **Import Schema File**
   - Select `lostnlocal_db` database
   - Click "Import" tab
   - Click "Choose File"
   - Select: `C:\xampp\htdocs\lostnlocal\database\schema.sql`
   - Click "Go"

### Option 2: SQL Commands (Copy-Paste)

1. **Open phpMyAdmin** → `http://localhost/phpmyadmin`
2. **Create Database** (if not exists)
   - Click "New" → Database name: `lostnlocal_db`
3. **Select Database** → `lostnlocal_db`
4. **Click "SQL" tab**
5. **Copy entire content** from `database/schema-simple.sql`
6. **Paste into SQL textarea**
7. **Click "Go"**

### Option 3: Automated Setup Script

1. **Run Setup Script**
   - Go to: `http://localhost/lostnlocal/setup-database.php`
   - This will create everything automatically

## Verification Steps

After import, verify the setup:

1. **Check Tables Created**
   - In phpMyAdmin, select `lostnlocal_db`
   - You should see 3 tables: `users`, `user_sessions`, `activity_logs`

2. **Check Admin User**
   - Click on `users` table
   - You should see one record with email: `admin@lostnlocal.com`

3. **Test API**
   - Go to: `http://localhost/lostnlocal/api/test-simple.php`
   - Should show "API is working correctly"

4. **Test Login**
   - Go to: `http://localhost/lostnlocal/auth.html`
   - Try logging in with admin credentials

## Default Admin Account

- **Email**: `admin@lostnlocal.com`
- **Password**: `admin123`
- **Admin Code**: `#14224#`

## Troubleshooting

### Import Errors
- Make sure MySQL service is running
- Check file permissions on schema.sql
- Verify database name is `lostnlocal_db`

### Connection Issues
- Check `config/database.php` settings
- Verify MySQL credentials in XAMPP
- Test connection with `api/test-simple.php`

### Missing Tables
- Re-run the import process
- Check for SQL syntax errors
- Verify database was selected before import
