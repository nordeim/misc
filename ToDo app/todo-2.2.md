# TaskMaster Pro: Ultimate Python TODO Application

I'll create an even more advanced TODO application with enhanced features and a professional-looking UI using PySide6 and SQLite. This version includes multiple views, advanced statistics, recurring tasks, subtasks, rich-text formatting, and more.

```python
import sys
import os
import sqlite3
import datetime
import json
import uuid
import calendar
import math
import re
from functools import partial
from enum import Enum, auto
import markdown
import webbrowser
from dataclasses import dataclass

from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QGridLayout,
    QPushButton, QLabel, QLineEdit, QComboBox, QDateEdit, QTimeEdit, QTextEdit,
    QListWidget, QListWidgetItem, QDialog, QFormLayout, QCheckBox, QMessageBox,
    QFrame, QStatusBar, QColorDialog, QSizePolicy, QDialogButtonBox, QTabWidget,
    QScrollArea, QMenu, QToolBar, QSystemTrayIcon, QSplitter, QStackedWidget,
    QGraphicsDropShadowEffect, QToolButton, QCalendarWidget, QSpinBox, QSlider,
    QFileDialog, QFontDialog, QInputDialog, QProgressBar, QTableWidget, QTableWidgetItem,
    QHeaderView, QStyledItemDelegate, QStyle, QRadioButton, QButtonGroup, QSpacerItem,
    QCompleter, QDockWidget, QTreeWidget, QTreeWidgetItem, QScrollBar, QStyleFactory
)
from PySide6.QtCore import (
    Qt, QDate, QTime, QDateTime, QSettings, Signal, QTimer, QSortFilterProxyModel,
    QStringListModel, QModelIndex, QPoint, QSize, QRect, QEvent, QItemSelectionModel,
    QPropertyAnimation, QEasingCurve, QObject, QByteArray, QMimeData, QThread, QMutex,
    QUrl, QAbstractTableModel
)
from PySide6.QtGui import (
    QColor, QPalette, QFont, QFontMetrics, QIcon, QKeySequence, QShortcut, QAction,
    QPainter, QPen, QBrush, QPixmap, QGradient, QLinearGradient, QCursor, QTextDocument,
    QTextCursor, QTextCharFormat, QTextListFormat, QTextBlockFormat, QTextImageFormat,
    QPainterPath, QTransform, QImage, QFontDatabase, QTextOption, QTextFormat, QDrag,
    QStaticText, QGuiApplication, QKeyEvent, QMouseEvent
)
from PySide6.QtCharts import QChart, QChartView, QPieSeries, QBarSeries, QBarSet, QValueAxis, QBarCategoryAxis

# ==== Constants ====
APP_NAME = "TaskMaster Pro"
VERSION = "1.0.0"
DB_PATH = os.path.join(os.path.expanduser("~"), ".taskmaster.db")

# Priority levels
class Priority(Enum):
    NONE = 0
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4

# Task view types
class ViewType(Enum):
    LIST = auto()
    BOARD = auto()
    CALENDAR = auto()
    STATS = auto()

# Repeat intervals for recurring tasks
class RepeatInterval(Enum):
    NONE = auto()
    DAILY = auto()
    WEEKDAYS = auto()
    WEEKLY = auto()
    BIWEEKLY = auto()
    MONTHLY = auto()
    QUARTERLY = auto()
    YEARLY = auto()

# ==== Database Setup ====
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
            color TEXT DEFAULT '#3498db',
            icon TEXT DEFAULT 'tag'
        )
        ''')
        
        # Create tags table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            color TEXT DEFAULT '#9b59b6'
        )
        ''')
        
        # Create projects table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            color TEXT DEFAULT '#2ecc71',
            due_date TEXT,
            completed INTEGER DEFAULT 0
        )
        ''')
        
        # Create tasks table with more fields
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            priority INTEGER DEFAULT 1,
            due_date TEXT,
            due_time TEXT,
            reminder TEXT,
            completed INTEGER DEFAULT 0,
            completion_date TEXT,
            category_id INTEGER,
            project_id INTEGER,
            parent_id INTEGER,
            created_at TEXT NOT NULL,
            modified_at TEXT NOT NULL,
            start_date TEXT,
            estimated_time INTEGER,
            actual_time INTEGER DEFAULT 0,
            recurring INTEGER DEFAULT 0,
            recurring_interval TEXT,
            recurring_count INTEGER DEFAULT 0,
            energy_level INTEGER DEFAULT 2,
            notes TEXT,
            status TEXT DEFAULT 'todo',
            position INTEGER DEFAULT 0,
            FOREIGN KEY (category_id) REFERENCES categories (id),
            FOREIGN KEY (project_id) REFERENCES projects (id),
            FOREIGN KEY (parent_id) REFERENCES tasks (id)
        )
        ''')
        
        # Create task_tags table for many-to-many relationship
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS task_tags (
            task_id INTEGER,
            tag_id INTEGER,
            PRIMARY KEY (task_id, tag_id),
            FOREIGN KEY (task_id) REFERENCES tasks (id),
            FOREIGN KEY (tag_id) REFERENCES tags (id)
        )
        ''')
        
        # Create attachments table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS attachments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            path TEXT NOT NULL,
            type TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (task_id) REFERENCES tasks (id)
        )
        ''')
        
        # Create activity_log table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS activity_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER,
            action TEXT NOT NULL,
            details TEXT,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (task_id) REFERENCES tasks (id)
        )
        ''')
        
        # Create pomodoro_sessions table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS pomodoro_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            duration INTEGER NOT NULL,
            FOREIGN KEY (task_id) REFERENCES tasks (id)
        )
        ''')
        
        # Create settings table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
        ''')
        
        # Insert default categories if they don't exist
        default_categories = [
            ('General', '#3498db', 'inbox'),
            ('Work', '#e74c3c', 'briefcase'),
            ('Personal', '#2ecc71', 'user'),
            ('Health', '#f39c12', 'heart'),
            ('Shopping', '#9b59b6', 'shopping-cart'),
            ('Education', '#1abc9c', 'book')
        ]
        
        for cat in default_categories:
            cursor.execute('''
            INSERT OR IGNORE INTO categories (name, color, icon) 
            VALUES (?, ?, ?)
            ''', cat)
        
        # Insert default tags if they don't exist
        default_tags = [
            ('urgent', '#e74c3c'),
            ('important', '#f39c12'),
            ('waiting', '#3498db'),
            ('quick', '#2ecc71'),
            ('focus', '#9b59b6')
        ]
        
        for tag in default_tags:
            cursor.execute('''
            INSERT OR IGNORE INTO tags (name, color) 
            VALUES (?, ?)
            ''', tag)
        
        # Insert default settings
        default_settings = [
            ('theme', 'light'),
            ('pomodoro_work', '25'),
            ('pomodoro_break', '5'),
            ('pomodoro_long_break', '15'),
            ('pomodoro_cycles', '4'),
            ('reminder_time', '15')  # minutes before due
        ]
        
        for setting in default_settings:
            cursor.execute('''
            INSERT OR IGNORE INTO settings (key, value) 
            VALUES (?, ?)
            ''', setting)
        
        conn.commit()

# ==== Data Models ====

class TaskModel:
    """Model for task data handling."""
    
    @staticmethod
    def get_all_tasks(include_completed=True):
        """Get all tasks from the database."""
        with get_connection() as conn:
            cursor = conn.cursor()
            query = '''
            SELECT t.id, t.uuid, t.title, t.description, t.priority, t.due_date, 
                   t.due_time, t.completed, c.name, c.color, p.name, t.created_at, 
                   t.modified_at, t.parent_id, t.recurring, t.recurring_interval,
                   t.energy_level, t.status, t.category_id, t.project_id, 
                   t.completion_date, t.estimated_time, t.actual_time,
                   t.notes, t.position
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN projects p ON t.project_id = p.id
            '''
            
            if not include_completed:
                query += " WHERE t.completed = 0"
                
            query += '''
            ORDER BY t.completed, 
                    CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END, 
                    t.due_date,
                    t.due_time,
                    t.priority DESC,
                    t.position
            '''
            
            cursor.execute(query)
            return cursor.fetchall()
    
    @staticmethod
    def get_task_by_id(task_id):
        """Get a specific task by its ID."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            SELECT t.id, t.uuid, t.title, t.description, t.priority, t.due_date, 
                   t.due_time, t.reminder, t.completed, c.name, c.color, p.name, 
                   t.created_at, t.modified_at, t.parent_id, t.recurring, 
                   t.recurring_interval, t.energy_level, t.status, t.category_id, 
                   t.project_id, t.completion_date, t.estimated_time, t.actual_time,
                   t.notes, t.position, t.start_date
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN projects p ON t.project_id = p.id
            WHERE t.id = ?
            ''', (task_id,))
            return cursor.fetchone()
    
    @staticmethod
    def get_subtasks(parent_id):
        """Get all subtasks for a specific parent task."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            SELECT t.id, t.uuid, t.title, t.description, t.priority, t.due_date, 
                   t.due_time, t.completed, c.name, c.color, p.name, t.created_at, 
                   t.modified_at, t.parent_id, t.recurring, t.recurring_interval,
                   t.energy_level, t.status, t.category_id, t.project_id,
                   t.completion_date, t.estimated_time, t.actual_time,
                   t.notes, t.position
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN projects p ON t.project_id = p.id
            WHERE t.parent_id = ?
            ORDER BY t.completed, t.position, t.priority DESC
            ''', (parent_id,))
            return cursor.fetchall()
    
    @staticmethod
    def add_task(title, description, priority, due_date=None, due_time=None, 
                reminder=None, category_id=None, project_id=None, parent_id=None,
                recurring=0, recurring_interval=None, energy_level=2, 
                start_date=None, estimated_time=None, status="todo", notes=None,
                position=0):
        """Add a new task to the database."""
        now = datetime.datetime.now().isoformat()
        task_uuid = str(uuid.uuid4())
        
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            INSERT INTO tasks (
                uuid, title, description, priority, due_date, due_time, reminder,
                category_id, project_id, parent_id, created_at, modified_at,
                recurring, recurring_interval, energy_level, start_date, 
                estimated_time, status, notes, position
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                task_uuid, title, description, priority, due_date, due_time, reminder,
                category_id, project_id, parent_id, now, now, recurring, 
                recurring_interval, energy_level, start_date, estimated_time, 
                status, notes, position
            ))
            
            task_id = cursor.lastrowid
            
            # Log the activity
            cursor.execute('''
            INSERT INTO activity_log (task_id, action, details, timestamp)
            VALUES (?, 'create', ?, ?)
            ''', (task_id, f"Created task: {title}", now))
            
            conn.commit()
            return task_id
    
    @staticmethod
    def update_task(task_id, title, description, priority, due_date=None, due_time=None,
                   reminder=None, completed=0, category_id=None, project_id=None,
                   recurring=0, recurring_interval=None, energy_level=2, 
                   status="todo", start_date=None, estimated_time=None, 
                   actual_time=None, notes=None, position=None):
        """Update an existing task."""
        now = datetime.datetime.now().isoformat()
        
        # Get the old task data for activity logging
        old_task = TaskModel.get_task_by_id(task_id)
        
        with get_connection() as conn:
            cursor = conn.cursor()
            
            # Set completion date if task is being marked as complete
            completion_date = None
            if completed and not old_task[8]:  # If newly completed
                completion_date = now
                # Log completion activity
                cursor.execute('''
                INSERT INTO activity_log (task_id, action, details, timestamp)
                VALUES (?, 'complete', 'Task marked as complete', ?)
                ''', (task_id, now))
                
                # Handle recurring task creation
                if old_task[15]:  # If task is recurring
                    TaskModel._create_next_recurring_task(old_task, conn)
            
            # Update the task
            query = '''
            UPDATE tasks
            SET title = ?, description = ?, priority = ?, due_date = ?, 
                due_time = ?, reminder = ?, completed = ?, category_id = ?,
                project_id = ?, modified_at = ?, recurring = ?, 
                recurring_interval = ?, energy_level = ?, status = ?,
                start_date = ?, estimated_time = ?
            '''
            params = [
                title, description, priority, due_date, due_time, reminder,
                completed, category_id, project_id, now, recurring,
                recurring_interval, energy_level, status, start_date, estimated_time
            ]
            
            # Only update completion_date if it's being set
            if completion_date:
                query += ", completion_date = ?"
                params.append(completion_date)
            
            # Only update actual_time if it's provided
            if actual_time is not None:
                query += ", actual_time = ?"
                params.append(actual_time)
                
            # Only update notes if it's provided
            if notes is not None:
                query += ", notes = ?"
                params.append(notes)
                
            # Only update position if it's provided
            if position is not None:
                query += ", position = ?"
                params.append(position)
                
            query += " WHERE id = ?"
            params.append(task_id)
            
            cursor.execute(query, params)
            
            # Log the update activity
            cursor.execute('''
            INSERT INTO activity_log (task_id, action, details, timestamp)
            VALUES (?, 'update', ?, ?)
            ''', (task_id, f"Updated task: {title}", now))
            
            conn.commit()
    
    @staticmethod
    def _create_next_recurring_task(old_task, conn=None):
        """Create the next occurrence of a recurring task."""
        should_close_conn = False
        if conn is None:
            conn = get_connection()
            should_close_conn = True
            
        try:
            cursor = conn.cursor()
            
            task_id, task_uuid, title, description, priority, due_date, due_time = old_task[:7]
            recurring_interval = old_task[15]
            
            if not due_date:
                # Can't create recurring task without due date
                return
                
            # Calculate next due date based on interval
            try:
                current_due = datetime.date.fromisoformat(due_date)
                next_due = None
                
                if recurring_interval == RepeatInterval.DAILY.name:
                    next_due = current_due + datetime.timedelta(days=1)
                elif recurring_interval == RepeatInterval.WEEKDAYS.name:
                    next_due = current_due + datetime.timedelta(days=1)
                    # Skip weekends
                    if next_due.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
                        next_due += datetime.timedelta(days=7 - next_due.weekday())
                elif recurring_interval == RepeatInterval.WEEKLY.name:
                    next_due = current_due + datetime.timedelta(weeks=1)
                elif recurring_interval == RepeatInterval.BIWEEKLY.name:
                    next_due = current_due + datetime.timedelta(weeks=2)
                elif recurring_interval == RepeatInterval.MONTHLY.name:
                    # Try to keep same day of month
                    month = current_due.month + 1
                    year = current_due.year
                    if month > 12:
                        month = 1
                        year += 1
                    # Handle month length differences
                    day = min(current_due.day, calendar.monthrange(year, month)[1])
                    next_due = datetime.date(year, month, day)
                elif recurring_interval == RepeatInterval.QUARTERLY.name:
                    # 3 months later
                    month = current_due.month + 3
                    year = current_due.year
                    if month > 12:
                        month -= 12
                        year += 1
                    day = min(current_due.day, calendar.monthrange(year, month)[1])
                    next_due = datetime.date(year, month, day)
                elif recurring_interval == RepeatInterval.YEARLY.name:
                    next_due = datetime.date(current_due.year + 1, current_due.month, 
                                           min(current_due.day, 
                                               calendar.monthrange(current_due.year + 1, 
                                                                  current_due.month)[1]))
                
                if next_due:
                    # Create the new recurring task instance
                    now = datetime.datetime.now().isoformat()
                    new_uuid = str(uuid.uuid4())
                    
                    cursor.execute('''
                    INSERT INTO tasks (
                        uuid, title, description, priority, due_date, due_time, 
                        category_id, project_id, parent_id, created_at, modified_at,
                        recurring, recurring_interval, energy_level, status, 
                        estimated_time, notes, position
                    )
                    SELECT 
                        ?, title, description, priority, ?, due_time, 
                        category_id, project_id, parent_id, ?, ?,
                        recurring, recurring_interval, energy_level, 'todo', 
                        estimated_time, notes, position
                    FROM tasks WHERE id = ?
                    ''', (
                        new_uuid, next_due.isoformat(), now, now, task_id
                    ))
                    
                    new_task_id = cursor.lastrowid
                    
                    # Log the creation of recurring task
                    cursor.execute('''
                    INSERT INTO activity_log (task_id, action, details, timestamp)
                    VALUES (?, 'create_recurring', ?, ?)
                    ''', (new_task_id, 
                         f"Created recurring task from task #{task_id}: {title}", 
                         now))
                    
                    # Increment the recurring_count for the original task
                    cursor.execute('''
                    UPDATE tasks
                    SET recurring_count = recurring_count + 1
                    WHERE id = ?
                    ''', (task_id,))
                    
                    if not should_close_conn:
                        conn.commit()
            except Exception as e:
                print(f"Error creating recurring task: {e}")
        finally:
            if should_close_conn and conn:
                conn.commit()
                conn.close()
    
    @staticmethod
    def delete_task(task_id):
        """Delete a task from the database."""
        with get_connection() as conn:
            cursor = conn.cursor()
            
            # First get the task details for logging
            cursor.execute('SELECT title FROM tasks WHERE id = ?', (task_id,))
            task = cursor.fetchone()
            
            if task:
                # Delete the task
                cursor.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
                
                # Delete all subtasks
                cursor.execute('DELETE FROM tasks WHERE parent_id = ?', (task_id,))
                
                # Delete task-tag relationships
                cursor.execute('DELETE FROM task_tags WHERE task_id = ?', (task_id,))
                
                # Delete attachments
                cursor.execute('DELETE FROM attachments WHERE task_id = ?', (task_id,))
                
                # Log the deletion
                now = datetime.datetime.now().isoformat()
                cursor.execute('''
                INSERT INTO activity_log (task_id, action, details, timestamp)
                VALUES (?, 'delete', ?, ?)
                ''', (task_id, f"Deleted task: {task[0]}", now))
                
                conn.commit()
    
    @staticmethod
    def toggle_task_completion(task_id, completed):
        """Toggle the completion status of a task."""
        task = TaskModel.get_task_by_id(task_id)
        if task:
            # Update with same values but toggle completed
            TaskModel.update_task(
                task_id, task[2], task[3], task[4], task[5], 
                task[6], task[7], 1 if completed else 0, task[19], 
                task[20], task[15], task[16], task[17], task[18]
            )
    
    @staticmethod
    def get_task_tags(task_id):
        """Get all tags for a task."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            SELECT t.id, t.name, t.color
            FROM tags t
            JOIN task_tags tt ON t.id = tt.tag_id
            WHERE tt.task_id = ?
            ORDER BY t.name
            ''', (task_id,))
            return cursor.fetchall()
    
    @staticmethod
    def add_tag_to_task(task_id, tag_id):
        """Add a tag to a task."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            INSERT OR IGNORE INTO task_tags (task_id, tag_id)
            VALUES (?, ?)
            ''', (task_id, tag_id))
            conn.commit()
    
    @staticmethod
    def remove_tag_from_task(task_id, tag_id):
        """Remove a tag from a task."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            DELETE FROM task_tags
            WHERE task_id = ? AND tag_id = ?
            ''', (task_id, tag_id))
            conn.commit()
    
    @staticmethod
    def get_task_attachments(task_id):
        """Get all attachments for a task."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            SELECT id, name, path, type, created_at
            FROM attachments
            WHERE task_id = ?
            ORDER BY created_at DESC
            ''', (task_id,))
            return cursor.fetchall()
    
    @staticmethod
    def add_attachment(task_id, name, path, type):
        """Add an attachment to a task."""
        now = datetime.datetime.now().isoformat()
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            INSERT INTO attachments (task_id, name, path, type, created_at)
            VALUES (?, ?, ?, ?, ?)
            ''', (task_id, name, path, type, now))
            conn.commit()
            return cursor.lastrowid
    
    @staticmethod
    def delete_attachment(attachment_id):
        """Delete an attachment."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM attachments WHERE id = ?', (attachment_id,))
            conn.commit()
    
    @staticmethod
    def add_pomodoro_session(task_id, duration):
        """Add a Pomodoro session for a task."""
        now = datetime.datetime.now()
        start_time = (now - datetime.timedelta(minutes=duration)).isoformat()
        end_time = now.isoformat()
        
        with get_connection() as conn:
            cursor = conn.cursor()
            
            # Add pomodoro session
            cursor.execute('''
            INSERT INTO pomodoro_sessions (task_id, start_time, end_time, duration)
            VALUES (?, ?, ?, ?)
            ''', (task_id, start_time, end_time, duration))
            
            # Update actual time spent on task
            cursor.execute('''
            UPDATE tasks 
            SET actual_time = COALESCE(actual_time, 0) + ?
            WHERE id = ?
            ''', (duration, task_id))
            
            conn.commit()
    
    @staticmethod
    def get_tasks_by_status(status="todo"):
        """Get tasks filtered by status."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            SELECT t.id, t.uuid, t.title, t.description, t.priority, t.due_date, 
                   t.due_time, t.completed, c.name, c.color, p.name, t.created_at, 
                   t.modified_at, t.parent_id, t.recurring, t.recurring_interval,
                   t.energy_level, t.status, t.category_id, t.project_id,
                   t.completion_date, t.estimated_time, t.actual_time,
                   t.notes, t.position
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN projects p ON t.project_id = p.id
            WHERE t.status = ? AND t.parent_id IS NULL
            ORDER BY t.position, t.priority DESC
            ''', (status,))
            return cursor.fetchall()
            
    @staticmethod
    def change_task_status(task_id, new_status):
        """Change the status of a task."""
        with get_connection() as conn:
            cursor = conn.cursor()
            
            # Get maximum position in the new status
            cursor.execute('''
            SELECT COALESCE(MAX(position), 0) FROM tasks WHERE status = ?
            ''', (new_status,))
            max_position = cursor.fetchone()[0]
            
            # Update the task status and position
            now = datetime.datetime.now().isoformat()
            cursor.execute('''
            UPDATE tasks
            SET status = ?, position = ?, modified_at = ?
            WHERE id = ?
            ''', (new_status, max_position + 1, now, task_id))
            
            # Log the status change
            cursor.execute('''
            INSERT INTO activity_log (task_id, action, details, timestamp)
            VALUES (?, 'status_change', ?, ?)
            ''', (task_id, f"Changed status to {new_status}", now))
            
            conn.commit()
    
    @staticmethod
    def update_positions(status, position_map):
        """Update positions of tasks in a given status column."""
        with get_connection() as conn:
            cursor = conn.cursor()
            for task_id, position in position_map.items():
                cursor.execute('''
                UPDATE tasks
                SET position = ?
                WHERE id = ? AND status = ?
                ''', (position, task_id, status))
            conn.commit()
    
    @staticmethod
    def get_stats_by_category():
        """Get task statistics grouped by category."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            SELECT 
                c.name,
                c.color,
                COUNT(t.id) as total,
                SUM(CASE WHEN t.completed = 1 THEN 1 ELSE 0 END) as completed
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            GROUP BY t.category_id
            ORDER BY total DESC
            ''')
            return cursor.fetchall()
    
    @staticmethod
    def get_stats_by_priority():
        """Get task statistics grouped by priority."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            SELECT 
                t.priority,
                COUNT(t.id) as total,
                SUM(CASE WHEN t.completed = 1 THEN 1 ELSE 0 END) as completed
            FROM tasks t
            GROUP BY t.priority
            ORDER BY t.priority
            ''')
            return cursor.fetchall()
    
    @staticmethod
    def get_stats_by_status():
        """Get task statistics grouped by status."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            SELECT 
                t.status,
                COUNT(t.id) as total
            FROM tasks t
            GROUP BY t.status
            ORDER BY total DESC
            ''')
            return cursor.fetchall()
    
    @staticmethod
    def get_stats_by_time():
        """Get task completion statistics over time."""
        with get_connection() as conn:
            cursor = conn.cursor()
            
            # Last 30 days 
            thirty_days_ago = (datetime.datetime.now() - datetime.timedelta(days=30)).date().isoformat()
            
            cursor.execute('''
            SELECT 
                completion_date,
                COUNT(id) as completed
            FROM tasks
            WHERE completed = 1 
              AND completion_date IS NOT NULL
              AND completion_date >= ?
            GROUP BY completion_date
            ORDER BY completion_date
            ''', (thirty_days_ago,))
            
            return cursor.fetchall()


class CategoryModel:
    """Model for category data handling."""
    
    @staticmethod
    def get_all_categories():
        """Get all categories from the database."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, name, color, icon FROM categories ORDER BY name')
            return cursor.fetchall()
    
    @staticmethod
    def add_category(name, color, icon="tag"):
        """Add a new category to the database."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)', 
                          (name, color, icon))
            conn.commit()
            return cursor.lastrowid
    
    @staticmethod
    def update_category(category_id, name, color, icon):
        """Update an existing category."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ?', 
                          (name, color, icon, category_id))
            conn.commit()
    
    @staticmethod
    def delete_category(category_id):
        """Delete a category from the database."""
        with get_connection() as conn:
            cursor = conn.cursor()
            # Update tasks to use the default category
            cursor.execute('UPDATE tasks SET category_id = 1 WHERE category_id = ?', (category_id,))
            # Delete the category if it's not the default (id=1)
            cursor.execute('DELETE FROM categories WHERE id = ? AND id != 1', (category_id,))
            conn.commit()


class TagModel:
    """Model for tag data handling."""
    
    @staticmethod
    def get_all_tags():
        """Get all tags from the database."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, name, color FROM tags ORDER BY name')
            return cursor.fetchall()
    
    @staticmethod
    def add_tag(name, color):
        """Add a new tag to the database."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('INSERT INTO tags (name, color) VALUES (?, ?)', (name, color))
            conn.commit()
            return cursor.lastrowid
    
    @staticmethod
    def update_tag(tag_id, name, color):
        """Update an existing tag."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE tags SET name = ?, color = ? WHERE id = ?', 
                          (name, color, tag_id))
            conn.commit()
    
    @staticmethod
    def delete_tag(tag_id):
        """Delete a tag from the database."""
        with get_connection() as conn:
            cursor = conn.cursor()
            # Delete tag-task relationships
            cursor.execute('DELETE FROM task_tags WHERE tag_id = ?', (tag_id,))
            # Delete the tag
            cursor.execute('DELETE FROM tags WHERE id = ?', (tag_id,))
            conn.commit()


class ProjectModel:
    """Model for project data handling."""
    
    @staticmethod
    def get_all_projects():
        """Get all projects from the database."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            SELECT id, name, description, color, due_date, completed
            FROM projects ORDER BY name
            ''')
            return cursor.fetchall()
    
    @staticmethod
    def add_project(name, description, color, due_date=None):
        """Add a new project to the database."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            INSERT INTO projects (name, description, color, due_date)
            VALUES (?, ?, ?, ?)
            ''', (name, description, color, due_date))
            conn.commit()
            return cursor.lastrowid
    
    @staticmethod
    def update_project(project_id, name, description, color, due_date=None, completed=0):
        """Update an existing project."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            UPDATE projects
            SET name = ?, description = ?, color = ?, due_date = ?, completed = ?
            WHERE id = ?
            ''', (name, description, color, due_date, completed, project_id))
            conn.commit()
    
    @staticmethod
    def delete_project(project_id):
        """Delete a project from the database."""
        with get_connection() as conn:
            cursor = conn.cursor()
            # Update tasks to remove project
            cursor.execute('UPDATE tasks SET project_id = NULL WHERE project_id = ?', (project_id,))
            # Delete the project
            cursor.execute('DELETE FROM projects WHERE id = ?', (project_id,))
            conn.commit()
    
    @staticmethod
    def get_project_tasks(project_id, include_completed=True):
        """Get all tasks for a specific project."""
        with get_connection() as conn:
            cursor = conn.cursor()
            query = '''
            SELECT t.id, t.uuid, t.title, t.description, t.priority, t.due_date, 
                   t.due_time, t.completed, c.name, c.color, p.name, t.created_at, 
                   t.modified_at, t.parent_id, t.recurring, t.recurring_interval,
                   t.energy_level, t.status, t.category_id, t.project_id,
                   t.completion_date, t.estimated_time, t.actual_time,
                   t.notes, t.position
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN projects p ON t.project_id = p.id
            WHERE t.project_id = ?
            '''
            
            if not include_completed:
                query += " AND t.completed = 0"
                
            query += " ORDER BY t.parent_id NULLS FIRST, t.position, t.priority DESC"
            
            cursor.execute(query, (project_id,))
            return cursor.fetchall()


class SettingsModel:
    """Model for application settings."""
    
    @staticmethod
    def get_setting(key, default=None):
        """Get a setting value by key."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT value FROM settings WHERE key = ?', (key,))
            result = cursor.fetchone()
            return result[0] if result else default
    
    @staticmethod
    def set_setting(key, value):
        """Set a setting value."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            INSERT OR REPLACE INTO settings (key, value)
            VALUES (?, ?)
            ''', (key, value))
            conn.commit()
    
    @staticmethod
    def get_all_settings():
        """Get all settings as a dictionary."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT key, value FROM settings')
            return {row[0]: row[1] for row in cursor.fetchall()}


# ==== UI Components ====

class ThemeManager:
    """Manage application themes."""
    
    LIGHT_THEME = {
        'bg_primary': '#ffffff',
        'bg_secondary': '#f5f5f5',
        'bg_tertiary': '#e0e0e0',
        'text_primary': '#212121',
        'text_secondary': '#757575',
        'accent': '#3498db',
        'accent_light': '#4fa5e0',
        'success': '#2ecc71',
        'warning': '#f39c12',
        'error': '#e74c3c',
        'info': '#3498db',
        'border': '#d1d1d1',
        'hover': '#eaeaea',
        'shadow': 'rgba(0, 0, 0, 0.1)'
    }
    
    DARK_THEME = {
        'bg_primary': '#1e1e1e',
        'bg_secondary': '#2d2d2d',
        'bg_tertiary': '#333333',
        'text_primary': '#f0f0f0',
        'text_secondary': '#b0b0b0',
        'accent': '#3498db',
        'accent_light': '#4fa5e0',
        'success': '#2ecc71',
        'warning': '#f39c12',
        'error': '#e74c3c',
        'info': '#3498db',
        'border': '#444444',
        'hover': '#3a3a3a',
        'shadow': 'rgba(0, 0, 0, 0.3)'
    }
    
    @staticmethod
    def get_theme():
        """Get the current theme colors."""
        theme_name = SettingsModel.get_setting('theme', 'light')
        return ThemeManager.DARK_THEME if theme_name == 'dark' else ThemeManager.LIGHT_THEME
    
    @staticmethod
    def apply_theme(app):
        """Apply the current theme to the application."""
        theme = ThemeManager.get_theme()
        theme_name = SettingsModel.get_setting('theme', 'light')
        
        # Set app style
        app.setStyle(QStyleFactory.create("Fusion"))
        
        # Create and set palette
        palette = QPalette()
        
        # Set palette colors
        palette.setColor(QPalette.Window, QColor(theme['bg_primary']))
        palette.setColor(QPalette.WindowText, QColor(theme['text_primary']))
        palette.setColor(QPalette.Base, QColor(theme['bg_secondary']))
        palette.setColor(QPalette.AlternateBase, QColor(theme['bg_tertiary']))
        palette.setColor(QPalette.ToolTipBase, QColor(theme['bg_primary']))
        palette.setColor(QPalette.ToolTipText, QColor(theme['text_primary']))
        palette.setColor(QPalette.Text, QColor(theme['text_primary']))
        palette.setColor(QPalette.Button, QColor(theme['bg_secondary']))
        palette.setColor(QPalette.ButtonText, QColor(theme['text_primary']))
        palette.setColor(QPalette.Link, QColor(theme['accent']))
        palette.setColor(QPalette.Highlight, QColor(theme['accent']))
        palette.setColor(QPalette.HighlightedText, QColor('#ffffff'))
        
        # Apply palette
        app.setPalette(palette)
        
        # Create global stylesheet
        stylesheet = f"""
            QMainWindow, QDialog {{ 
                background-color: {theme['bg_primary']}; 
                color: {theme['text_primary']}; 
            }}
            
            QWidget {{ 
                color: {theme['text_primary']}; 
            }}
            
            QLabel {{ 
                color: {theme['text_primary']}; 
            }}
            
            QPushButton {{ 
                background-color: {theme['bg_secondary']}; 
                border: 1px solid {theme['border']}; 
                border-radius: 4px; 
                padding: 6px 12px; 
                color: {theme['text_primary']}; 
            }}
            
            QPushButton:hover {{ 
                background-color: {theme['hover']}; 
            }}
            
            QPushButton:pressed {{ 
                background-color: {theme['accent']}; 
                color: white; 
            }}
            
            QPushButton[flat="true"] {{ 
                border: none; 
                background-color: transparent; 
            }}
            
            QLineEdit, QTextEdit, QComboBox, QSpinBox, QDateEdit, QTimeEdit {{ 
                background-color: {theme['bg_secondary']}; 
                border: 1px solid {theme['border']}; 
                border-radius: 4px; 
                padding: 6px; 
                color: {theme['text_primary']}; 
            }}
            
            QComboBox::drop-down {{ 
                border: none; 
                width: 20px; 
            }}
            
            QTabWidget::pane {{ 
                border: 1px solid {theme['border']}; 
                border-radius: 4px; 
            }}
            
            QTabBar::tab {{ 
                background-color: {theme['bg_secondary']}; 
                border: 1px solid {theme['border']}; 
                border-bottom: none; 
                border-top-left-radius: 4px; 
                border-top-right-radius: 4px; 
                padding: 6px 12px; 
                margin-right: 2px; 
            }}
            
            QTabBar::tab:selected {{ 
                background-color: {theme['accent']}; 
                color: white; 
            }}
            
            QTabBar::tab:!selected:hover {{ 
                background-color: {theme['hover']}; 
            }}
            
            QListWidget, QTreeWidget, QTableWidget {{ 
                background-color: {theme['bg_secondary']}; 
                border: 1px solid {theme['border']}; 
                border-radius: 4px; 
                alternate-background-color: {theme['bg_tertiary']}; 
            }}
            
            QListWidget::item, QTreeWidget::item, QTableWidget::item {{ 
                padding: 4px; 
                border-bottom: 1px solid {theme['border']}; 
            }}
            
            QListWidget::item:selected, QTreeWidget::item:selected, QTableWidget::item:selected {{ 
                background-color: {theme['accent']}; 
                color: white; 
            }}
            
            QScrollBar:vertical {{ 
                background-color: {theme['bg_tertiary']}; 
                width: 12px; 
                margin: 0; 
            }}
            
            QScrollBar::handle:vertical {{ 
                background-color: {theme['border']}; 
                min-height: 20px; 
                border-radius: 6px; 
            }}
            
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{ 
                height: 0; 
            }}
            
            QScrollBar:horizontal {{ 
                background-color: {theme['bg_tertiary']}; 
                height: 12px; 
                margin: 0; 
            }}
            
            QScrollBar::handle:horizontal {{ 
                background-color: {theme['border']}; 
                min-width: 20px; 
                border-radius: 6px; 
            }}
            
            QScrollBar::add-line:horizontal, QScrollBar::sub-line:horizontal {{ 
                width: 0; 
            }}
            
            QMenu {{ 
                background-color: {theme['bg_secondary']}; 
                border: 1px solid {theme['border']}; 
            }}
            
            QMenu::item {{ 
                padding: 6px 24px 6px 12px; 
            }}
            
            QMenu::item:selected {{ 
                background-color: {theme['accent']}; 
                color: white; 
            }}
            
            QToolTip {{ 
                background-color: {theme['bg_secondary']}; 
                color: {theme['text_primary']}; 
                border: 1px solid {theme['border']}; 
                padding: 4px; 
            }}
            
            QCalendarWidget {{ 
                background-color: {theme['bg_secondary']}; 
            }}
            
            QCalendarWidget QWidget {{ 
                alternate-background-color: {theme['bg_tertiary']}; 
            }}
        """
        
        app.setStyleSheet(stylesheet)


class TaskItemWidget(QWidget):
    """Custom widget for displaying a task in the list."""
    
    statusChanged = Signal(int, bool)
    editRequested = Signal(int)
    deleteRequested = Signal(int)
    priorityChanged = Signal(int, int)
    
    def __init__(self, task_data, parent=None, show_subtasks=True):
        super().__init__(parent)
        self.task_id = task_data[0]
        self.task_uuid = task_data[1]
        self.task_title = task_data[2]
        self.task_desc = task_data[3]
        self.task_priority = task_data[4]
        self.task_due_date = task_data[5]
        self.task_due_time = task_data[6]
        self.task_completed = bool(task_data[7])
        self.category_name = task_data[8] or "General"
        self.category_color = task_data[9] or "#3498db"
        self.project_name = task_data[10]
        self.parent_id = task_data[13]
        self.recurring = bool(task_data[14])
        self.recurring_interval = task_data[15]
        self.energy_level = task_data[16] or 2  # Default to medium
        self.status = task_data[17] or "todo"
        self.category_id = task_data[18]
        self.project_id = task_data[19]
        self.completion_date = task_data[20]
        self.estimated_time = task_data[21]
        self.actual_time = task_data[22]
        self.notes = task_data[23]
        self.position = task_data[24]
        
        self.show_subtasks = show_subtasks
        self.subtasks = []
        self.tags = []
        
        # Get task tags
        self.tags = TaskModel.get_task_tags(self.task_id)
        
        # Setup UI
        self.initUI()
        
        # Load subtasks if needed
        if show_subtasks:
            self.loadSubtasks()
    
    def initUI(self):
        theme = ThemeManager.get_theme()
        
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(8, 8, 8, 8)
        main_layout.setSpacing(4)
        
        # Main task container
        task_container = QWidget()
        task_container.setObjectName("taskContainer")
        task_layout = QHBoxLayout(task_container)
        task_layout.setContentsMargins(8, 8, 8, 8)
        task_layout.setSpacing(8)
        
        # Task completion checkbox
        self.checkbox = QCheckBox()
        self.checkbox.setChecked(self.task_completed)
        self.checkbox.toggled.connect(self.onStatusChanged)
        self.checkbox.setCursor(Qt.PointingHandCursor)
        self.checkbox.setStyleSheet(f"""
            QCheckBox::indicator {{
                width: 20px;
                height: 20px;
                border-radius: 10px;
                border: 2px solid {theme['border']};
            }}
            QCheckBox::indicator:unchecked {{
                background-color: {theme['bg_secondary']};
            }}
            QCheckBox::indicator:checked {{
                background-color: {theme['success']};
                border: 2px solid {theme['success']};
                image: url(':/icons/check.png');
            }}
        """)
        task_layout.addWidget(self.checkbox)
        
        # Priority indicator
        priority_colors = ["#95a5a6", "#3498db", "#f39c12", "#e74c3c", "#8e44ad"]  # None, Low, Medium, High, Critical
        priority_frame = QFrame()
        priority_frame.setFixedWidth(4)
        priority_frame.setStyleSheet(f"""
            background-color: {priority_colors[self.task_priority]};
            border-radius: 2px;
        """)
        task_layout.addWidget(priority_frame)
        
        # Task details container
        details_widget = QWidget()
        details_layout = QVBoxLayout(details_widget)
        details_layout.setContentsMargins(0, 0, 0, 0)
        details_layout.setSpacing(4)
        
        # Title and recurring indicator
        title_layout = QHBoxLayout()
        title_layout.setContentsMargins(0, 0, 0, 0)
        title_layout.setSpacing(4)
        
        self.title_label = QLabel(self.task_title)
        font = QFont()
        font.setBold(True)
        font.setPointSize(10)
        self.title_label.setFont(font)
        if self.task_completed:
            self.title_label.setStyleSheet(f"text-decoration: line-through; color: {theme['text_secondary']};")
        title_layout.addWidget(self.title_label, 1)
        
        # Recurring indicator if applicable
        if self.recurring:
            recurring_label = QLabel("↻")
            recurring_label.setToolTip(f"Recurring task: {self.recurring_interval.lower().replace('_', ' ')}")
            recurring_label.setStyleSheet(f"color: {theme['info']}; font-weight: bold;")
            title_layout.addWidget(recurring_label)
        
        details_layout.addLayout(title_layout)
        
        # Category, project, and tags
        meta_layout = QHBoxLayout()
        meta_layout.setContentsMargins(0, 0, 0, 0)
        meta_layout.setSpacing(6)
        
        # Category badge
        category_label = QLabel(self.category_name)
        category_label.setStyleSheet(f"""
            background-color: {self.category_color};
            color: white;
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 9px;
        """)
        meta_layout.addWidget(category_label)
        
        # Project badge (if any)
        if self.project_name:
            project_label = QLabel(self.project_name)
            project_label.setStyleSheet(f"""
                background-color: {theme['info']};
                color: white;
                border-radius: 4px;
                padding: 2px 6px;
                font-size: 9px;
            """)
            meta_layout.addWidget(project_label)
        
        # Tags
        for tag in self.tags[:3]:  # Limit to 3 tags to save space
            tag_name = tag[1]
            tag_color = tag[2]
            tag_label = QLabel(tag_name)
            tag_label.setStyleSheet(f"""
                background-color: {tag_color};
                color: white;
                border-radius: 4px;
                padding: 2px 6px;
                font-size: 9px;
            """)
            meta_layout.addWidget(tag_label)
        
        # If more than 3 tags, show count
        if len(self.tags) > 3:
            more_tags = QLabel(f"+{len(self.tags) - 3}")
            more_tags.setStyleSheet(f"""
                background-color: {theme['text_secondary']};
                color: white;
                border-radius: 4px;
                padding: 2px 6px;
                font-size: 9px;
            """)
            meta_layout.addWidget(more_tags)
        
        # Energy level indicator
        energy_levels = ["", "Low", "Medium", "High"]
        energy_colors = ["", "#3498db", "#f39c12", "#e74c3c"]
        if self.energy_level > 0:
            energy_label = QLabel(energy_levels[self.energy_level])
            energy_label.setStyleSheet(f"""
                background-color: {energy_colors[self.energy_level]};
                color: white;
                border-radius: 4px;
                padding: 2px 6px;
                font-size: 9px;
                margin-left: 4px;
            """)
            meta_layout.addWidget(energy_label)
        
        meta_layout.addStretch()
        details_layout.addLayout(meta_layout)
        
        # Add the description if it exists
        if self.task_desc and self.task_desc.strip():
            desc_label = QLabel(self.task_desc.strip())
            desc_label.setWordWrap(True)
            desc_label.setStyleSheet(f"color: {theme['text_secondary']}; font-size: 9px;")
            metrics = QFontMetrics(desc_label.font())
            elidedText = metrics.elidedText(self.task_desc.strip(), Qt.ElideRight, 300)
            desc_label.setText(elidedText)
            details_layout.addWidget(desc_label)
        
        # Time information (estimated, actual)
        if self.estimated_time or self.actual_time:
            time_layout = QHBoxLayout()
            time_layout.setContentsMargins(0, 0, 0, 0)
            
            if self.estimated_time:
                est_label = QLabel(f"Est: {self.estimated_time}m")
                est_label.setStyleSheet(f"color: {theme['text_secondary']}; font-size: 9px;")
                time_layout.addWidget(est_label)
            
            if self.actual_time:
                act_label = QLabel(f"Spent: {self.actual_time}m")
                act_label.setStyleSheet(f"color: {theme['text_secondary']}; font-size: 9px;")
                time_layout.addWidget(act_label)
                
                # Add progress bar if both times are available
                if self.estimated_time and self.actual_time:
                    progress = min(100, int((self.actual_time / self.estimated_time) * 100))
                    progress_label = QLabel(f"{progress}%")
                    progress_label.setStyleSheet(f"color: {theme['text_secondary']}; font-size: 9px;")
                    time_layout.addWidget(progress_label)
            
            time_layout.addStretch()
            details_layout.addLayout(time_layout)
            
        task_layout.addWidget(details_widget, 1)
        
        # Due date & time
        if self.task_due_date:
            due_widget = QWidget()
            due_layout = QVBoxLayout(due_widget)
            due_layout.setContentsMargins(0, 0, 0, 0)
            due_layout.setSpacing(2)
            due_layout.setAlignment(Qt.AlignRight | Qt.AlignVCenter)
            
            try:
                due_date = QDate.fromString(self.task_due_date, Qt.ISODate)
                today = QDate.currentDate()
                days_left = today.daysTo(due_date)
                
                if days_left < 0:
                    date_color = theme['error']  # Red for overdue
                    date_text = f"Overdue: {abs(days_left)}d"
                elif days_left == 0:
                    date_color = theme['warning']  # Orange for today
                    date_text = "Today"
                elif days_left <= 3:
                    date_color = theme['warning']  # Orange for soon
                    date_text = f"In {days_left}d"
                else:
                    date_color = theme['success']  # Green for future
                    date_text = due_date.toString("MMM d")
                
                due_date_label = QLabel(date_text)
                due_date_label.setStyleSheet(f"""
                    color: {date_color};
                    font-size: 9px;
                    font-weight: bold;
                """)
                due_layout.addWidget(due_date_label)
                
                # Add time if present
                if self.task_due_time:
                    time_obj = QTime.fromString(self.task_due_time, "hh:mm")
                    time_text = time_obj.toString("h:mm AP")
                    due_time_label = QLabel(time_text)
                    due_time_label.setStyleSheet(f"""
                        color: {theme['text_secondary']};
                        font-size: 9px;
                    """)
                    due_layout.addWidget(due_time_label)
                
            except Exception:
                pass
            
            task_layout.addWidget(due_widget)
        
        # Action buttons
        action_widget = QWidget()
        action_layout = QVBoxLayout(action_widget)
        action_layout.setContentsMargins(0, 0, 0, 0)
        action_layout.setSpacing(4)
        
        # Button styles
        button_style = f"""
            QPushButton {{
                background-color: transparent;
                border: none;
                border-radius: 4px;
                padding: 4px;
                color: {theme['text_secondary']};
                font-size: 16px;
            }}
            QPushButton:hover {{
                background-color: {theme['hover']};
                color: {theme['text_primary']};
            }}
        """
        
        # Edit button
        edit_btn = QPushButton("✎")
        edit_btn.setToolTip("Edit Task")
        edit_btn.setStyleSheet(button_style)
        edit_btn.setCursor(Qt.PointingHandCursor)
        edit_btn.clicked.connect(self.onEditClicked)
        action_layout.addWidget(edit_btn)
        
        # Delete button
        delete_btn = QPushButton("🗑")
        delete_btn.setToolTip("Delete Task")
        delete_btn.setStyleSheet(button_style)
        delete_btn.setCursor(Qt.PointingHandCursor)
        delete_btn.clicked.connect(self.onDeleteClicked)
        action_layout.addWidget(delete_btn)
        
        task_layout.addWidget(action_widget)
        
        main_layout.addWidget(task_container)
        
        # Subtasks container (will be populated later if needed)
        if self.show_subtasks:
            self.subtasks_container = QWidget()
            self.subtasks_layout = QVBoxLayout(self.subtasks_container)
            self.subtasks_layout.setContentsMargins(30, 0, 0, 0)
            self.subtasks_layout.setSpacing(2)
            main_layout.addWidget(self.subtasks_container)
            self.subtasks_container.setVisible(False)  # Hide until populated
        
        # Apply shadow effect for depth
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(10)
        shadow.setColor(QColor(theme['shadow']))
        shadow.setOffset(0, 2)
        task_container.setGraphicsEffect(shadow)
        
        # Set fixed height for consistent look
        task_container.setMinimumHeight(80)
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
        
        # Set background style based on completion status
        if self.task_completed:
            task_container.setStyleSheet(f"""
                #taskContainer {{
                    background-color: {theme['bg_secondary']};
                    border-radius: 8px;
                    opacity: 0.7;
                }}
            """)
        else:
            task_container.setStyleSheet(f"""
                #taskContainer {{
                    background-color: {theme['bg_secondary']};
                    border-radius: 8px;
                }}
            """)
    
    def loadSubtasks(self):
        """Load and display subtasks."""
        if not self.show_subtasks:
            return
            
        self.subtasks = TaskModel.get_subtasks(self.task_id)
        
        # Clear existing subtasks first
        while self.subtasks_layout.count():
            item = self.subtasks_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
        
        if not self.subtasks:
            self.subtasks_container.setVisible(False)
            return
            
        self.subtasks_container.setVisible(True)
        
        # Add subtasks to the container
        for subtask in self.subtasks:
            subtask_widget = TaskItemWidget(subtask, self, show_subtasks=False)
            
            # Connect signals
            subtask_widget.statusChanged.connect(self.onSubtaskStatusChanged)
            subtask_widget.editRequested.connect(self.editRequested.emit)
            subtask_widget.deleteRequested.connect(self.deleteRequested.emit)
            
            self.subtasks_layout.addWidget(subtask_widget)
    
    def onStatusChanged(self, checked):
        """Handle task completion status change."""
        self.statusChanged.emit(self.task_id, checked)
    
    def onSubtaskStatusChanged(self, subtask_id, checked):
        """Pass subtask status change to parent handler."""
        self.statusChanged.emit(subtask_id, checked)
    
    def onEditClicked(self):
        """Emit signal to edit this task."""
        self.editRequested.emit(self.task_id)
    
    def onDeleteClicked(self):
        """Emit signal to delete this task."""
        self.deleteRequested.emit(self.task_id)
    
    def updateSubtasks(self):
        """Refresh subtasks after changes."""
        self.loadSubtasks()


class BoardTaskCard(QWidget):
    """Card widget for Kanban board view."""
    
    statusChanged = Signal(int, str)
    editRequested = Signal(int)
    deleteRequested = Signal(int)
    
    def __init__(self, task_data, parent=None):
        super().__init__(parent)
        self.task_id = task_data[0]
        self.task_title = task_data[2]
        self.task_priority = task_data[4]
        self.task_due_date = task_data[5]
        self.task_completed = bool(task_data[7])
        self.category_name = task_data[8] or "General"
        self.category_color = task_data[9] or "#3498db"
        self.initUI()
        
        # Enable drag and drop
        self.setAcceptDrops(True)
    
    def initUI(self):
        theme = ThemeManager.get_theme()
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(8, 8, 8, 8)
        layout.setSpacing(8)
        
        # Title with priority indicator
        title_layout = QHBoxLayout()
        
        priority_colors = ["#95a5a6", "#3498db", "#f39c12", "#e74c3c", "#8e44ad"]
        priority_indicator = QFrame()
        priority_indicator.setFixedSize(12, 12)
        priority_indicator.setStyleSheet(f"""
            background-color: {priority_colors[self.task_priority]};
            border-radius: 6px;
        """)
        title_layout.addWidget(priority_indicator)
        
        title_label = QLabel(self.task_title)
        title_label.setWordWrap(True)
        font = QFont()
        font.setBold(True)
        title_label.setFont(font)
        title_layout.addWidget(title_label, 1)
        
        layout.addLayout(title_layout)
        
        # Category badge
        category_label = QLabel(self.category_name)
        category_label.setStyleSheet(f"""
            background-color: {self.category_color};
            color: white;
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 9px;
            max-width: 100px;
        """)
        category_label.setAlignment(Qt.AlignCenter)
        
        # Due date if available
        footer_layout = QHBoxLayout()
        footer_layout.addWidget(category_label)
        footer_layout.addStretch()
        
        if self.task_due_date:
            try:
                due_date = QDate.fromString(self.task_due_date, Qt.ISODate)
                today = QDate.currentDate()
                days_left = today.daysTo(due_date)
                
                if days_left < 0:
                    date_color = theme['error']
                    date_text = "Overdue"
                elif days_left == 0:
                    date_color = theme['warning']
                    date_text = "Today"
                else:
                    date_color = theme['success']
                    date_text = due_date.toString("MMM d")
                
                due_label = QLabel(date_text)
                due_label.setStyleSheet(f"""
                    color: {date_color};
                    font-size: 9px;
                    font-weight: bold;
                """)
                footer_layout.addWidget(due_label)
            except Exception:
                pass
        
        layout.addLayout(footer_layout)
        
        # Set the overall widget style
        self.setFixedHeight(80)
        self.setMinimumWidth(200)
        self.setMaximumWidth(250)
        self.setStyleSheet(f"""
            background-color: {theme['bg_secondary']};
            border-radius: 6px;
        """)
        
        # Add shadow effect
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(10)
        shadow.setColor(QColor(theme['shadow']))
        shadow.setOffset(0, 2)
        self.setGraphicsEffect(shadow)
    
    def mousePressEvent(self, event):
        """Handle mouse press for drag and drop."""
        if event.button() == Qt.LeftButton:
            self.drag_start_position = event.position().toPoint()
            self.setCursor(Qt.ClosedHandCursor)
        super().mousePressEvent(event)
    
    def mouseMoveEvent(self, event):
        """Handle mouse move for drag and drop."""
        if not (event.buttons() & Qt.LeftButton):
            return
            
        if (event.position().toPoint() - self.drag_start_position).manhattanLength() < QApplication.startDragDistance():
            return
            
        drag = QDrag(self)
        mime_data = QMimeData()
        
        # Store task ID in mime data
        mime_data.setText(str(self.task_id))
        drag.setMimeData(mime_data)
        
        # Create preview pixmap
        pixmap = QPixmap(self.size())
        self.render(pixmap)
        drag.setPixmap(pixmap)
        drag.setHotSpot(event.position().toPoint())
        
        # Execute drag
        result = drag.exec(Qt.MoveAction)
        self.setCursor(Qt.ArrowCursor)
    
    def contextMenuEvent(self, event):
        """Show context menu on right click."""
        theme = ThemeManager.get_theme()
        
        menu = QMenu(self)
        menu.setStyleSheet(f"""
            QMenu {{
                background-color: {theme['bg_secondary']};
                border: 1px solid {theme['border']};
            }}
            QMenu::item {{
                padding: 6px 24px 6px 12px;
            }}
            QMenu::item:selected {{
                background-color: {theme['accent']};
                color: white;
            }}
        """)
        
        edit_action = menu.addAction("Edit Task")
        delete_action = menu.addAction("Delete Task")
        menu.addSeparator()
        
        # Add status change options
        status_menu = menu.addMenu("Move to...")
        for status in ["todo", "in_progress", "review", "done"]:
            status_action = status_menu.addAction(status.replace("_", " ").title())
            status_action.setData(status)
        
        # Execute menu and handle result
        action = menu.exec(event.globalPosition().toPoint())
        
        if action:
            if action == edit_action:
                self.editRequested.emit(self.task_id)
            elif action == delete_action:
                self.deleteRequested.emit(self.task_id)
            elif action.data():  # Status change action
                self.statusChanged.emit(self.task_id, action.data())


class TaskDialog(QDialog):
    """Dialog for adding or editing tasks."""
    
    def __init__(self, parent=None, task_id=None):
        super().__init__(parent)
        self.task_id = task_id
        self.categories = CategoryModel.get_all_categories()
        self.projects = ProjectModel.get_all_projects()
        self.all_tags = TagModel.get_all_tags()
        
        self.setWindowTitle("New Task" if task_id is None else "Edit Task")
        self.setMinimumWidth(600)
        self.setMinimumHeight(500)
        
        self.initUI()
        
        if task_id is not None:
            self.loadTaskData()
    
    def initUI(self):
        theme = ThemeManager.get_theme()
        
        layout = QVBoxLayout(self)
        layout.setSpacing(16)
        
        # Tabs for organizing fields
        self.tabs = QTabWidget()
        
        # Main tab
        main_tab = QWidget()
        main_layout = QFormLayout(main_tab)
        main_layout.setSpacing(12)
        
        # Title
        self.title_edit = QLineEdit()
        self.title_edit.setPlaceholderText("Enter task title")
        main_layout.addRow("Title:", self.title_edit)
        
        # Description
        self.desc_edit = QTextEdit()
        self.desc_edit.setPlaceholderText("Enter task description (optional)")
        self.desc_edit.setMinimumHeight(100)
        main_layout.addRow("Description:", self.desc_edit)
        
        # Priority
        self.priority_combo = QComboBox()
        self.priority_combo.addItems(["None", "Low", "Medium", "High", "Critical"])
        self.priority_combo.setCurrentIndex(2)  # Default to Medium
        main_layout.addRow("Priority:", self.priority_combo)
        
        # Energy Level
        self.energy_combo = QComboBox()
        self.energy_combo.addItems(["None", "Low", "Medium", "High"])
        self.energy_combo.setCurrentIndex(2)  # Default to Medium
        main_layout.addRow("Energy Level:", self.energy_combo)
        
        # Status
        self.status_combo = QComboBox()
        self.status_combo.addItems(["To Do", "In Progress", "Review", "Done"])
        self.status_combo.setCurrentIndex(0)  # Default to To Do
        self.status_combo.currentIndexChanged.connect(self.onStatusChanged)
        main_layout.addRow("Status:", self.status_combo)
        
        # Completed status (only for editing)
        if self.task_id is not None:
            self.completed_check = QCheckBox("Task is completed")
            self.completed_check.toggled.connect(self.onCompletedToggled)
            main_layout.addRow("Completion:", self.completed_check)
        
        # Due Date & Time
        due_date_widget = QWidget()
        due_date_layout = QHBoxLayout(due_date_widget)
        due_date_layout.setContentsMargins(0, 0, 0, 0)
        
        self.due_date_check = QCheckBox("Set due date")
        self.due_date_check.toggled.connect(self.onDueDateToggled)
        
        self.due_date_edit = QDateEdit()
        self.due_date_edit.setCalendarPopup(True)
        self.due_date_edit.setDate(QDate.currentDate())
        self.due_date_edit.setEnabled(False)
        
        self.due_time_check = QCheckBox("Set time")
        self.due_time_check.toggled.connect(self.onDueTimeToggled)
        
        self.due_time_edit = QTimeEdit()
        self.due_time_edit.setTime(QTime.currentTime().addSecs(3600))  # Default to 1 hour from now
        self.due_time_edit.setEnabled(False)
        
        due_date_layout.addWidget(self.due_date_check)
        due_date_layout.addWidget(self.due_date_edit)
        due_date_layout.addWidget(self.due_time_check)
        due_date_layout.addWidget(self.due_time_edit)
        
        main_layout.addRow("Due:", due_date_widget)
        
        # Start Date
        start_date_widget = QWidget()
        start_date_layout = QHBoxLayout(start_date_widget)
        start_date_layout.setContentsMargins(0, 0, 0, 0)
        
        self.start_date_check = QCheckBox("Set start date")
        self.start_date_check.toggled.connect(lambda checked: self.start_date_edit.setEnabled(checked))
        
        self.start_date_edit = QDateEdit()
        self.start_date_edit.setCalendarPopup(True)
        self.start_date_edit.setDate(QDate.currentDate())
        self.start_date_edit.setEnabled(False)
        
        start_date_layout.addWidget(self.start_date_check)
        start_date_layout.addWidget(self.start_date_edit)
        start_date_layout.addStretch()
        
        main_layout.addRow("Start:", start_date_widget)
        
        # Estimated Time
        time_widget = QWidget()
        time_layout = QHBoxLayout(time_widget)
        time_layout.setContentsMargins(0, 0, 0, 0)
        
        self.estimated_time_check = QCheckBox("Estimated time (minutes)")
        self.estimated_time_check.toggled.connect(lambda checked: self.estimated_time_spin.setEnabled(checked))
        
        self.estimated_time_spin = QSpinBox()
        self.estimated_time_spin.setRange(1, 1440)  # 1 minute to 24 hours
        self.estimated_time_spin.setValue(30)  # Default to 30 minutes
        self.estimated_time_spin.setEnabled(False)
        
        time_layout.addWidget(self.estimated_time_check)
        time_layout.addWidget(self.estimated_time_spin)
        time_layout.addStretch()
        
        main_layout.addRow("Time:", time_widget)
        
        # Category
        self.category_combo = QComboBox()
        for category in self.categories:
            self.category_combo.addItem(category[1], category[0])
        main_layout.addRow("Category:", self.category_combo)
        
        # Project
        self.project_combo = QComboBox()
        self.project_combo.addItem("None", None)
        for project in self.projects:
            self.project_combo.addItem(project[1], project[0])
        main_layout.addRow("Project:", self.project_combo)
        
        # Parent Task (for subtasks)
        self.parent_combo = QComboBox()
        self.parent_combo.addItem("None (Top-Level Task)", None)
        
        # Only offer parent selection for new tasks to avoid circular references
        if self.task_id is None:
            # Get all potential parent tasks (non-completed tasks)
            with get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                SELECT id, title FROM tasks 
                WHERE completed = 0 AND parent_id IS NULL
                ORDER BY title
                ''')
                potential_parents = cursor.fetchall()
                
                for parent in potential_parents:
                    self.parent_combo.addItem(parent[1], parent[0])
            
            main_layout.addRow("Parent Task:", self.parent_combo)
        
        # Add main tab
        self.tabs.addTab(main_tab, "Basic Info")
        
        # Advanced tab
        advanced_tab = QWidget()
        advanced_layout = QFormLayout(advanced_tab)
        
        # Recurring
        recurring_widget = QWidget()
        recurring_layout = QHBoxLayout(recurring_widget)
        recurring_layout.setContentsMargins(0, 0, 0, 0)
        
        self.recurring_check = QCheckBox("Recurring task")
        self.recurring_check.toggled.connect(lambda checked: self.recurring_combo.setEnabled(checked))
        
        self.recurring_combo = QComboBox()
        self.recurring_combo.addItems([i.name.title().replace('_', ' ') for i in RepeatInterval])
        self.recurring_combo.setCurrentIndex(0)  # None
        self.recurring_combo.setEnabled(False)
        
        recurring_layout.addWidget(self.recurring_check)
        recurring_layout.addWidget(self.recurring_combo)
        recurring_layout.addStretch()
        
        advanced_layout.addRow("Recurring:", recurring_widget)
        
        # Reminder
        reminder_widget = QWidget()
        reminder_layout = QHBoxLayout(reminder_widget)
        reminder_layout.setContentsMargins(0, 0, 0, 0)
        
        self.reminder_check = QCheckBox("Set reminder")
        self.reminder_check.toggled.connect(lambda checked: self.reminder_combo.setEnabled(checked))
        
        self.reminder_combo = QComboBox()
        self.reminder_combo.addItems(["At due time", "5 minutes before", "15 minutes before", 
                                    "30 minutes before", "1 hour before", "2 hours before",
                                    "1 day before"])
        self.reminder_combo.setEnabled(False)
        
        reminder_layout.addWidget(self.reminder_check)
        reminder_layout.addWidget(self.reminder_combo)
        reminder_layout.addStretch()
        
        advanced_layout.addRow("Reminder:", reminder_widget)
        
        # Tags
        tags_widget = QWidget()
        tags_layout = QVBoxLayout(tags_widget)
        tags_layout.setContentsMargins(0, 0, 0, 0)
        
        # Tag selection list
        self.tag_list = QListWidget()
        self.tag_list.setSelectionMode(QListWidget.MultiSelection)
        self.tag_list.setMaximumHeight(150)
        
        # Populate tags
        for tag in self.all_tags:
            item = QListWidgetItem(tag[1])
            item.setData(Qt.UserRole, tag[0])  # Store tag ID
            
            # Set background color based on tag color
            item.setBackground(QColor(tag[2]))
            item.setForeground(QColor(Qt.white))
            
            self.tag_list.addItem(item)
        
        tags_layout.addWidget(self.tag_list)
        
        # Button to create new tag
        new_tag_button = QPushButton("Create New Tag")
        new_tag_button.clicked.connect(self.showAddTagDialog)
        tags_layout.addWidget(new_tag_button)
        
        advanced_layout.addRow("Tags:", tags_widget)
        
        # Notes
        self.notes_edit = QTextEdit()
        self.notes_edit.setPlaceholderText("Enter additional notes (optional)")
        self.notes_edit.setMinimumHeight(100)
        advanced_layout.addRow("Notes:", self.notes_edit)
        
        # Add advanced tab
        self.tabs.addTab(advanced_tab, "Advanced")
        
        # Subtasks tab (only for editing existing tasks)
        if self.task_id is not None:
            subtasks_tab = QWidget()
            subtasks_layout = QVBoxLayout(subtasks_tab)
            
            # Subtasks list
            self.subtasks_list = QListWidget()
            subtasks_layout.addWidget(self.subtasks_list)
            
            # Add subtask button
            add_subtask_btn = QPushButton("Add Subtask")
            add_subtask_btn.clicked.connect(self.showAddSubtaskDialog)
            subtasks_layout.addWidget(add_subtask_btn)
            
            # Load subtasks
            self.loadSubtasks()
            
            self.tabs.addTab(subtasks_tab, "Subtasks")
        
        layout.addWidget(self.tabs)
        
        # Buttons
        button_box = QDialogButtonBox(QDialogButtonBox.Save | QDialogButtonBox.Cancel)
        button_box.accepted.connect(self.accept)
        button_box.rejected.connect(self.reject)
        
        layout.addWidget(button_box)
    
    def onDueDateToggled(self, checked):
        """Handle due date checkbox toggled."""
        self.due_date_edit.setEnabled(checked)
        if not checked:
            self.due_time_check.setChecked(False)
    
    def onDueTimeToggled(self, checked):
        """Handle due time checkbox toggled."""
        self.due_time_edit.setEnabled(checked)
    
    def onStatusChanged(self, index):
        """Handle status change."""
        if hasattr(self, 'completed_check'):
            # If status is Done, auto-check completed
            self.completed_check.setChecked(index == 3)  # 3 = "Done"
    
    def onCompletedToggled(self, checked):
        """Handle completed checkbox toggled."""
        # If completed is checked, set status to Done
        if checked:
            self.status_combo.setCurrentIndex(3)  # "Done"
    
    def loadTaskData(self):
        """Load task data for editing."""
        task = TaskModel.get_task_by_id(self.task_id)
        if task:
            self.title_edit.setText(task[2])
            self.desc_edit.setText(task[3] or "")
            self.priority_combo.setCurrentIndex(task[4])
            
            if task[5]:  # Due date
                self.due_date_check.setChecked(True)
                self.due_date_edit.setDate(QDate.fromString(task[5], Qt.ISODate))
            
            if task[6]:  # Due time
                self.due_time_check.setChecked(True)
                self.due_time_edit.setTime(QTime.fromString(task[6], "hh:mm"))
            
            # Status
            status_map = {"todo": 0, "in_progress": 1, "review": 2, "done": 3}
            status_index = status_map.get(task[17], 0)
            self.status_combo.setCurrentIndex(status_index)
            
            # Completed status
            self.completed_check.setChecked(bool(task[8]))
            
            # Energy level
            self.energy_combo.setCurrentIndex(task[16] or 0)
            
            # Set the category
            category_id = task[19]
            if category_id:
                index = self.category_combo.findData(category_id)
                if index >= 0:
                    self.category_combo.setCurrentIndex(index)
            
            # Set the project
            project_id = task[20]
            if project_id:
                index = self.project_combo.findData(project_id)
                if index >= 0:
                    self.project_combo.setCurrentIndex(index)
            
            # Start date
            if task[26]:  # Start date
                self.start_date_check.setChecked(True)
                self.start_date_edit.setDate(QDate.fromString(task[26], Qt.ISODate))
            
            # Estimated time
            if task[21]:
                self.estimated_time_check.setChecked(True)
                self.estimated_time_spin.setValue(task[21])
            
            # Recurring
            if task[15]:
                self.recurring_check.setChecked(True)
                
                # Find index for recurring interval
                interval_text = task[15].title().replace('_', ' ')
                index = self.recurring_combo.findText(interval_text)
                if index >= 0:
                    self.recurring_combo.setCurrentIndex(index)
            
            # Notes
            if task[23]:
                self.notes_edit.setText(task[23])
            
            # Tags - select the ones associated with this task
            task_tags = TaskModel.get_task_tags(self.task_id)
            tag_ids = [tag[0] for tag in task_tags]
            
            for i in range(self.tag_list.count()):
                item = self.tag_list.item(i)
                tag_id = item.data(Qt.UserRole)
                item.setSelected(tag_id in tag_ids)
    
    def loadSubtasks(self):
        """Load subtasks for the current task."""
        if not hasattr(self, 'subtasks_list'):
            return
            
        self.subtasks_list.clear()
        
        subtasks = TaskModel.get_subtasks(self.task_id)
        for subtask in subtasks:
            item = QListWidgetItem(subtask[2])
            item.setData(Qt.UserRole, subtask[0])  # Store task ID
            
            # Set checked if completed
            if subtask[7]:  # completed
                item.setCheckState(Qt.Checked)
            else:
                item.setCheckState(Qt.Unchecked)
            
            self.subtasks_list.addItem(item)
        
        self.subtasks_list.itemChanged.connect(self.onSubtaskItemChanged)
    
    def onSubtaskItemChanged(self, item):
        """Handle subtask checkbox changes."""
        subtask_id = item.data(Qt.UserRole)
        completed = item.checkState() == Qt.Checked
        
        # Update the subtask status
        TaskModel.toggle_task_completion(subtask_id, completed)
    
    def showAddSubtaskDialog(self):
        """Show dialog to add a subtask."""
        dialog = QDialog(self)
        dialog.setWindowTitle("Add Subtask")
        dialog.setMinimumWidth(400)
        
        layout = QVBoxLayout(dialog)
        
        # Subtask title
        title_label = QLabel("Subtask Title:")
        layout.addWidget(title_label)
        
        title_edit = QLineEdit()
        layout.addWidget(title_edit)
        
        # Priority
        priority_layout = QHBoxLayout()
        priority_label = QLabel("Priority:")
        priority_combo = QComboBox()
        priority_combo.addItems(["None", "Low", "Medium", "High", "Critical"])
        priority_combo.setCurrentIndex(2)  # Default to Medium
        
        priority_layout.addWidget(priority_label)
        priority_layout.addWidget(priority_combo)
        layout.addLayout(priority_layout)
        
        # Buttons
        button_box = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        button_box.accepted.connect(dialog.accept)
        button_box.rejected.connect(dialog.reject)
        layout.addWidget(button_box)
        
        if dialog.exec():
            subtask_title = title_edit.text().strip()
            subtask_priority = priority_combo.currentIndex()
            
            if subtask_title:
                # Add the subtask
                TaskModel.add_task(
                    subtask_title, "", subtask_priority, 
                    parent_id=self.task_id,
                    category_id=self.getTaskData()['category_id'],
                    project_id=self.getTaskData()['project_id']
                )
                
                # Refresh subtasks list
                self.loadSubtasks()
    
    def showAddTagDialog(self):
        """Show dialog to add a new tag."""
        dialog = QDialog(self)
        dialog.setWindowTitle("Create New Tag")
        dialog.setMinimumWidth(300)
        
        layout = QVBoxLayout(dialog)
        
        # Tag name
        name_label = QLabel("Tag Name:")
        layout.addWidget(name_label)
        
        name_edit = QLineEdit()
        layout.addWidget(name_edit)
        
        # Tag color
        color_label = QLabel("Tag Color:")
        layout.addWidget(color_label)
        
        color_button = QPushButton("Choose Color")
        color_button.setStyleSheet("background-color: #9b59b6;")
        color_value = "#9b59b6"  # Default color
        
        def choose_color():
            nonlocal color_value
            color = QColorDialog.getColor(QColor(color_value), dialog)
            if color.isValid():
                color_value = color.name()
                color_button.setStyleSheet(f"background-color: {color_value};")
        
        color_button.clicked.connect(choose_color)
        layout.addWidget(color_button)
        
        # Buttons
        button_box = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        button_box.accepted.connect(dialog.accept)
        button_box.rejected.connect(dialog.reject)
        layout.addWidget(button_box)
        
        if dialog.exec():
            tag_name = name_edit.text().strip().lower()
            
            if tag_name:
                # Add the tag
                tag_id = TagModel.add_tag(tag_name, color_value)
                
                # Refresh tag list
                self.all_tags = TagModel.get_all_tags()
                
                # Add to tag list widget
                item = QListWidgetItem(tag_name)
                item.setData(Qt.UserRole, tag_id)
                item.setBackground(QColor(color_value))
                item.setForeground(QColor(Qt.white))
                self.tag_list.addItem(item)
                item.setSelected(True)
    
    def getTaskData(self):
        """Get the task data from the dialog."""
        title = self.title_edit.text().strip()
        description = self.desc_edit.toPlainText().strip()
        priority = self.priority_combo.currentIndex()
        energy_level = self.energy_combo.currentIndex()
        
        # Status from combo
        status_map = {0: "todo", 1: "in_progress", 2: "review", 3: "done"}
        status = status_map[self.status_combo.currentIndex()]
        
        due_date = None
        if self.due_date_check.isChecked():
            due_date = self.due_date_edit.date().toString(Qt.ISODate)
        
        due_time = None
        if self.due_time_check.isChecked() and self.due_date_check.isChecked():
            due_time = self.due_time_edit.time().toString("hh:mm")
        
        start_date = None
        if self.start_date_check.isChecked():
            start_date = self.start_date_edit.date().toString(Qt.ISODate)
        
        estimated_time = None
        if self.estimated_time_check.isChecked():
            estimated_time = self.estimated_time_spin.value()
        
        category_id = self.category_combo.currentData()
        project_id = self.project_combo.currentData()
        
        parent_id = None
        if hasattr(self, 'parent_combo'):
            parent_id = self.parent_combo.currentData()
        
        recurring = 0
        recurring_interval = None
        if self.recurring_check.isChecked():
            recurring = 1
            recurring_interval = RepeatInterval[self.recurring_combo.currentText().upper().replace(' ', '_')].name
        
        reminder = None
        if self.reminder_check.isChecked():
            reminder_options = {
                0: "at_time",
                1: "5_min_before",
                2: "15_min_before",
                3: "30_min_before",
                4: "1_hour_before",
                5: "2_hours_before",
                6: "1_day_before"
            }
            reminder = reminder_options[self.reminder_combo.currentIndex()]
        
        # Get selected tags
        selected_tags = []
        for i in range(self.tag_list.count()):
            item = self.tag_list.item(i)
            if item.isSelected():
                selected_tags.append(item.data(Qt.UserRole))
        
        notes = self.notes_edit.toPlainText().strip()
        
        completed = False
        if hasattr(self, 'completed_check'):
            completed = self.completed_check.isChecked()
        
        return {
            'title': title,
            'description': description,
            'priority': priority,
            'energy_level': energy_level,
            'status': status,
            'due_date': due_date,
            'due_time': due_time,
            'start_date': start_date,
            'estimated_time': estimated_time,
            'category_id': category_id,
            'project_id': project_id,
            'parent_id': parent_id,
            'recurring': recurring,
            'recurring_interval': recurring_interval,
            'reminder': reminder,
            'tags': selected_tags,
            'notes': notes,
            'completed': completed
        }


class CategoryDialog(QDialog):
    """Dialog for adding or editing categories."""
    
    def __init__(self, parent=None, category_id=None):
        super().__init__(parent)
        self.category_id = category_id
        
        self.setWindowTitle("Add Category" if category_id is None else "Edit Category")
        self.setMinimumWidth(400)
        self.initUI()
        
        if category_id is not None:
            self.loadCategoryData()
    
    def initUI(self):
        theme = ThemeManager.get_theme()
        
        layout = QVBoxLayout(self)
        layout.setSpacing(16)
        
        form_layout = QFormLayout()
        form_layout.setSpacing(12)
        
        # Name
        self.name_edit = QLineEdit()
        self.name_edit.setPlaceholderText("Enter category name")
        form_layout.addRow("Name:", self.name_edit)
        
        # Color
        color_widget = QWidget()
        color_layout = QHBoxLayout(color_widget)
        color_layout.setContentsMargins(0, 0, 0, 0)
        
        self.color_preview = QFrame()
        self.color_preview.setFixedSize(30, 30)
        self.color_preview.setStyleSheet("background-color: #3498db; border-radius: 15px;")
        self.color_value = "#3498db"  # Default color
        
        self.color_button = QPushButton("Choose Color")
        self.color_button.clicked.connect(self.chooseColor)
        
        color_layout.addWidget(self.color_preview)
        color_layout.addWidget(self.color_button)
        color_layout.addStretch()
        
        form_layout.addRow("Color:", color_widget)
        
        # Icon (text field for now, could be expanded to icon picker)
        self.icon_edit = QLineEdit()
        self.icon_edit.setPlaceholderText("Enter icon name (e.g., 'tag', 'work', 'home')")
        form_layout.addRow("Icon:", self.icon_edit)
        
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
            self.color_preview.setStyleSheet(f"background-color: {self.color_value}; border-radius: 15px;")
    
    def loadCategoryData(self):
        """Load category data for editing."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT name, color, icon FROM categories WHERE id = ?', (self.category_id,))
            result = cursor.fetchone()
            
            if result:
                self.name_edit.setText(result[0])
                self.color_value = result[1]
                self.color_preview.setStyleSheet(f"background-color: {self.color_value}; border-radius: 15px;")
                self.icon_edit.setText(result[2])
    
    def getCategoryData(self):
        """Get the category data from the dialog."""
        name = self.name_edit.text().strip()
        icon = self.icon_edit.text().strip() or "tag"
        return {
            'name': name,
            'color': self.color_value,
            'icon': icon
        }


class ProjectDialog(QDialog):
    """Dialog for adding or editing projects."""
    
    def __init__(self, parent=None, project_id=None):
        super().__init__(parent)
        self.project_id = project_id
        
        self.setWindowTitle("Add Project" if project_id is None else "Edit Project")
        self.setMinimumWidth(500)
        self.initUI()
        
        if project_id is not None:
            self.loadProjectData()
    
    def initUI(self):
        theme = ThemeManager.get_theme()
        
        layout = QVBoxLayout(self)
        layout.setSpacing(16)
        
        form_layout = QFormLayout()
        form_layout.setSpacing(12)
        
        # Name
        self.name_edit = QLineEdit()
        self.name_edit.setPlaceholderText("Enter project name")
        form_layout.addRow("Name:", self.name_edit)
        
        # Description
        self.desc_edit = QTextEdit()
        self.desc_edit.setPlaceholderText("Enter project description (optional)")
        self.desc_edit.setMaximumHeight(100)
        form_layout.addRow("Description:", self.desc_edit)
        
        # Color
        color_widget = QWidget()
        color_layout = QHBoxLayout(color_widget)
        color_layout.setContentsMargins(0, 0, 0, 0)
        
        self.color_preview = QFrame()
        self.color_preview.setFixedSize(30, 30)
        self.color_preview.setStyleSheet("background-color: #2ecc71; border-radius: 15px;")
        self.color_value = "#2ecc71"  # Default color
        
        self.color_button = QPushButton("Choose Color")
        self.color_button.clicked.connect(self.chooseColor)
        
        color_layout.addWidget(self.color_preview)
        color_layout.addWidget(self.color_button)
        color_layout.addStretch()
        
        form_layout.addRow("Color:", color_widget)
        
        # Due Date
        due_date_widget = QWidget()
        due_date_layout = QHBoxLayout(due_date_widget)
        due_date_layout.setContentsMargins(0, 0, 0, 0)
        
        self.due_date_check = QCheckBox("Set due date")
        self.due_date_check.toggled.connect(lambda checked: self.due_date_edit.setEnabled(checked))
        
        self.due_date_edit = QDateEdit()
        self.due_date_edit.setCalendarPopup(True)
        self.due_date_edit.setDate(QDate.currentDate().addMonths(1))  # Default to 1 month from now
        self.due_date_edit.setEnabled(False)
        
        due_date_layout.addWidget(self.due_date_check)
        due_date_layout.addWidget(self.due_date_edit)
        due_date_layout.addStretch()
        
        form_layout.addRow("Due Date:", due_date_widget)
        
        layout.addLayout(form_layout)
        
        # Completed (only for editing)
        if self.project_id is not None:
            self.completed_check = QCheckBox("Project is completed")
            form_layout.addRow("Status:", self.completed_check)
        
        # Buttons
        button_box = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        button_box.accepted.connect(self.accept)
        button_box.rejected.connect(self.reject)
        
        layout.addWidget(button_box)
    
    def chooseColor(self):
        color = QColorDialog.getColor(QColor(self.color_value), self)
        if color.isValid():
            self.color_value = color.name()
            self.color_preview.setStyleSheet(f"background-color: {self.color_value}; border-radius: 15px;")
    
    def loadProjectData(self):
        """Load project data for editing."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            SELECT name, description, color, due_date, completed
            FROM projects WHERE id = ?
            ''', (self.project_id,))
            result = cursor.fetchone()
            
            if result:
                self.name_edit.setText(result[0])
                self.desc_edit.setText(result[1] or "")
                self.color_value = result[2]
                self.color_preview.setStyleSheet(f"background-color: {self.color_value}; border-radius: 15px;")
                
                if result[3]:  # Due date
                    self.due_date_check.setChecked(True)
                    self.due_date_edit.setDate(QDate.fromString(result[3], Qt.ISODate))
                
                self.completed_check.setChecked(bool(result[4]))
    
    def getProjectData(self):
        """Get the project data from the dialog."""
        name = self.name_edit.text().strip()
        description = self.desc_edit.toPlainText().strip()
        due_date = None
        if self.due_date_check.isChecked():
            due_date = self.due_date_edit.date().toString(Qt.ISODate)
            
        completed = 0
        if hasattr(self, 'completed_check'):
            completed = 1 if self.completed_check.isChecked() else 0
            
        return {
            'name': name,
            'description': description,
            'color': self.color_value,
            'due_date': due_date,
            'completed': completed
        }


class SettingsDialog(QDialog):
    """Dialog for application settings."""
    themeChanged = Signal(str)
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Settings")
        self.setMinimumWidth(500)
        self.settings = SettingsModel.get_all_settings()
        self.initUI()
    
    def initUI(self):
        theme = ThemeManager.get_theme()
        
        layout = QVBoxLayout(self)
        
        tabs = QTabWidget()
        
        # Appearance tab
        appearance_tab = QWidget()
        appearance_layout = QVBoxLayout(appearance_tab)
        
        # Theme selection
        theme_group = QGroupBox("Theme")
        theme_layout = QVBoxLayout(theme_group)
        
        self.theme_radio_light = QRadioButton("Light Theme")
        self.theme_radio_dark = QRadioButton("Dark Theme")
        
        current_theme = self.settings.get('theme', 'light')
        if current_theme == 'dark':
            self.theme_radio_dark.setChecked(True)
        else:
            self.theme_radio_light.setChecked(True)
        
        theme_layout.addWidget(self.theme_radio_light)
        theme_layout.addWidget(self.theme_radio_dark)
        
        appearance_layout.addWidget(theme_group)
        appearance_layout.addStretch()
        
        tabs.addTab(appearance_tab, "Appearance")
        
        # Pomodoro tab
        pomodoro_tab = QWidget()
        pomodoro_layout = QFormLayout(pomodoro_tab)
        
        # Work duration
        self.pomodoro_work_spin = QSpinBox()
        self.pomodoro_work_spin.setRange(1, 60)
        self.pomodoro_work_spin.setValue(int(self.settings.get('pomodoro_work', '25')))
        self.pomodoro_work_spin.setSuffix(" minutes")
        pomodoro_layout.addRow("Work Duration:", self.pomodoro_work_spin)
        
        # Short break duration
        self.pomodoro_break_spin = QSpinBox()
        self.pomodoro_break_spin.setRange(1, 30)
        self.pomodoro_break_spin.setValue(int(self.settings.get('pomodoro_break', '5')))
        self.pomodoro_break_spin.setSuffix(" minutes")
        pomodoro_layout.addRow("Short Break Duration:", self.pomodoro_break_spin)
        
        # Long break duration
        self.pomodoro_long_break_spin = QSpinBox()
        self.pomodoro_long_break_spin.setRange(5, 60)
        self.pomodoro_long_break_spin.setValue(int(self.settings.get('pomodoro_long_break', '15')))
        self.pomodoro_long_break_spin.setSuffix(" minutes")
        pomodoro_layout.addRow("Long Break Duration:", self.pomodoro_long_break_spin)
        
        # Cycles before long break
        self.pomodoro_cycles_spin = QSpinBox()
        self.pomodoro_cycles_spin.setRange(1, 10)
        self.pomodoro_cycles_spin.setValue(int(self.settings.get('pomodoro_cycles', '4')))
        self.pomodoro_cycles_spin.setSuffix(" cycles")
        pomodoro_layout.addRow("Cycles Before Long Break:", self.pomodoro_cycles_spin)
        
        tabs.addTab(pomodoro_tab, "Pomodoro Timer")
        
        # Notifications tab
        notifications_tab = QWidget()
        notifications_layout = QFormLayout(notifications_tab)
        
        # Default reminder time
        self.reminder_time_combo = QComboBox()
        self.reminder_time_combo.addItems(["At due time", "5 minutes before", "15 minutes before", 
                                         "30 minutes before", "1 hour before", "2 hours before",
                                         "1 day before"])
        
        reminder_map = {
            "0": 0,
            "5": 1,
            "15": 2,
            "30": 3,
            "60": 4,
            "120": 5,
            "1440": 6
        }
        
        self.reminder_time_combo.setCurrentIndex(
            reminder_map.get(self.settings.get('reminder_time', '15'), 2))
        
        notifications_layout.addRow("Default Reminder Time:", self.reminder_time_combo)
        
        tabs.addTab(notifications_tab, "Notifications")
        
        # Data Management tab
        data_tab = QWidget()
        data_layout = QVBoxLayout(data_tab)
        
        export_btn = QPushButton("Export Data")
        export_btn.clicked.connect(self.exportData)
        data_layout.addWidget(export_btn)
        
        import_btn = QPushButton("Import Data")
        import_btn.clicked.connect(self.importData)
        data_layout.addWidget(import_btn)
        
        backup_btn = QPushButton("Backup Database")
        backup_btn.clicked.connect(self.backupDatabase)
        data_layout.addWidget(backup_btn)
        
        reset_btn = QPushButton("Reset All Data")
        reset_btn.setStyleSheet(f"background-color: {theme['error']}; color: white;")
        reset_btn.clicked.connect(self.resetData)
        data_layout.addWidget(reset_btn)
        
        data_layout.addStretch()
        
        tabs.addTab(data_tab, "Data Management")
        
        layout.addWidget(tabs)
        
        # Buttons
        button_box = QDialogButtonBox(QDialogButtonBox.Save | QDialogButtonBox.Cancel)
        button_box.accepted.connect(self.saveSettings)
        button_box.rejected.connect(self.reject)
        
        layout.addWidget(button_box)
    
    def saveSettings(self):
        """Save the settings and close the dialog."""
        # Theme
        theme = 'dark' if self.theme_radio_dark.isChecked() else 'light'
        old_theme = self.settings.get('theme', 'light')
        SettingsModel.set_setting('theme', theme)
        
        # Pomodoro settings
        SettingsModel.set_setting('pomodoro_work', str(self.pomodoro_work_spin.value()))
        SettingsModel.set_setting('pomodoro_break', str(self.pomodoro_break_spin.value()))
        SettingsModel.set_setting('pomodoro_long_break', str(self.pomodoro_long_break_spin.value()))
        SettingsModel.set_setting('pomodoro_cycles', str(self.pomodoro_cycles_spin.value()))
        
        # Notification settings
        reminder_map = {
            0: "0",     # At due time
            1: "5",     # 5 minutes before
            2: "15",    # 15 minutes before
            3: "30",    # 30 minutes before
            4: "60",    # 1 hour before
            5: "120",   # 2 hours before
            6: "1440"   # 1 day before
        }
        SettingsModel.set_setting('reminder_time', 
                                 reminder_map[self.reminder_time_combo.currentIndex()])
        
        # Emit theme changed signal if needed
        if theme != old_theme:
            self.themeChanged.emit(theme)
        
        self.accept()
    
    def exportData(self):
        """Export data to a JSON file."""
        file_path, _ = QFileDialog.getSaveFileName(
            self, "Export Data", "", "JSON Files (*.json)")
        
        if not file_path:
            return
            
        try:
            with get_connection() as conn:
                # Get all data as dictionaries
                cursor = conn.cursor()
                
                # Get tasks
                cursor.execute("SELECT * FROM tasks")
                tasks = [dict(zip([column[0] for column in cursor.description], row)) 
                         for row in cursor.fetchall()]
                
                # Get categories
                cursor.execute("SELECT * FROM categories")
                categories = [dict(zip([column[0] for column in cursor.description], row)) 
                             for row in cursor.fetchall()]
                
                # Get tags
                cursor.execute("SELECT * FROM tags")
                tags = [dict(zip([column[0] for column in cursor.description], row)) 
                       for row in cursor.fetchall()]
                
                # Get projects
                cursor.execute("SELECT * FROM projects")
                projects = [dict(zip([column[0] for column in cursor.description], row)) 
                           for row in cursor.fetchall()]
                
                # Get task_tags
                cursor.execute("SELECT * FROM task_tags")
                task_tags = [dict(zip([column[0] for column in cursor.description], row)) 
                            for row in cursor.fetchall()]
                
                data = {
                    "tasks": tasks,
                    "categories": categories,
                    "tags": tags,
                    "projects": projects,
                    "task_tags": task_tags,
                    "export_date": datetime.datetime.now().isoformat()
                }
                
                with open(file_path, 'w') as f:
                    json.dump(data, f, indent=2)
                
                QMessageBox.information(self, "Export Successful", 
                                      "Data has been successfully exported.")
        except Exception as e:
            QMessageBox.critical(self, "Export Failed", f"Error exporting data: {str(e)}")
    
    def importData(self):
        """Import data from a JSON file."""
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Import Data", "", "JSON Files (*.json)")
        
        if not file_path:
            return
            
        try:
            # Show confirmation dialog
            confirm = QMessageBox.question(
                self, "Confirm Import", 
                "Importing data will merge with your existing data. Continue?",
                QMessageBox.Yes | QMessageBox.No,
                QMessageBox.No
            )
            
            if confirm != QMessageBox.Yes:
                return
                
            with open(file_path, 'r') as f:
                data = json.load(f)
                
            with get_connection() as conn:
                cursor = conn.cursor()
                
                # Import categories
                for category in data.get('categories', []):
                    cursor.execute('''
                    INSERT OR IGNORE INTO categories (name, color, icon)
                    VALUES (?, ?, ?)
                    ''', (category['name'], category['color'], category.get('icon', 'tag')))
                
                # Import tags
                for tag in data.get('tags', []):
                    cursor.execute('''
                    INSERT OR IGNORE INTO tags (name, color)
                    VALUES (?, ?)
                    ''', (tag['name'], tag['color']))
                
                # Import projects
                for project in data.get('projects', []):
                    cursor.execute('''
                    INSERT OR IGNORE INTO projects (name, description, color, due_date, completed)
                    VALUES (?, ?, ?, ?, ?)
                    ''', (project['name'], project.get('description', ''), 
                         project['color'], project.get('due_date'), project.get('completed', 0)))
                
                # Import tasks
                for task in data.get('tasks', []):
                    # Check if task with this UUID already exists
                    cursor.execute('SELECT id FROM tasks WHERE uuid = ?', (task.get('uuid', ''),))
                    existing = cursor.fetchone()
                    
                    if existing:
                        continue  # Skip existing tasks
                        
                    cursor.execute('''
                    INSERT INTO tasks (
                        uuid, title, description, priority, due_date, due_time, 
                        reminder, completed, completion_date, category_id, project_id, 
                        parent_id, created_at, modified_at, start_date, estimated_time, 
                        actual_time, recurring, recurring_interval, recurring_count, 
                        energy_level, notes, status, position
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        task.get('uuid', str(uuid.uuid4())), task['title'], task.get('description', ''),
                        task.get('priority', 1), task.get('due_date'), task.get('due_time'),
                        task.get('reminder'), task.get('completed', 0), task.get('completion_date'),
                        task.get('category_id'), task.get('project_id'), task.get('parent_id'),
                        task.get('created_at', datetime.datetime.now().isoformat()),
                        task.get('modified_at', datetime.datetime.now().isoformat()),
                        task.get('start_date'), task.get('estimated_time'), 
                        task.get('actual_time', 0), task.get('recurring', 0),
                        task.get('recurring_interval'), task.get('recurring_count', 0),
                        task.get('energy_level', 2), task.get('notes'),
                        task.get('status', 'todo'), task.get('position', 0)
                    ))
                
                # Import task_tags relationships
                for relation in data.get('task_tags', []):
                    cursor.execute('''
                    INSERT OR IGNORE INTO task_tags (task_id, tag_id)
                    VALUES (?, ?)
                    ''', (relation['task_id'], relation['tag_id']))
                
                conn.commit()
                
                QMessageBox.information(self, "Import Successful", 
                                      "Data has been successfully imported.")
        except Exception as e:
            QMessageBox.critical(self, "Import Failed", f"Error importing data: {str(e)}")
    
    def backupDatabase(self):
        """Backup the SQLite database file."""
        now = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        default_filename = f"taskmaster_backup_{now}.db"
        
        file_path, _ = QFileDialog.getSaveFileName(
            self, "Backup Database", default_filename, "SQLite Database (*.db)")
        
        if not file_path:
            return
            
        try:
            # Simple file copy for backup
            import shutil
            shutil.copy2(DB_PATH, file_path)
            
            QMessageBox.information(self, "Backup Successful", 
                                  "Database has been successfully backed up.")
        except Exception as e:
            QMessageBox.critical(self, "Backup Failed", f"Error backing up database: {str(e)}")
    
    def resetData(self):
        """Reset all data in the application."""
        confirm = QMessageBox.warning(
            self, "Confirm Reset", 
            "This will delete ALL your tasks, categories, tags, and projects. "
            "This action cannot be undone. Are you absolutely sure?",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        
        if confirm != QMessageBox.Yes:
            return
            
        # Double confirm with password
        confirm2, ok = QInputDialog.getText(
            self, "Confirm Reset", 
            "Type 'DELETE ALL DATA' to confirm reset:",
            QLineEdit.Normal
        )
        
        if not ok or confirm2 != "DELETE ALL DATA":
            return
            
        try:
            # Close the database connection
            # Delete the database file
            import os
            if os.path.exists(DB_PATH):
                os.remove(DB_PATH)
                
            # Re-initialize the database
            init_db()
            
            QMessageBox.information(self, "Reset Successful", 
                                  "All data has been reset. The application will now restart.")
            
            # Signal to the main application to restart
            self.accept()
            QApplication.instance().exit(1001)  # Special exit code for restart
        except Exception as e:
            QMessageBox.critical(self, "Reset Failed", f"Error resetting data: {str(e)}")


class PomodoroTimer(QDialog):
    """Pomodoro timer dialog."""
    
    WORK = 0
    SHORT_BREAK = 1
    LONG_BREAK = 2
    
    def __init__(self, parent=None, task_id=None):
        super().__init__(parent)
        self.task_id = task_id
        self.task_title = ""
        if task_id:
            task = TaskModel.get_task_by_id(task_id)
            if task:
                self.task_title = task[2]
        
        self.setWindowTitle("Pomodoro Timer")
        self.setMinimumWidth(400)
        
        # Load settings
        self.work_minutes = int(SettingsModel.get_setting('pomodoro_work', '25'))
        self.short_break_minutes = int(SettingsModel.get_setting('pomodoro_break', '5'))
        self.long_break_minutes = int(SettingsModel.get_setting('pomodoro_long_break', '15'))
        self.cycles_before_long_break = int(SettingsModel.get_setting('pomodoro_cycles', '4'))
        
        # State variables
        self.current_state = self.WORK
        self.current_cycle = 1
        self.timer_running = False
        self.time_left = self.work_minutes * 60
        
        # Create UI
        self.initUI()
        
        # Timer
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.updateTimer)
        
        # Update display
        self.updateDisplay()
    
    def initUI(self):
        theme = ThemeManager.get_theme()
        
        layout = QVBoxLayout(self)
        layout.setSpacing(20)
        
        # Task title if available
        if self.task_title:
            title_label = QLabel(f"Working on: {self.task_title}")
            title_label.setStyleSheet("font-weight: bold; font-size: 14px;")
            title_label.setAlignment(Qt.AlignCenter)
            layout.addWidget(title_label)
        
        # Current state label
        self.state_label = QLabel("Work Session")
        self.state_label.setStyleSheet("font-size: 16px; font-weight: bold;")
        self.state_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.state_label)
        
        # Timer display
        self.time_display = QLabel("25:00")
        self.time_display.setStyleSheet("font-size: 72px; font-weight: bold;")
        self.time_display.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.time_display)
        
        # Progress bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setRange(0, self.work_minutes * 60)
        self.progress_bar.setValue(self.work_minutes * 60)
        layout.addWidget(self.progress_bar)
        
        # Cycle indicator
        self.cycle_label = QLabel(f"Cycle {self.current_cycle}/{self.cycles_before_long_break}")
        self.cycle_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.cycle_label)
        
        # Control buttons
        buttons_layout = QHBoxLayout()
        
        self.start_button = QPushButton("Start")
        self.start_button.clicked.connect(self.startTimer)
        self.start_button.setStyleSheet(f"""
            background-color: {theme['success']};
            color: white;
            border: none;
            border-radius: 4px;
            padding: 10px 20px;
            font-weight: bold;
        """)
        
        self.pause_button = QPushButton("Pause")
        self.pause_button.clicked.connect(self.pauseTimer)
        self.pause_button.setEnabled(False)
        self.pause_button.setStyleSheet(f"""
            background-color: {theme['warning']};
            color: white;
            border: none;
            border-radius: 4px;
            padding: 10px 20px;
            font-weight: bold;
        """)
        
        self.skip_button = QPushButton("Skip")
        self.skip_button.clicked.connect(self.skipSession)
        self.skip_button.setStyleSheet(f"""
            background-color: {theme['info']};
            color: white;
            border: none;
            border-radius: 4px;
            padding: 10px 20px;
            font-weight: bold;
        """)
        
        buttons_layout.addWidget(self.start_button)
        buttons_layout.addWidget(self.pause_button)
        buttons_layout.addWidget(self.skip_button)
        
        layout.addLayout(buttons_layout)
        
        # Close button
        close_button = QPushButton("Close")
        close_button.clicked.connect(self.close)
        layout.addWidget(close_button)
    
    def updateDisplay(self):
        """Update the timer display and state label."""
        minutes = self.time_left // 60
        seconds = self.time_left % 60
        self.time_display.setText(f"{minutes:02d}:{seconds:02d}")
        
        if self.current_state == self.WORK:
            self.state_label.setText("Work Session")
            self.state_label.setStyleSheet("font-size: 16px; font-weight: bold; color: #e74c3c;")
            self.progress_bar.setMaximum(self.work_minutes * 60)
        elif self.current_state == self.SHORT_BREAK:
            self.state_label.setText("Short Break")
            self.state_label.setStyleSheet("font-size: 16px; font-weight: bold; color: #2ecc71;")
            self.progress_bar.setMaximum(self.short_break_minutes * 60)
        else:  # LONG_BREAK
            self.state_label.setText("Long Break")
            self.state_label.setStyleSheet("font-size: 16px; font-weight: bold; color: #3498db;")
            self.progress_bar.setMaximum(self.long_break_minutes * 60)
        
        self.progress_bar.setValue(self.time_left)
        self.cycle_label.setText(f"Cycle {self.current_cycle}/{self.cycles_before_long_break}")
    
    def startTimer(self):
        """Start the timer."""
        self.timer_running = True
        self.timer.start(1000)  # 1 second intervals
        self.start_button.setEnabled(False)
        self.pause_button.setEnabled(True)
    
    def pauseTimer(self):
        """Pause the timer."""
        self.timer_running = False
        self.timer.stop()
        self.start_button.setEnabled(True)
        self.pause_button.setEnabled(False)
    
    def updateTimer(self):
        """Update the timer every second."""
        if self.time_left > 0:
            self.time_left -= 1
            self.updateDisplay()
        else:
            self.timer.stop()
            self.sessionCompleted()
    
    def sessionCompleted(self):
        """Handle completion of current session."""
        self.timer_running = False
        
        # Record completed work session
        if self.current_state == self.WORK and self.task_id:
            TaskModel.add_pomodoro_session(self.task_id, self.work_minutes)
        
        # Show notification
        if self.current_state == self.WORK:
            QMessageBox.information(self, "Pomodoro", "Work session completed! Take a break!")
        else:
            QMessageBox.information(self, "Pomodoro", "Break completed! Back to work!")
        
        # Move to next state
        if self.current_state == self.WORK:
            # After work, decide which break to take
            if self.current_cycle % self.cycles_before_long_break == 0:
                self.current_state = self.LONG_BREAK
                self.time_left = self.long_break_minutes * 60
            else:
                self.current_state = self.SHORT_BREAK
                self.time_left = self.short_break_minutes * 60
        else:
            # After any break, go back to work and increment cycle if needed
            if self.current_state == self.LONG_BREAK:
                self.current_cycle = 1
            else:  # SHORT_BREAK
                self.current_cycle += 1
            
            self.current_state = self.WORK
            self.time_left = self.work_minutes * 60
        
        self.updateDisplay()
        self.start_button.setEnabled(True)
        self.pause_button.setEnabled(False)
    
    def skipSession(self):
        """Skip the current session."""
        self.timer.stop()
        self.sessionCompleted()
    
    def closeEvent(self, event):
        """Handle window close event."""
        if self.timer_running:
            confirm = QMessageBox.question(
                self, "Confirm Close", 
                "Timer is still running. Are you sure you want to close?",
                QMessageBox.Yes | QMessageBox.No,
                QMessageBox.No
            )
            
            if confirm == QMessageBox.Yes:
                self.timer.stop()
                event.accept()
            else:
                event.ignore()
        else:
            event.accept()


class CalendarWidget(QWidget):
    """Widget for calendar view of tasks."""
    
    taskSelected = Signal(int)  # Signal when a task is selected
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.initUI()
        self.tasks = []
        self.date_tasks = {}  # Map dates to task IDs
    
    def initUI(self):
        theme = ThemeManager.get_theme()
        
        layout = QVBoxLayout(self)
        layout.setSpacing(10)
        
        # Calendar widget
        self.calendar = QCalendarWidget()
        self.calendar.setGridVisible(True)
        self.calendar.setVerticalHeaderFormat(QCalendarWidget.NoVerticalHeader)
        
        # Customize calendar appearance
        self.calendar.setStyleSheet(f"""
            QCalendarWidget QWidget {{
                alternate-background-color: {theme['bg_tertiary']};
            }}
            QCalendarWidget QAbstractItemView:enabled {{
                background-color: {theme['bg_secondary']};
                color: {theme['text_primary']};
            }}
            QCalendarWidget QAbstractItemView:disabled {{
                color: {theme['text_secondary']};
            }}
            QCalendarWidget QAbstractItemView:selected {{
                background-color: {theme['accent']};
                color: white;
            }}
        """)
        
        self.calendar.selectionChanged.connect(self.dateSelected)
        layout.addWidget(self.calendar)
        
        # Tasks for selected date
        task_group = QGroupBox("Tasks for Selected Date")
        task_layout = QVBoxLayout(task_group)
        
        self.task_list = QListWidget()
        self.task_list.itemDoubleClicked.connect(self.taskClicked)
        task_layout.addWidget(self.task_list)
        
        layout.addWidget(task_group)
    
    def loadTasks(self, tasks):
        """Load tasks and highlight dates with tasks."""
        self.tasks = tasks
        self.date_tasks = {}
        
        # Group tasks by date
        for task in tasks:
            if task[5]:  # Has due date
                due_date = QDate.fromString(task[5], Qt.ISODate)
                if due_date not in self.date_tasks:
                    self.date_tasks[due_date] = []
                self.date_tasks[due_date].append(task)
        
        # Update calendar
        self.calendar.updateCells()
        
        # Update task list for current selected date
        self.dateSelected()
    
    def dateSelected(self):
        """Handle date selection in calendar."""
        self.task_list.clear()
        selected_date = self.calendar.selectedDate()
        
        if selected_date in self.date_tasks:
            for task in self.date_tasks[selected_date]:
                item = QListWidgetItem()
                
                status_emoji = ""
                if task[7]:  # completed
                    status_emoji = "✓ "
                elif selected_date < QDate.currentDate():
                    status_emoji = "⚠ "
                
                # Priority indicators
                priority_indicators = ["", "🔵", "🟠", "🔴", "⭐"]
                
                item.setText(f"{status_emoji}{priority_indicators[task[4]]} {task[2]}")
                item.setData(Qt.UserRole, task[0])  # Store task ID
                
                # Set text color based on completion status
                theme = ThemeManager.get_theme()
                if task[7]:  # completed
                    item.setForeground(QColor(theme['text_secondary']))
                elif selected_date < QDate.currentDate():
                    item.setForeground(QColor(theme['error']))
                
                self.task_list.addItem(item)
    
    def taskClicked(self, item):
        """Handle task selection."""
        task_id = item.data(Qt.UserRole)
        self.taskSelected.emit(task_id)
    
    def paintCell(self, painter, rect, date):
        """Custom paint method for calendar cells to highlight dates with tasks."""
        # Check if date has tasks
        if date in self.date_tasks:
            # Count completed vs total tasks
            tasks = self.date_tasks[date]
            total = len(tasks)
            completed = sum(1 for task in tasks if task[7])
            
            # Paint indicator based on task status
            theme = ThemeManager.get_theme()
            
            # Use different colors based on completion ratio
            if completed == total:
                # All tasks completed
                color = QColor(theme['success'])
            elif date < QDate.currentDate() and completed < total:
                # Overdue tasks
                color = QColor(theme['error'])
            elif date == QDate.currentDate() and completed < total:
                # Today's tasks
                color = QColor(theme['warning'])
            else:
                # Future tasks
                color = QColor(theme['accent'])
            
            painter.save()
            
            # Draw a dot in the top-right corner
            dot_size = min(rect.width(), rect.height()) * 0.15
            painter.setPen(Qt.NoPen)
            painter.setBrush(color)
            painter.drawEllipse(
                rect.right() - dot_size * 1.5, 
                rect.top() + dot_size * 0.5,
                dot_size, dot_size
            )
            
            # Draw task count if more than one
            if total > 1:
                painter.setPen(QColor(theme['text_primary']))
                painter.setFont(QFont(painter.font().family(), 7))
                text_rect = QRect(
                    rect.right() - dot_size * 4,
                    rect.bottom() - dot_size * 2,
                    dot_size * 3,
                    dot_size * 1.5
                )
                painter.drawText(text_rect, Qt.AlignCenter, f"{completed}/{total}")
            
            painter.restore()


class StatisticsWidget(QWidget):
    """Widget for displaying task statistics."""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.initUI()
    
    def initUI(self):
        theme = ThemeManager.get_theme()
        
        layout = QVBoxLayout(self)
        layout.setSpacing(20)
        
        # Summary statistics
        summary_group = QGroupBox("Task Summary")
        summary_layout = QHBoxLayout(summary_group)
        
        # Total tasks
        self.total_label = QLabel("0")
        self.total_label.setStyleSheet("font-size: 36px; font-weight: bold;")
        self.total_label.setAlignment(Qt.AlignCenter)
        
        total_widget = QWidget()
        total_layout = QVBoxLayout(total_widget)
        total_layout.addWidget(self.total_label)
        total_layout.addWidget(QLabel("Total Tasks"))
        total_layout.setAlignment(Qt.AlignCenter)
        
        # Completed tasks
        self.completed_label = QLabel("0")
        self.completed_label.setStyleSheet(f"font-size: 36px; font-weight: bold; color: {theme['success']};")
        self.completed_label.setAlignment(Qt.AlignCenter)
        
        completed_widget = QWidget()
        completed_layout = QVBoxLayout(completed_widget)
        completed_layout.addWidget(self.completed_label)
        completed_layout.addWidget(QLabel("Completed"))
        completed_layout.setAlignment(Qt.AlignCenter)
        
        # Pending tasks
        self.pending_label = QLabel("0")
        self.pending_label.setStyleSheet(f"font-size: 36px; font-weight: bold; color: {theme['warning']};")
        self.pending_label.setAlignment(Qt.AlignCenter)
        
        pending_widget = QWidget()
        pending_layout = QVBoxLayout(pending_widget)
        pending_layout.addWidget(self.pending_label)
        pending_layout.addWidget(QLabel("Pending"))
        pending_layout.setAlignment(Qt.AlignCenter)
        
        # Overdue tasks
        self.overdue_label = QLabel("0")
        self.overdue_label.setStyleSheet(f"font-size: 36px; font-weight: bold; color: {theme['error']};")
        self.overdue_label.setAlignment(Qt.AlignCenter)
        
        overdue_widget = QWidget()
        overdue_layout = QVBoxLayout(overdue_widget)
        overdue_layout.addWidget(self.overdue_label)
        overdue_layout.addWidget(QLabel("Overdue"))
        overdue_layout.setAlignment(Qt.AlignCenter)
        
        summary_layout.addWidget(total_widget)
        summary_layout.addWidget(completed_widget)
        summary_layout.addWidget(pending_widget)
        summary_layout.addWidget(overdue_widget)
        
        layout.addWidget(summary_group)
        
        # Charts tab widget
        charts_tabs = QTabWidget()
        
        # Category distribution chart
        category_tab = QWidget()
        category_layout = QVBoxLayout(category_tab)
        
        self.category_chart_view = QChartView()
        self.category_chart_view.setRenderHint(QPainter.Antialiasing)
        category_layout.addWidget(self.category_chart_view)
        
        charts_tabs.addTab(category_tab, "By Category")
        
        # Priority distribution chart
        priority_tab = QWidget()
        priority_layout = QVBoxLayout(priority_tab)
        
        self.priority_chart_view = QChartView()
        self.priority_chart_view.setRenderHint(QPainter.Antialiasing)
        priority_layout.addWidget(self.priority_chart_view)
        
        charts_tabs.addTab(priority_tab, "By Priority")
        
        # Status distribution chart
        status_tab = QWidget()
        status_layout = QVBoxLayout(status_tab)
        
        self.status_chart_view = QChartView()
        self.status_chart_view.setRenderHint(QPainter.Antialiasing)
        status_layout.addWidget(self.status_chart_view)
        
        charts_tabs.addTab(status_tab, "By Status")
        
        # Completion timeline chart
        timeline_tab = QWidget()
        timeline_layout = QVBoxLayout(timeline_tab)
        
        self.timeline_chart_view = QChartView()
        self.timeline_chart_view.setRenderHint(QPainter.Antialiasing)
        timeline_layout.addWidget(self.timeline_chart_view)
        
        charts_tabs.addTab(timeline_tab, "Completion Timeline")
        
        layout.addWidget(charts_tabs)
    
    def updateStats(self, tasks):
        """Update statistics display with current tasks."""
        # Count total, completed, pending and overdue tasks
        total = len(tasks)
        completed = sum(1 for task in tasks if task[7])
        pending = total - completed
        
        # Count overdue tasks
        today = QDate.currentDate()
        overdue = 0
        for task in tasks:
            if not task[7] and task[5]:  # Not completed and has due date
                due_date = QDate.fromString(task[5], Qt.ISODate)
                if due_date < today:
                    overdue += 1
        
        # Update summary labels
        self.total_label.setText(str(total))
        self.completed_label.setText(str(completed))
        self.pending_label.setText(str(pending))
        self.overdue_label.setText(str(overdue))
        
        # Update category chart
        self.updateCategoryChart()
        
        # Update priority chart
        self.updatePriorityChart()
        
        # Update status chart
        self.updateStatusChart()
        
        # Update timeline chart
        self.updateTimelineChart()
    
    def updateCategoryChart(self):
        """Update the category distribution chart."""
        theme = ThemeManager.get_theme()
        
        # Get data
        category_stats = TaskModel.get_stats_by_category()
        
        # Create pie series
        series = QPieSeries()
        
        for cat in category_stats:
            name = cat[0] or "Uncategorized"
            color = cat[1] or "#cccccc"
            total = cat[2]
            completed = cat[3]
            
            if total > 0:
                slice = series.append(f"{name} ({completed}/{total})", total)
                slice.setBrush(QColor(color))
                slice.setLabelVisible(True)
        
        # Create chart
        chart = QChart()
        chart.addSeries(series)
        chart.setTitle("Tasks by Category")
        chart.setTheme(QChart.ChartThemeDark if theme == ThemeManager.DARK_THEME else QChart.ChartThemeLight)
        chart.legend().setVisible(True)
        chart.legend().setAlignment(Qt.AlignBottom)
        
        # Set the chart
        self.category_chart_view.setChart(chart)
    
    def updatePriorityChart(self):
        """Update the priority distribution chart."""
        theme = ThemeManager.get_theme()
        
        # Get data
        priority_stats = TaskModel.get_stats_by_priority()
        
        # Create bar series
        bar_set = QBarSet("Tasks")
        
        priority_names = ["None", "Low", "Medium", "High", "Critical"]
        priority_colors = ["#95a5a6", "#3498db", "#f39c12", "#e74c3c", "#8e44ad"]
        
        categories = []
        values = []
        
        for stat in priority_stats:
            priority = stat[0]
            if priority < len(priority_names):
                categories.append(priority_names[priority])
                values.append(stat[1])  # total
        
        # Add values to bar set
        for value in values:
            bar_set.append(value)
        
        series = QBarSeries()
        series.append(bar_set)
        
        # Create chart
        chart = QChart()
        chart.addSeries(series)
        chart.setTitle("Tasks by Priority")
        chart.setTheme(QChart.ChartThemeDark if theme == ThemeManager.DARK_THEME else QChart.ChartThemeLight)
        chart.legend().setVisible(False)
        
        # Set up axes
        axis_x = QBarCategoryAxis()
        axis_x.append(categories)
        chart.addAxis(axis_x, Qt.AlignBottom)
        series.attachAxis(axis_x)
        
        axis_y = QValueAxis()
        axis_y.setRange(0, max(values) * 1.1 if values else 10)
        axis_y.setLabelFormat("%d")
        axis_y.setTickCount(5)
        chart.addAxis(axis_y, Qt.AlignLeft)
        series.attachAxis(axis_y)
        
        # Set the chart
        self.priority_chart_view.setChart(chart)
    
    def updateStatusChart(self):
        """Update the status distribution chart."""
        theme = ThemeManager.get_theme()
        
        # Get data
        status_stats = TaskModel.get_stats_by_status()
        
        # Create pie series
        series = QPieSeries()
        
        status_colors = {
            "todo": "#3498db",
            "in_progress": "#f39c12",
            "review": "#9b59b6",
            "done": "#2ecc71"
        }
        
        for stat in status_stats:
            status = stat[0]
            total = stat[1]
            
            display_status = status.replace("_", " ").title()
            
            if total > 0:
                slice = series.append(f"{display_status} ({total})", total)
                slice.setBrush(QColor(status_colors.get(status, "#cccccc")))
                slice.setLabelVisible(True)
        
        # Create chart
        chart = QChart()
        chart.addSeries(series)
        chart.setTitle("Tasks by Status")
        chart.setTheme(QChart.ChartThemeDark if theme == ThemeManager.DARK_THEME else QChart.ChartThemeLight)
        chart.legend().setVisible(True)
        chart.legend().setAlignment(Qt.AlignBottom)
        
        # Set the chart
        self.status_chart_view.setChart(chart)
    
    def updateTimelineChart(self):
        """Update the completion timeline chart."""
        theme = ThemeManager.get_theme()
        
        # Get data for the last 30 days
        completion_stats = TaskModel.get_stats_by_time()
        
        # Create bar series
        bar_set = QBarSet("Completed Tasks")
        bar_set.setColor(QColor(theme['success']))
        
        # Prepare data
        dates = []
        counts = []
        
        # Fill in missing dates with zeros
        today = datetime.date.today()
        date_dict = {stat[0][:10]: stat[1] for stat in completion_stats}
        
        for i in range(30):
            date = today - datetime.timedelta(days=29-i)
            date_str = date.isoformat()
            dates.append(date.strftime("%m/%d"))
            counts.append(date_dict.get(date_str, 0))
        
        # Add values to bar set
        for count in counts:
            bar_set.append(count)
        
        series = QBarSeries()
        series.append(bar_set)
        
        # Create chart
        chart = QChart()
        chart.addSeries(series)
        chart.setTitle("Task Completion (Last 30 Days)")
        chart.setTheme(QChart.ChartThemeDark if theme == ThemeManager.DARK_THEME else QChart.ChartThemeLight)
        chart.legend().setVisible(False)
        
        # Set up axes
        axis_x = QBarCategoryAxis()
        axis_x.append(dates)
        chart.addAxis(axis_x, Qt.AlignBottom)
        series.attachAxis(axis_x)
        
        axis_y = QValueAxis()
        max_count = max(counts) if counts else 0
        axis_y.setRange(0, max_count + 1)
        axis_y.setLabelFormat("%d")
        axis_y.setTickCount(max(2, min(6, max_count + 1)))
        chart.addAxis(axis_y, Qt.AlignLeft)
        series.attachAxis(axis_y)
        
        # Set the chart
        self.timeline_chart_view.setChart(chart)


class KanbanColumn(QWidget):
    """Column widget for the Kanban board view."""
    
    taskMoved = Signal(int, str)  # task_id, new_status
    
    def __init__(self, title, status, parent=None):
        super().__init__(parent)
        self.title = title
        self.status = status
        self.tasks = []
        self.initUI()
        
        # Enable drop
        self.setAcceptDrops(True)
    
    def initUI(self):
        theme = ThemeManager.get_theme()
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(8, 8, 8, 8)
        layout.setSpacing(10)
        
        # Column header
        header = QLabel(self.title)
        header.setStyleSheet(f"""
            font-weight: bold;
            font-size: 14px;
            color: {theme['text_primary']};
            padding: 8px;
            background-color: {theme['bg_tertiary']};
            border-radius: 4px;
        """)
        header.setAlignment
