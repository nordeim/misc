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

---
Here's how to create the `esadmin` user for the `eshopdb` database with the password "Edmin1234":

1.  **Connect to your MySQL server as a user with administrative privileges (like `root` or `myadmin`):**
    ```bash
    mysql -u root -p
    ```
    or
    ```bash
    mysql -u myadmin -p
    ```
    Enter the password when prompted.

2.  **Create the `esadmin` user for `localhost`:**
    ```sql
    CREATE USER 'esadmin'@'localhost' IDENTIFIED BY 'Edmin1234';
    ```
    *(This will create a user named `esadmin` that can only connect from the local machine (`localhost`).)*

3.  **Grant all privileges on the `eshopdb` database to the `esadmin` user at `localhost`:**
    ```sql
    GRANT ALL PRIVILEGES ON eshopdb.* TO 'esadmin'@'localhost';
    ```

4.  **Apply the changes:**
    ```sql
    FLUSH PRIVILEGES;
    ```

5.  **Exit the MySQL shell:**
    ```sql
    exit
    ```

**Explanation:**

* `CREATE USER 'esadmin'@'localhost' IDENTIFIED BY 'Edmin1234';`: This command creates a new MySQL user named `esadmin`. The `'@'localhost'` part specifies that this user can only connect from the local machine. `IDENTIFIED BY 'Edmin1234'` sets the password for this user.
* `GRANT ALL PRIVILEGES ON eshopdb.* TO 'esadmin'@'localhost';`: This command grants all possible privileges on all tables within the `eshopdb` database (`eshopdb.*`) to the `esadmin` user when they connect from `localhost`.
* `FLUSH PRIVILEGES;`: This command reloads the grant tables, ensuring that the newly created user and granted privileges are applied immediately.

Now, you have a dedicated user `esadmin` with the password "Edmin1234" who has full access to the `eshopdb` database when connecting from the local machine. If you need this user to connect from other hosts, you would create additional user entries with the same username but different host specifications (e.g., `'esadmin'@'%'` for any host, or `'esadmin'@'your_remote_ip'` for a specific IP address).
