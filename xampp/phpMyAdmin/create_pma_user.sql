-- Create the user with an empty password (if you choose to keep it that way)
CREATE USER 'pma'@'localhost' IDENTIFIED BY '';

-- Alternatively, if you want to set a password, choose a secure one and update config.inc.php accordingly:
-- CREATE USER 'pma'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant necessary privileges on the phpMyAdmin database tables
GRANT SELECT, INSERT, UPDATE, DELETE ON phpmyadmin.* TO 'pma'@'localhost';

FLUSH PRIVILEGES;
