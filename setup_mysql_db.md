Here's how you can create the database `eshopdb` and grant full access to both the `root` and `myadmin` users:

1.  **Connect to your MySQL server as a user with administrative privileges (like `root` or `myadmin`):**
    ```bash
    mysql -u root -p
    ```
    or
    ```bash
    mysql -u myadmin -p
    ```
    Enter the password when prompted.

2.  **Create the `eshopdb` database:**
    ```sql
    CREATE DATABASE eshopdb;
    ```

3.  **Grant all privileges on the `eshopdb` database to the `root` user for their allowed hosts:**
    ```sql
    GRANT ALL PRIVILEGES ON eshopdb.* TO 'root'@'localhost';
    GRANT ALL PRIVILEGES ON eshopdb.* TO 'root'@'127.0.0.1';
    ```

4.  **Grant all privileges on the `eshopdb` database to the `myadmin` user for their allowed hosts:**
    ```sql
    GRANT ALL PRIVILEGES ON eshopdb.* TO 'myadmin'@'%';
    GRANT ALL PRIVILEGES ON eshopdb.* TO 'myadmin'@'127.0.0.1';
    GRANT ALL PRIVILEGES ON eshopdb.* TO 'myadmin'@'localhost';
    ```

5.  **Apply the changes:**
    ```sql
    FLUSH PRIVILEGES;
    ```

6.  **Exit the MySQL shell:**
    ```sql
    exit
    ```

**Explanation:**

* `CREATE DATABASE eshopdb;`: This command creates the new database named `eshopdb`.
* `GRANT ALL PRIVILEGES ON eshopdb.* TO 'user'@'host';`: This command grants all possible privileges (`ALL PRIVILEGES`) on all tables within the `eshopdb` database (`eshopdb.*`) to the specified user at the specified host.
* We grant privileges to `root` for both `localhost` and `127.0.0.1`.
* We grant privileges to `myadmin` for `%` (any host), `127.0.0.1`, and `localhost` to cover all their allowed connection methods.
* `FLUSH PRIVILEGES;`: This command reloads the grant tables, ensuring that the newly granted privileges take effect immediately.

After running these commands, both the `root` and `myadmin` users will have full access to the `eshopdb` database from their respective allowed hosts.
