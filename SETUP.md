# LostnLocal PHP/MySQL Setup Instructions

## Prerequisites

Before setting up the LostnLocal website, ensure you have the following installed:

- **PHP 7.4 or higher** (with PDO MySQL extension)
- **MySQL 5.7 or higher** (or MariaDB 10.2+)
- **Web Server** (Apache, Nginx, or PHP built-in server)
- **Composer** (optional, for dependency management)

## Installation Steps

### 1. Database Setup

1. **Create MySQL Database:**
   ```sql
   CREATE DATABASE lostnlocal_db;
   ```

2. **Import Database Schema:**
   ```bash
   mysql -u root -p lostnlocal_db < database/schema.sql
   ```

3. **Create Database User (Optional but Recommended):**
   ```sql
   CREATE USER 'lostnlocal_user'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON lostnlocal_db.* TO 'lostnlocal_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### 2. Configuration Setup

1. **Copy Environment Configuration:**
   ```bash
   cp env.example .env
   ```

2. **Edit Configuration File:**
   Update the `.env` file with your database credentials:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=lostnlocal_user
   DB_PASSWORD=your_secure_password
   DB_NAME=lostnlocal_db
   DB_PORT=3306
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-very-long-and-random
   
   # Admin Configuration
   ADMIN_CODE=#14224#
   ```

3. **Update PHP Configuration:**
   Edit `config/config.php` to use environment variables or update the constants directly.

### 3. File Permissions

1. **Create Logs Directory:**
   ```bash
   mkdir logs
   chmod 755 logs
   ```

2. **Set Proper Permissions:**
   ```bash
   chmod 644 *.php
   chmod 644 config/*.php
   chmod 644 api/*.php
   chmod 644 database/*.sql
   ```

### 4. Web Server Configuration

#### Option A: PHP Built-in Server (Development)
```bash
php -S localhost:8000
```
Then visit: `http://localhost:8000`

#### Option B: Apache Configuration
1. **Enable Required Modules:**
   ```bash
   sudo a2enmod rewrite
   sudo a2enmod headers
   ```

2. **Create Virtual Host:**
   ```apache
   <VirtualHost *:80>
       ServerName lostnlocal.local
       DocumentRoot /path/to/your/lostnlocal
       
       <Directory /path/to/your/lostnlocal>
           AllowOverride All
           Require all granted
       </Directory>
   </VirtualHost>
   ```

3. **Create .htaccess File:**
   ```apache
   RewriteEngine On
   
   # Handle API requests
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^api/(.*)$ api/$1.php [L,QSA]
   
   # Security headers
   Header always set X-Content-Type-Options nosniff
   Header always set X-Frame-Options DENY
   Header always set X-XSS-Protection "1; mode=block"
   ```

#### Option C: Nginx Configuration
```nginx
server {
    listen 80;
    server_name lostnlocal.local;
    root /path/to/your/lostnlocal;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    location /api/ {
        try_files $uri $uri.php$is_args$args;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

### 5. Testing the Installation

1. **Test Database Connection:**
   Visit: `http://your-domain/api/health.php`
   
   Expected response:
   ```json
   {
       "success": true,
       "data": {
           "status": "OK",
           "message": "LostnLocal API is running",
           "version": "1.0.0"
       }
   }
   ```

2. **Test Authentication:**
   - Visit: `http://your-domain/auth.html`
   - Try creating a new account
   - Test login functionality

3. **Test Data Loading:**
   - Visit: `http://your-domain/index.html`
   - Check if destinations, hotels, and cultural insights load properly

## Default Admin Account

The system comes with a default admin account:
- **Email:** admin@lostnlocal.com
- **Password:** admin123

**⚠️ IMPORTANT:** Change the admin password immediately after setup!

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/signup.php` - User registration
- `POST /api/auth/login.php` - User login
- `POST /api/auth/logout.php` - User logout
- `GET /api/auth/profile.php` - Get user profile
- `PUT /api/auth/profile.php` - Update user profile
- `PUT /api/auth/change-password.php` - Change password

### Public Endpoints
- `GET /api/health.php` - Health check
- `GET /api/destinations.php` - Get destinations
- `GET /api/hotels.php` - Get hotels
- `GET /api/cultural-insights.php` - Get cultural insights
- `GET /api/hidden-gems.php` - Get approved hidden gems
- `POST /api/hidden-gems.php` - Submit hidden gem (requires auth)
- `POST /api/contact.php` - Submit contact form

### Admin Endpoints (Require Admin Token)
- `GET /api/admin/pending-gems.php` - Get pending hidden gems
- `PUT /api/admin/approve-gem.php/{id}` - Approve hidden gem
- `DELETE /api/admin/reject-gem.php/{id}` - Reject hidden gem

## Security Features

1. **Password Hashing:** Uses PHP's `password_hash()` with bcrypt
2. **JWT Tokens:** Secure token-based authentication
3. **Rate Limiting:** Prevents brute force attacks
4. **Input Validation:** Comprehensive input sanitization
5. **SQL Injection Protection:** Prepared statements
6. **CORS Headers:** Configurable cross-origin requests
7. **Security Headers:** XSS and CSRF protection

## Troubleshooting

### Common Issues

1. **Database Connection Failed:**
   - Check database credentials in config
   - Ensure MySQL service is running
   - Verify database exists and user has permissions

2. **API Endpoints Not Working:**
   - Check web server configuration
   - Verify .htaccess rules (Apache)
   - Check PHP error logs

3. **Authentication Issues:**
   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Ensure sessions table exists

4. **CORS Errors:**
   - Update ALLOWED_ORIGINS in config
   - Check browser developer console
   - Verify API endpoint URLs

### Log Files

- **Activity Logs:** `logs/activity.log`
- **PHP Error Logs:** Check your web server error logs
- **MySQL Logs:** Check MySQL error log

### Performance Optimization

1. **Database Indexing:** Ensure proper indexes on frequently queried columns
2. **Caching:** Consider implementing Redis or Memcached for session storage
3. **CDN:** Use a CDN for static assets
4. **Compression:** Enable gzip compression in web server

## Production Deployment

### Security Checklist

- [ ] Change default admin password
- [ ] Update JWT_SECRET to a strong random value
- [ ] Set `display_errors = Off` in php.ini
- [ ] Enable HTTPS with SSL certificate
- [ ] Configure proper firewall rules
- [ ] Set up regular database backups
- [ ] Monitor logs for suspicious activity
- [ ] Update PHP and MySQL to latest stable versions

### Environment Variables

For production, use environment variables instead of hardcoded values:

```php
// In config/config.php
define('DB_HOST', $_ENV['DB_HOST'] ?? 'localhost');
define('DB_USER', $_ENV['DB_USER'] ?? 'root');
define('DB_PASS', $_ENV['DB_PASSWORD'] ?? '');
define('JWT_SECRET', $_ENV['JWT_SECRET'] ?? 'default-secret');
```

## Support

For issues and questions:
1. Check the logs first
2. Verify configuration settings
3. Test with minimal setup
4. Check PHP and MySQL versions compatibility

## License

This project is licensed under the MIT License.
