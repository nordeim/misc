<p align="center">
  <img src="https://raw.githubusercontent.com/your-org/your-repo/main/.github/banner.png" width="680" alt="TODO Pro banner">
</p>

<h1 align="center">🔥 TODO Pro</h1>
<p align="center">
  A modern, lightning-fast, tag-powered, single-file <code>Python + Qt 6</code> task manager.<br>
  No server. No vendor lock-in. Just you and your tasks.
</p>

<p align="center">
  <a href="https://github.com/your-org/your-repo/actions"><img alt="CI" src="https://github.com/your-org/your-repo/actions/workflows/ci.yml/badge.svg"></a>
  <img alt="license" src="https://img.shields.io/badge/license-MIT-blue">
  <img alt="made with" src="https://img.shields.io/badge/built_with-PySide6-6.5-critical">
</p>

---

## ✨ Features

|  |  |
|--|--|
| 🏷️ **Tags** | Add `#tags` anywhere in the title → colourful chips, click to filter |
| 🔍 **Fuzzy Search** | Instant search across title & tags |
| 🛎️ **Due-Soon Alerts** | Desktop notifications every hour (cross-platform) |
| 🎨 **Light / Dark Theme** | Quick toggle in the toolbar |
| ↕️ **Drag-&-Drop Re-order** | Custom list order, stored in DB |
| 📈 **Live Stats** | Total / active / completed counter in the status bar |
| ⚡ **Quick-Add** | Press `Return` anywhere, type, hit **OK** – done |
| 🗑️ **Delete / Toggle / Keyboard** | `Del`, `Space`, **all the shortcuts you expect** |
| 🧪 **Built-in Tests** | Run `pytest todo_pro.py::tests` – no GUI needed |

All packed into **one Python file** → perfect for quick hacks, portable scripts, and teaching purposes.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
python -m pip install --upgrade pyside6 notifypy pytest

# 2. Launch the GUI
python todo_pro.py

# 3. (Optional) run the automated tests
pytest todo_pro.py::tests
```

SQLite data lives in `~/.todo_pro.sqlite` (or `%USERPROFILE%\.todo_pro.sqlite` on Windows).  
Delete it if you ever want to start fresh.

---

## 📸 Screenshots

| Light | Dark |
|-------|------|
| ![light](.github/screen_light.png) | ![dark](.github/screen_dark.png) |

---

## 🛠  Architecture

```
                 +--------------+
   PySide6  ───► |  QListView   |  ◄── drag-n-drop, search, chips
                 +------+-------+
                        |
                        ▼
                 +--------------+     SQLite (file)
                 | TaskModel    | ─── tasks table
                 +------+-------+
                        |
                        ▼
                 +--------------+
                 |  Qt SQL API  |
                 +--------------+
```

* MVC-ish: Qt’s `QSqlTableModel` is the **Model**, `QListView` the **View**, and `MainWindow` the **Controller**.  
* No ORM, no external services – dead-simple and hackable.

---

## 🔭 Roadmap / Ideas

* Attach files & images (Blob or file-paths)  
* Cloud-sync (WebDAV / Dropbox) – keep SQLite, just push diffs  
* Mobile UI: switch the view to **Qt Quick** for buttery-smooth swipe actions  
* Natural-language date (“next Monday”) using `dateparser`  
* Pomodoro / time-tracking integration

Want to help? Jump into [issues](../../issues) or open a PR!

---

## 📝 License

MIT – free to use, modify, and share. If you build something cool on top,  
drop a ⭐ and let us know!

---

> Built with 💚 by [Your Name](https://github.com/your-account)
