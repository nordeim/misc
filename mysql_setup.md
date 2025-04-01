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

