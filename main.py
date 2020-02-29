from appJar import gui
from tkinter import filedialog
from tkinter import *
import os


# calls when toolbar button is clicked
def action(btn):
    # todo actions
    return {
        "Открыть": openfile(),
        "Сохранить": 1,
        "Удаление артефактов": 2,
        "Выделение": 3,
        "Удаление": 4,
        "Корреляционный анализ произвольных пар сигналов": 5,
        "Фурье-спектрограммы": 6,
        "Вейвлетограммы": 7,
        "О программе": 8,
        "Авторы": 9
    }.get(btn)


# calls when open button is clicked
def openfile():
    # create a file dialog object
    root = Tk()
    root.withdraw()
    filetypes = [
        ("all files", "*.*"),
        ("dat files", "*.dat"),
        ("txt files", "*.txt"),
        ("wav files", "*.wav"),
        ("mp3 files", "*.mp3"),
        ("avi files", "*.avi"),
    ]

    # open chosen file
    file = filedialog.askopenfile(initialdir=(os.getcwd()), title="Выберите файл",
                                  filetypes=filetypes)
    root.update()

    if file:
        for line in file:
            print(line)


def addtoolbar():
    # creating a file menu
    app.addMenuList("Файл", ["Открыть", "Сохранить"], action)

    # creating a filter menu
    app.createMenu("Фильтрация")
    app.addMenuItem("Фильтрация", "Удаление артефактов")
    app.addSubMenu("Фильтрация", "Полиномиальные тренды")
    app.addMenuItem("Полиномиальные тренды", "Выделение")
    app.addMenuItem("Полиномиальные тренды", "Удаление")

    # creating an analysis menu
    app.createMenu("Анализ")
    app.addMenuItem("Анализ", "Частотный", action)
    app.addSubMenu("Анализ", "Взаимный")
    app.addSubMenu("Анализ", "Частотно-временной")
    app.addMenuItem("Взаимный", "Корреляционный анализ произвольных пар сигналов", action)
    app.addMenuItem("Частотно-временной", "Фурье-спектрограммы", action)
    app.addMenuItem("Частотно-временной", "Вейвлетограммы", action)

    app.addMenuList("Настройки", ["Открыть", "Сохранить"], action)  # todo window configuration settings
    app.addMenuList("Справка", ["О программе", "Авторы"], action)  # todo about windows


if __name__ == '__main__':
    # gui variable init
    app = gui()

    # set gui configuration
    app.setTitle("DSP-сцт(1)-MyshalovRodion-ZaytsevVeniamin-TunevaTatyana")
    app.setSize(900, 500)

    # creating a toolbar
    addtoolbar()

    app.go()
