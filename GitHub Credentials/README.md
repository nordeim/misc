# Clearing cached GitHub credentials and updating Git author details

Your "permission denied" error indicates that your system is using cached credentials for the wrong GitHub user ("nordeim"). You need to clear the stored credentials for GitHub, and then Git will prompt you for the correct login information the next time you push.  
The process varies by operating system, as the credentials are saved in your system's secure storage. You should also make sure your commit author details are correct for the new user.

---

## For Windows

**Open Credential Manager.**
- Click the Start Menu and search for "Credential Manager".
- In the search results, click on the Credential Manager control panel to open it.

**Delete the GitHub entry.**
- Click on Windows Credentials.
- Look for an entry for `git:https://github.com` under the "Generic Credentials" section.
- Expand the entry and click Remove. Confirm the deletion.

**Push your changes again.**
- Return to your terminal and run `git push -u origin main`.
- Git will now display a pop-up window asking you to sign in with your correct GitHub account.

---

## For macOS

**Open Keychain Access.**
- Press Command + Space to open Spotlight Search.
- Type "Keychain Access" and hit Enter.

**Delete the GitHub entry.**
- In the Keychain Access application, search for "github.com".
- Find the "internet password" entry for github.com.
- Right-click the entry and choose Delete "github.com".

**Push your changes again.**
- Return to your terminal and run `git push -u origin main`.
- The system will prompt you for your new GitHub username and Personal Access Token (PAT).

---

## For Linux

**Clear cached credentials.**
- If you're using a credentials file, you can manually delete it by running:

```sh
rm ~/.git-credentials
```

> Use code with caution.

**You can also tell Git to reject the stored credentials for GitHub:**

```sh
echo "url=https://github.com" | git credential reject
```

> Use code with caution.

**Push your changes again.**
- Run `git push -u origin main` and enter your correct GitHub credentials when prompted.

---

## How to update your Git author details

The steps above clear your saved login credentials, but they don't change the name and email associated with your commits. To ensure your future commits are associated with the correct user, you should update your global Git configuration.

**To change your name and email for all future commits on your machine, run the following commands:**

```sh
git config --global user.name "Your New Name"
git config --global user.email "yournewemail@example.com"
```

> Use code with caution.

If you only need to change it for the current repository, omit the `--global` flag.

---

https://copilot.microsoft.com/shares/his5FqTFP7TfTXm8ACAR8
