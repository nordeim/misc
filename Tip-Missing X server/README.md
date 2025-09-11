# Running GUI Applications as Another User on Linux

This guide provides methods to run graphical user interface (GUI) applications as a different user on a Linux system, addressing the common "Missing X server or $DISPLAY" error. These methods are designed for X11-based display servers, which are widely used.

## Understanding the Problem

The error `Missing X server or $DISPLAY` indicates that the GUI application launched under a different user (e.g., `www-data`) lacks the necessary authorization or environment variables to interact with the X display server. The X server's security mechanism, known as X authorization (xauth), prevents unauthorized users from accessing your graphical session.

To resolve this, you need to grant the target user (e.g., `www-data`) permission to access your X display server and ensure they have the correct `DISPLAY` and `XAUTHORITY` environment variables set.

## Methods to Run GUI Applications as Another User

### Method 1: Using `xhost` (Temporary, Less Secure)

This method involves explicitly granting access to your display server for a specific user. It's straightforward for quick, temporary tests but less secure than using `xauth` because it can relax display security temporarily.

1.  **As the primary user (`pete`):**
    ```sh
    pete@pop-os:~$ xhost +si:localuser:www-data
    ```
    This command grants access to your X server specifically for the `www-data` user.

2.  **Become the target user (`www-data`) and set the `DISPLAY` variable:**
    ```sh
    pete@pop-os:~$ su - www-data
    www-data@pop-os:~$ export DISPLAY=:0
    www-data@pop-os:~$ brave-browser &
    ```
    *   `su - www-data` switches to the `www-data` user and creates a new shell environment.
    *   `export DISPLAY=:0` sets the `DISPLAY` environment variable, telling the application where to send its graphical output. `:0` is common for the primary display.

3.  **Alternatively, run the command in a single line:**
    ```sh
    pete@pop-os:~$ su www-data -c "DISPLAY=:0 brave-browser" &
    ```
    This executes the command as `www-data` directly without switching the user's shell.

4.  **After testing, revoke access (as `pete`):**
    ```sh
    pete@pop-os:~$ xhost -si:localuser:www-data
    ```
    This command removes the specific user's access, restoring a more secure X server configuration.

### Method 2: Using `xauth` (More Secure)

This method provides more secure access by transferring a "magic cookie" from your `.Xauthority` file to the target user, granting them temporary, authenticated access to your display server.

1.  **As the primary user (`pete`), verify `DISPLAY` and `XAUTHORITY` variables:**
    ```sh
    pete@pop-os:~$ echo $DISPLAY
    :0
    pete@pop-os:~$ echo $XAUTHORITY
    /home/pete/.Xauthority
    ```
    Note your `DISPLAY` value and the path to your `.Xauthority` file.

2.  **Transfer the authentication cookie to the target user (`www-data`):**
    ```sh
    pete@pop-os:~$ xauth extract - $DISPLAY | sudo -u www-data xauth merge -
    ```
    This command extracts your X authentication record and merges it into the `www-data` user's X authorization.

3.  **Run the GUI application as the target user:**
    ```sh
    pete@pop-os:~$ sudo -u www-data brave-browser
    ```
    Or, for explicitly setting the environment:
    ```sh
    pete@pop-os:~$ sudo -i -u www-data env DISPLAY="$DISPLAY" brave-browser
    ```
    This launches the `brave-browser` application as `www-data`.

### Method 3: Using `sudo` with Environment Preservation

This method leverages `sudo`'s capability to preserve environment variables, making it a potentially simpler one-liner depending on your `sudo` configuration.

1.  **Run the GUI application using `sudo -E`:**
    ```sh
    pete@pop-os:~$ sudo -E -u www-data brave-browser
    ```
    The `-E` option preserves your current environment variables, including `DISPLAY` and `XAUTHORITY`.
    **Note**: This method's success depends on the `sudoers` file configuration, specifically if `env_keep+=DISPLAY` is set.

### Method 4: Addressing Wayland (Modern Systems)

If you are using Wayland as your display server (common in newer Ubuntu installations), the X11-based methods above may not work directly for native Wayland applications.

1.  **Switch to X11 (if necessary):**
    *   Log out and, on the login screen, select "Ubuntu on Xorg" (or similar) from the gear icon to explicitly use the X11 session.
2.  **Consider `ego` for Wayland support:**
    *   The `ego` tool (Alter Ego) is designed to handle both X11 and Wayland sessions, including sharing of sockets {Link: according to one Reddit user https://www.reddit.com/r/linux4noobs/comments/qwavmw/how_do_i_run_a_gui_program_as_a_different_user/}.
    *   You would install it and then run:
        ```sh
        ego -u www-data brave-browser
        ```
    *   **Note:** `ego` might not revoke privileges after the program exits, which could be a security consideration {Link: notes the creator https://superuser.com/questions/1527492/how-to-run-gui-applications-as-another-user-on-linux-without-ssh-and-kde-gksudo}.

## Summary Table

https://share.google/aimode/lFSCFRFBdVfT2KfiS
