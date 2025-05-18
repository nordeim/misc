```bash
rm -rf /var/lib/mysql
# rm -rf /Home1/neon/current/var/lib/mysql
mkdir /var/lib/mysql
chmod 700 /var/lib/mysql
chown mysql:mysql /var/lib/mysql
sudo mysqld --initialize-insecure --user=mysql --datadir=/var/lib/mysql
rm /var/log/mysql/error.log 
ps -ef | grep mysql
systemctl start mysql.service
mysql_secure_installation
```
```
# sudo -u mysql mysql
ERROR 1045 (28000): Access denied for user 'pete'@'localhost' (using password: NO)
root@pop-os:/cdrom/project# sudo -u mysql mysql -u root
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 13
Server version: 8.0.41-0ubuntu0.24.04.1 (Ubuntu)

Copyright (c) 2000, 2025, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
4 rows in set (0.00 sec)

mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'Admin1234';
Query OK, 0 rows affected (0.01 sec)

mysql> flush privileges;
Query OK, 0 rows affected (0.00 sec)
```

---
It appears your MySQL server is failing to start because a crucial InnoDB redo log file is missing. The error logs clearly indicate this:

```
2025-05-18T13:22:32.378683Z 1 [ERROR] [MY-013882] [InnoDB] Missing redo log file ./#innodb_redo/#ib_redo8 (with start_lsn = 26206208).
2025-05-18T13:22:32.378718Z 1 [ERROR] [MY-012930] [InnoDB] Plugin initialization aborted with error Generic error.
2025-05-18T13:22:32.817923Z 1 [ERROR] [MY-010334] [Server] Failed to initialize DD Storage Engine
2025-05-18T13:22:32.818114Z 0 [ERROR] [MY-010020] [Server] Data Dictionary initialization failed.
2025-05-18T13:22:32.818170Z 0 [ERROR] [MY-010119] [Server] Aborting
```

InnoDB requires this redo log file (`#ib_redo8`) to perform recovery and ensure data consistency. Without it, InnoDB cannot initialize, which in turn prevents the MySQL server from starting. The systemd logs confirm that the MySQL service is repeatedly trying to start and failing (`Failed with result 'exit-code'`, `Start request repeated too quickly`).

Here’s a step-by-step guide to address this issue:

**Step 1: Stop MySQL Service (if it's still trying to restart)**

Ensure MySQL isn't caught in a restart loop.

```bash
sudo systemctl stop mysql.service
```

**Step 2: CRITICAL - Backup Your MySQL Data Directory**

Before attempting any recovery or making changes, it's absolutely crucial to back up your current MySQL data directory. This will preserve the current state in case recovery attempts worsen the situation.

```bash
sudo rsync -av /var/lib/mysql/ /var/lib/mysql_backup_$(date +%F_%H-%M-%S)/
```

Alternatively, you can use tar:

```bash
sudo tar -cvzf /tmp/mysql_data_backup_$(date +%F_%H-%M-%S).tar.gz /var/lib/mysql
```

Store this backup in a safe location.

**Step 3: Inspect the InnoDB Redo Log Directory**

Let's verify the contents of the `#innodb_redo` directory to see which files are present and if `#ib_redo8` is indeed missing.

```bash
sudo ls -l /var/lib/mysql/#innodb_redo/
```

Please note the output of this command. It will show you the existing redo log files.

**Step 4: Recovery Options**

Based on the situation (availability of backups, tolerance for data loss), here are your options:

  * **Option A: Restore from a Known Good Backup (Safest)**
    If you have a recent and reliable backup of your MySQL data (either a physical backup of `/var/lib/mysql` made when the server was healthy, or a logical SQL dump), restoring from it is the safest and recommended approach. The exact steps will depend on the type of backup you have.

  * **Option B: Attempt `innodb_force_recovery` (High Risk of Data Loss/Corruption)**
    This option tries to start MySQL in a degraded mode, potentially allowing you to dump your data. Use this with extreme caution, as it can lead to data corruption.

    1.  Edit your MySQL configuration file. This is typically located at `/etc/mysql/mysql.conf.d/mysqld.cnf` or `/etc/mysql/my.cnf`.
    2.  Under the `[mysqld]` section, add the following line:
        ```ini
        innodb_force_recovery = 1
        ```
    3.  Save the configuration file and try to start MySQL:
        ```bash
        sudo systemctl start mysql.service
        sudo systemctl status mysql.service
        ```
    4.  If MySQL starts (check the status and error logs), **immediately take a logical backup (dump) of all your databases**:
        ```bash
        sudo mysqldump --all-databases --routines --triggers --events > /tmp/all_databases_dump_$(date +%F_%H-%M-%S).sql
        ```
    5.  If `innodb_force_recovery = 1` doesn't work, you can try increasing the value from 2 up to 4. **It is strongly advised not to go above 4 unless you fully understand the severe risks, as higher values can corrupt your data permanently.** Each level disables more InnoDB functionality:
          * `1`: (SRV\_FORCE\_IGNORE\_CORRUPT) Lets the server run even if it detects a corrupt page.
          * `2`: (SRV\_FORCE\_NO\_BACKGROUND) Prevents the master thread and any background threads from running.
          * `3`: (SRV\_FORCE\_NO\_TRX\_UNDO) Does not run transaction rollbacks after crash recovery.
          * `4`: (SRV\_FORCE\_NO\_IBUF\_MERGE) Prevents insert buffer merge operations.
    6.  If you successfully dump your data, stop MySQL, remove the `innodb_force_recovery` line from the configuration file. You will then likely need to re-initialize your MySQL data directory (see Option C) and restore your data from the SQL dump you just created.

  * **Option C: Re-initialize MySQL Data Directory (Data Loss Warning)**
    If you don't have backups and `innodb_force_recovery` fails or isn't an option, you might have to re-initialize your MySQL data directory. **This process will erase all your existing MySQL data.**

    1.  Ensure MySQL is stopped:
        ```bash
        sudo systemctl stop mysql.service
        ```
    2.  Move your old (and now backed-up) data directory:
        ```bash
        sudo mv /var/lib/mysql /var/lib/mysql_OLD_$(date +%F_%H-%M-%S)
        ```
    3.  Create a new, empty data directory with correct permissions:
        ```bash
        sudo mkdir /var/lib/mysql
        sudo chown mysql:mysql /var/lib/mysql
        sudo chmod 700 /var/lib/mysql
        ```
    4.  Initialize the new data directory. For MySQL 8.0, you can use:
        ```bash
        sudo mysqld --initialize-insecure --user=mysql --datadir=/var/lib/mysql
        ```
        (Using `--initialize-insecure` sets up the root user with no password; `--initialize` would generate a random temporary password and log it.)
    5.  Start MySQL:
        ```bash
        sudo systemctl start mysql.service
        ```
    6.  Check the status:
        ```bash
        sudo systemctl status mysql.service
        ```
    7.  If MySQL starts successfully, you'll need to secure your new installation (e.g., by running `sudo mysql_secure_installation`) and then restore any data from logical backups (SQL dumps) if you have them.

**Understanding the Missing Redo Log**

Redo logs are vital for InnoDB's ACID compliance and crash recovery. The error `Missing redo log file ./#innodb_redo/#ib_redo8 (with start_lsn = 26206208)` means InnoDB was expecting this specific file to continue its recovery process from a known Log Sequence Number (LSN). Reasons for a missing redo log file can include accidental deletion, filesystem corruption, or issues during a previous unclean shutdown.

Please proceed carefully, prioritizing the backup in Step 2. The output from Step 3 (`ls -l /var/lib/mysql/#innodb_redo/`) will be very informative. If you have any recent backups, using them (Option A) is by far the preferred solution.

---
Okay, thank you for providing the listing of your `/var/lib/mysql/#innodb_redo/` directory.

```
total 12800
-rw-r----- 1 mysql mysql 3276800 Apr 28 14:13 '#ib_redo14'
-rw-r----- 1 mysql mysql 3276800 May 11 11:39 '#ib_redo20'
-rw-r----- 1 mysql mysql 3276800 May 12 20:42 '#ib_redo21'
-rw-r----- 1 mysql mysql 3276800 Apr 19 02:24 '#ib_redo7'
```

This confirms the MySQL error log: the file `#ib_redo8` is indeed missing from this directory. InnoDB was expecting this file to continue its recovery process (as indicated by `start_lsn = 26206208` in the error log), and its absence is preventing MySQL from starting. The existing files (`#ib_redo7`, `#ib_redo14`, etc.) show that redo logs were being created, but the one MySQL needs for the current recovery operation is gone.

Here's the updated plan, keeping this confirmation in mind:

**Step 1: Ensure You Have a Backup (Reiteration)**

If you haven't already, please ensure you've backed up the entire `/var/lib/mysql` directory as described in the previous response. This is your safety net.

```bash
sudo systemctl stop mysql.service # Ensure it's stopped
sudo rsync -av /var/lib/mysql/ /var/lib/mysql_backup_$(date +%F_%H-%M-%S)/
```

**Step 2: Attempting `innodb_force_recovery` (Proceed with Extreme Caution)**

This method attempts to start MySQL in a degraded state to allow you to export your data. Given that a redo log file is missing, `innodb_force_recovery=4` is the level that directly addresses skipping redo log application, but it implies data loss for transactions covered by the missing log. **Always start with the lowest effective level.**

1.  **Edit your MySQL configuration file** (e.g., `/etc/mysql/mysql.conf.d/mysqld.cnf` or `/etc/mysql/my.cnf`).

2.  Under the `[mysqld]` section, add `innodb_force_recovery`. Start with `1`:

    ```ini
    [mysqld]
    innodb_force_recovery = 1
    ```

3.  Try to start MySQL and check its status and logs:

    ```bash
    sudo systemctl start mysql.service
    sudo systemctl status mysql.service
    sudo journalctl -xeu mysql.service
    sudo cat /var/log/mysql/error.log # Check the end of this file for new errors
    ```

4.  **If `innodb_force_recovery = 1` does not work (MySQL still fails to start with similar errors):**

      * Stop MySQL: `sudo systemctl stop mysql.service`
      * Change the value in the configuration file to `innodb_force_recovery = 2`.
      * Try starting MySQL again and check logs.

5.  **If `2` fails, try `3`:**

      * Stop MySQL.
      * Change to `innodb_force_recovery = 3`.
      * Try starting MySQL again and check logs.

6.  **If `3` fails, try `4`:**

      * Stop MySQL.
      * Change to `innodb_force_recovery = 4`.
          * **Be aware:** Level 4 (`SRV_FORCE_NO_LOG_REDO`) tells InnoDB *not* to apply the redo logs during recovery. This is the most likely level to bypass the "missing redo log file" error but means any transactions that were in the missing `#ib_redo8` (and potentially subsequent logs if they were also affected) and not yet fully written to the data files will be lost.
      * Try starting MySQL again and check logs.

7.  **If MySQL Starts with any of these `innodb_force_recovery` levels:**

      * **Immediately back up all your data using `mysqldump`**:
        ```bash
        sudo mysqldump --all-databases --routines --triggers --events > /home/pete/mysql_dump_after_recovery_$(date +%F_%H-%M-%S).sql
        ```
        (Adjust the path `/home/pete/` as needed).
      * **Do not perform any write operations on the database while `innodb_force_recovery` is active, especially at levels 3 or 4.** The database is in an unstable state.
      * After a successful dump, **stop MySQL**:
        ```bash
        sudo systemctl stop mysql.service
        ```
      * **Remove the `innodb_force_recovery` line** from your MySQL configuration file.
      * At this point, the most reliable path forward is to **re-initialize your MySQL instance** (Option C from the previous response: move old data dir, create new, initialize, start, secure) and then **restore your data from the SQL dump** you just created. Continuing to use an instance that required high levels of `innodb_force_recovery` is risky.

**Step 3: If `innodb_force_recovery` Fails (even at level 4)**

If MySQL still doesn't start even with `innodb_force_recovery = 4`, the corruption might be too severe, or other underlying issues might prevent startup. In this scenario:

  * **Option A: Restore from a Full Backup (Safest)**
    If you have a known good backup (physical or logical) from *before* this issue occurred, restoring it is the best course of action.

  * **Option B: Re-initialize MySQL Data Directory (Data Loss)**
    This is the last resort if you have no viable backups and cannot get the server to start to dump data. It involves deleting (or moving) the current data directory and setting up MySQL from scratch. You will lose all data not previously backed up. (Refer to Option C in the first detailed response I provided).

The missing `#ib_redo8` is a serious issue. Prioritize getting a data dump if `innodb_force_recovery` allows MySQL to start, and then plan to rebuild your MySQL instance for stability.

---
https://g.co/gemini/share/0fc0228f0577
