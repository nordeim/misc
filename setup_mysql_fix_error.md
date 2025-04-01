https://copilot.microsoft.com/shares/Qv6ysA8FsFG7jvCCS6Tmo  
mysql> CREATE USER 'root'@'127.0.0.1' IDENTIFIED BY 'Admin1234';
Query OK, 0 rows affected (0.02 sec)

mysql> GRANT ALL PRIVILEGES ON *.* TO 'root'@'127.0.0.1';
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT Host, User FROM user WHERE User='root';
+-----------+------+
| Host      | User |
+-----------+------+
| 127.0.0.1 | root |
| localhost | root |
+-----------+------+
2 rows in set (0.00 sec)

mysql> FLUSH PRIVILEGES;
Query OK, 0 rows affected (0.00 sec)

mysql> CREATE USER 'myadmin'@'%' IDENTIFIED BY 'Admin1234';
Query OK, 0 rows affected (0.00 sec)

mysql> GRANT ALL PRIVILEGES ON *.* TO 'myadmin'@'%';
Query OK, 0 rows affected (0.00 sec)

mysql> CREATE USER 'myadmin'@'127.0.0.1' IDENTIFIED BY 'Admin1234';
Query OK, 0 rows affected (0.01 sec)

mysql> GRANT ALL PRIVILEGES ON *.* TO 'myadmin'@'127.0.0.1';
Query OK, 0 rows affected (0.00 sec)

mysql> GRANT ALL PRIVILEGES ON *.* TO 'myadmin'@'localhost';
ERROR 1410 (42000): You are not allowed to create a user with GRANT
mysql> CREATE USER 'myadmin'@'localhost' IDENTIFIED BY 'Admin1234';
Query OK, 0 rows affected (0.01 sec)

mysql> GRANT ALL PRIVILEGES ON *.* TO 'myadmin'@'localhost';
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT Host, User FROM user WHERE User='root';
+-----------+------+
| Host      | User |
+-----------+------+
| 127.0.0.1 | root |
| localhost | root |
+-----------+------+
2 rows in set (0.00 sec)

mysql> SELECT Host, User FROM user WHERE User='myadmin';
+-----------+---------+
| Host      | User    |
+-----------+---------+
| %         | myadmin |
| 127.0.0.1 | myadmin |
| localhost | myadmin |
+-----------+---------+
3 rows in set (0.00 sec)

mysql> FLUSH PRIVILEGES;
Query OK, 0 rows affected (0.00 sec)

mysql> exit

---
root@pop-os:/etc# ps -ef | grep mysql
root     2727382 2658287  0 10:44 pts/3    00:00:00 /bin/sh /usr/bin/mysqld_safe --skip-grant-tables
mysql    2727539 2727382  0 10:44 pts/3    00:00:02 /usr/sbin/mysqld --basedir=/usr --datadir=/var/lib/mysql --plugin-dir=/usr/lib/mysql/plugin --user=mysql --skip-grant-tables --log-error=/var/log/mysql/error.log --pid-file=pop-os.pid
root     2728096 2658287  0 10:48 pts/3    00:00:00 grep --color=auto mysql
root@pop-os:/etc# kill 2727539 2727382
root@pop-os:/etc# ps -ef | grep mysql2025-04-01T02:48:43.426223Z mysqld_safe mysqld from pid file /var/lib/mysql/pop-os.pid ended

root     2728139 2658287  0 10:48 pts/3    00:00:00 grep --color=auto mysql
[1]+  Done                    mysqld_safe --skip-grant-tables
root@pop-os:/etc# ps -ef | grep mysql
root     2728141 2658287  0 10:48 pts/3    00:00:00 grep --color=auto mysql
root@pop-os:/etc# systemctl stop mysql
root@pop-os:/etc# systemctl status mysql
○ mysql.service - MySQL Community Server
     Loaded: loaded (/usr/lib/systemd/system/mysql.service; enabled; preset: enabled)
     Active: inactive (dead) since Tue 2025-04-01 10:43:23 +08; 5min ago
   Duration: 2min 38.196s
    Process: 2726738 ExecStartPre=/usr/share/mysql/mysql-systemd-start pre (code=exited, status=0/SUCCESS)
    Process: 2726746 ExecStart=/usr/sbin/mysqld (code=exited, status=0/SUCCESS)
   Main PID: 2726746 (code=exited, status=0/SUCCESS)
     Status: "Server shutdown complete"
        CPU: 1.621s

Apr 01 10:40:43 pop-os systemd[1]: Starting mysql.service - MySQL Community Server...
Apr 01 10:40:43 pop-os systemd[1]: Started mysql.service - MySQL Community Server.
Apr 01 10:43:22 pop-os systemd[1]: Stopping mysql.service - MySQL Community Server...
Apr 01 10:43:23 pop-os systemd[1]: mysql.service: Deactivated successfully.
Apr 01 10:43:23 pop-os systemd[1]: Stopped mysql.service - MySQL Community Server.
Apr 01 10:43:23 pop-os systemd[1]: mysql.service: Consumed 1.621s CPU time, 467.2M memory peak, 0B memory swap peak.
root@pop-os:/etc# ps -ef | grep mysql
root     2728163 2658287  0 10:49 pts/3    00:00:00 grep --color=auto mysql
root@pop-os:/etc# 
root@pop-os:/etc# 
root@pop-os:/etc# rm -rf /var/lib/mysql
root@pop-os:/etc# ls -l /var/lib/mysql
ls: cannot access '/var/lib/mysql': No such file or directory
root@pop-os:/etc# mysqld --initialize --user=mysql --datadir=/var/lib/mysql
mysqld: Can't create directory '/var/lib/mysql/' (OS errno 13 - Permission denied)
root@pop-os:/etc# mkdir /var/lib/mysql/
root@pop-os:/etc# chown mysql:mysql /var/lib/mysql/
root@pop-os:/etc# mysqld --initialize --user=mysql --datadir=/var/lib/mysql
root@pop-os:/etc# ls -l /var/lib/mysql
total 79276
-rw-r----- 1 mysql mysql       56 Apr  1 10:50  auto.cnf
-rw------- 1 mysql mysql     1705 Apr  1 10:50  ca-key.pem
-rw-r--r-- 1 mysql mysql     1112 Apr  1 10:50  ca.pem
-rw-r--r-- 1 mysql mysql     1112 Apr  1 10:50  client-cert.pem
-rw------- 1 mysql mysql     1705 Apr  1 10:50  client-key.pem
-rw-r----- 1 mysql mysql   196608 Apr  1 10:50 '#ib_16384_0.dblwr'
-rw-r----- 1 mysql mysql  8585216 Apr  1 10:50 '#ib_16384_1.dblwr'
-rw-r----- 1 mysql mysql     5927 Apr  1 10:50  ib_buffer_pool
-rw-r----- 1 mysql mysql 12582912 Apr  1 10:50  ibdata1
drwxr-x--- 2 mysql mysql      680 Apr  1 10:50 '#innodb_redo'
drwxr-x--- 2 mysql mysql       40 Apr  1 10:50 '#innodb_temp'
drwxr-x--- 2 mysql mysql      160 Apr  1 10:50  mysql
-rw-r----- 1 mysql mysql 26214400 Apr  1 10:50  mysql.ibd
drwxr-x--- 2 mysql mysql     2240 Apr  1 10:50  performance_schema
-rw------- 1 mysql mysql     1705 Apr  1 10:50  private_key.pem
-rw-r--r-- 1 mysql mysql      452 Apr  1 10:50  public_key.pem
-rw-r--r-- 1 mysql mysql     1112 Apr  1 10:50  server-cert.pem
-rw------- 1 mysql mysql     1705 Apr  1 10:50  server-key.pem
drwxr-x--- 2 mysql mysql       60 Apr  1 10:50  sys
-rw-r----- 1 mysql mysql 16777216 Apr  1 10:50  undo_001
-rw-r----- 1 mysql mysql 16777216 Apr  1 10:50  undo_002
root@pop-os:/etc# ps -ef | grep mysql
root     2728404 2658287  0 10:50 pts/3    00:00:00 grep --color=auto mysql
root@pop-os:/etc# systemctl restart mysql
root@pop-os:/etc# ps -ef | grep mysql
mysql    2728451       1 13 10:50 ?        00:00:00 /usr/sbin/mysqld
root     2728505 2658287  0 10:51 pts/3    00:00:00 grep --color=auto mysql
root@pop-os:/etc# mysql -u root
ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: NO)
root@pop-os:/etc# mysql -u root -p
Enter password: 
ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: YES)
root@pop-os:/etc# cat /var/log/mysql/error.log | grep "temporary password"
2025-04-01T02:50:15.516562Z 6 [Note] [MY-010454] [Server] A temporary password is generated for root@localhost: izC!<k=-S3sK
root@pop-os:/etc# mysql -u root -p
Enter password: 
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 10
Server version: 8.0.41-0ubuntu0.24.04.1

Copyright (c) 2000, 2025, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> ALTER USER 'root'@'localhost' IDENTIFIED BY 'Admin1234';
Query OK, 0 rows affected (0.00 sec)

mysql> FLUSH PRIVILEGES;
Query OK, 0 rows affected (0.01 sec)

mysql> exit
Bye
root@pop-os:/etc# mysql -u root -p
Enter password: 
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 11
Server version: 8.0.41-0ubuntu0.24.04.1 (Ubuntu)

Copyright (c) 2000, 2025, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>

root@pop-os:/etc# systemctl status mysql
● mysql.service - MySQL Community Server
     Loaded: loaded (/usr/lib/systemd/system/mysql.service; enabled; preset: enabled)
     Active: active (running) since Tue 2025-04-01 10:50:56 +08; 7min ago
    Process: 2728443 ExecStartPre=/usr/share/mysql/mysql-systemd-start pre (code=exited, status=0/SUCCESS)
   Main PID: 2728451 (mysqld)
     Status: "Server is operational"
      Tasks: 38 (limit: 18729)
     Memory: 468.7M (peak: 469.2M)
        CPU: 2.813s
     CGroup: /system.slice/mysql.service
             └─2728451 /usr/sbin/mysqld

Apr 01 10:50:55 pop-os systemd[1]: Starting mysql.service - MySQL Community Server...
Apr 01 10:50:56 pop-os systemd[1]: Started mysql.service - MySQL Community Server.
root@pop-os:/etc# mysql_secure_installation

Securing the MySQL server deployment.

Enter password for user root: 

VALIDATE PASSWORD COMPONENT can be used to test passwords
and improve security. It checks the strength of password
and allows the users to set only those passwords which are
secure enough. Would you like to setup VALIDATE PASSWORD component?

Press y|Y for Yes, any other key for No: n
Using existing password for root.
Change the password for root ? ((Press y|Y for Yes, any other key for No) : n

 ... skipping.
By default, a MySQL installation has an anonymous user,
allowing anyone to log into MySQL without having to have
a user account created for them. This is intended only for
testing, and to make the installation go a bit smoother.
You should remove them before moving into a production
environment.

Remove anonymous users? (Press y|Y for Yes, any other key for No) : y
Success.


Normally, root should only be allowed to connect from
'localhost'. This ensures that someone cannot guess at
the root password from the network.

Disallow root login remotely? (Press y|Y for Yes, any other key for No) : n

 ... skipping.
By default, MySQL comes with a database named 'test' that
anyone can access. This is also intended only for testing,
and should be removed before moving into a production
environment.


Remove test database and access to it? (Press y|Y for Yes, any other key for No) : n

 ... skipping.
Reloading the privilege tables will ensure that all changes
made so far will take effect immediately.

Reload privilege tables now? (Press y|Y for Yes, any other key for No) : y
Success.

All done!

---

mysql> UPDATE user SET authentication_string='*2B12E1A2252D642C09F640B63ED35DCC5690464A', plugin='mysql_native_password' WHERE user='root' AND host='localhost';
Query OK, 0 rows affected (0.00 sec)
Rows matched: 0  Changed: 0  Warnings: 0

mysql> UPDATE user SET authentication_string='*2B12E1A2252D642C09F640B63ED35DCC5690464A', plugin='mysql_native_password' WHERE user='root' AND host='127.0.0.1';
Query OK, 0 rows affected (0.00 sec)
Rows matched: 0  Changed: 0  Warnings: 0

mysql> UPDATE user SET authentication_string='*2B12E1A2252D642C09F640B63ED35DCC5690464A', plugin='mysql_native_password' WHERE user='root' AND host='%';
Query OK, 0 rows affected (0.00 sec)
Rows matched: 0  Changed: 0  Warnings: 0

mysql> FLUSH PRIVILEGES;
Query OK, 0 rows affected (0.00 sec)

mysql> exit
Bye
root@pop-os:/etc# mysqld_safe --skip-grant-tables &^C
root@pop-os:/etc# mysql -u root -p
Enter password: 
ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: YES)
root@pop-os:/etc# ps -ef | grep mysql
root     2725278 2658287  0 10:31 pts/3    00:00:00 /bin/sh /usr/bin/mysqld_safe --skip-grant-tables
mysql    2725437 2725278  0 10:31 pts/3    00:00:03 /usr/sbin/mysqld --basedir=/usr --datadir=/var/lib/mysql --plugin-dir=/usr/lib/mysql/plugin --user=mysql --skip-grant-tables --log-error=/var/log/mysql/error.log --pid-file=pop-os.pid
root     2726697 2658287  0 10:40 pts/3    00:00:00 grep --color=auto mysql
root@pop-os:/etc# kill   2725437 2725278
root@pop-os:/etc# 2025-04-01T02:40:31.395105Z mysqld_safe mysqld from pid file /var/lib/mysql/pop-os.pid ended

[1]+  Done                    mysqld_safe --skip-grant-tables
root@pop-os:/etc# ps -ef | grep mysql
root     2726725 2658287  0 10:40 pts/3    00:00:00 grep --color=auto mysql
root@pop-os:/etc# systemctl restart mysql
root@pop-os:/etc# systemctl status mysql
● mysql.service - MySQL Community Server
     Loaded: loaded (/usr/lib/systemd/system/mysql.service; enabled; preset: enabled)
     Active: active (running) since Tue 2025-04-01 10:40:43 +08; 11s ago
    Process: 2726738 ExecStartPre=/usr/share/mysql/mysql-systemd-start pre (code=exited, status=0/SUCCESS)
   Main PID: 2726746 (mysqld)
     Status: "Server is operational"
      Tasks: 38 (limit: 18729)
     Memory: 466.7M (peak: 467.2M)
        CPU: 852ms
     CGroup: /system.slice/mysql.service
             └─2726746 /usr/sbin/mysqld

Apr 01 10:40:43 pop-os systemd[1]: Starting mysql.service - MySQL Community Server...
Apr 01 10:40:43 pop-os systemd[1]: Started mysql.service - MySQL Community Server.
root@pop-os:/etc# ps -ef | grep mysql
mysql    2726746       1  5 10:40 ?        00:00:00 /usr/sbin/mysqld
root     2726836 2658287  0 10:40 pts/3    00:00:00 grep --color=auto mysql
root@pop-os:/etc# mysql -u root -p
Enter password: 
ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: YES)

---

root@pop-os:/etc# systemctl stop mysql
root@pop-os:/etc# systemctl status mysql
○ mysql.service - MySQL Community Server
     Loaded: loaded (/usr/lib/systemd/system/mysql.service; enabled; preset: enabled)
     Active: inactive (dead) since Tue 2025-04-01 10:43:23 +08; 2s ago
   Duration: 2min 38.196s
    Process: 2726738 ExecStartPre=/usr/share/mysql/mysql-systemd-start pre (code=exited, status=0/SUCCESS)
    Process: 2726746 ExecStart=/usr/sbin/mysqld (code=exited, status=0/SUCCESS)
   Main PID: 2726746 (code=exited, status=0/SUCCESS)
     Status: "Server shutdown complete"
        CPU: 1.621s

Apr 01 10:40:43 pop-os systemd[1]: Starting mysql.service - MySQL Community Server...
Apr 01 10:40:43 pop-os systemd[1]: Started mysql.service - MySQL Community Server.
Apr 01 10:43:22 pop-os systemd[1]: Stopping mysql.service - MySQL Community Server...
Apr 01 10:43:23 pop-os systemd[1]: mysql.service: Deactivated successfully.
Apr 01 10:43:23 pop-os systemd[1]: Stopped mysql.service - MySQL Community Server.
Apr 01 10:43:23 pop-os systemd[1]: mysql.service: Consumed 1.621s CPU time, 467.2M memory peak, 0B memory swap peak.
root@pop-os:/etc# ps -ef | grep mysql
root     2727185 2658287  0 10:43 pts/3    00:00:00 grep --color=auto mysql
root@pop-os:/etc# mysqld_safe --skip-grant-tables &
[1] 2727204
root@pop-os:/etc# 2025-04-01T02:43:51.809660Z mysqld_safe Logging to '/var/log/mysql/error.log'.
2025-04-01T02:43:51.811433Z mysqld_safe Directory '/var/run/mysqld' for UNIX socket file don't exists.

[1]+  Exit 1                  mysqld_safe --skip-grant-tables
root@pop-os:/etc# ls -l /var/run/mysqld
ls: cannot access '/var/run/mysqld': No such file or directory
root@pop-os:/etc# mkdir /var/run/mysqld
root@pop-os:/etc# chown mysql:mysql /var/run/mysqld
root@pop-os:/etc# mysqld_safe --skip-grant-tables &
[1] 2727382
root@pop-os:/etc# 2025-04-01T02:44:21.239666Z mysqld_safe Logging to '/var/log/mysql/error.log'.
2025-04-01T02:44:21.263083Z mysqld_safe Starting mysqld daemon with databases from /var/lib/mysql

root@pop-os:/etc# mysql -u root
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 7
Server version: 8.0.41-0ubuntu0.24.04.1 (Ubuntu)

Copyright (c) 2000, 2025, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> USE mysql;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> SELECT Host, User, authentication_string, plugin FROM user WHERE User='root';
Empty set (0.00 sec)

---

