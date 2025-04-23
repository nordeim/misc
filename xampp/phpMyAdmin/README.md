The error:

```
ERROR 1064 (42000) at line 2: You have an error in your SQL syntax; … near 'varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT ''' at line 2
```

occurs because the SQL statement using `CHANGE` is missing the new column name. In MySQL/MariaDB, the syntax for the `CHANGE` command requires you to restate the column name even if you’re not actually renaming it. The correct syntax is:

```
ALTER TABLE table_name
  CHANGE old_column_name new_column_name column_definition;
```

If you are not renaming the column, you must specify the same name for both the old and new names.

There are two ways to fix this:

1. **Using CHANGE with proper syntax:**  
   Update your SQL file to repeat the column name:
   ```sql
   USE phpmyadmin;
   ALTER TABLE `pma__column_info`
     CHANGE `input_transformation` `input_transformation` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '';
   ALTER TABLE `pma__column_info`
     CHANGE `input_transformation_options` `input_transformation_options` VARCHAR(256) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '';
   ```

2. **Using MODIFY if no renaming is intended:**  
   Alternatively, if you are simply modifying the column definition without renaming it, you can use the `MODIFY` command:
   ```sql
   USE phpmyadmin;
   ALTER TABLE `pma__column_info`
     MODIFY COLUMN `input_transformation` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '';
   ALTER TABLE `pma__column_info`
     MODIFY COLUMN `input_transformation_options` VARCHAR(256) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '';
   ```

Either approach will correct the syntax error.  
  
As a next step, you might want to verify that your MariaDB version supports your desired character set and collation, and also back up your database before applying such schema changes. Testing the changes in a development environment can help avoid unintended impacts on your production data.

If you'd like to understand more about the differences between `CHANGE` and `MODIFY` or MariaDB/SQL best practices for schema modifications, let me know!

https://copilot.microsoft.com/shares/3uz5MWFkYDvbrLRUpTpYw

---
The error messages in your phpMyAdmin interface indicate that the “controluser” connection is failing. In your configuration file (`config.inc.php`), you have defined the control user as follows:

```php
$cfg['Servers'][$i]['controluser'] = 'pma';
$cfg['Servers'][$i]['controlpass'] = '';
```

However, your MariaDB server is rejecting a connection for the user `pma`—in this case, telling you "Access denied for user 'pma'@'localhost' (using password: NO)". This typically happens for one of two reasons:

1. **The `pma` user does not exist:**  
   phpMyAdmin tries to use the user `pma` to enable advanced features (such as relation support, bookmarking, etc.), but if this user isn’t created in the database, MariaDB won’t let the connection through. You can verify if the user exists by logging in as root and running a query:

   ```sql
   SELECT User, Host FROM mysql.user WHERE User = 'pma';
   ```

   If no results are returned, that means the user doesn’t exist.

2. **The credentials for `pma` are incorrect:**  
   Even if the `pma` user exists, if it’s defined with a password (or if it requires one) and you’re sending an empty password from the configuration, the connection will be denied.

### How to Fix This

You’ve got two main options depending on whether you want to use the advanced features or not:

#### **Option 1: Create/Configure the `pma` User**  
If you want to use phpMyAdmin’s advanced features (such as relation view, bookmarking, etc.), you need to create the `pma` user and grant it the appropriate privileges on the `phpmyadmin` database. For example, you can execute the following SQL commands in MariaDB (logged in as root):

```sql
-- Create the user with an empty password (if you choose to keep it that way)
CREATE USER 'pma'@'localhost' IDENTIFIED BY '';

-- Alternatively, if you want to set a password, choose a secure one and update config.inc.php accordingly:
-- CREATE USER 'pma'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant necessary privileges on the phpMyAdmin database tables
GRANT SELECT, INSERT, UPDATE, DELETE ON phpmyadmin.* TO 'pma'@'localhost';

FLUSH PRIVILEGES;
```

If you choose to set a password (recommended for security reasons), update your config file accordingly:

```php
$cfg['Servers'][$i]['controlpass'] = 'your_secure_password';
```

#### **Option 2: Disable the Advanced Features (Remove Control User)**  
If you don’t require the advanced features that use the controluser, you can simply comment out or remove the following lines from your `config.inc.php` file:

```php
// $cfg['Servers'][$i]['controluser'] = 'pma';
// $cfg['Servers'][$i]['controlpass'] = '';
```

Removing these will stop phpMyAdmin from trying to connect as the control user, and you won't see the error messages. However, note that some advanced functionalities might be disabled.

### Additional Considerations

- **Backup and Testing:**  
  It’s always a good idea to back up your configuration and database before making changes. Test any changes in a development environment if possible.

- **Security Reminder:**  
  Even if running on a local environment like XAMPP, consider using strong passwords, especially if your setup could ever be exposed to the internet. Also, the `$cfg['blowfish_secret']` should be changed to a more random string to secure your cookie-based authentication better.

Resolving this error should make your phpMyAdmin interface run without those “Access denied” warnings for `pma`, allowing you to enjoy full functionality of advanced features. 

Beyond this, you might be interested in exploring the various phpMyAdmin configuration options to tailor your interface further—such as setting up additional security measures, custom themes, or optimizing performance settings.
