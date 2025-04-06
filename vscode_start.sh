xhost +si:localuser:www-data

cd ~www-data/
sudo -E -u www-data env XDG_RUNTIME_DIR=/Home1/tmp bash -c konsole &

sudo -E -u www-data env XDG_RUNTIME_DIR=/Home1/tmp code --user-data-dir /Home1/www-data/.vscode --extensions-dir /Home1/www-data/.vscode --crash-reporter-database=/Home1/www-data/.vscode/crashpad_db .

#sudo -E -u www-data env XDG_RUNTIME_DIR=/tmp code --user-data-dir /cdrom/project/.vscode --extensions-dir /cdrom/project/.vscode --crash-reporter-database=/cdrom/project/.vscode/crashpad_db .

https://raw.githubusercontent.com/nordeim/misc/refs/heads/main/doc_switching_user_for_vscode.md 
