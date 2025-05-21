# Modern Python TODO Application

I'll create a feature-rich, modern TODO application using PySide6 for the GUI and SQLite for data persistence.

```python
# main.py
import sys
from PySide6.QtWidgets import QApplication
from ui.main_window import MainWindow

def main():
    app = QApplication(sys.argv)
    app.setApplicationName("TaskFlow")
    
    window = MainWindow()
    window.show()
    
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
```

Would you like me to explain or break down the code?
