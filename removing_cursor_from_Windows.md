Below is a detailed procedure you can follow to remove the Cursor program and all its residual files from your Windows 10 PC. **Before you begin:** Make sure you’ve backed up any important data and, if possible, create a system restore point. This way, if anything goes wrong during the cleanup process, you can restore your system to its previous state.

---

### 1. Uninstall the Main Program

**a. Using Windows Settings:**

- **Open Apps & Features:**  
  Press **Windows key + I** to open Settings and go to **Apps → Apps & features**.  
- **Locate and Uninstall:**  
  Scroll through the list or use the search box to find “Cursor.” Click on it and select **Uninstall**.  
- **Follow Prompts:**  
  Complete the uninstaller prompts provided by the application.

**b. Using Control Panel (if needed):**

- **Open Control Panel:**  
  Press **Windows key**, type **Control Panel**, and open it.  
- **Programs and Features:**  
  Select **Uninstall a program** under the **Programs** section.  
- **Select and Uninstall:**  
  Find the Cursor program, right-click, and choose **Uninstall**.

*Note: Ensure the program isn’t running in the background (check Task Manager) before you try to uninstall it.*

---

### 2. Remove Residual Files and Folders

Even after an uninstall, programs can leave behind folders and files. To ensure a complete removal, manually hunt down and delete these residual files.

**a. Check the Program Installation Folders:**

- Look in **`C:\Program Files\`** and **`C:\Program Files (x86)\`** for any folder named “Cursor” or related to it.  
- **Delete the Folder:**  
  If you’re sure these files belong to the Cursor program, delete the folder.

**b. Check User-Specific Data:**

- **AppData Directories:**  
  Open File Explorer and navigate to the following (you can paste these paths directly into the address bar):
  - `%AppData%\` (typically used for roaming profiles)  
  - `%LocalAppData%\` (used for caches and local settings)
- **Search for “Cursor”:**  
  Look for folders or files with “Cursor” in their name and delete them if they clearly belong to the application.

**c. System-Wide Data:**

- **ProgramData:**  
  Check **`C:\ProgramData\`** for any folders related to the Cursor program and remove them.

*A good approach is to perform a search (using File Explorer’s search box) for “cursor” on your system—but be cautious. Verify that the files or folders you’re deleting are not part of Windows system files or other software you wish to keep.*

---

### 3. Clean up Registry Entries

Programs sometimes leave traces in the Windows Registry. Editing the registry is advanced and you must proceed with caution.

**a. Create a Registry Backup:**

- **Export the Registry:**  
  Open **Registry Editor** (press **Windows key + R**, type `regedit`, and hit Enter).  
  In the Registry Editor, click on **File → Export** to save a backup.

**b. Delete Residual Entries:**

- **Search for References:**  
  Press **Ctrl + F** in Registry Editor and type “Cursor” to search for entries related to the program.
- **Examine Before Deleting:**  
  When you find a key or value that appears to belong solely to the Cursor program, right-click and choose **Delete**.
- **Repeat the Search:**  
  Continue until no additional leftover entries are found.

*Be sure you’re not removing unrelated keys. If you’re unsure, it might be best to leave them or consult additional guidance.*

---

### 4. Clear Temporary Files and Caches

The program might have stored temporary files that are not immediately obvious:

- **Delete Temp Files:**  
  Press **Windows key + R**, type `%temp%`, and press Enter.  
  Delete the files and folders in this Temp directory.
- **Disk Cleanup:**  
  You can run Windows’ built-in Disk Cleanup tool to further clear out residual temporary files.

---

### 5. Optional: Use a Third-Party Uninstaller

If manual cleaning sounds too time-consuming or if you’re not comfortable with registry edits, a third-party uninstaller can help remove a program and its remnants more thoroughly. Tools like **Revo Uninstaller** or **IObit Uninstaller** can scan for leftover files and registry entries after the standard uninstallation process.

---

By following these steps, you should be able to completely purge the Cursor program—including its caches, data, temporary storage, configuration files, and related folders—from your Windows 10 PC. This process is generally similar to completely uninstalling any stubborn application, as detailed in guides on comprehensive program removal .

https://copilot.microsoft.com/shares/aRXN3ShFjbNtU1VMa4Dry

---
Yes, the `%temp%` environment variable usually refers to the folder at:

```
C:\Users\jess\AppData\Local\Temp
```

This directory is where Windows and many applications store temporary files. Deleting the contents of this folder is generally safe because these files aren’t needed long-term. However, keep the following points in mind:

- **Some Files Might Be in Use:**  
  If an application or system process is actively using a temporary file, Windows may prevent you from deleting it. You can simply skip these files; they will be removed when they’re no longer in use, or you can consider restarting your computer and trying again.

- **Close Active Applications:**  
  It’s a good idea to close as many programs as possible before purging the content of the `%temp%` folder. This minimizes the chance that you’ll encounter “in use” errors.

- **Don’t Delete the Folder Itself:**  
  Only delete the files and subdirectories inside the `%temp%` folder, not the folder itself. The folder is required by many applications even if it’s currently empty.

- **Use Disk Cleanup if Preferred:**  
  If you’d rather not manually delete files, Windows’ built-in Disk Cleanup tool can help clear temporary files safely.

Clearing out the `%temp%` folder periodically is a useful maintenance task that can help recover disk space and potentially improve system performance. If you encounter locked files during deletion, a system restart or booting in safe mode can often help complete the clean-up. 

https://copilot.microsoft.com/shares/VRVCjSygY1b6VPr6jqDiW
