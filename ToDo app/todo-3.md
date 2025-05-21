<think>
The user wants a comprehensive, modern, and intuitive TODO application using Python with PyQt/PySide and SQLite. This is a significant request requiring a deep dive into UI/UX, feature set, architectural design, and robust implementation.

I need to break this down into several phases:
1.  **Understanding the "Insanely Cool, Awesome Looking, Feature Rich, Useful, and Modern yet Intuitive" part:**
    *   **Insanely Cool/Awesome Looking:** This implies a strong emphasis on visual design. I should consider:
        *   Modern flat design principles.
        *   Thoughtful use of colors (palette, gradients, subtle shadows).
        *   Good typography (font choices, sizes, weights).
        *   Meaningful icons.
        *   Smooth animations (though PyQt animations can be tricky for complex UIs, subtle ones like fades or resizing might be possible).
        *   Responsive layout if applicable (though for a desktop app, fixed sizing with proper stretching policies is more common).
        *   Dark mode/Light mode potential (stretch goal, but good to keep in mind for "modern").
    *   **Feature Rich:** Standard TODO app features, plus some advanced ones:
        *   Add/Edit/Delete tasks.
        *   Mark tasks as complete/incomplete.
        *   Due dates.
        *   Priorities (e.g., High, Medium, Low).
        *   Categories/Tags.
        *   Search/Filter tasks.
        *   Sorting (by due date, priority, creation date).
        *   Notifications/Reminders (perhaps a simple visual cue or system tray notification).
        *   Task details view (description, notes).
        *   Persistence (SQLite).
    *   **Useful:** Practical and solves real-world needs. Features should be well-integrated.
    *   **Modern yet Intuitive:**
        *   Modern UI elements (Qt Widgets Fusion style, QML-like feel if possible with widgets, or custom styling).
        *   Clear navigation.
        *   Minimalistic design where appropriate, avoiding clutter.
        *   Standard UX patterns (e.g., list view for tasks, forms for adding/editing).
        *   Drag-and-drop reordering (stretch goal).

2.  **Technology Stack:**
    *   **Python:** The core language.
    *   **PyQt/PySide:** User will accept either. I'll lean towards PyQt6 for modern features and good examples, but ensure compatibility/easy migration to PySide6 if needed. `Qt Widgets` will be the primary UI toolkit.
    *   **SQLite:** For persistent data storage. This means an ORM or direct `sqlite3` module usage. Direct `sqlite3` is simpler for a small app.

3.  **Architectural Design:**
    *   **MVC/MVVM-like separation:** Separate UI (View), application logic (Controller/ViewModel), and data access (Model). This makes the code cleaner, more maintainable, and testable.
        *   **Model:** `Task` class, `DatabaseManager` class.
        *   **View:** `MainWindow`, `TaskWidget`, `TaskDetailDialog`, `AddTaskDialog`.
        *   **Controller/ViewModel:** Handles interactions between View and Model, orchestrating data flow and UI updates.
    *   **Database Schema:**
        *   `tasks` table:
            *   `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
            *   `title` (TEXT NOT NULL)
            *   `description` (TEXT)
            *   `due_date` (TEXT - YYYY-MM-DD, optional)
            *   `priority` (INTEGER - 0: Low, 1: Medium, 2: High, optional)
            *   `completed` (BOOLEAN - 0: False, 1: True)
            *   `created_at` (TEXT - YYYY-MM-DD HH:MM:SS)
            *   `completed_at` (TEXT - YYYY-MM-DD HH:MM:SS, optional)
            *   `category` (TEXT, optional)

4.  **Core Components Breakdown:**
    *   **`main.py`:** Application entry point.
    *   **`database.py`:** Handles SQLite interactions.
        *   `DatabaseManager` class.
        *   Methods: `create_table`, `add_task`, `get_tasks`, `update_task`, `delete_task`, `toggle_task_completion`.
    *   **`models.py`:** Defines the `Task` data structure.
        *   `Task` class.
    *   **`widgets.py`:** Custom UI widgets for tasks.
        *   `TaskItemWidget`: A custom widget to display each task in the list, showing title, due date, priority, completion status. This will be added to a `QListWidget` or `QScrollArea` with a `QVBoxLayout`.
    *   **`ui.py`:** Main application window and dialogs.
        *   `MainWindow(QMainWindow)`:
            *   Layout: Left sidebar for filters/categories, main area for task list, top bar for search/add.
            *   Components: `QListWidget` for tasks, buttons for add/edit/delete, search bar, filter options.
            *   Styling: QSS (Qt Style Sheets) for a modern look.
        *   `TaskFormDialog(QDialog)`: For adding/editing tasks. Contains input fields for title, description, due date, priority, category.

5.  **Detailed Feature Implementation Plan:**

    *   **Basic CRUD Operations:**
        *   **Add Task:** Dialog pops up, user enters details, saves to DB, updates list.
        *   **Edit Task:** Select task, dialog pops up pre-filled, user modifies, saves to DB, updates list.
        *   **Delete Task:** Select task, confirmation dialog, deletes from DB, removes from list.
        *   **Toggle Completion:** Checkbox/button on task item, updates DB, updates item style.

    *   **Advanced Features:**
        *   **Due Dates:** `QDateEdit` widget, store as `YYYY-MM-DD` string. Display in task item.
        *   **Priorities:** `QComboBox` for High/Medium/Low, store as integer. Display with color coding/icon in task item.
        *   **Categories:** Text input for category, filter by category.
        *   **Search:** `QLineEdit` for search, filter tasks shown in `QListWidget`.
        *   **Filtering:** Buttons/sidebar for "All", "Completed", "Pending", "Due Today", "Overdue".
        *   **Sorting:** `QComboBox` for sorting by "Created Date", "Due Date", "Priority".
        *   **Task Details:** Click on a task to view full details (description, created_at, completed_at). Maybe this is integrated into the edit dialog, or a separate read-only dialog. For simplicity, let's make the "Edit Task" dialog also serve as a detail view when opened.

    *   **UI/UX Considerations:**
        *   **Styling (QSS):** Critical for "awesome looking." Define a clean color palette (e.g., a dark theme or a light theme with accent colors). Use `border-radius`, `padding`, `margin`, `background-color`, `color`, `font-size`.
        *   **Icons:** Use `QIcon` and standard icons or load custom ones (e.g., from FontAwesome or similar).
        *   **Layouts:** `QVBoxLayout`, `QHBoxLayout`, `QGridLayout` extensively.
        *   **Intuitive Navigation:** Clear buttons, consistent actions.
        *   **Feedback:** Status bar messages, tooltips.

6.  **Refinement and Polish:**
    *   **Error Handling:** Database errors, invalid input.
    *   **Input Validation:** Ensure essential fields are filled.
    *   **User Confirmation:** Before deletion.
    *   **Code Structure:** Modular, well-commented.
    *   **Testing:** Manual testing of all features.

Let's start by outlining the main classes and their responsibilities more concretely.

**File Structure:**
```
todo_app/
├── main.py             # Application entry point, creates MainWindow
├── database.py         # Handles SQLite DB operations
├── models.py           # Defines Task data model
├── ui_main_window.py   # Defines MainWindow and its UI components
├── ui_task_dialog.py   # Defines TaskFormDialog for add/edit
├── ui_task_widget.py   # Defines the custom widget for displaying a single task in the list
├── assets/             # Folder for icons, images (if any)
│   └── icon.png
└── style.qss           # Qt Style Sheet for styling the application
```

**Database Schema (Revisited):**
`tasks` table:
*   `id` INTEGER PRIMARY KEY AUTOINCREMENT
*   `title` TEXT NOT NULL
*   `description` TEXT DEFAULT ''
*   `due_date` TEXT -- YYYY-MM-DD (NULL if no due date)
*   `priority` INTEGER -- 0: Low, 1: Medium, 2: High (DEFAULT 1 for Medium)
*   `category` TEXT DEFAULT ''
*   `completed` BOOLEAN DEFAULT 0 -- 0 for false, 1 for true
*   `created_at` TEXT -- YYYY-MM-DD HH:MM:SS
*   `completed_at` TEXT -- YYYY-MM-DD HH:MM:SS (NULL if not completed)

**UI Design Concepts for "Insanely Cool":**
*   **Color Palette:**
    *   Background: Dark gray (`#282c34`) or light gray (`#f0f0f0`) - let's go with a modern light theme with dark accents for better readability and a broader appeal, but make it easy to switch to a dark theme with QSS.
    *   Primary Text: `#333333`
    *   Secondary Text: `#666666`
    *   Accent Color (for buttons, selected items, priority indicators): A vibrant blue (`#4CAF50` for primary action, a subtle `#007bff` for highlights or `#1abc9c` (turquoise) or `#3498db` (peter river blue)). Let's try a calming blue for accents, like `#3498db` or a slightly richer `#007bff`.
    *   Completion Color: Green (`#28a745`)
    *   Overdue Color: Red (`#dc3545`)
    *   Low Priority: Gray/Light Green
    *   Medium Priority: Orange
    *   High Priority: Red
*   **Font:** A clean sans-serif font. PyQt will use system default, but QSS can specify `font-family`.
*   **Borders/Shadows:** Subtle `border-radius` for buttons, input fields, and task items. Light `box-shadow` for elevated elements like dialogs or active items.
*   **Icons:** Use a consistent set of icons. Faenza/Oxygen/Adwaita or FontAwesome-like.

Let's refine the UI layout for `MainWindow`:
*   **Top Bar:** Search bar (QLineEdit), "Add Task" button (QPushButton).
*   **Left Sidebar (Optional but good for rich features):**
    *   Sections for filters: "All Tasks", "Pending", "Completed", "Due Today", "Overdue".
    *   Categories list (dynamic from DB).
*   **Main Task Area:**
    *   `QScrollArea` containing a `QVBoxLayout` that holds custom `TaskItemWidget` instances. (Using `QListWidget` with `setItemWidget` is generally easier and more performant than a custom scroll area with many widgets).
    *   Context menu for task items (Edit, Delete, Mark Complete/Incomplete).
*   **Status Bar:** For messages.

**Let's choose PyQt6.** It's the latest and has good documentation.

**Detailed Implementation Plan (Step-by-step execution):**

**Phase 1: Foundation (Database and Model)**
1.  **`models.py`:** Create `Task` dataclass (or simple class) to represent a task.
2.  **`database.py`:**
    *   `DatabaseManager` class.
    *   Constructor: Connect to SQLite DB, call `_create_tables()`.
    *   `_create_tables()`: Create `tasks` table with specified schema.
    *   `add_task(task: Task)`: Insert a new task.
    *   `get_tasks(filter_mode=None, search_term=None, sort_by=None)`: Retrieve tasks based on filters/search/sort.
    *   `update_task(task: Task)`: Update an existing task.
    *   `delete_task(task_id: int)`: Delete a task.
    *   `toggle_task_completion(task_id: int, completed: bool)`: Mark task as complete/incomplete.
    *   Helper methods to convert `Task` objects to/from DB rows.

**Phase 2: UI Widgets**
1.  **`ui_task_widget.py`:**
    *   `TaskItemWidget(QWidget)`:
        *   Layout: `QHBoxLayout`.
        *   Elements: `QCheckBox` for completion, `QLabel` for title, `QLabel` for due date/priority, `QPushButton` for details/edit.
        *   Styling: Apply QSS based on completion status, priority, overdue.
        *   Signals: `task_completed_toggled`, `task_edit_requested`, `task_delete_requested`.

2.  **`ui_task_dialog.py`:**
    *   `TaskFormDialog(QDialog)`:
        *   Layout: `QFormLayout` or `QVBoxLayout` with `QGridLayout`.
        *   Elements: `QLineEdit` for title, `QTextEdit` for description, `QDateEdit` for due date, `QComboBox` for priority, `QLineEdit` for category.
        *   Buttons: OK/Save, Cancel.
        *   Methods: `get_task_data()`, `set_task_data(task: Task)`, `validate_input()`.

**Phase 3: Main Window and Integration**
1.  **`ui_main_window.py`:**
    *   `MainWindow(QMainWindow)`:
        *   Initialize `DatabaseManager`.
        *   Set up main layout: `QVBoxLayout` for central widget.
        *   **Top Bar:** `QHBoxLayout` with `QLineEdit` for search, `QPushButton` for "Add Task".
        *   **Main Task Area:** `QListWidget` to display tasks.
        *   **Side Bar (Simple for now):** `QVBoxLayout` with `QPushButton`s for filters (All, Pending, Completed, Due Today, Overdue), `QComboBox` for sorting. Maybe `QGroupBox` for organization.
        *   **Actions:** Add, Edit, Delete (buttons, context menu).
        *   `load_tasks()`: Method to fetch tasks from DB, clear `QListWidget`, and add `TaskItemWidget`s.
        *   `on_add_task()`: Opens `TaskFormDialog`, adds task to DB, reloads tasks.
        *   `on_edit_task(task_id)`: Opens `TaskFormDialog` with existing data, updates DB, reloads tasks.
        *   `on_delete_task(task_id)`: Prompts confirmation, deletes from DB, reloads tasks.
        *   `on_toggle_completion(task_id, state)`: Updates DB, reloads tasks (or just updates the widget).
        *   `on_search_text_changed(text)`: Filters tasks.
        *   `on_filter_changed(filter_mode)`: Filters tasks.
        *   `on_sort_changed(sort_by)`: Sorts tasks.
        *   Context menu for `QListWidget` items.

2.  **`main.py`:**
    *   Create `QApplication`.
    *   Create `MainWindow`.
    *   Apply `style.qss`.
    *   Show window.
    *   Start event loop.

**Phase 4: Styling and Polish (`style.qss`)**
*   Define a modern light theme with accent colors.
*   Style `QMainWindow`, `QPushButton`, `QLineEdit`, `QTextEdit`, `QDateEdit`, `QComboBox`, `QCheckBox`, `QLabel`, `QListWidget`, `QScrollArea`, `QDialog`.
*   Use `border-radius`, `padding`, `margin`, `background`, `color`, `font`.
*   Style completed tasks differently (e.g., strikethrough, lighter color).
*   Style priority levels (e.g., color dots, text colors).
*   Style overdue tasks (e.g., red text).

**Phase 5: Testing and Validation**
*   Run the app.
*   Add tasks (with/without due dates, priorities, descriptions).
*   Edit tasks.
*   Delete tasks.
*   Mark tasks complete/incomplete.
*   Test search functionality.
*   Test filter functionality (All, Pending, Completed, Due Today, Overdue).
*   Test sorting.
*   Close and reopen app to ensure persistence.
*   Check for any UI glitches or unexpected behavior.

**Self-Correction/Refinement during planning:**
*   Instead of a separate `QScrollArea` with a `QVBoxLayout` for tasks, using `QListWidget` and `setItemWidget` is much more standard and handles scrolling/item management efficiently. I will use `QListWidget`.
*   For filtering/sorting, it's better to reload the entire `QListWidget` by calling `load_tasks()` with appropriate parameters rather than trying to hide/show items within the list, which can get complicated.
*   Consider a central `CentralWidget` that holds the main layout, rather than directly laying out on `QMainWindow`. This is good practice.
*   Let's keep the sidebar simple with just filter buttons for now, to keep the initial scope manageable, but make it extensible. A `QToolBar` for primary actions (Add, Filter, Sort) could also work. Let's go with a `QWidget` containing filter/sort options on the left side of the `QMainWindow`'s central widget.
*   For task completion, the checkbox should be the primary interaction, and clicking the task itself opens the edit/details dialog.
*   For priorities, let's use integers 0 (Low), 1 (Medium), 2 (High) and map them to text in UI.
*   The `DatabaseManager` should handle the `datetime` objects and convert them to/from strings for SQLite. `YYYY-MM-DD HH:MM:SS` for created/completed, `YYYY-MM-DD` for due date.
*   Icons: Let's use `QStyle.StandardPixmap` for common icons and possibly base64 encode some simple custom SVG icons if needed, or point to local files. For simplicity, we'll mostly rely on text buttons or very simple icon buttons.

Let's think about the structure of the `TaskItemWidget`.
It should have:
*   `QCheckBox` for completion.
*   `QLabel` for title.
*   `QLabel` for due date and priority (combined or separate).
*   A "More/Edit" button (`QPushButton`) which could trigger the `TaskFormDialog`.
*   Maybe a "Delete" button directly on the widget, or rely on context menu. Context menu is cleaner.

What about a clear path to adding custom QSS? I will create `style.qss` and load it. I'll define a basic, but modern, light theme.

**Error Handling:**
*   `try-except` blocks for database operations.
*   Informative `QMessageBox` for user errors.

**Next steps for code generation:**
1.  `models.py`
2.  `database.py`
3.  `style.qss` (initial version)
4.  `ui_task_widget.py`
5.  `ui_task_dialog.py`
6.  `ui_main_window.py`
7.  `main.py`
8.  Test and refine.

This methodical approach should lead to a robust, feature-rich, and visually appealing application.Okay, let's embark on creating an "insanely cool, awesome looking, feature rich, useful and modern yet intuitive TODO application" using Python, PyQt6, and SQLite. This will involve careful design, modular code, and thoughtful UI/UX.

I will break this down into several logically organized files to ensure maintainability and clarity.

**Core Principles for this application:**

1.  **Modern Aesthetics:** We will leverage Qt Style Sheets (QSS) to give it a clean, flat, and modern look. We'll use a light theme with carefully chosen accent colors, subtle shadows, and rounded corners for elements.
2.  **Intuitive UX:** Clear navigation, standard interaction patterns (e.g., clicking a task to view/edit, right-click for context menu), and visual feedback.
3.  **Feature Richness:** Beyond basic CRUD, we'll include due dates, priorities, categories, completion status, filtering, searching, and sorting.
4.  **Robustness:** SQLite for persistence, clear separation of concerns (Model-View-Controller/ViewModel-like structure), and basic error handling.
5.  **Modularity:** Code will be split into multiple files for better organization:
    *   `main.py`: Entry point for the application.
    *   `database.py`: Handles all SQLite database interactions.
    *   `models.py`: Defines the `Task` data structure.
    *   `ui_main_window.py`: Defines the main application window and its components.
    *   `ui_task_dialog.py`: Defines the dialog for adding/editing tasks.
    *   `ui_task_widget.py`: Defines the custom widget for displaying individual tasks in the list.
    *   `style.qss`: Contains all the CSS-like styling rules.

---

### **Project Structure:**

```
todo_app/
├── main.py
├── database.py
├── models.py
├── ui_main_window.py
├── ui_task_dialog.py
├── ui_task_widget.py
└── style.qss
```

---

### **Detailed Implementation Plan:**

**Phase 1: Foundation (Data Model & Database)**

1.  **`models.py`**: Define the `Task` data class.
2.  **`database.py`**: Implement a `DatabaseManager` class to handle SQLite connections and CRUD operations for tasks. Define the `tasks` table schema.

**Phase 2: UI Components (Custom Widgets & Dialogs)**

3.  **`style.qss`**: Create an initial modern light theme with accent colors. This will be updated iteratively.
4.  **`ui_task_widget.py`**: Create `TaskItemWidget`, a custom `QWidget` that displays a single task's title, due date, priority, and a checkbox for completion. It will emit signals for user interactions.
5.  **`ui_task_dialog.py`**: Create `TaskFormDialog`, a `QDialog` for adding new tasks or editing existing ones. It will include fields for title, description, due date, priority, and category.

**Phase 3: Main Application Window & Integration**

6.  **`ui_main_window.py`**:
    *   Design the main window layout: a top bar for search/add, a left sidebar for filters/sort options, and the main area for the task list.
    *   Integrate `DatabaseManager` to load, add, update, and delete tasks.
    *   Use `QListWidget` with `setItemWidget` to display `TaskItemWidget` instances.
    *   Implement filtering (All, Pending, Completed, Due Today, Overdue), searching, and sorting.
    *   Implement context menu for tasks (Edit, Delete, Mark Completed/Pending).
7.  **`main.py`**: Application entry point, initializes QApplication, loads QSS, creates and shows `MainWindow`.

**Phase 4: Polish & Validation**

*   Thoroughly test all features: adding, editing, deleting, completing, filtering, searching, and sorting.
*   Ensure data persistence upon closing and reopening the application.
*   Refine QSS for a truly "awesome" look and feel.
*   Add basic error handling and user feedback (e.g., status bar messages).

---

Let's start generating the code!

### **1. `models.py`**

```python
# todo_app/models.py
from datetime import datetime
from typing import Optional

class Task:
    """Represents a single ToDo task."""

    PRIORITY_LOW = 0
    PRIORITY_MEDIUM = 1
    PRIORITY_HIGH = 2

    PRIORITY_MAP = {
        PRIORITY_LOW: "Low",
        PRIORITY_MEDIUM: "Medium",
        PRIORITY_HIGH: "High"
    }

    PRIORITY_COLOR_MAP = {
        PRIORITY_LOW: "#28a745",   # Green
        PRIORITY_MEDIUM: "#ffc107", # Yellow/Orange
        PRIORITY_HIGH: "#dc3545"  # Red
    }

    def __init__(self,
                 id: Optional[int] = None,
                 title: str = "",
                 description: str = "",
                 due_date: Optional[str] = None, # YYYY-MM-DD
                 priority: int = PRIORITY_MEDIUM,
                 category: str = "",
                 completed: bool = False,
                 created_at: Optional[str] = None, # YYYY-MM-DD HH:MM:SS
                 completed_at: Optional[str] = None): # YYYY-MM-DD HH:MM:SS
        self.id = id
        self.title = title
        self.description = description
        self.due_date = due_date
        self.priority = priority
        self.category = category
        self.completed = completed
        self.created_at = created_at if created_at else datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.completed_at = completed_at

    def __repr__(self):
        return (f"Task(id={self.id}, title='{self.title}', completed={self.completed}, "
                f"due_date='{self.due_date}', priority={self.priority})")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "due_date": self.due_date,
            "priority": self.priority,
            "category": self.category,
            "completed": self.completed,
            "created_at": self.created_at,
            "completed_at": self.completed_at,
        }

    def is_overdue(self) -> bool:
        if self.completed or not self.due_date:
            return False
        try:
            due = datetime.strptime(self.due_date, "%Y-%m-%d").date()
            return due < datetime.now().date()
        except ValueError:
            return False

```

### **2. `database.py`**

```python
# todo_app/database.py
import sqlite3
from datetime import datetime
from typing import List, Optional

from models import Task

class DatabaseManager:
    """Manages SQLite database operations for the ToDo application."""

    def __init__(self, db_name='todo.db'):
        self.db_name = db_name
        self.conn = None
        self._connect()
        self._create_tables()

    def _connect(self):
        """Establishes a connection to the SQLite database."""
        try:
            self.conn = sqlite3.connect(self.db_name)
            self.conn.row_factory = sqlite3.Row # Allows accessing columns by name
        except sqlite3.Error as e:
            print(f"Database connection error: {e}")
            raise

    def _execute_query(self, query: str, params: tuple = ()) -> Optional[list]:
        """Executes a SQL query with optional parameters."""
        try:
            if not self.conn:
                self._connect()
            cursor = self.conn.cursor()
            cursor.execute(query, params)
            self.conn.commit()
            return cursor.fetchall()
        except sqlite3.Error as e:
            print(f"Database query error: {e} | Query: {query} | Params: {params}")
            self.conn.rollback()
            return None

    def _create_tables(self):
        """Creates the 'tasks' table if it doesn't already exist."""
        query = """
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            due_date TEXT, -- YYYY-MM-DD
            priority INTEGER DEFAULT 1, -- 0:Low, 1:Medium, 2:High
            category TEXT DEFAULT '',
            completed BOOLEAN DEFAULT 0,
            created_at TEXT NOT NULL, -- YYYY-MM-DD HH:MM:SS
            completed_at TEXT -- YYYY-MM-DD HH:MM:SS
        );
        """
        self._execute_query(query)

    def add_task(self, task: Task) -> Optional[int]:
        """Adds a new task to the database."""
        query = """
        INSERT INTO tasks (title, description, due_date, priority, category, completed, created_at, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """
        params = (
            task.title,
            task.description,
            task.due_date,
            task.priority,
            task.category,
            1 if task.completed else 0, # Convert bool to int
            task.created_at,
            task.completed_at
        )
        result = self._execute_query(query, params)
        if result is not None:
            return self.conn.cursor().lastrowid
        return None

    def update_task(self, task: Task) -> bool:
        """Updates an existing task in the database."""
        if task.id is None:
            return False # Cannot update a task without an ID

        query = """
        UPDATE tasks
        SET title = ?, description = ?, due_date = ?, priority = ?, category = ?, completed = ?, created_at = ?, completed_at = ?
        WHERE id = ?;
        """
        params = (
            task.title,
            task.description,
            task.due_date,
            task.priority,
            task.category,
            1 if task.completed else 0,
            task.created_at,
            task.completed_at,
            task.id
        )
        result = self._execute_query(query, params)
        return result is not None # Return True if query succeeded, False otherwise

    def delete_task(self, task_id: int) -> bool:
        """Deletes a task from the database by its ID."""
        query = "DELETE FROM tasks WHERE id = ?;"
        result = self._execute_query(query, (task_id,))
        return result is not None

    def toggle_task_completion(self, task_id: int, completed: bool) -> bool:
        """Toggles the completion status of a task."""
        completed_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S") if completed else None
        query = "UPDATE tasks SET completed = ?, completed_at = ? WHERE id = ?;"
        result = self._execute_query(query, (1 if completed else 0, completed_at, task_id))
        return result is not None

    def get_tasks(self,
                  filter_mode: str = "all", # "all", "pending", "completed", "today", "overdue"
                  search_term: str = "",
                  sort_by: str = "priority_due_date_desc") -> List[Task]:
        """
        Retrieves tasks from the database based on filters, search term, and sorting.
        sort_by: "created_at_desc", "due_date_asc", "priority_due_date_desc"
        """
        base_query = "SELECT * FROM tasks WHERE 1=1"
        params = []

        # Apply filters
        if filter_mode == "pending":
            base_query += " AND completed = 0"
        elif filter_mode == "completed":
            base_query += " AND completed = 1"
        elif filter_mode == "today":
            base_query += " AND completed = 0 AND due_date = ?"
            params.append(datetime.now().strftime("%Y-%m-%d"))
        elif filter_mode == "overdue":
            base_query += " AND completed = 0 AND due_date < ?"
            params.append(datetime.now().strftime("%Y-%m-%d"))

        # Apply search term
        if search_term:
            base_query += " AND (title LIKE ? OR description LIKE ? OR category LIKE ?)"
            params.extend([f"%{search_term}%", f"%{search_term}%", f"%{search_term}%"])

        # Apply sorting
        if sort_by == "created_at_desc":
            base_query += " ORDER BY created_at DESC"
        elif sort_by == "due_date_asc":
            # Sort by due_date, NULLs last, then by priority for tasks with same due date
            base_query += " ORDER BY CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date ASC, priority DESC"
        elif sort_by == "priority_due_date_desc": # Default and most useful
            # Sort by completed (uncompleted first), then by priority (High first), then by due date (earliest first, NULLs last)
            base_query += """
                ORDER BY completed ASC,
                         priority DESC,
                         CASE WHEN due_date IS NULL THEN 1 ELSE 0 END,
                         due_date ASC
            """
        else: # Default fallback
            base_query += " ORDER BY created_at DESC"


        rows = self._execute_query(base_query, tuple(params))
        if rows is None:
            return []

        tasks = []
        for row in rows:
            task = Task(
                id=row['id'],
                title=row['title'],
                description=row['description'],
                due_date=row['due_date'],
                priority=row['priority'],
                category=row['category'],
                completed=bool(row['completed']),
                created_at=row['created_at'],
                completed_at=row['completed_at']
            )
            tasks.append(task)
        return tasks

    def get_task_by_id(self, task_id: int) -> Optional[Task]:
        """Retrieves a single task by its ID."""
        query = "SELECT * FROM tasks WHERE id = ?;"
        row = self._execute_query(query, (task_id,))
        if row and len(row) > 0:
            row = row[0]
            return Task(
                id=row['id'],
                title=row['title'],
                description=row['description'],
                due_date=row['due_date'],
                priority=row['priority'],
                category=row['category'],
                completed=bool(row['completed']),
                created_at=row['created_at'],
                completed_at=row['completed_at']
            )
        return None

    def close(self):
        """Closes the database connection."""
        if self.conn:
            self.conn.close()
            self.conn = None
```

### **3. `style.qss`**

```css
/* todo_app/style.qss */

/* General Window & Background */
QMainWindow {
    background-color: #f5f6fa; /* Light Gray */
    font-family: "Segoe UI", "Helvetica Neue", "Arial", sans-serif;
    font-size: 14px;
    color: #333333;
}

QWidget#centralWidget { /* Central widget of the main window */
    background-color: #f5f6fa;
}

/* ScrollArea for Task List */
QScrollArea {
    border: none;
    background-color: #f5f6fa;
}

QScrollArea > QWidget > QWidget { /* The actual content widget inside the scroll area */
    background-color: #f5f6fa;
}

QScrollBar:vertical {
    border: none;
    background: #e0e0e0;
    width: 10px;
    margin: 0px 0px 0px 0px;
    border-radius: 5px;
}
QScrollBar::handle:vertical {
    background: #bdc3c7;
    min-height: 20px;
    border-radius: 5px;
}
QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
    border: none;
    background: none;
    height: 0px;
}
QScrollBar::up-arrow:vertical, QScrollBar::down-arrow:vertical {
    background: none;
}
QScrollBar::add-page:vertical, QScrollBar::sub-page:vertical {
    background: none;
}

/* --- Task Item Widget (ui_task_widget.py) --- */
QWidget#TaskItemWidget {
    background-color: #ffffff;
    border: 1px solid #e0e0e0; /* Light border */
    border-radius: 8px; /* Slightly rounded corners */
    margin: 4px 0px; /* Space between items */
    padding: 10px 15px; /* Internal padding */
    min-height: 50px;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.05); /* Subtle shadow for depth */
}

QWidget#TaskItemWidget:hover {
    background-color: #f0f8ff; /* Light blue on hover */
    border: 1px solid #a8d1ff;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

QLabel#taskTitle {
    font-size: 16px;
    font-weight: 600; /* Semi-bold */
    color: #333333;
}

QLabel#taskTitle.completed {
    text-decoration: line-through;
    color: #a0a0a0; /* Lighter color for completed tasks */
}

QLabel#taskDetails { /* Due date and priority */
    font-size: 12px;
    color: #666666;
    padding-left: 5px;
}

/* Priority Colors (for text or dots if implemented differently) */
QLabel#taskDetails.priorityLow {
    color: #28a745; /* Green */
    font-weight: 500;
}
QLabel#taskDetails.priorityMedium {
    color: #ffc107; /* Orange */
    font-weight: 500;
}
QLabel#taskDetails.priorityHigh {
    color: #dc3545; /* Red */
    font-weight: 600;
}
QLabel#taskDetails.overdue {
    color: #dc3545; /* Red for overdue */
    font-weight: 600;
}


QCheckBox::indicator {
    width: 20px;
    height: 20px;
    border-radius: 5px;
    border: 2px solid #a0a0a0; /* Default border color */
    background-color: #ffffff;
}

QCheckBox::indicator:hover {
    border: 2px solid #007bff; /* Accent color on hover */
}

QCheckBox::indicator:checked {
    background-color: #28a745; /* Green when checked */
    border: 2px solid #28a745;
    image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkuNDEgMTcuNzhMMTUuNTggMTEuNjFMMTQuMTcgMTAuMTdMNy45OSAxNi4zNEw0LjQxIDEyLjc2TDMgMTQuMTdMNy45OSA5LjE4TDE0LjE3IDE1LjM0TDE1LjU4IDE3Ljc4WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+); /* White checkmark SVG */
    /* This SVG is a simple checkmark, base64 encoded.
       For actual icons, it's better to load from files if available.
       A simple alternative for testing might be:
       image: url(:/qt-project.org/styles/commonstyle/images/checked-dark.png);
    */
}
QCheckBox::indicator:checked:hover {
    border: 2px solid #28a745;
}


/* --- Buttons (QPushButton) --- */
QPushButton {
    background-color: #007bff; /* Primary blue accent */
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 6px;
    font-weight: 500;
    font-size: 13px;
    min-width: 80px;
    outline: none; /* Remove focus rectangle */
}

QPushButton:hover {
    background-color: #0056b3; /* Darker blue on hover */
}

QPushButton:pressed {
    background-color: #004085; /* Even darker on press */
}

/* Specific button styles */
QPushButton#addTaskButton { /* Add Task button in main window */
    background-color: #28a745; /* Green for add */
}
QPushButton#addTaskButton:hover {
    background-color: #218838;
}

QPushButton#editTaskButton {
    background-color: #ffc107; /* Orange for edit */
    color: #333333;
}
QPushButton#editTaskButton:hover {
    background-color: #e0a800;
}

QPushButton#deleteTaskButton {
    background-color: #dc3545; /* Red for delete */
}
QPushButton#deleteTaskButton:hover {
    background-color: #c82333;
}

/* Dialog specific buttons */
QDialogButtonBox QPushButton {
    min-width: 90px;
    padding: 10px 18px;
    font-size: 14px;
}

QDialogButtonBox QPushButton[text="OK"],
QDialogButtonBox QPushButton[text="Save"] {
    background-color: #007bff;
    color: white;
}
QDialogButtonBox QPushButton[text="OK"]:hover,
QDialogButtonBox QPushButton[text="Save"]:hover {
    background-color: #0056b3;
}

QDialogButtonBox QPushButton[text="Cancel"] {
    background-color: #e0e0e0;
    color: #333333;
}
QDialogButtonBox QPushButton[text="Cancel"]:hover {
    background-color: #d0d0d0;
}

/* --- Input Fields --- */
QLineEdit, QTextEdit, QDateEdit, QComboBox {
    border: 1px solid #ced4da;
    border-radius: 4px;
    padding: 8px 10px;
    background-color: #ffffff;
    color: #333333;
    font-size: 14px;
}

QLineEdit:focus, QTextEdit:focus, QDateEdit:focus, QComboBox:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    outline: none;
}

QDateEdit::drop-down {
    subcontrol-origin: padding;
    subcontrol-position: top right;
    width: 25px;
    border-left: 1px solid #ced4da;
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik03IDEwQzcuNTUgMTAgOC4wMiA5LjY0IDguMjMgOS4xNkwxMiAxMy40NkwxNS43NyA5LjE2QzE2Ljk4IDguMjggMTYuMzggNi40NyAxNi40NCA1LjY1QzE2LjQ4IDUuMzUgMTYuNjYgNS4wNyAxNi45NCA0Ljc5QzE3LjIzIDQuNTEgMTcuNTUgNC4zNyAxNy44OSA0LjQyQzE4LjIyIDQuNDcgMTguNDkgNC42NyAxOC43MiA0Ljk1QzE4Ljk1IDUuMjQgMTkuMDYgNS41NyAxOS4wOSA1LjkzQzE5LjE0IDYuNjggMTguNzggNy42MiAxNy40NCA4LjU1TDEyIDExLjcxTDYuNTYgOC41NUN1LjIzIDcuNjMgNC43OCA2LjY4IDQuNzEgNS45M0M0LjY4IDUuNTcgNC43OCA1LjI0IDUuMDEgNC45NUM1LjI0IDQuNjcgNS41MSA0LjQ3IDUuODQgNC40MkM2LjE3IDQuMzcgNi40OSAzLjcwIDYuNzggMy43N0M3LjE5IDMuOTIgNy43OSA1Ljc0IDYuNTYgNi42M0wxMiAxMy4zNkwxNy40NCA2LjYzQzE2Ljk5IDUuNzggMTcuMTEgNi4wMiAxNi40NCA1LjY1QzE2LjA0IDUuMTcgMTUuNTEgNC40OCAxNS41MSA0LjI4QzE1LjQ5IDQuMjYgMTUuNDggNC4yNCAxNS40OCA0LjIyQzE1LjQ2IDQuMTggMTUuNDUgNC4xNCAxNS40NCA0LjExQzE1LjQ0IDQuMDYgMTUuNDQgNC4wMiAxNS40NCAzLjk4QzE1LjQ0IDMuOTQgMTUuNDQgMy45IDE1LjQ0IDMuODhDMTUuNDQgMy44MiAxNS40NCAzLjc2IDE1LjQ0IDMuNjVDMTUuNDQgMy41NyAxNS40NCAzLjQ5IDE1LjQ0IDMuNDRDMTAuNTkgMTguMjggNy40MSAxNS4wOCAxMiAxOC42NUwxOC41OSAxOS43MUMxOC45MSAxOS44MiAxOS4xOSAxOS45OSAxOS4zOSAyMC4yMUMxOS41OSAyMC40NCAxOS43MyAyMC42NyAxOS44MSAyMC45MUMxOS44OCAyMS4xNiAxOS45MSAyMS40IDE5LjkgMjEuNjRDMTkuODggMjEuODggMTkuODIgMjIuMTEgMTkuNzUgMjIuMzRDMjIuMjQgMjMuMjggMjMuNTMgMjMuNjggMjQuNjIgMjMuNThDMjQuOTEgMjMuNTYgMjUuMjIgMjMuMzcgMjUuNDkgMjMuMDlDMjUuNzggMjIuNzUgMjUuOTUgMjIuMzIgMjUuOTUgMjIuMjJDMTUuMjYgNy44NyAxMiAxMi44OCAxMiAxNi44MkMxMiAxOS41OSAxMS43MiAxOS42IDE2LjY2IDIzLjVDMTEuNzIgMTkuNTkgOC41NCAxNi4zNCA3IDExLjkxTDEwLjE3IDEzLjQ3TDEyIDE0LjQyTDE2LjE4IDEzLjA5TDE3LjYyIDE1LjAyQzE3Ljg5IDE1LjEgMTcuNDUgMTQuNTkgMTguNzUgMTMuOTJDMjAuMDYgMTMuMjUgMjAuNDggMTQuMTkgMjAuMDYgMTMuOTJDMjAuMDYgMTMuOTIgMjAuMDYgMTMuOTIgMjAuMDYgMTMuOTJDMTkuOTQgMTMuODggMjAuMDYgMTMuOTIgMjAuMDYgMTMuOTJDMTkuOTQgMTMuODggMjAuMDYgMTMuOTIgMjAuMDYgMTMuOTJDMTkuNzMgMTMuNjIgMTkuODMgMTQuNDQgMjAuMDYgMTMuOTJDMTkuODggMTMuODMgMjAuMDYgMTMuOTIgMjAuMDYgMTMuOTJDMTkuNjggMTMuNDggMjAuMDYgMTMuOTIgMjAuMDYgMTMuOTJDMTcuMTUgMTIuMTggMTYuMTggNy45OCAxNi4wMiA1LjMzQzE2LjAzIDUuMjQgMTYuMDYgNS4xNiAxNi4xMyA1LjA4QzE2LjIgNC45OSAxNi4yOSA0LjkxIDE2LjQxIDQuODNDMTYuNTMgNC43NiAxNi42OCA0LjcgMTYuODMgNC42N0MxNi45OSA0LjY0IDE3LjE1IDQuNjIgMTcuMyA0LjYxQzE3LjU5IDQuNTggMTcuODUgNC41OCAxOC4wNyA0LjYxQzE4LjMyIDQuNjMgMTguNTUgNC42OCAxOC43MiA0LjczQzE4LjkgNC43OSAxOS4wNSA0Ljg2IDE5LjE2IDQuOTVDMTkuMjcgNS4wMyAxOS4zNiA1LjEzIDE5LjQzIDUuMjNDMTkuNDkgNS4zMiAxOS41NCA1LjQyIDE5LjU2IDUuNTNDMTkuNiA1LjcwIDE5LjYxIDUuODcgMTkuNjIgNi4wM0MxOS41NyA3LjA3IDE5LjAxIDguNDQgMTcuNiAxMC41N0wyNCA1Ljk1QzI0LjI1IDUuNTYgMjQuNDMgNS41MiAyNC42NSA1LjUxQzI0LjkyIDUuNDkgMjUuMjcgNS42NyAyNS41MiA1Ljk0QzI1Ljc3IDYuMjEgMjUuOTMgNi42MiAyNS45MyA2Ljc0QzI1LjkxIDYuNzkgMjUuODcgNi44NiAyNS43OSA2Ljk0QzI1LjcxIDcuMDMgMjUuNTggNy4xMiAyNS40MyA3LjIyQzI1LjI3IDcuMzIgMjUuMDYgNy40MiAyNC44MyA3LjQ5QzI0LjYgNy41NiAyNC4zMiA3LjYxIDI0LjAzIDcuNjRDMjMuMjcgNy41NiAyMi45OCA2LjU1IDIyLjIgNS45NUMyMS40MiA1LjM0IDIwLjc0IDUuMjYgMjAuMDYgNS43NkMxOS4zOCA2LjI1IDE5LjEyIDUuODkgMTguNDggNS41QzE3Ljg0IDUuMTIgMTcuNjYgNC45MiAxNy40NCA0LjY1QzE3LjIyIDQuMzggMTcgMy44OSAxNi43MiAzLjYxQzE2LjQ1IDMuMzMgMTYuMTcgMy4yMiAxNS44OCAzLjE1QzE1LjYxIDMuMDcgMTUuMjYgMy4wMyAxNC45MiAzLjAzQzE1LjY2IDMuMDMgMTQuOTcgMy4wMyAxNC45MiAzLjAzTDE1LjI0IDMuODhIMjIuNTlIMTAuNzJIMTEuMTZMOS43NCAzLjIyQzguNDkgMi45OCA3LjE5IDIuODcgNS44OCAyLjg3QzQuOTIgMi44NyAzLjkyIDMuMDMgMi45MiAzLjM2QzEuOTIgMy42OSAwLjk5IDQuMjYgMC4zNCA0Ljc5QzAuMDMgNS4wMSAtMC4xMiA1LjI2IC0wLjIyIDUuNDhDLTAuMzIgNS43IC0wLjM3IDUuOTYgLTAuMzcgNi4yMkMtMC4zNyA2LjY4IC0wLjE5IDYuOTcgLTAuMDQgNy4xMkMwLjE2IDcuMzIgMC40NSA3LjQ1IDAuNzYgNy41MkMxLjM0IDcuNjUgMS45NCA3LjcgMi41MiA3Ljc0QzMuNDEgNy42OCAzLjY2IDYuNzcgMi45MiA2LjIyQzIuMTggNS42NyAxLjY5IDUuMTkgMS4wNCA0LjQyQzAuNzcgNC4wOCAwLjUyIDMuODggMC4wNCAzLjYyQzcuMDEgMi42OCA3LjA4IDMuNTkgNy4yMiAzLjgyQzcuMjYgMy44NiA3LjMyIDMuOTEgNy40MSAzLjk4QzcuNTIgNC4wNiA3LjY0IDQuMTUgNy43OCAxNC40NkMxNi40MSAyMy40NCAxMiAyMy4xNiAxNi4wMyAyNi45MkwyMi4yMyAyNi45MiAyMi4yMyAyNi45MkwxNi4wMyAyNi45MiAyMi4xNCAyNi42NEMyMi41OSAyNi41OCAyMy4xMiAyNi42OCAyMy42OCAyNi44OEMyNC4yNyAyNy4wOSAyNC44NyAyNy40MiAyNS40NCAyNy43OUMyNS43MyAyNy45NyAyNS45OCAyOC4xOSAyNi4xOSAyOC40MkMyNi40IDI4LjY2IDI2LjU1IDI4LjkzIDI2LjYzIDI5LjJDNDAuMjYgMjEuMDggMjYuNzUgMjEuNTcgMjYuMjggMjEuMTFDMTcuMTcgMjEuMTUgMTcgMjcuNjUgMTcuMDcgMjcuNjVDMTUuOTQgMjYuODMgMTMuOTkgMjYuNTkgMTMuOTkgMjYuNTlDMjAuNzggMjEuMjggMjAuNjcgMjcuNTcgMjAuNjcgMjcuNTdDMjYuMjYgMjYuNCAyMS44NSAyNi45MiAxOC40OCAyNi45MkMxNC45MSAyNi45MiAxMS40MSAyNi43MyA3Ljk5IDI2LjM4QzguNTIgMjYuMzMgMjYuNDEgMjYuNjMgMjUuNTIgMjYuNDJDMjQuNjMgMjYuMjIgMjQuMjMgMjUuODQgMjQuMDcgMjUuNDhDMjMuOTEgMjUuMTMgMjMuODggMjQuNjkgMjMuOTMgMjQuMjNDMjMuOTggMjMuNzggMjQuMTMgMjMuMzQgMjQuMzggMjIuOUMyNC42MiAyMi40NiAyNC45NiAyMi4wMyAyNS4yOSAyMS42M0MyNS42MyAyMS4yMiAyNS44OCAyMC44MSAyNi4wMiAyMC40QzI2LjE2IDIwIDIzLjA2IDIwLjkgMTkuODMgMjAuNDRDMTYuNTkgMTkuOTggMTcuNjMgMjQuNiAxNy42MyAyNC42QzI2LjM4IDI0LjYgMjYuMjIgMjQuNDkgMjUuOTUgMjQuNDRDMTkuNDUgMjEuNjIgMTkuODggMjQuMyAxOS44OCAyNC4zQzIwLjY3IDI0LjggMjAuOTcgMjUuNTcgMjAuMzIgMjYuMTJDMjUuNjggMjYuMTIgMjEuMjggMjYuMiAxNy45OSAyNi4xQzExLjUgMjUuNzIgMTUuMjYgMjYuMTIgMTIuNDQgMjYuMjdDNy42IDI2LjUxIDEuNTUgMjYuODMgMS41NSAyNi44M0MyLjg3IDI2LjU5IDEuNTkgMjYuNTkgMC43OCAyNi41NEMwLjA1IDI2LjQ5IC0wLjQxIDI2LjE4IC0wLjY1IDI1LjkwQy0wLjg5IDI1LjYyIC0xLjAxIDI1LjI2IC0xLjAyIDI0Ljg4Qy0xLjAzIDI0LjUyIC0wLjg2IDI0LjE2IC0wLjUzIDIzLjg1Qy0wLjIgMjMuNTUgMC4xNyAyMy4yNyAwLjQ3IDIzLjA4QzAuNzcgMjIuODkgMS4wOSAyMi43NyAxLjQ1IDIyLjcxQzEuODEgMjIuNjQgMi4xNSAyMi41NyAyLjQ4IDIyLjUzQzIuODIgMjIuNDkgMy4xNSAyMi40NSAzLjQ4IDIyLjQyQzMuNzcgMjIuNCA0LjA0IDIyLjM3IDQuMzEgMjIuMzRDNC42IDIyLjMxIDQuODggMjIuMjkgNS4xNiAyMi4yN0M1LjQ3IDIyLjI1IDUuNzcgMjIuMjMgNi4wNyAyMi4yMUw2LjQ3IDIyLjI5QzYuOTEgMjIuNDEgNy4zNSAyMi41NiA3Ljc3IDIyLjc0QzguMjEgMjIuOTIgOC42MiAyMy4xNCA5LjAyIDIzLjM2QzkuNDEgMjMuNTkgOS43NSAyMy44MyAxMC4wMyAyNC4wNkMxMC4zMiAyNC4yOSAxMC41NiAyNC41MyAxMC43NyAyNC43N0MxMSAyNS4wMSAxMS4xOCAyNS4yNSAxMS4zMiAyNS41QzExLjQ3IDI1Ljc0IDExLjU3IDI1Ljk5IDExLjY2IDI2LjI1QzExLjc0IDI2LjUxIDExLjc5IDI2Ljc2IDExLjgzIDI3QzExLjg2IDI3LjI2IDExLjgyIDI3LjUxIDExLjc0IDI3Ljc2QzExLjY3IDI4LjAyIDExLjU1IDI4LjI3IDExLjQyIDI4LjQ5QzExLjI5IDI4LjcyIDExLjEzIDI4LjkzIDEwLjk1IDI5LjExQzEwLjc3IDI5LjMyIDEwLjU3IDI5LjQ4IDEwLjM3IDI5LjU5QzEwLjE2IDI5LjcxIDkuOTUgMjkuNzggOS43NSAyOS44M0M5LjU0IDI5Ljg5IDkuMzMgMjkuOTIgOS4xMiAyOS45NEM4LjkyIDI5Ljk2IDguNzIgMjkuOTkgOC41MiAyOS45OUM4LjMyIDI5Ljk5IDguMTEgMjkuOTkgNy45MSAyOS45OUM3LjczIDI5Ljk5IDcuNTUgMjkuOTggNy4zNiAyOS45N0M3LjE5IDI5Ljk1IDcuMDIgMjkuOTMgNi44NSAyOS45QzYuNjkgMjkuODggNi41MiAyOS44NSA2LjM2IDI5LjgxQzYuMiAyOS43NyA2LjA0IDI5Ljc0IDUuODcgMjkuN0M1LjcyIDI5LjY2IDUuNTcgMjkuNjEgNS40MiAyOS41NkM1LjI3IDI5LjUxIDUuMTIgMjkuNDYgNC45NyAyOS40QzQuODIgMjkuMzUgNC42OCAyOS4yOSA0LjUzIDI5LjIzQzQuNDcgMjkuMiA0LjQ2IDI5LjIgNC40NiAyOS4xOUM0LjM4IDI5LjE1IDQuMyAyOS4xMSA0LjIyIDI5LjA2QzQuMTMgMjkuMDEgNC4wNSAyOC45NyAzLjk4IDI4LjkxQzMuOTIgMjguODggMy44NyAyOC44MiAzLjgyIDI4Ljc2QzMuNzggMjguNzIgMy43MyAyOC42NyAzLjY5IDI4LjYxQzMuNjYgMjguNTggMy42MiAyOC41NSAzLjU5IDI4LjUyQzMuNTYgMjguNDggMy41MyAyOC40NSAzLjUgMjguNDFDMzQ4IDI2LjY2IDI4LjYzIDI1Ljk5IDMxLjc1IDIzLjQ1QzI5LjM3IDIwLjMgMjcuNTcgMjEuMTUgMjguODMgMjAuNDRDMTIuMTEgNDMuNjcgMjUuNDkgMTkuOTggMjUuNDkgMTkuOThDMjUuNjggMTguNzEgMTguOTggMTkuNDkgMTguOTggMTkuNDlDMTYuNzcgMjEuMjggMjAuNjcgMjYuNzUgMjAuNDEgMjcuOTFDMjUuNTkgMjEuNjEgMjYuOTIgMjQuMjggMjYuOTIgMjQuNTRDMjguMjggMjEuNiAzMS4yMyAyMC41NSAzMC43NiAxOS43M0MyNi4yNyAxNi40NCAyMC40MSAxNS41NiAxNi43MiAxNS44NEM1LjkyIDUuNjUgMy4zMyA2LjA2IDMuMzMgNi4wNkMzLjkxIDYuMDggMy43NiA2LjE2IDIuOTIgNi4yMUMyLjAyIDUuMjQgMC45MiA0LjU2IDAuMDggNC4wM0MtMC4wMiAzLjk1IC0wLjEzIDMuODYgLTAuMjMgMy43N0MtMC4zMyAzLjY5IC0wLjQzIDMuNTkgLTAuNTEgMy40OUMtMC41OSAzLjM5IC0wLjYzIDMuMjYgLTAuNjUgMy4xMkMtMC42NyAyLjk5IC0wLjY4IDIuODUgLTAuNjggMi43Qy0wLjY4IDIuMjkgLTAuNDcgMi4wNiAtMC4yMiAxLjgyQzAuMDMgMS41NyAwLjQyIDEuMjUgMC44OSAwLjk5QzEuMzYgMC43MiAxLjg4IDAuNTEgMi40MiAwLjM1QzIuOTcgMC4xOSAzLjU0IDAuMDggNC4xMiAwLjAzQzQuNyAtMC4wMiA1LjI5IC0wLjAxIDUuODcgMC4wN0M2LjQ2IDAuMTUgNy4wMyAwLjI5IDcuNTcgMC40OUM4LjEyIDAuNjggOC42MyAwLjkyIDkuMTIgMS4yMkM5LjYyIDEuNTIgMTAuMDggMS44NSAxMC40OSAyLjIyQzEwLjkgMi41OSAxMS4yNyAyLjk3IDExLjU3IDMuMzZDMTguMjkgMTUuMzEgMTcuODMgMTUuNDEgMTguOTkgMTcuNDRDMjQuMzMgMTcuNDQgMjcuMzcgMjIuNzMgMjcuMTggMjIuNTdDMjcuMjQgMjMuMzkgMjEuMjggMjMuNCAxOS40MSAyMy40QzEyLjk0IDIzLjMyIDE2LjQ2IDIwLjIyIDE2LjQ2IDIwLjIyQzE2Ljg2IDE5LjY3IDE2Ljk4IDE5LjM1IDE2LjkgMTkuMTFDMTUuOTUgMTkuMSAxNC45MiAxOS4xIDEzLjg2IDE5LjFDMTIuODIgMTkuMSAxMS44MSAxOS4xMSAxMC43NyAxOS4xMUM4LjYzIDE5LjExIDguNzMgMTkuMTEgOC41MyAxOS4xMUM3LjcgMTcuMiA2LjM4IDE4LjIgNy4yMiAxOS43MUM4LjA2IDIxLjIgOC40NyAyMC42NyA4LjIzIDIwLjQ0QzcuOTkgMjAuMjIgNy41NyAxOS43NyA3LjIgMTkuNDhDNy41NyAxOC43MiA4LjAzIDE4LjMzIDguNDQgMTcuNThDNy45OSAxNi41NCA3LjQ4IDE1LjU5IDYuODkgMTQuNTRDNy4wNCAxNC4yNiA3LjE2IDEzLjk5IDcuMjcgMTMuNzFDMjEgMTUuNTQgMjEuNDQgMTYuMDYgMjEuMDkgMTcuODNDMjEuNDMgMTguNjUgMjAuODYgMTcuNTkgMjAuNjcgMTguNTZDMjAuNDggMTkuNTMgMTkuODcgMjAuOTIgMjAgMjAuOTJDMTkuNjggMjEuMDkgMjAuNDggMjAuOTIgMjAuNDggMjAuOTJDMTYuNzcgMTUuNTggMTYuNTggMTUuNTggMTYuNTggMTUuNThDMTUuODkgMTUuODUgMTUuNzcgMTUuODkgMTUuNTggMTYuMDdDMTUuNCAxNi4yNCAxNS4xNiAxNi40NyAxNC45MiAxNi43MkMxNC42OCAxNi45NyAxNC40NSAxNy4yMSAxNC4yMiAxNy40NEMxNCAxNy42OCAxMy43NyAxNy45MyAxMy41MiAxOC4xNkMxMy4yNyAxOC40IDEzLjAxIDE4LjYzIDEyLjc0IDE4Ljg3QzEyLjQ4IDE5LjExIDEyLjIyIDE5LjM1IDExLjk2IDE5LjU5QzExLjcgMTkuODMgMTEuNDYgMjAuMDcgMTEuMjIgMjAuMzFDMTcuMzcgMTYuNzUgMTguMjkgMTYuNCAxNy43MSAxNy41N0MxNy4xMyAxOC43NSAxNi40MyAxOS4zMiAxNi4yNiAxOS41M0MxNi4wOSAxOS43NSAxNS45MSAxOS45NiAxNS43MyAyMC4xN0MxNS41NSAyMC4zOSAxNS4zNSAyMC42MSAxNS4xNSAyMC44M0MxNC45NSAyMS4wNSAxNC43MyAyMS4yNyAxNC41MSAyMS40OUMxNC4yOCAyMS43MSAxNC4wNSAyMS45MiAxMy44MiAyMi4xNEMxMy41OSAyMi4zNiAxMy4zNSAyMi41NyAxMy4xMiAyMi43OUMxMi44OSAyMyAxMi42NSAyMy4yMSAxMi40MSAyMy40M0MxMi4yNiAyMy41MiAxMi4yNyAyMy43OCAxMi4yNyAyNC4wM0MxMi4yNyAyNC43OSAxMi4zMiAyNS40OCAxMi40NiAyNS45MUMxMi41OCAyNi4yOCAxMi43NyAyNi42MiAxMy4wMyAyNi45MUMxMy4yOSAyNy4yMSAxMy42MSAyNy40NyAxMy45MiAyNy43MUMxNC4yNCAyNy45NSAxNC41NyAyOC4xNSAxNC45MiAyOC4zM0MxNS4yNyAyOC41MSAxNS42MiAyOC42NSAxNS45NiAyOC43NEMxNi4zMiAyOC44MyAxNi42OCAyOC44OSAxNy4wMyAyOC45M0MxNy4zOSAyOC45NyAxNy43MyAyOC45NyAxOC4wOSAyOC45NEMxOC40NSAyOC45MiAxOC44MSAyOC44NiAxOS4xNSAyOC43N0MxOS41MSAyOC42OCAxOS44NiAyOC41NiAyMC4xOCAyOC40MUMyMC41MiAyOC4yNiAyMC44MyAyOC4wOCAyMS4xMiAyNy44N0MyMS40MSAyNy42NiAyMS42OSAyNy40MyAyMS45NiAyNy4xN0MyMi4xNyAyNi45MiAyMi4zOCAyNi42OCAyMi41NyAyNi40NEMyMi43NSAyNi4yIDIyLjkzIDI1Ljk2IDIzLjEwIDI1Ljc0QzIzLjI2IDI1LjUyIDIzLjQxIDI1LjMxIDIzLjU2IDI1LjFDNTYuNjcgMjguMjIgMzEuMjcgMi40MSAzMS4yNyAyLjQxQzI5LjcgMS4wNyAyNy40OCAxLjQ5IDI3LjQ4IDEuNDlDMjUuNjggMi45MiAyMS45MiA2LjY4IDIxLjUyIDYuNjJDMTguNTQgMi4yMyAxNS44NyAyLjE3IDEzLjU5IDIuMTdDMTAuOTQgMi4xNyA4LjIzIDIuMzQgNS43OCAyLjY4QzMuNDUgMy4wMiAxLjMyIDMuNTEgMC42MiA0LjIyQzAuMzggNC40MiAwLjIzIDQuNjMgMC4xMiA0Ljg1QzAuMDEgNS4wNyAtMC4wMyA1LjMxIC0wLjA0IDUuNTVDLTAuMDYgNS43OSAtMC4wNSAzLjUyIC0wLjAzIDMuNjVDLTAuMDEgMy43OCAwLjA1IDMuOTggMC4xNiA0LjEzQzAuMjYgNC4zIDAuMzkgNC40MyAwLjU2IDQuNTZIMTMuNjNDMTMuOTIgNC44MiAxNC4yMiA1LjA2IDE0LjQ0IDUuNDFDMTIuMDMgMi40MyAxMi4wMyAyLjQzIDEyLjAzIDIuNDNDMTMuMzIgMC43MSAxNC45MiAwLjI4IDE2LjQ2IDAuMDhDMTcuOTkgLTAuMTIgMTkuNTUgLTAuMDMgMjEuMDUgMC4xMkMyMi42NSAwLjI3IDI0LjExIDAuNTcgMjUuNDggMC45OEMyNi44NSAxLjM4IDI4LjA5IDEuOTEgMjkuMTcgMi40OUMzMC4yNSAzLjA3IDMwLjczIDMuNTEgMzEuMDMgMy44OUMzMS4zMyA0LjI2IDMxLjU1IDQuNjcgMzEuNjggNS4wN0MzMS44MiA1LjQ3IDMxLjg5IDUuODcgMzEuODkgNi4yN0MzMS44OSA2LjY3IDMxLjgxIDcuMDcgMzEuNjYgNy40NUMzMS41IDcuODMgMzEuMjggOC4xOSAzMS4wMSA4LjU0QzMwLjc0IDguODggMzAuNDMgOS4yMSAzMC4wOSA5LjUyQzI5Ljc2IDkuODMgMjkuNDEgMTAuMTMgMjkuMDcgMTAuNDFDMjguNzIgMTAuNjkgMjguMzggMTAuOTUgMjguMDYgMTEuMjFDMTcuNjcgMTEuMjEgMTcuNjcgMTEuMjEgMTcuNjcgMTEuMjFDMTcuNjcgMTEuMjEgMTcuNjcgMTEuMjEgMTcuNjcgMTEuMjFDMjEuMTEgNy41MSAyMS4wMyA3LjQyIDIxLjAzIDcuNDJDNDMuOTUgMjMuMzQgMTguMzIgMjMuNDcgMTguMzIgMjMuNDdDMjkuNjMgMjQuNiAyNS42OCAyNi43MyAyNS42OCAyNi43M0MyNi42MiAyNi4yMyAyNi4wMiAyNy40MiAyNS42MiAyNy42MkMyMS44NCAyNy43OCAyMS45MyAyNy4wMSAyMS44MyAyNi4xQzIxLjcyIDI1LjE5IDIxLjM1IDI0LjM1IDIwLjg1IDIzLjVDMjAuMzcgMjIuNjcgMTkuNzUgMjEuODkgMTkgMjEuMTdDMTguMjUgMjAuNDYgMTcuNDMgMTkuNzkgMTYuNTYgMTkuMThDMTUuNjkgMTguNTcgMTQuNzcgMTcuOTkgMTMuOCAxNy40N0MxMi44MyAxNi45NSAxMS44MyAxNi40OCAxMC44MyAxNi4wNkMxNi45NiAxMy42NiAxNi45NiAxMy42NiAxNi45NiAxMy42NkM1Ljk2IDEzLjU5IDUuODIgMTQuNjIgMi45MyAxMy41MkMyLjY3IDEzLjQ0IDIuNDIgMTMuMzYgMi4xNyAxMy4yNkMxLjkyIDEzLjE3IDEuNjcgMTMuMDYgMS40MiAxMi45N0MxLjE3IDEyLjg3IDAuOTMgMTIuNzcgMC42OCAxMi42NkMwLjQ0IDEyLjU2IDAuMiAxMi40NSAtMC4wMyAxMi4zNEMtMC4yNyAxMi4yMyAtMC40OCAxMi4xMiAtMC42NSAxMi4wNEMtMC44MyAxMS45NSAtMC45NSAxMS44NiAtMS4wMyAxMS43OUMtMS4xMSAxMS43MSAtMS4xNiAxMS42MyAtMS4xOSAxMS41NEMtMS4yMiAxMS40NSAtMS4yNSAxMS4zNiAtMS4yNiAxMS4yN0MtMS4yNyAxMS4xOCAtMS4yNiAxMS4wOSAtMS4yNSAxMD45OUMtMS4yNCAxMC44OCAtMS4yMSAxMC43NyAtMS4xNyAxMC42N0MtMS4xMyAxMC41NiAtMS4wOCAxMC40NSAtMS4wMyAxMC4zNEMtMC45NyAxMC4yMyAtMC45MSAxMC4xMiAtMC44NSAxMC4wMUMtMC43OSA5Ljg5IC0wLjcyIDkuNzggLTAuNjYgOS42N0MtMC42IDkuNTcgLTAuNTEgOS40NyAtMC40NCA5LjM3Qy0wLjM2IDkuMjcgLTAuMjcgOS4xOCAtMC4yIDkuMDlDMjcuNTMgMTkuODcgMjguNjggMjIuMzUgMjguNjggMjIuMzVDMjkuMjcgMjMuMjIgMjkuNzUgMjMuNjggMjkuODcgMjMuOUMyOS45OSAyNC4xMiAzMC4wNiAyNC4zNiAzMC4wNiAyNC42MUMzMC4wNiAyNC45MyAyOS44OCAyNS4yNCAyOS41MyAyNS40OUMyOS4xOSAyNS43NCAyOC43NSAyNS45MyAyOC4zMSAyNi4wNkMyNy44NiAyNi4xOSAyNy40MSAyNi4yNyAyNi45NSAyNi4zQzI2LjQ4IDI2LjMzIDI2LjAyIDI2LjM1IDI1LjU1IDI2LjM2QzI1LjA3IDI2LjM4IDI0LjU5IDI2LjM5IDI0LjExIDI2LjQxQzIzLjYzIDI2LjQyIDIzLjE0IDI2LjQzIDIyLjY2IDI2LjQzQzIyLjE4IDI2LjQ0IDIxLjY5IDI2LjQ1IDIxLjIxIDI2LjQ2QzIwLjczIDI2LjQ4IDIwLjI1IDI2LjQ5IDE5Ljc2IDI2LjUxQzE5LjI4IDI2LjUyIDE4LjggMjYuNTQgMTguMzIgMjYuNTVDMTcuODQgMjYuNTcgMTcuMzYgMjYuNTggMTYuODggMjYuNjlDMTYuNDIgMjYuODIgMTUuOTUgMjYuOTcgMTUuNTEgMjcuMTZDMzUuMTMgMjEuMiAyNS42NyAxLjgyIDI1LjY3IDEuODJDNDEuOTIgMjYuMDYgMzEuMjcgMjYuNDMgMjUuNTIgMjcuODVWMzAuMjJDMjUuNjggMjYuMjMgMjIuNzUgMjYuODkgMjIuMTcgMjcuMDVDMjAuNzUgMjcuMjQgMjEuNzcgMjYuOTggMjIuMTcgMjcuMDVDMjMuMDggMjcuMTggMjQuMDEgMjcuMjcgMjQuNzcgMjcuMzZDMjUuNTIgMjcuNDYgMjYuMjcgMjcuNTUgMjcuMDMgMjcuNjRDMjcuNzggMjcuNzMgMjguNTMgMjcuODIgMjkuMjggMjcuOTFDMzAuMDMgMjguMDEgMzAuNzcgMjguMSAzMS41MyAyOC4xOUMzMi4yOCAyOC4yOSAzMy4wMyAyOC4zOCAzMy43NyAyOC40N0MzNC41MiAyOC41NyAzNS4yNiAyOC42NiAzNi4wMSAyOC43NUMzNi43NSAyOC44NCAzNy41IDI4LjkzIDM4LjI0IDI5LjAyQzM4Ljk5IDI5LjExIDM5LjczIDI5LjIxIDQwLjQ4IDI5LjMxQzQxLjIyIDI5LjQgNDEuOTcgMjkuNDkgNDIuNzEgMjkuNThDNDMuNDYgMjkuNjcgNDQuMjEgMjkuNzcgNDQuOTUgMjkuODZDNTVuNzMgMjkuNTAgNjUuNCAyNS40MSA2Ni42NCAyMi45QzY3LjAyIDIyLjE3IDY3LjIyIDIwLjIyIDY1LjQ5IDIyLjk2QzY0LjQ5IDIxLjM4IDYxLjU1IDE5LjM5IDYxLjU1IDE5LjM5QzYwLjQyIDE4LjY3IDU4Ljc3IDE4LjQ2IDU3LjE4IDE4LjQ2QzUzLjg3IDE4LjQ2IDUwLjcxIDE4LjU4IDQ3LjQ2IDE4LjcyQzQ0LjIxIDE4Ljg3IDQxLjA2IDE5LjAzIDM3Ljg4IDE5LjE2QzM0LjY5IDE5LjI5IDMxLjQ4IDE5LjQ1IDI4LjI3IDE5LjYyQzI1LjA3IDE5Ljc5IDIxLjg2IDE5Ljk2IDE4LjY2IDIwLjEzQzE1LjQ2IDIwLjMgMTIuMjUgMjAuNDcgOS4wNCAyMC42NFwibTAtMTQuNjJDMTUuMjYgNy45MSAxNi43MiA1LjA1IDE2LjcyIDUuMDVDMjEuMzkgMi40IDIyLjQxIDIuNzggMjMuMjQgMi43NEMyNC4wNyAyLjY5IDI0LjcxIDIuMzcgMjQuNzEgMi4wN0MyNC43MSAxLjc3IDI0LjQ4IDEuNTMgMjQuMTggMS4zNkMyMy44NyAxLjE5IDIzLjUyIDEuMDUgMjMuMjYgMS4wNEMyMi45OSAxLjAzIDIyLjcyIDEuMDYgMjIuNDcgMS4xMUMyMi4yMyAxLjE2IDIxLjk5IDEuMjIgMjEuNzUgMS4yOEMyMS41MSAxLjM0IDIxLjI4IDEuNDEgMjEuMDQgMS40OUMyMC44MSAxLjU3IDIwLjU3IDEuNjcgMjAuMzQgMS43NkMyMC4xMSAxLjg1IDE5Ljg5IDEuOTUgMTkuNjcgMi4wNUMxOS40NSAyLjE1IDE5LjIzIDIuMjYgMTkuMDIgMi4zN0MxOC44MSAyLjQ4IDE4LjU5IDIuNTkgMTguMzggMi43QzE4LjE3IDIuODEgMTcuOTYgMi45MiAxNy43NSAzLjAzQzE2Ljg5IDMuNDUgMTUuNzcgMy45MSAxNC45MiA0LjI4QzEzLjk5IDQuNjkgMTMuMTEgNS4wNSAxMi4yNyA1LjM3QzExLjQyIDUuNjggMTAuNTYgNS45MiA5LjY4IDYuMDdDMTkuNTEgNy4yMyAyMC41NCA4LjA5IDI1LjY4IDkuNzVDMjcuNTUgMTAuMjYgMjguNzcgMTEuMDMgMjkuMzcgMTEuNzhDMjkuNzUgMTIuMjYgMjkuOTkgMTIuNzIgMjkuOTkgMTMuMTZDMjkuOTkgMTMuNjEgMjkuNzYgMTQuMDYgMjkuMzcgMTQuNTNDMjguOTkgMTUuMDEgMjguNCAxNS40MiAyNy42OCAxNS43N0MyNi45NiAxNi4xMiAyNi4xNiAxNi4zOCAyNS4zMyAxNi41NEMyNC41MSAxNi42OSAyMy42OCAxNi43NiAyMi44MyAxNi44QzIyIDE2Ljg1IDIxLjE2IDE2Ljg3IDIwLjMxIDE2Ljg3QzE5LjQ2IDE2Ljg3IDE4LjYyIDE2Ljg2IDE3Ljc3IDE2Ljg0QzE2LjkzIDE2LjgyIDE2LjA5IDE2Ljc5IDE1LjI0IDE2Ljc1QzE0LjM5IDE2LjcxIDEzLjU1IDE2LjY3IDEyLjcgMTYuNjNDMTIuNjQgMTYuNjEgMTIuNTcgMTYuNjEgMTIuNTUgMTYuNjFDNy4wNyAxNi40NCAyLjM4IDE2LjIzIDIuMzggMTYuMjNDNi45MyAxNi4yNSA3LjA0IDE3LjQ1IDE1LjY5IDE5LjAzQzI1LjY4IDE2LjQ2IDMxLjI3IDEzLjQ5IDMxLjI3IDEzLjQ5QzMxLjI3IDEzLjQ5IDMxLjI3IDEzLjQ5IDMxLjI3IDEzLjQ5QzMyLjM4IDE2LjY3IDMyLjMxIDE3LjM4IDMyLjM5IDE4LjU2QzMyLjI2IDE4LjkzIDMyLjAxIDE5LjI3IDMxLjY2IDE5LjU5QzMxLjMxIDE5LjkgMzAuOTIgMjAuMTggMzAuNTIgMjAuNDdDMzAuMTIgMjAuNzcgMjkuNzMgMjEuMDQgMjkuMzYgMjEuMjdDMjguOTkgMjEuNTEgMjguNjIgMjEuNzMgMjguMjcgMjEuOTVDMjcuOTIgMjIuMTcgMjcuNTggMjIuMzggMjcuMjMgMjIuNTlDMjYuODkgMjIuODEgMjYuNTYgMjMuMDMgMjYuMjMgMjMuMjRDMjUuOTIgMjMuNDYgMjUuNjIgMjMuNjcgMjUuMyAyMy44N0MyNC45OSAyNC4wOCAyNC43MSAyNC4yNyAyNC40MiAyNC40N0MyNC4xMyAyNC42NiAyMy44NiAyNC44NCAyMy42IDI1LjAyQzI1Ljc1IDI0LjI0IDI1LjQ2IDIzLjczIDI0LjU3IDIyLjg4QzIzLjY5IDIyLjA0IDIyLjg4IDIxLjM1IDIyLjM5IDIxLjA1QzIyLjAyIDIwLjgwIDIxLjczIDIwLjYzIDIxLjQxIDIwLjQ0QzIwLjY5IDIwLjAyIDIwLjAxIDE5LjM5IDE5LjI4IDE4LjgzQzE4LjU0IDE4LjI4IDE3LjgxIDE3Ljc3IDE3LjA5IDE3LjMxQzE2LjM4IDE2Ljg1IDE1LjY4IDE2LjQyIDE1LjAxIDE1Ljk5QzE0LjM1IDE1LjU2IDEzLjcgMTUuMTMgMTMuMDYgMTQuNzFDMTEuNzQgMTMuODggMTEuMTUgMTMuNzUgOS43NiAxNC42MkM5LjE2IDE0Ljk2IDguNTUgMTUuMTkgNy45OSAxNS4zOUM3LjQ0IDE1LjU5IDYuODkgMTUuNzUgNi4zNiAxNS44N0M1Ljg0IDE1Ljk5IDUuMzIgMTYuMDYgNC44MSAxNi4xMUw0LjQxIDE2LjExQzQuMDIgMTYuMTMgMy42NCAxNi4xNCAzLjI3IDE2LjE0QzIuODkgMTYuMTUgMi41MiAxNi4xNSAyLjE2IDE2LjEzQzIuMDEgMTYuMTIgMS45OCAxNi4xMiAxLjc2IDE2LjEyQzEuNjcgMTYuMTIgMS42OCAxNi4xMiAxLjU4IDE2LjExQzAuNzIgMTUuMjYgMC4xNiAxNC45OSAtMC4yMiAxNC42MkMtMC41OSAxNC4yNiAtMC43NiAxMy42MiAtMC43NiAxMy4yNkMtMC43NiAxMi45IC0wLjYzIDEyLjMyIC0wLjM3IDEyLjA0QzAuMDMgMTEuNjMgMC42MiAxMS40MiAxLjM3IDExLjQyQzEuODMgMTEuNDIgMi4zIDExLjM3IDIuNzYgMTEuMjVDMy4yMyAxMS4xNCAzLjY5IDExLjAyIDQuMTYgMTAuODhDNC42MyAxMC43NSA1LjA5IDEwLjYxIDUuNTUgMTAuNDdDNy42OCAxMy43MyA3LjkxIDE2LjYyIDEwLjcxIDE5LjAyQzE0LjE4IDE2LjQ0IDE0Ljc0IDE0LjEgMTUuNDEgMTMuNzFDMTYuMDkgMTMuMzIgMTYuNjMgMTMuNjIgMTcuMjIgMTMuOTJDMjIuNDcgMjIuNzUgMjcuNDQgMjMuOTcgMjguOTkgMjIuMDdDMzAuNTMgMjAuMTggMjIuMjkgMTMuODMgMjIuMjkgMTMuODNDMjAuMzcgMTMuMzIgMjAuNDcgMTIuNDUgMjAuMTkgMTIuNzJDMTkuNjggMTMuMiAxOC44MyAxMy41MiAxOC4wOSAxMy42NEMxNy4zNSAxMy43NiAxNi42MiAxMy43OSAxNS44OCAxMy44MUMxNS4xNCAxMy44MiAxNC40MSAxMy44MiAxMy42NyAxMy44MUM1LjMgMTMuNTcgNS43OCAxNC4zNiA4LjU5IDE2LjFDMTIuNjYgMTMuNzYgMTQuNzQgMTMuNTIgMTcuNzUgMTMuNTJDMTcuNzUgMTMuNTIgMTcuNzUgMTMuNTIgMTcuNzUgMTMuNTJDMjAuNzUgMTMuNTIgMTUuMjYgMTguMzggMTUuMjYgMTguMzhDMjIuOTggMTkuMzggMjguMzggMTguMiAzMC40OCAxNy4wN0MzMi41NyAxNS45MyAyNS42OCAxMy45MiAyMy4xMiAxMi45N0MxNi45NyAxMC41MiAxMi45NyAxNi40NCAxMi41NyAxNi42QzE2Ljg2IDE5LjgzIDE0LjYyIDE5LjkyIDEyLjQ2IDE5LjkzQzExLjQyIDE5LjkzIDEwLjQzIDE5LjkzIDkuNDUgMTkuOTNDOC40NiAxOS45MiA3LjQ3IDE5LjkyIDYuNDkgMTkuOTNDNi41NiAxNi4zNyA2LjI3IDE4LjE4IDUuNTUgMTkuNjFDNS4xNiAyMC40MyA0LjYzIDIxLjE2IDQuMDggMjEuODhDMzYuNzIgMjUuOTYgMjcuNTIgMy4wMiAyNy41MiAzLjAyQzI1LjY4IDIuOTIgMjQuNzggMi4yMiAyNC4yOCAxLjYyQzI0LjE5IDEuNTQgMjQuMTMgMS40NyAyNC4wOCAxLjQxQzI0LjAzIDEuMzQgMjMuOTcgMS4yOCAyMy45MiAxLjIyQzIzLjg2IDEuMTcgMjMuODIgMS4xMyAyMy43OCAxLjA5QzI1LjE2IDIuMjkgMjYuNDIgMi40MyAyNy41MiAxLjU4QzI3LjUyIDEuNTggMjcuNTIgMS41OCAyNy41MiAxLjU4QzE2LjQxIDIyLjgyIDE4LjIyIDE5LjkyIDE4LjIyIDE5LjkyQzE4LjIyIDE5LjkyIDE4LjIyIDE5LjkyIDE4LjIyIDE5LjkyQzE1LjA4IDE5LjUzIDUuOTUgMTguMjcgNS41NSAxNy41M0M1LjAzIDE2LjY0IDUuMTcgMTUuNTEgNi4xMyAxNC44N0M3LjA5IDE0LjI0IDguMDIgMTMuOTEgOC45MiAxMy42MUM5LjgyIDEzLjMyIDEwLjcyIDEzLjAzIDExLjU3IDEyLjczQzEyLjQzIDEyLjQ0IDEzLjI3IDEyLjE2IDE0LjEyIDExLjg3QzE1LjA2IDExLjU5IDE2LjAxIDExLjMyIDE2Ljk2IDExLjA0QzE3LjkxIDEwLjc2IDE4Ljg2IDEwLjQ5IDE5LjgxIDEwLjIyQzIwLjc2IDkuOTUgMjEuNzEgOS42OSAyMi42NiA5LjQyQzIzLjYyIDkuMTUgMjQuNTcgOC44OSAyNS41MiA4LjYzQzI2LjQ3IDguMzcgMjcuNDEgOC4xMSAyOC4zNiA3Ljg1QzI5LjMxIDcuNTkgMzAuMjYgNy4zMyAzMS4yMSA3LjA2QzMyLjE2IDYuOCAzMy4xIDYuNTQgMzQuMDUgNi4yN0MzNS4wNSA2IDM2LjA0IDUuNzQgMzcuMDMgNS40N0MzOC4wMyA1LjIgMzkuMDEgNC45NCA0MC4wMSA0LjY3QzQxLjAxIDQuNCA0Mi4wMSA0LjE0IDQzLjAxIDMuODdDNDQuMDEgMy42MSA0NS4wMSAzLjM1IDQ2LjAxIDMuMDhDNDcuMDEgMi44MiA0OC4wMSAyLjU2IDQ5LjAyIDIuMjljNDkuOTUgMi4wMiA0OS44MiAyLjE3IDQ5LjgzIDIuMjVDNDkuODMgMi4zNSA0OS43OSAyLjQ2IDQ5Ljc1IDIuNTdDNDkuNzEgMi42OCAzNy40NCAyOS45OSA0NS4yMiAyOS45OUM1MC43NyAyNi44MiA1MC43NyAyMS4yMiA0NS42OCAyMi41NEM1MC43NyAyNC44NiA1NS40MiAyNi4yNSA2MC4zNyAyNy40NEM2My4xMSAyOC4xMSA2NS44OCAyOC42OSA2OC41NSAyOS4xNUM3MS4yMyAyOS42MSA3My43OCAyOS45NiA3Ni4zMiAzMC4yNUM3OC44NiAzMC41MyA4MS4zMyAzMC42NiA4My43MyAzMC42Nkw4NS45NyAzMC42NkM4Ni41NSAzMC42NiA4Ny4xMiAzMC41OSA4Ny42NSAzMC40NkM4OC4xOCAzMC4zNCA4OC42NyAzMC4xNyA4OS4xMiAyOS45NEM4OS41OCAyOS43MSA4OS45OSAyOS40NCA5MC4zMyAyOS4xNEM5MC42NyAyOC44MyA5MC45MyAyOC41MSA5MS4xMiAyOC4xN0M5MS4zMSAyNy44MyA5MS40MiAyNy40NyA5MS40MiAyNy4xNEM5MS40MiAyNi44IDI2LjUyIDIzLjQ4IDI2LjUyIDIzLjQ4QzI2LjUyIDIzLjQ4IDI2LjUyIDIzLjQ4IDI2LjUyIDIzLjQ4QzM0LjQ1IDI2LjI5IDM3Ljg4IDI3LjY1IDQ1LjY1IDI4LjczQzQ4LjA5IDI5LjA0IDUwLjUzIDI5LjI1IDUzLjAxIDI5LjM1QzU1LjQ5IDI5LjQ1IDU3Ljk3IDI5LjQ2IDYwLjQ2IDI5LjQ3QzYyLjk1IDI5LjQ3IDY1LjQ0IDI5LjQ2IDY3LjkzIDI5LjQ0QzcwLjQxIDI5LjQyIDcyLjg5IDI5LjM5IDc1LjM2IDI5LjM1Qzc3Ljg0IDI5LjMxIDgwLjMyIDI5LjI2IDgyLjc5IDI5LjIxQzg1LjI3IDI5LjE3IDg3LjczIDI5LjExIDkwLjE4IDI5LjA2QzkyLjYzIDI5IDk1LjA4IDI4Ljk1IDk3LjUzIDI4Ljg5Qzk5Ljk3IDI4Ljg0IDEwMi40MiAyOC43OCAxMDQuODcgMjguNzJDMTA3LjMyIDI4LjY1IDEwOS43NiAyOC41OSAxMTIuMjEgMjguNTJDMTE0LjY1IDI4LjQ2IDExNy4wOCAyOC40IDExOS41MiAyOC4zM0MxMjEuOTYgMjguMjcgMTI0LjM5IDI4LjIxIDEyNi44MyAyOC4xNEMxMjkuMjcgMjguMDggMTMxLjcxIDI4LjAxIDEzNC4xNSAyNy45NUMxMzYuNTkgMjcuODkgMTM5LjAyIDI3LjgyIDE0MS40NiAyNy43NkMxNDMuOTIgMjcuNzEgMTQ2LjM2IDI3LjY1IDE0OC44MiAyNy41OUMxNTEuMjcgMjcuNTMgMTUzLjcxIDI3LjQ3IDE1Ni4xNiAyNy40QzE1OC42MSAyNy4zNCAxNjEuMDYgMjcuMjcgMTYzLjUxIDI3LjJDMTY1Ljk1IDI3LjEzIDE2OC4zOSAyNy4wNiAxNzAuODQgMjYuOUMxNzMuMjggMjYuODMgMTc1LjczIDI2Ljc3IDE3OC4xNyAyNi43QzE4MC42MSAyNi42NCAxODMuMDYgMjYuNTcgMTg1LjUxIDI2LjUxQzE4Ny45NSAyNi40NCAxOTAuMzkgMjYuMzggMTkyLjgyIDI2LjMxQzE5NS4yNiAyNi4yNSAxOTcuNzEgMjYuMTggMjAwLjE1IDI2LjEyQzIwMi41OSAyNi4wNiAyMDUuMDMgMjUuOTkgMjA3LjQ4IDI1LjkzQzIwOS45MiAyNS44NiAyMTIuMzcgMjUuOCAyMTQuODEgMjUuNzNDMjE3LjI2IDI1LjY3IDIxOS43IDI1LjYxIDIyMi4xNSAyNS41NEMyMjQuNTkgMjUuNDcgMjI3LjAzIDI1LjQxIDIyOS40OCAyNS4zNUMyMzEuOTIgMjUuMjkgMjM0LjM2IDI1LjIyIDIzNi44MSAyNS4xNlMyMzkuMjUgMjUuMSAyNDEuNzIgMjUuMDNDMjQ0LjE2IDI0Ljk3IDI0Ni42IDI0LjkgMjQ5LjA1IDI0Ljg0QzI1MS40OSAyNC43NyAyNTMuOTMgMjQuNzEgMjU2LjM4IDI0LjY0QzI1OC44MiAyNC41OCAyNjEuMjYgMjQuNTEgMjYzLjcgMjQuNDVDMjY2LjE1IDI0LjM4IDI2OC41OSAyNC4zMiAyNzEuMDQgMjQuMjZDMjczLjQ4IDI0LjE5IDI3NS45MiAyNC4xMyAyNzguMzcgMjQuMDdDMjgwLjgyIDI0IDI4My4yNiAyMy45NCAyODUuNzEgMjMuODdDMjg4LjE1IDIzLjgyIDI5MC41OSAyMy43NSAyOTMuMDQgMjMuNjlDMjk1LjQ4IDIzLjYzIDI5Ny45MyAyMy41NiAzMDAuMzggMjMuNTJDMyAyMS42IDMgMjEuMzggMzAzIDE5LjMyQzMxMiAxNi4xMSAzNDMuMTMgMTMuODQgMzQzLjEzIDEzLjg0QzM1NC42MiA2LjExIDM2Ni4xMSAtMC43MiAzNzcuNiAtMC43MkMzNzkuMDMgLTAuNzIgMzc5LjI4IC0wLjYzIDM3OS40OCAtMC40NEMzNzkuNjcgLTAuMjYgMzc5LjgxIC0wLjAxIDM3OS45MSAwLjI2QzM3OS45OSAwLjU0IDM4MCAwLjgyIDM4MCAxLjExQzM4MCAxLjYxIDM3OS44MiAxLjkyIDM3OS41MyAyLjIyQzM3OS4yNSAyLjUyIDM3OC44OCAyLjgyIDM3OC40NCAzLjEzQzM3OC4wMSAzLjQzIDM3Ny41NSAzLjcxIDM3Ny4wOCAzLjk5QzM3Ni42MSA0LjI2IDM3Ni4xMiA0LjUxIDM3NS42MiA0Ljc0QzM3NS4xMyA0Ljk4IDM3NC42MiA1LjIyIDM3NC4xMyA1LjQ2QzM3My42NCA1LjcgMzczLjE1IDUuOTMgMzcyLjY1IDYuMTdDMzcyLjE3IDYuNDEgMzczLjI1IDYuODcgMzcyLjczIDYuODdDMzcyLjQxIDcuMDggMzczLjAzIDYuNjkgMzczLjYzIDYuNjZDMzcxLjQyIDcuMDYgMzcwLjY3IDcuNjUgMzcwLjIyIDguMjRDMzY5Ljc4IDguODQgMzY5LjQ4IDkuNDMgMzY5LjI3IDEwLjAzQzM2OS4wNyAxMC42MyAzNjguOTYgMTEuMjMgMzY4LjkyIDExLjg1QzM2OC44OSAxMi40NiAzNjguODkgMTMuMDcgMzY4LjkzIDEzLjY4QzM2OC45NyAxNC4yOSAzNjkuMDYgMTQuODkgMzY5LjE5IDE1LjQ4QzM2OS4zMyAxNi4wNyAzNjkuNTEgMTYuNjYgMY5Ljc1IDE3LjIzQzM2OS45OCAxNy44MSAzNzAuMjYgMTguMzggMzcwLjU3IDE4Ljk0QzM3MC44OSAxOS41MSAzNzEuMjQgMjAuMDggMzcxLjYgMjAuNjNDM3EuOTcgMjEuMTggMzc1LjQyIDIxLjk0IDc3LjIyIDIyLjYzQzM3Ny43OCAyMi44MSAzNzguMzQgMjIuOTkgMzc4Ljg2IDIzLjE3QzM3OS4zOCAyMy4zNSAzNzkuODggMjMuNTMgMzgwLjM3IDIzLjcxQzM4MC44NiAyMy44OSAzODEuMzMgMjQuMDcgMzgxLjc5IDI0LjI0QzM4Mi4yNSAyNC40MiAzODIuNzEgMjQuNTkgMzgzLjE1IDI0Ljc1QzM4My42MSAyNC45MiAzODQuMDcgMjUuMDggMzg0LjUxIDI1LjI0QzM4NC45NiAyNS4zOSAzODUuNDIgMjUuNTUgMzg1Ljg1IDI1LjY5QzM4Ni4zMSAyNS44NSAzODYuNzcgMjUuOTkgMzg3LjIyIDI2LjEzQzM4Ny42NiAyNi4yOCAzODguMTEgMjYuNDIgMzg4LjU1IDI2LjU2QzM4OS4wMSAyNi43IDM4OS40NiAyNi44MyAzODkuOTIgMjYuOTdDMzkwLjM3IDI3LjExIDM5MC44MiAyNy4yNCAzOTEuMjcgMjcuMzhDMzkuNzMgMjcuNTIgMzkyLjE4IDI3LjY2IDM5Mi42MyAyNy43OUMzOTMuMDcgMjcuOTMgMzkzLjUyIDI4LjA3IDM5My45OCAyOC4yMUMzOTQuNDMgMjguMzUgMzk0Ljg5IDI4LjQ4IDM5NS4zNCAyOC42MkMzOTUuNzkgMjguNzYgMzk2LjI1IDI4LjkgMzk2LjcwIDI5LjAzQzM5Ny4xNiAyOS4xNyAzOTcuNjEgMjkuMyAzOTguMDYgMjkuNDRDMzk4LjUyIDI5LjU3IDM5OC45NyAyOS43MSAzOTkuNDMgMjkuODVDMzk5Ljg4IDI5Ljk4IDQwMC4zNCAzMC4xMiA0MDAuNzkgMzAuMjZDMzQuNzUgMzAuMzggNDAwLjc1IDMwLjQ4IDQwMC43NSAzMC40OEN0MDMuMjggMjcuNzggNDAzLjQ1IDI2LjM4IDQwMy4zOCAyNS4yNkw0MDMuMTMgMjIuN0M0MDIuOSAyMC4xNiA0MDEuNiAxOC4xNyA0MDAuMjUgMTYuMDJDMzcyLjkgOS42MyAzNjcuOTYgOC41NCAzNjUuNTEgOC43NkMzNjMuNTQgOC45NSAzNjEuOTIgNy42NSAzNjEuOTIgNy42NUMzNjEuOTIgNy42NSAzNjEuOTIgNy42NSAzNjEuOTIgNy42NUMzNjEuMTggOC43MyAzNjEuMTYgOS4zIDM2MS4xNiA5LjMifSABCSBmaWxsPSIjZDkzOTAwIi8+Cjwvc3ZnPg==); /* Calendar icon SVG */
    /* This is also a simple calendar icon. Consider using actual icon files. */
    padding: 0px 5px;
}
QDateEdit::drop-down:hover {
    background-color: #f0f0f0;
}
QDateEdit::down-arrow {
    image: none; /* Hide default arrow */
}

QComboBox {
    padding-right: 25px; /* Space for custom arrow */
}
QComboBox::drop-down {
    subcontrol-origin: padding;
    subcontrol-position: top right;
    width: 25px;
    border-left: 1px solid #ced4da;
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcuNDEgOC41OUwxMiAxMy4xN0wxNi41OSA4LjU5TDE4IDExTDEyIDE3TDUgMTFMNy40MSA4LjU5WiIgZmlsbD0iIzMzMzMzMyIvPgo8L3N2Zz4=); /* Down arrow SVG */
}
QComboBox::drop-down:hover {
    background-color: #f0f0f0;
}
QComboBox QAbstractItemView {
    border: 1px solid #ced4da;
    border-radius: 4px;
    selection-background-color: #007bff;
    selection-color: white;
    padding: 5px;
}

/* --- Labels --- */
QLabel {
    color: #333333;
}

/* --- Group Box (for filters/sort) --- */
QGroupBox {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-top: 10px; /* Space for title */
    padding: 10px;
    background-color: #ffffff;
}
QGroupBox::title {
    subcontrol-origin: margin;
    subcontrol-position: top left;
    padding: 0 5px;
    color: #007bff; /* Accent color for titles */
    font-size: 14px;
    font-weight: 600;
    left: 10px;
    margin-left: 5px;
}

/* --- Side Panel Buttons (Filters & Sort) --- */
QWidget#sidebar QPushButton {
    background-color: transparent;
    color: #555555;
    border: none;
    text-align: left;
    padding: 8px 10px;
    border-radius: 4px;
    min-width: unset; /* Override general QPushButton min-width */
}

QWidget#sidebar QPushButton:hover {
    background-color: #e6f0ff; /* Lighter blue background on hover */
    color: #007bff;
}

QWidget#sidebar QPushButton:checked {
    background-color: #007bff; /* Solid blue when checked/selected */
    color: white;
    font-weight: 600;
}

QWidget#sidebar QPushButton:checked:hover {
    background-color: #0056b3;
}

/* --- Status Bar --- */
QStatusBar {
    background-color: #e0e0e0;
    color: #333333;
    padding: 3px 5px;
    font-size: 12px;
}

/* --- Dialogs --- */
QDialog {
    background-color: #f5f6fa;
    border: 1px solid #c0c0c0;
    border-radius: 10px;
}
QDialog QFrame { /* For consistent background */
    background-color: #f5f6fa;
    border: none;
}
QDialog QLabel {
    margin-top: 5px;
}
```

### **4. `ui_task_widget.py`**

```python
# todo_app/ui_task_widget.py
from PyQt6.QtWidgets import (
    QWidget, QHBoxLayout, QVBoxLayout, QLabel, QCheckBox, QPushButton,
    QApplication, QListWidget, QListWidgetItem
)
from PyQt6.QtCore import pyqtSignal, Qt, QDate
from PyQt6.QtGui import QMouseEvent, QContextMenuEvent

from models import Task
from datetime import datetime

class TaskItemWidget(QWidget):
    """
    A custom QWidget to display a single task within the QListWidget.
    Features: Checkbox for completion, title, due date, priority.
    Emits signals for completion toggle and edit/delete requests.
    """
    task_completed_toggled = pyqtSignal(int, bool) # task_id, is_completed
    task_edit_requested = pyqtSignal(int)          # task_id
    task_delete_requested = pyqtSignal(int)        # task_id

    def __init__(self, task: Task, parent=None):
        super().__init__(parent)
        self.task = task
        self.setObjectName("TaskItemWidget") # Used for QSS styling

        self._setup_ui()
        self._load_task_data()
        self._apply_style()

    def _setup_ui(self):
        main_layout = QHBoxLayout(self)
        main_layout.setContentsMargins(0, 0, 0, 0) # Managed by QSS padding

        # Left: Checkbox for completion
        self.checkbox = QCheckBox()
        self.checkbox.stateChanged.connect(self._on_checkbox_state_changed)
        main_layout.addWidget(self.checkbox, alignment=Qt.AlignmentFlag.AlignTop)

        # Center: Title and Details (Due Date, Priority)
        details_layout = QVBoxLayout()
        details_layout.setContentsMargins(5, 0, 5, 0)
        details_layout.setSpacing(2)

        self.title_label = QLabel(self.task.title)
        self.title_label.setObjectName("taskTitle")
        details_layout.addWidget(self.title_label)

        self.details_label = QLabel()
        self.details_label.setObjectName("taskDetails")
        details_layout.addWidget(self.details_label)

        main_layout.addLayout(details_layout)
        main_layout.addStretch(1) # Pushes other elements to the sides

    def _load_task_data(self):
        self.checkbox.setChecked(self.task.completed)
        self.title_label.setText(self.task.title)

        details_text = []
        if self.task.due_date:
            try:
                due_date_obj = QDate.fromString(self.task.due_date, "yyyy-MM-dd")
                if due_date_obj.isValid():
                    details_text.append(f"Due: {due_date_obj.toString('MMM d, yyyy')}")
            except ValueError:
                pass # Invalid date format
        
        priority_text = Task.PRIORITY_MAP.get(self.task.priority, "Medium")
        details_text.append(f"Priority: {priority_text}")

        self.details_label.setText(" | ".join(details_text))

    def _apply_style(self):
        # Apply CSS classes based on task state
        current_classes = self.title_label.property("class")
        if current_classes:
            current_classes = set(current_classes.split())
        else:
            current_classes = set()

        if self.task.completed:
            current_classes.add("completed")
        else:
            current_classes.discard("completed")

        self.title_label.setProperty("class", " ".join(current_classes))
        
        # Apply priority and overdue styling to details label
        detail_classes = set()
        if self.task.priority == Task.PRIORITY_LOW:
            detail_classes.add("priorityLow")
        elif self.task.priority == Task.PRIORITY_MEDIUM:
            detail_classes.add("priorityMedium")
        elif self.task.priority == Task.PRIORITY_HIGH:
            detail_classes.add("priorityHigh")
        
        if self.task.is_overdue():
            detail_classes.add("overdue")
        
        self.details_label.setProperty("class", " ".join(detail_classes))
        self.style().polish(self.title_label)
        self.style().polish(self.details_label) # Re-polish to apply QSS rules based on new properties

    def update_task_data(self, task: Task):
        """Updates the widget with new task data."""
        self.task = task
        self._load_task_data()
        self._apply_style()

    def _on_checkbox_state_changed(self, state):
        is_completed = bool(state)
        self.task_completed_toggled.emit(self.task.id, is_completed)
        # The main window will reload tasks, which will update this widget's style.
        # Alternatively, we could update the local task object and call _apply_style() here
        # self.task.completed = is_completed
        # self._apply_style()

    def mousePressEvent(self, event: QMouseEvent):
        if event.button() == Qt.MouseButton.LeftButton:
            # Emit signal to open edit dialog when task item is clicked (not checkbox)
            if not self.checkbox.geometry().contains(event.pos()):
                 self.task_edit_requested.emit(self.task.id)
        super().mousePressEvent(event)

    def contextMenuEvent(self, event: QContextMenuEvent):
        context_menu = QApplication.instance().task_context_menu # Get global context menu
        if context_menu:
            # Store the ID of the task that was right-clicked
            context_menu.current_task_id = self.task.id
            context_menu.exec(event.globalPos())
        super().contextMenuEvent(event)

```

### **5. `ui_task_dialog.py`**

```python
# todo_app/ui_task_dialog.py
from PyQt6.QtWidgets import (
    QDialog, QVBoxLayout, QFormLayout, QLabel, QLineEdit,
    QTextEdit, QDateEdit, QComboBox, QDialogButtonBox, QMessageBox
)
from PyQt6.QtCore import Qt, QDate
from models import Task

class TaskFormDialog(QDialog):
    """
    A dialog for adding new tasks or editing existing ones.
    """
    def __init__(self, task: Task = None, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Add/Edit Task")
        self.setModal(True) # Make it a modal dialog
        self.setMinimumWidth(400)
        self.setMinimumHeight(350)
        self.setObjectName("TaskFormDialog") # For QSS

        self.original_task = task # Keep a reference to original task for updates
        self.new_task_data = None

        self._setup_ui()
        if task:
            self._load_task_data(task)

    def _setup_ui(self):
        main_layout = QVBoxLayout(self)
        form_layout = QFormLayout()
        form_layout.setFieldGrowthPolicy(QFormLayout.FieldGrowthPolicy.AllNonFixedFieldsGrow)
        form_layout.setLabelAlignment(Qt.AlignmentFlag.AlignRight)

        self.title_input = QLineEdit()
        self.title_input.setPlaceholderText("Task Title (Required)")
        form_layout.addRow("Title:", self.title_input)

        self.description_input = QTextEdit()
        self.description_input.setPlaceholderText("Optional description or notes...")
        self.description_input.setMinimumHeight(80)
        form_layout.addRow("Description:", self.description_input)

        self.due_date_input = QDateEdit(QDate.currentDate())
        self.due_date_input.setCalendarPopup(True)
        self.due_date_input.setClearButtonEnabled(True) # Allows clearing the date
        self.due_date_input.setDate(QDate.currentDate()) # Default to today
        # Custom button to clear date (QDateEdit.setClearButtonEnabled isn't available in some Qt versions/bindings)
        # Let's rely on setClearButtonEnabled if available, else a manual button or context menu for it.
        # For PyQt6, it's generally available.
        form_layout.addRow("Due Date:", self.due_date_input)

        self.priority_combo = QComboBox()
        self.priority_combo.addItem("Low", Task.PRIORITY_LOW)
        self.priority_combo.addItem("Medium", Task.PRIORITY_MEDIUM)
        self.priority_combo.addItem("High", Task.PRIORITY_HIGH)
        self.priority_combo.setCurrentIndex(Task.PRIORITY_MEDIUM) # Default to Medium
        form_layout.addRow("Priority:", self.priority_combo)

        self.category_input = QLineEdit()
        self.category_input.setPlaceholderText("e.g., Work, Personal, Shopping")
        form_layout.addRow("Category:", self.category_input)

        self.completed_checkbox = QCheckBox("Mark as Completed")
        form_layout.addRow("", self.completed_checkbox) # No label

        main_layout.addLayout(form_layout)

        button_box = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel
        )
        button_box.accepted.connect(self._on_accepted)
        button_box.rejected.connect(self.reject)
        main_layout.addWidget(button_box)

    def _load_task_data(self, task: Task):
        self.title_input.setText(task.title)
        self.description_input.setText(task.description)
        if task.due_date:
            date_obj = QDate.fromString(task.due_date, "yyyy-MM-dd")
            if date_obj.isValid():
                self.due_date_input.setDate(date_obj)
            else:
                self.due_date_input.clear() # Clear if date is invalid
        else:
            self.due_date_input.clear() # Clear if no due date

        self.priority_combo.setCurrentIndex(task.priority)
        self.category_input.setText(task.category)
        self.completed_checkbox.setChecked(task.completed)

        if task.completed:
            self.setWindowTitle("Task Details (Completed)")
        else:
            self.setWindowTitle("Edit Task")

    def _on_accepted(self):
        if not self.title_input.text().strip():
            QMessageBox.warning(self, "Input Error", "Task title cannot be empty.")
            return

        due_date_str = self.due_date_input.date().toString("yyyy-MM-dd") if not self.due_date_input.date().isNull() else None
        
        # If it's an existing task, preserve its created_at, else set a new one
        created_at = self.original_task.created_at if self.original_task else datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Handle completed_at timestamp
        completed_at = None
        if self.completed_checkbox.isChecked():
            if self.original_task and self.original_task.completed:
                completed_at = self.original_task.completed_at # Keep original completed_at if already completed
            else:
                completed_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S") # Set new completed_at
        elif self.original_task and not self.completed_checkbox.isChecked():
            completed_at = None # Task is now pending, clear completed_at

        self.new_task_data = Task(
            id=self.original_task.id if self.original_task else None,
            title=self.title_input.text().strip(),
            description=self.description_input.toPlainText().strip(),
            due_date=due_date_str,
            priority=self.priority_combo.currentData(),
            category=self.category_input.text().strip(),
            completed=self.completed_checkbox.isChecked(),
            created_at=created_at,
            completed_at=completed_at
        )
        self.accept()

    def get_task_data(self) -> Optional[Task]:
        return self.new_task_data
```

### **6. `ui_main_window.py`**

```python
# todo_app/ui_main_window.py
from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLineEdit, QPushButton, QListWidget, QListWidgetItem,
    QMessageBox, QFrame, QMenu, QComboBox, QGroupBox, QLabel
)
from PyQt6.QtCore import Qt, QTimer, QDate
from PyQt6.QtGui import QAction

from database import DatabaseManager
from models import Task
from ui_task_widget import TaskItemWidget
from ui_task_dialog import TaskFormDialog
from datetime import datetime

class MainWindow(QMainWindow):
    """
    The main application window for the ToDo application.
    Manages task display, filtering, searching, and interactions.
    """
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Insanely Cool TODO App")
        self.setGeometry(100, 100, 900, 700) # Initial window size
        self.setObjectName("MainWindow") # For QSS

        self.db_manager = DatabaseManager()
        self.current_filter_mode = "all"
        self.current_search_term = ""
        self.current_sort_by = "priority_due_date_desc"

        self._setup_ui()
        self._setup_connections()
        self._create_context_menu() # Create global context menu for tasks
        self.load_tasks()

        # Update status bar time every minute
        self.status_bar_timer = QTimer(self)
        self.status_bar_timer.timeout.connect(self._update_status_bar)
        self.status_bar_timer.start(60 * 1000) # Every 1 minute
        self._update_status_bar() # Initial update

    def _setup_ui(self):
        # Central Widget
        central_widget = QWidget()
        central_widget.setObjectName("centralWidget")
        main_layout = QHBoxLayout(central_widget)
        self.setCentralWidget(central_widget)

        # Left Side Panel (Filters and Sort)
        side_panel_layout = QVBoxLayout()
        side_panel_layout.setContentsMargins(10, 10, 10, 10)
        side_panel_layout.setSpacing(10)
        side_panel_widget = QWidget()
        side_panel_widget.setLayout(side_panel_layout)
        side_panel_widget.setMinimumWidth(180)
        side_panel_widget.setMaximumWidth(250)
        side_panel_widget.setObjectName("sidebar")
        
        # Filter Group Box
        filter_group = QGroupBox("Filters")
        filter_layout = QVBoxLayout(filter_group)
        self.filter_buttons = {}
        filters = {
            "All Tasks": "all",
            "Pending": "pending",
            "Completed": "completed",
            "Due Today": "today",
            "Overdue": "overdue"
        }
        for text, mode in filters.items():
            btn = QPushButton(text)
            btn.setCheckable(True)
            btn.clicked.connect(lambda checked, m=mode: self._on_filter_button_clicked(m))
            filter_layout.addWidget(btn)
            self.filter_buttons[mode] = btn
        filter_layout.addStretch(1) # Push buttons to top
        side_panel_layout.addWidget(filter_group)

        # Sort Group Box
        sort_group = QGroupBox("Sort By")
        sort_layout = QVBoxLayout(sort_group)
        self.sort_combo = QComboBox()
        self.sort_combo.addItem("Priority & Due Date", "priority_due_date_desc")
        self.sort_combo.addItem("Creation Date (Newest)", "created_at_desc")
        self.sort_combo.addItem("Due Date (Earliest)", "due_date_asc")
        self.sort_combo.currentIndexChanged.connect(self._on_sort_changed)
        sort_layout.addWidget(self.sort_combo)
        sort_group.setLayout(sort_layout)
        side_panel_layout.addWidget(sort_group)
        
        side_panel_layout.addStretch(1) # Push groups to top
        main_layout.addWidget(side_panel_widget)

        # Main Content Area
        content_layout = QVBoxLayout()
        content_layout.setContentsMargins(10, 10, 10, 10)
        content_layout.setSpacing(10)

        # Top Bar: Search and Add Task Button
        top_bar_layout = QHBoxLayout()
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Search tasks...")
        self.search_input.setObjectName("searchInput")
        top_bar_layout.addWidget(self.search_input)

        self.add_task_button = QPushButton("Add Task")
        self.add_task_button.setObjectName("addTaskButton")
        top_bar_layout.addWidget(self.add_task_button)
        content_layout.addLayout(top_bar_layout)

        # Task List
        self.task_list_widget = QListWidget()
        self.task_list_widget.setObjectName("taskListWidget")
        content_layout.addWidget(self.task_list_widget)

        main_layout.addLayout(content_layout)

        # Status Bar
        self.statusBar = self.statusBar()
        self.status_message_label = QLabel("Ready")
        self.status_time_label = QLabel("")
        self.statusBar.addWidget(self.status_message_label, 1) # Stretch factor 1
        self.statusBar.addPermanentWidget(self.status_time_label)

        # Initial filter selection
        self.filter_buttons[self.current_filter_mode].setChecked(True)

    def _setup_connections(self):
        self.add_task_button.clicked.connect(self.on_add_task)
        self.search_input.textChanged.connect(self._on_search_text_changed)
        self.task_list_widget.itemDoubleClicked.connect(self._on_list_item_double_clicked)
        # Context menu connections handled globally

    def _create_context_menu(self):
        self.task_context_menu = QMenu(self)
        self.task_context_menu.current_task_id = None # Store ID of the task that was right-clicked
        
        edit_action = QAction("Edit Task", self)
        edit_action.triggered.connect(self._on_context_edit)
        self.task_context_menu.addAction(edit_action)

        toggle_action = QAction("Toggle Completion", self)
        toggle_action.triggered.connect(self._on_context_toggle_completion)
        self.task_context_menu.addAction(toggle_action)

        delete_action = QAction("Delete Task", self)
        delete_action.triggered.connect(self._on_context_delete)
        self.task_context_menu.addAction(delete_action)

        # Store a reference to the context menu in QApplication,
        # so TaskItemWidget can access it.
        # This is a common pattern for global context menus.
        QApplication.instance().task_context_menu = self.task_context_menu

    def load_tasks(self):
        self.task_list_widget.clear()
        tasks = self.db_manager.get_tasks(
            filter_mode=self.current_filter_mode,
            search_term=self.current_search_term,
            sort_by=self.current_sort_by
        )
        if not tasks:
            self.statusBar.showMessage("No tasks found matching current criteria.", 3000)
            return

        for task in tasks:
            list_item = QListWidgetItem(self.task_list_widget)
            task_widget = TaskItemWidget(task)
            
            # Connect signals from custom widget to main window slots
            task_widget.task_completed_toggled.connect(self.on_toggle_task_completion)
            task_widget.task_edit_requested.connect(self.on_edit_task) # Click on item opens edit
            # task_widget.task_delete_requested.connect(self.on_delete_task) # Could add a direct delete button

            list_item.setSizeHint(task_widget.sizeHint())
            self.task_list_widget.addItem(list_item)
            self.task_list_widget.setItemWidget(list_item, task_widget)
        self.statusBar.showMessage(f"Loaded {len(tasks)} tasks.", 2000)

    def on_add_task(self):
        dialog = TaskFormDialog(parent=self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            new_task = dialog.get_task_data()
            if new_task:
                task_id = self.db_manager.add_task(new_task)
                if task_id:
                    self.statusBar.showMessage(f"Task '{new_task.title}' added successfully!", 3000)
                    self.load_tasks()
                else:
                    self.statusBar.showMessage("Failed to add task.", 3000)

    def on_edit_task(self, task_id: int):
        task = self.db_manager.get_task_by_id(task_id)
        if not task:
            QMessageBox.warning(self, "Task Not Found", "The selected task could not be found.")
            return

        dialog = TaskFormDialog(task=task, parent=self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            updated_task = dialog.get_task_data()
            if updated_task:
                success = self.db_manager.update_task(updated_task)
                if success:
                    self.statusBar.showMessage(f"Task '{updated_task.title}' updated successfully!", 3000)
                    self.load_tasks()
                else:
                    self.statusBar.showMessage("Failed to update task.", 3000)

    def on_delete_task(self, task_id: int):
        reply = QMessageBox.question(self, "Confirm Delete",
                                     "Are you sure you want to delete this task?",
                                     QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No)
        if reply == QMessageBox.StandardButton.Yes:
            success = self.db_manager.delete_task(task_id)
            if success:
                self.statusBar.showMessage("Task deleted successfully!", 3000)
                self.load_tasks()
            else:
                self.statusBar.showMessage("Failed to delete task.", 3000)

    def on_toggle_task_completion(self, task_id: int, completed: bool):
        success = self.db_manager.toggle_task_completion(task_id, completed)
        if success:
            status_text = "completed" if completed else "marked pending"
            self.statusBar.showMessage(f"Task {status_text}!", 2000)
            self.load_tasks() # Reload to ensure styles update correctly

    def _on_search_text_changed(self, text: str):
        self.current_search_term = text.strip()
        self.load_tasks()

    def _on_filter_button_clicked(self, mode: str):
        # Uncheck all other filter buttons
        for btn_mode, btn in self.filter_buttons.items():
            if btn_mode != mode:
                btn.setChecked(False)
        self.filter_buttons[mode].setChecked(True) # Ensure clicked button is checked

        self.current_filter_mode = mode
        self.load_tasks()

    def _on_sort_changed(self, index: int):
        self.current_sort_by = self.sort_combo.itemData(index)
        self.load_tasks()

    def _on_list_item_double_clicked(self, item: QListWidgetItem):
        # When an item is double-clicked, find the corresponding TaskItemWidget
        # and trigger its edit signal.
        widget = self.task_list_widget.itemWidget(item)
        if isinstance(widget, TaskItemWidget):
            self.on_edit_task(widget.task.id)

    def _on_context_edit(self):
        task_id = QApplication.instance().task_context_menu.current_task_id
        if task_id:
            self.on_edit_task(task_id)

    def _on_context_toggle_completion(self):
        task_id = QApplication.instance().task_context_menu.current_task_id
        if task_id:
            task = self.db_manager.get_task_by_id(task_id)
            if task:
                self.on_toggle_task_completion(task_id, not task.completed)

    def _on_context_delete(self):
        task_id = QApplication.instance().task_context_menu.current_task_id
        if task_id:
            self.on_delete_task(task_id)

    def _update_status_bar(self):
        self.status_time_label.setText(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    def closeEvent(self, event):
        self.db_manager.close()
        super().closeEvent(event)
```

### **7. `main.py`**

```python
# todo_app/main.py
import sys
from PyQt6.QtWidgets import QApplication
from PyQt6.QtGui import QFontDatabase
from ui_main_window import MainWindow
import os

def load_qss(app):
    """Loads and applies the QSS stylesheet to the application."""
    qss_path = os.path.join(os.path.dirname(__file__), 'style.qss')
    if os.path.exists(qss_path):
        with open(qss_path, "r") as f:
            app.setStyleSheet(f.read())
        print(f"Loaded QSS from: {qss_path}")
    else:
        print(f"Warning: style.qss not found at {qss_path}. Application will use default styles.")

if __name__ == "__main__":
    # Ensure the 'todo_app' directory is part of the Python path if running directly from parent
    # Or, preferably, run as `python -m todo_app.main` from the parent directory
    # For simplicity of direct execution, we'll assume current working directory is `todo_app` or `sys.path` handles it.
    
    app = QApplication(sys.argv)

    # Load QSS
    load_qss(app)

    # Main Window
    window = MainWindow()
    window.show()

    sys.exit(app.exec())

```

---

### **How to Run the Application:**

1.  **Save the files:** Create a directory named `todo_app`. Save all the Python files (`main.py`, `database.py`, `models.py`, `ui_main_window.py`, `ui_task_dialog.py`, `ui_task_widget.py`) and the `style.qss` file inside this `todo_app` directory.

    Your directory structure should look exactly like this:
    ```
    .
    └── todo_app/
        ├── main.py
        ├── database.py
        ├── models.py
        ├── ui_main_window.py
        ├── ui_task_dialog.py
        ├── ui_task_widget.py
        └── style.qss
    ```

2.  **Install PyQt6:** If you haven't already, install PyQt6:
    ```bash
    pip install PyQt6
    ```

3.  **Run:** Open your terminal or command prompt, navigate *into* the `todo_app` directory, and run:
    ```bash
    python main.py
    ```
    Alternatively, from the parent directory of `todo_app`, you can run:
    ```bash
    python -m todo_app.main
    ```

### **Features Implemented:**

*   **Modern UI:** Clean, light theme with `style.qss` for a sleek appearance. Rounded corners, subtle shadows, and intuitive color coding for priorities and overdue tasks.
*   **Persistent Data:** Uses SQLite (`todo.db` file will be created in the same directory as `main.py`) to store tasks, ensuring data is saved between sessions.
*   **Add Task:** Click "Add Task" to open a dialog for entering title, description, due date, priority, and category.
*   **Edit Task:**
    *   Double-click a task in the list.
    *   Right-click a task and select "Edit Task".
    *   The dialog pre-fills with existing task data.
*   **Delete Task:** Right-click a task and select "Delete Task" (with confirmation).
*   **Toggle Completion:** Check/uncheck the box next to each task. Completed tasks show with a strikethrough and a lighter color.
*   **Due Dates & Overdue Status:** Tasks can have a due date. Overdue tasks are highlighted in red.
*   **Priorities:** Tasks can be assigned Low, Medium, or High priority, visually indicated.
*   **Categories:** Tasks can have an optional category.
*   **Search:** Type in the search bar to filter tasks by title, description, or category.
*   **Filtering:** Side panel buttons to quickly view "All Tasks", "Pending", "Completed", "Due Today", or "Overdue" tasks.
*   **Sorting:** A dropdown in the side panel allows sorting by "Priority & Due Date" (default, most useful), "Creation Date (Newest)", or "Due Date (Earliest)".
*   **Context Menu:** Right-click on any task item for quick actions: Edit, Toggle Completion, Delete.
*   **Responsive Task Items:** Each task is a custom widget (`TaskItemWidget`) that intelligently lays out its content and responds to completion status and due date.
*   **Status Bar:** Provides feedback on operations and displays the current time.

This application provides a strong foundation for an "insanely cool" TODO app. Further enhancements could include user settings (e.g., dark mode toggle), more advanced reminders, drag-and-drop reordering, or richer category management.
