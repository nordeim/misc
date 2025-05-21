import sys
import sqlite3
import datetime
import os
from functools import partial

from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
    QPushButton, QLabel, QLineEdit, QComboBox, QDateEdit, QTextEdit,
    QListWidget, QListWidgetItem, QDialog, QFormLayout, QCheckBox,
    QMessageBox, QFrame, QStatusBar, QColorDialog, QSizePolicy,
    QDialogButtonBox
)
from PySide6.QtCore import (
    Qt, QDate, QSettings, Signal
)
from PySide6.QtGui import (
    QColor, QPalette, QFont, QFontMetrics
)

# Database setup
DB_PATH = os.path.join(os.path.expanduser("~"), ".taskflow.db")

def get_connection():
    """Create a connection to the SQLite database."""
    return sqlite3.connect(DB_PATH)

def init_db():
    """Initialize the database with required tables."""
    with get_connection() as conn:
        cursor = conn.cursor()
        
        # Create categories table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            color TEXT DEFAULT '#3498db'
        )
        ''')
        
        # Create tasks table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            priority INTEGER DEFAULT 1,
            due_date TEXT,
            completed INTEGER DEFAULT 0,
            category_id INTEGER,
            created_at TEXT NOT NULL,
            modified_at TEXT NOT NULL,
            FOREIGN KEY (category_id) REFERENCES categories (id)
        )
        ''')
        
        # Insert default category if it doesn't exist
        cursor.execute('''
        INSERT OR IGNORE INTO categories (name, color) 
        VALUES ('General', '#3498db')
        ''')
        
        conn.commit()


class TaskModel:
    """Model for task data handling."""
    
    @staticmethod
    def get_all_tasks():
        """Get all tasks from the database."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            SELECT t.id, t.title, t.description, t.priority, t.due_date, 
                   t.completed, c.name, c.color, t.created_at, t.modified_at, t.category_id
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            ORDER BY t.completed, 
                    CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END, 
                    t.due_date,
                    t.priority DESC
            ''')
            return cursor.fetchall()
    
    @staticmethod
    def get_task_by_id(task_id):
        """Get a specific task by its ID."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            SELECT t.id, t.title, t.description, t.priority, t.due_date, 
                   t.completed, c.name, c.color, t.created_at, t.modified_at, t.category_id
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.id = ?
            ''', (task_id,))
            return cursor.fetchone()
    
    @staticmethod
    def add_task(title, description, priority, due_date, category_id):
        """Add a new task to the database."""
        now = datetime.datetime.now().isoformat()
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            INSERT INTO tasks (title, description, priority, due_date, category_id, created_at, modified_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (title, description, priority, due_date, category_id, now, now))
            conn.commit()
            return cursor.lastrowid
    
    @staticmethod
    def update_task(task_id, title, description, priority, due_date, completed, category_id):
        """Update an existing task."""
        now = datetime.datetime.now().isoformat()
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            UPDATE tasks
            SET title = ?, description = ?, priority = ?, due_date = ?, 
                completed = ?, category_id = ?, modified_at = ?
            WHERE id = ?
            ''', (title, description, priority, due_date, completed, category_id, now, task_id))
            conn.commit()
    
    @staticmethod
    def delete_task(task_id):
        """Delete a task from the database."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
            conn.commit()
    
    @staticmethod
    def toggle_task_completion(task_id, completed):
        """Toggle the completion status of a task."""
        now = datetime.datetime.now().isoformat()
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            UPDATE tasks
            SET completed = ?, modified_at = ?
            WHERE id = ?
            ''', (1 if completed else 0, now, task_id))
            conn.commit()


class CategoryModel:
    """Model for category data handling."""
    
    @staticmethod
    def get_all_categories():
        """Get all categories from the database."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, name, color FROM categories ORDER BY name')
            return cursor.fetchall()
    
    @staticmethod
    def add_category(name, color):
        """Add a new category to the database."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('INSERT INTO categories (name, color) VALUES (?, ?)', (name, color))
            conn.commit()
            return cursor.lastrowid
    
    @staticmethod
    def update_category(category_id, name, color):
        """Update an existing category."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE categories SET name = ?, color = ? WHERE id = ?', (name, color, category_id))
            conn.commit()
    
    @staticmethod
    def delete_category(category_id):
        """Delete a category from the database."""
        with get_connection() as conn:
            cursor = conn.cursor()
            # Update tasks to use the default category
            cursor.execute('UPDATE tasks SET category_id = 1 WHERE category_id = ?', (category_id,))
            # Delete the category
            cursor.execute('DELETE FROM categories WHERE id = ? AND id != 1', (category_id,))
            conn.commit()


class TaskItemWidget(QWidget):
    """Custom widget for displaying a task in the list."""
    
    statusChanged = Signal(int, bool)
    editRequested = Signal(int)
    deleteRequested = Signal(int)
    
    def __init__(self, task_data, parent=None):
        super().__init__(parent)
        self.task_id = task_data[0]
        self.task_title = task_data[1]
        self.task_desc = task_data[2]
        self.task_priority = task_data[3]
        self.task_due_date = task_data[4]
        self.task_completed = bool(task_data[5])
        self.category_name = task_data[6] or "General"
        self.category_color = task_data[7] or "#3498db"
        self.category_id = task_data[10]
        
        self.initUI()
    
    def initUI(self):
        layout = QHBoxLayout(self)
        layout.setContentsMargins(8, 8, 8, 8)
        
        # Task completion checkbox
        self.checkbox = QCheckBox()
        self.checkbox.setChecked(self.task_completed)
        self.checkbox.toggled.connect(self.onStatusChanged)
        layout.addWidget(self.checkbox)
        
        # Task details container
        details_widget = QWidget()
        details_layout = QVBoxLayout(details_widget)
        details_layout.setContentsMargins(0, 0, 0, 0)
        details_layout.setSpacing(2)
        
        # Task title
        self.title_label = QLabel(self.task_title)
        font = QFont()
        font.setBold(True)
        font.setPointSize(11)
        self.title_label.setFont(font)
        if self.task_completed:
            self.title_label.setStyleSheet("text-decoration: line-through; color: gray;")
        details_layout.addWidget(self.title_label)
        
        # Category and due date
        info_layout = QHBoxLayout()
        info_layout.setContentsMargins(0, 0, 0, 0)
        
        # Category badge
        category_label = QLabel(self.category_name)
        category_label.setStyleSheet(f"""
            background-color: {self.category_color};
            color: white;
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 10px;
        """)
        info_layout.addWidget(category_label)
        
        # Priority indicator
        priority_colors = ["#95a5a6", "#f39c12", "#e74c3c"]  # Low, Medium, High
        priority_names = ["Low", "Medium", "High"]
        priority_label = QLabel(priority_names[self.task_priority])
        priority_label.setStyleSheet(f"""
            background-color: {priority_colors[self.task_priority]};
            color: white;
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 10px;
            margin-left: 4px;
        """)
        info_layout.addWidget(priority_label)
        
        # Due date
        if self.task_due_date:
            try:
                due_date = QDate.fromString(self.task_due_date, Qt.ISODate)
                today = QDate.currentDate()
                days_left = today.daysTo(due_date)
                
                if days_left < 0:
                    date_color = "#e74c3c"  # Red for overdue
                    date_text = f"Overdue by {abs(days_left)} days"
                elif days_left == 0:
                    date_color = "#f39c12"  # Orange for today
                    date_text = "Due today"
                elif days_left <= 3:
                    date_color = "#f39c12"  # Orange for soon
                    date_text = f"Due in {days_left} days"
                else:
                    date_color = "#27ae60"  # Green for future
                    date_text = f"Due in {days_left} days" if days_left < 30 else due_date.toString("MMM d, yyyy")
                
                due_label = QLabel(date_text)
                due_label.setStyleSheet(f"""
                    color: {date_color};
                    font-size: 10px;
                    margin-left: 4px;
                """)
                info_layout.addWidget(due_label)
            except Exception:
                pass
        
        info_layout.addStretch()
        details_layout.addLayout(info_layout)
        
        # Add the description if it exists
        if self.task_desc and self.task_desc.strip():
            desc_label = QLabel(self.task_desc.strip())
            desc_label.setWordWrap(True)
            desc_label.setStyleSheet("color: #7f8c8d; font-size: 10px;")
            metrics = QFontMetrics(desc_label.font())
            elidedText = metrics.elidedText(self.task_desc.strip(), Qt.ElideRight, 300)
            desc_label.setText(elidedText)
            details_layout.addWidget(desc_label)
        
        layout.addWidget(details_widget, 1)
        
        # Action buttons
        actions_layout = QHBoxLayout()
        
        edit_btn = QPushButton("Edit")
        edit_btn.setStyleSheet("""
            QPushButton {
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 4px 8px;
            }
            QPushButton:hover {
                background-color: #2980b9;
            }
        """)
        edit_btn.clicked.connect(self.onEditClicked)
        actions_layout.addWidget(edit_btn)
        
        delete_btn = QPushButton("Delete")
        delete_btn.setStyleSheet("""
            QPushButton {
                background-color: #e74c3c;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 4px 8px;
            }
            QPushButton:hover {
                background-color: #c0392b;
            }
        """)
        delete_btn.clicked.connect(self.onDeleteClicked)
        actions_layout.addWidget(delete_btn)
        
        layout.addLayout(actions_layout)
        
        # Style for the entire widget
        self.setStyleSheet("""
            background-color: #f9f9f9;
            border-radius: 8px;
            margin: 4px;
        """)
        
        # Set fixed height for consistent look
        self.setMinimumHeight(70)
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    
    def onStatusChanged(self, checked):
        self.statusChanged.emit(self.task_id, checked)
    
    def onEditClicked(self):
        self.editRequested.emit(self.task_id)
    
    def onDeleteClicked(self):
        self.deleteRequested.emit(self.task_id)


class TaskDialog(QDialog):
    """Dialog for adding or editing tasks."""
    
    def __init__(self, parent=None, task_id=None):
        super().__init__(parent)
        self.task_id = task_id
        self.categories = CategoryModel.get_all_categories()
        
        self.setWindowTitle("Add Task" if task_id is None else "Edit Task")
        self.setMinimumWidth(400)
        self.initUI()
        
        if task_id is not None:
            self.loadTaskData()
    
    def initUI(self):
        layout = QVBoxLayout(self)
        
        form_layout = QFormLayout()
        
        # Title
        self.title_edit = QLineEdit()
        self.title_edit.setPlaceholderText("Enter task title")
        form_layout.addRow("Title:", self.title_edit)
        
        # Description
        self.desc_edit = QTextEdit()
        self.desc_edit.setPlaceholderText("Enter task description (optional)")
        self.desc_edit.setMaximumHeight(100)
        form_layout.addRow("Description:", self.desc_edit)
        
        # Priority
        self.priority_combo = QComboBox()
        self.priority_combo.addItems(["Low", "Medium", "High"])
        self.priority_combo.setCurrentIndex(1)  # Default to Medium
        form_layout.addRow("Priority:", self.priority_combo)
        
        # Due Date
        self.due_date_edit = QDateEdit()
        self.due_date_edit.setCalendarPopup(True)
        self.due_date_edit.setDate(QDate.currentDate())
        self.due_date_check = QCheckBox("Set due date")
        self.due_date_check.toggled.connect(self.due_date_edit.setEnabled)
        self.due_date_edit.setEnabled(False)
        
        due_date_layout = QHBoxLayout()
        due_date_layout.addWidget(self.due_date_check)
        due_date_layout.addWidget(self.due_date_edit)
        form_layout.addRow("Due Date:", due_date_layout)
        
        # Category
        self.category_combo = QComboBox()
        for category in self.categories:
            self.category_combo.addItem(category[1], category[0])
        form_layout.addRow("Category:", self.category_combo)
        
        # Completed status (only for editing)
        if self.task_id is not None:
            self.completed_check = QCheckBox("Task is completed")
            form_layout.addRow("Status:", self.completed_check)
        
        layout.addLayout(form_layout)
        
        # Buttons
        button_box = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        button_box.accepted.connect(self.accept)
        button_box.rejected.connect(self.reject)
        
        layout.addWidget(button_box)
    
    def loadTaskData(self):
        """Load task data for editing."""
        task = TaskModel.get_task_by_id(self.task_id)
        if task:
            self.title_edit.setText(task[1])
            self.desc_edit.setText(task[2] or "")
            self.priority_combo.setCurrentIndex(task[3])
            
            if task[4]:  # Due date
                self.due_date_check.setChecked(True)
                self.due_date_edit.setDate(QDate.fromString(task[4], Qt.ISODate))
            
            # Set the category
            category_id = task[10]
            index = self.category_combo.findData(category_id)
            if index >= 0:
                self.category_combo.setCurrentIndex(index)
            
            # Set completed status
            self.completed_check.setChecked(bool(task[5]))
    
    def getTaskData(self):
        """Get the task data from the dialog."""
        title = self.title_edit.text().strip()
        description = self.desc_edit.toPlainText().strip()
        priority = self.priority_combo.currentIndex()
        
        due_date = None
        if hasattr(self, 'due_date_check') and self.due_date_check.isChecked():
            due_date = self.due_date_edit.date().toString(Qt.ISODate)
        
        category_id = self.category_combo.currentData()
        
        completed = False
        if hasattr(self, 'completed_check'):
            completed = self.completed_check.isChecked()
        
        return {
            'title': title,
            'description': description,
            'priority': priority,
            'due_date': due_date,
            'category_id': category_id,
            'completed': completed
        }


class CategoryDialog(QDialog):
    """Dialog for adding or editing categories."""
    
    def __init__(self, parent=None, category_id=None):
        super().__init__(parent)
        self.category_id = category_id
        
        self.setWindowTitle("Add Category" if category_id is None else "Edit Category")
        self.setMinimumWidth(300)
        self.initUI()
        
        if category_id is not None:
            self.loadCategoryData()
    
    def initUI(self):
        layout = QVBoxLayout(self)
        
        form_layout = QFormLayout()
        
        # Name
        self.name_edit = QLineEdit()
        self.name_edit.setPlaceholderText("Enter category name")
        form_layout.addRow("Name:", self.name_edit)
        
        # Color
        color_layout = QHBoxLayout()
        self.color_preview = QFrame()
        self.color_preview.setFixedSize(24, 24)
        self.color_preview.setStyleSheet("background-color: #3498db; border-radius: 12px;")
        self.color_value = "#3498db"  # Default color
        
        self.color_button = QPushButton("Choose Color")
        self.color_button.clicked.connect(self.chooseColor)
        
        color_layout.addWidget(self.color_preview)
        color_layout.addWidget(self.color_button)
        color_layout.addStretch()
        
        form_layout.addRow("Color:", color_layout)
        
        layout.addLayout(form_layout)
        
        # Buttons
        button_box = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        button_box.accepted.connect(self.accept)
        button_box.rejected.connect(self.reject)
        
        layout.addWidget(button_box)
    
    def chooseColor(self):
        color = QColorDialog.getColor(QColor(self.color_value), self)
        if color.isValid():
            self.color_value = color.name()
            self.color_preview.setStyleSheet(f"background-color: {self.color_value}; border-radius: 12px;")
    
    def loadCategoryData(self):
        """Load category data for editing."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT name, color FROM categories WHERE id = ?', (self.category_id,))
            result = cursor.fetchone()
            
            if result:
                self.name_edit.setText(result[0])
                self.color_value = result[1]
                self.color_preview.setStyleSheet(f"background-color: {self.color_value}; border-radius: 12px;")
    
    def getCategoryData(self):
        """Get the category data from the dialog."""
        name = self.name_edit.text().strip()
        return {
            'name': name,
            'color': self.color_value
        }


class MainWindow(QMainWindow):
    """Main application window."""
    
    def __init__(self):
        super().__init__()
        self.setWindowTitle("TaskFlow")
        self.setMinimumSize(800, 600)
        
        # Initialize settings
        self.settings = QSettings("TaskFlow", "TaskFlow")
        self.restoreGeometry(self.settings.value("geometry", bytes()))
        
        self.initUI()
        self.loadTasks()
    
    def initUI(self):
        # Central widget
        central_widget = QWidget()
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(16, 16, 16, 16)
        
        # Header with app name and info
        header_widget = QWidget()
        header_layout = QHBoxLayout(header_widget)
        header_layout.setContentsMargins(0, 0, 0, 16)
        
        app_name = QLabel("TaskFlow")
        app_name.setStyleSheet("font-size: 24px; font-weight: bold; color: #3498db;")
        header_layout.addWidget(app_name)
        
        # Add task counter
        self.task_counter = QLabel()
        self.task_counter.setStyleSheet("color: #7f8c8d;")
        header_layout.addWidget(self.task_counter)
        
        header_layout.addStretch()
        
        # Add Category button
        add_category_btn = QPushButton("Add Category")
        add_category_btn.setStyleSheet("""
            QPushButton {
                background-color: #9b59b6;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 8px 16px;
            }
            QPushButton:hover {
                background-color: #8e44ad;
            }
        """)
        add_category_btn.clicked.connect(self.showAddCategoryDialog)
        header_layout.addWidget(add_category_btn)
        
        # Add Task button
        add_task_btn = QPushButton("Add Task")
        add_task_btn.setStyleSheet("""
            QPushButton {
                background-color: #2ecc71;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 8px 16px;
            }
            QPushButton:hover {
                background-color: #27ae60;
            }
        """)
        add_task_btn.clicked.connect(self.showAddTaskDialog)
        header_layout.addWidget(add_task_btn)
        
        main_layout.addWidget(header_widget)
        
        # Filter bar
        filter_widget = QWidget()
        filter_layout = QHBoxLayout(filter_widget)
        filter_layout.setContentsMargins(0, 0, 0, 8)
        
        # Search box
        self.search_box = QLineEdit()
        self.search_box.setPlaceholderText("Search tasks...")
        self.search_box.textChanged.connect(self.filterTasks)
        filter_layout.addWidget(self.search_box)
        
        # Filter by category
        self.category_filter = QComboBox()
        self.category_filter.addItem("All Categories", -1)
        self.loadCategories()
        self.category_filter.currentIndexChanged.connect(self.filterTasks)
        filter_layout.addWidget(self.category_filter)
        
        # Filter by priority
        self.priority_filter = QComboBox()
        self.priority_filter.addItem("All Priorities", -1)
        self.priority_filter.addItem("Low", 0)
        self.priority_filter.addItem("Medium", 1)
        self.priority_filter.addItem("High", 2)
        self.priority_filter.currentIndexChanged.connect(self.filterTasks)
        filter_layout.addWidget(self.priority_filter)
        
        # Filter by status
        self.status_filter = QComboBox()
        self.status_filter.addItem("All Tasks", -1)
        self.status_filter.addItem("Active", 0)
        self.status_filter.addItem("Completed", 1)
        self.status_filter.currentIndexChanged.connect(self.filterTasks)
        filter_layout.addWidget(self.status_filter)
        
        main_layout.addWidget(filter_widget)
        
        # Task list
        self.task_list = QListWidget()
        self.task_list.setStyleSheet("""
            QListWidget {
                background-color: #f0f0f0;
                border: none;
                border-radius: 8px;
                padding: 8px;
            }
            QListWidget::item {
                border-bottom: 1px solid #e0e0e0;
                padding: 4px;
            }
        """)
        self.task_list.setSpacing(4)
        
        main_layout.addWidget(self.task_list)
        
        # Status bar with summary
        self.statusBar = QStatusBar()
        self.setStatusBar(self.statusBar)
        self.updateStatusBar()
        
        self.setCentralWidget(central_widget)
    
    def loadCategories(self):
        """Load categories into the filter dropdown."""
        self.category_filter.clear()
        self.category_filter.addItem("All Categories", -1)
        
        categories = CategoryModel.get_all_categories()
        for category in categories:
            self.category_filter.addItem(category[1], category[0])
    
    def loadTasks(self):
        """Load tasks from the database into the list."""
        self.task_list.clear()
        tasks = TaskModel.get_all_tasks()
        
        for task in tasks:
            item = QListWidgetItem()
            widget = TaskItemWidget(task)
            
            # Connect signals
            widget.statusChanged.connect(self.onTaskStatusChanged)
            widget.editRequested.connect(self.showEditTaskDialog)
            widget.deleteRequested.connect(self.confirmDeleteTask)
            
            item.setSizeHint(widget.sizeHint())
            self.task_list.addItem(item)
            self.task_list.setItemWidget(item, widget)
        
        self.updateTaskCounter()
        self.updateStatusBar()
    
    def filterTasks(self):
        """Filter tasks based on search, category, priority, and status."""
        search_text = self.search_box.text().lower()
        category_id = self.category_filter.currentData()
        priority = self.priority_filter.currentData()
        status = self.status_filter.currentData()
        
        for i in range(self.task_list.count()):
            item = self.task_list.item(i)
            widget = self.task_list.itemWidget(item)
            
            # Match search text
            text_match = (not search_text or
                          search_text in widget.task_title.lower() or
                          (widget.task_desc and search_text in widget.task_desc.lower()))
            
            # Match category
            category_match = (category_id == -1 or  # All categories
                              category_id is None or
                              category_id == widget.category_id)
            
            # Match priority
            priority_match = (priority == -1 or  # All priorities
                             priority == widget.task_priority)
            
            # Match status
            status_match = (status == -1 or  # All statuses
                           status == int(widget.task_completed))
            
            # Show/hide based on filters
            item.setHidden(not (text_match and category_match and priority_match and status_match))
        
        self.updateTaskCounter()
    
    def updateTaskCounter(self):
        """Update the task counter in the header."""
        total_tasks = self.task_list.count()
        visible_tasks = sum(1 for i in range(total_tasks) if not self.task_list.item(i).isHidden())
        completed_tasks = sum(1 for i in range(total_tasks) 
                            if self.task_list.itemWidget(self.task_list.item(i)).task_completed)
        
        self.task_counter.setText(f"Showing {visible_tasks} of {total_tasks} tasks • {completed_tasks} completed")
    
    def updateStatusBar(self):
        """Update the status bar with task summary."""
        tasks = TaskModel.get_all_tasks()
        total = len(tasks)
        completed = sum(1 for task in tasks if task[5])
        high_priority = sum(1 for task in tasks if task[3] == 2 and not task[5])
        due_today = 0
        overdue = 0
        
        today = QDate.currentDate()
        for task in tasks:
            if task[4] and not task[5]:  # has due date and not completed
                due_date = QDate.fromString(task[4], Qt.ISODate)
                days_to_due = today.daysTo(due_date)
                if days_to_due == 0:
                    due_today += 1
                elif days_to_due < 0:
                    overdue += 1
        
        status_text = (f"Total: {total} • Completed: {completed} • "
                      f"High Priority: {high_priority} • Due Today: {due_today} • Overdue: {overdue}")
        self.statusBar.showMessage(status_text)
    
    def showAddTaskDialog(self):
        """Show dialog to add a new task."""
        dialog = TaskDialog(self)
        if dialog.exec():
            task_data = dialog.getTaskData()
            if task_data['title']:
                TaskModel.add_task(
                    task_data['title'],
                    task_data['description'],
                    task_data['priority'],
                    task_data['due_date'],
                    task_data['category_id']
                )
                self.loadTasks()
    
    def showEditTaskDialog(self, task_id):
        """Show dialog to edit an existing task."""
        dialog = TaskDialog(self, task_id)
        if dialog.exec():
            task_data = dialog.getTaskData()
            if task_data['title']:
                TaskModel.update_task(
                    task_id,
                    task_data['title'],
                    task_data['description'],
                    task_data['priority'],
                    task_data['due_date'],
                    task_data['completed'],
                    task_data['category_id']
                )
                self.loadTasks()
    
    def onTaskStatusChanged(self, task_id, completed):
        """Handle task completion status change."""
        TaskModel.toggle_task_completion(task_id, completed)
        self.loadTasks()
    
    def confirmDeleteTask(self, task_id):
        """Confirm and delete a task."""
        confirm = QMessageBox.question(
            self,
            "Confirm Delete",
            "Are you sure you want to delete this task?",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        
        if confirm == QMessageBox.Yes:
            TaskModel.delete_task(task_id)
            self.loadTasks()
    
    def showAddCategoryDialog(self):
        """Show dialog to add a new category."""
        dialog = CategoryDialog(self)
        if dialog.exec():
            category_data = dialog.getCategoryData()
            if category_data['name']:
                CategoryModel.add_category(
                    category_data['name'],
                    category_data['color']
                )
                self.loadCategories()
                self.loadTasks()  # Refresh to show new category
    
    def closeEvent(self, event):
        """Save window state on close."""
        self.settings.setValue("geometry", self.saveGeometry())
        event.accept()


def main():
    """Main application entry point."""
    try:
        # Initialize the database
        init_db()
        
        # Start the application
        app = QApplication(sys.argv)
        app.setApplicationName("TaskFlow")
        app.setStyle("Fusion")
        
        # Set up custom palette for modern look
        palette = QPalette()
        palette.setColor(QPalette.Window, QColor(240, 240, 240))
        palette.setColor(QPalette.WindowText, QColor(53, 53, 53))
        palette.setColor(QPalette.Base, QColor(255, 255, 255))
        palette.setColor(QPalette.AlternateBase, QColor(245, 245, 245))
        palette.setColor(QPalette.ToolTipBase, QColor(255, 255, 255))
        palette.setColor(QPalette.ToolTipText, QColor(53, 53, 53))
        palette.setColor(QPalette.Text, QColor(53, 53, 53))
        palette.setColor(QPalette.Button, QColor(240, 240, 240))
        palette.setColor(QPalette.ButtonText, QColor(53, 53, 53))
        palette.setColor(QPalette.BrightText, QColor(255, 0, 0))
        palette.setColor(QPalette.Highlight, QColor(52, 152, 219))
        palette.setColor(QPalette.HighlightedText, QColor(255, 255, 255))
        app.setPalette(palette)
        
        window = MainWindow()
        window.show()
        
        sys.exit(app.exec())
    except Exception as e:
        print(f"Error starting application: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
