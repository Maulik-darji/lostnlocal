# LostnLocal Authentication Setup Guide

## Prerequisites
- XAMPP installed and running
- Apache and MySQL services started
- PHP 7.4+ (included with XAMPP)

## Setup Steps

### 1. Start XAMPP Services
1. Open XAMPP Control Panel
2. Start **Apache** service
3. Start **MySQL** service
4. Verify both services are running (green status)

### 2. Database Setup
1. Open your browser and go to: `http://localhost/lostnlocal/setup-database.php`
2. This will automatically create the database and tables
3. Alternative: Import `database/schema.sql` manually in phpMyAdmin

### 3. Configuration
The system uses these default settings:
- **Database**: `lostnlocal_db`
- **Username**: `root`
- **Password**: (empty - default XAMPP)
- **Host**: `localhost`

### 4. Test the System
1. **Test API**: Visit `http://localhost/lostnlocal/api/test-simple.php`
2. **Test Login**: Visit `http://localhost/lostnlocal/auth.html`

### 5. Default Admin Account
- **Email**: `admin@lostnlocal.com`
- **Password**: `admin123`
- **Admin Code**: `#14224#`

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Test Endpoints
- `GET /api/test-simple.php` - API connectivity test

## File Structure
```
lostnlocal/
├── api/
│   ├── auth/
│   │   ├── login.php
│   │   ├── signup.php
│   │   ├── profile.php
│   │   └── logout.php
│   ├── index.php
│   └── test-simple.php
├── config/
│   ├── database.php
│   ├── jwt.php
│   └── password.php
├── database/
│   └── schema.sql
├── auth.html
├── auth.js
├── auth-styles.css
├── .htaccess
└── setup-database.php
```

## Security Features
- Password hashing with bcrypt
- JWT token authentication
- Session management
- Activity logging
- CORS protection
- Input validation
- SQL injection prevention

## Troubleshooting

### Database Connection Issues
1. Check if MySQL is running in XAMPP
2. Verify database credentials in `config/database.php`
3. Ensure `lostnlocal_db` database exists

### API Not Working
1. Check Apache error logs
2. Verify `.htaccess` is working
3. Test with `api/test-simple.php`

### Frontend Issues
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check CORS settings

## Development Notes
- JWT secret should be changed in production
- Database password should be set in production
- Enable HTTPS in production
- Regular security updates recommended
