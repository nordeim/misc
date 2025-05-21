$ python todo-2b.py
Error starting application: name 'QGroupBox' is not defined
Traceback (most recent call last):
  File "H:\project\todo-2b.py", line 4697, in main
    window = MainWindow()
  File "H:\project\todo-2b.py", line 3985, in __init__
    self.initUI()
    ~~~~~~~~~~~^^
  File "H:\project\todo-2b.py", line 4128, in initUI
    self.calendar_view = CalendarWidget()
                         ~~~~~~~~~~~~~~^^
  File "H:\project\todo-2b.py", line 3287, in __init__
    self.initUI()
    ~~~~~~~~~~~^^
  File "H:\project\todo-2b.py", line 3324, in initUI
    task_group = QGroupBox("Tasks for Selected Date")
                 ^^^^^^^^^
NameError: name 'QGroupBox' is not defined
