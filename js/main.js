(function() {
    let input = document.querySelector('.add-todo input'), // Поле для ввода
        checkAll = document.querySelector('.check-all'), // Выделяет все задачи
        deleteComplete = document.querySelector('.delete-complete'),
        taskCount = document.querySelector('.count strong'),
        filter = document.querySelector('.filters'),
        todoList = document.querySelector('.todo-list'); // выводимое поле списка задач

    let taskArr = []; // Массив для задач

    /*
        Вписываем задание в поле для ввода, сохраняем в локальном хранилище
        и по клику на клавишу 'Enter' выводим в поле 'TODO LIST'
    */
    input.addEventListener(
        'keydown',
        (addTask = e => {
            if (e.key === 'Enter') {
                let newTask = input.value.trim();
                if (newTask !== '') {
                    taskArr.push({
                        name: newTask,
                        checked: false
                    });
                    localStorage.setItem('TODO', JSON.stringify(taskArr));
                }
                input.value = '';
                input.focus();
                loadList();
            }
        })
    );

    // Функция вывода в 'TODO LIST'
    function loadList() {
        let out = '';
        taskArr.forEach((item, index) => {
            out += `<li class="todo-item ${item.checked ? 'completed' : ''}">
                        <i class="far ${
                            item.checked ? 'fa-check-circle' : 'fa-circle'
                        } check" data-id="${index}"></i>
                        <p class="text ${
                            item.checked ? 'line-through' : ''
                        }" data-id="${index}">${item.name}</p>
                        <i class="far fa-trash-alt delete" data-id="${index}"></i>
                        <input class="edit" value="${item.name}">
                    </li>`;
        });
        todoList.innerHTML = out;
        taskCount.innerText = taskArr.length;
    }

    /* 
        Загружаем данные из массива при перезагрузке страницы
    */
    if (localStorage.getItem('TODO')) {
        taskArr = JSON.parse(localStorage.getItem('TODO'));
        loadList();
    }

    /*  
        Вешаем клик на 'TODO LIST'. Вычисляем delID задачи и удаляем
        её из 'TODO LIST' и из локального хранилища
    */
    todoList.addEventListener(
        'click',
        (deleteTask = e => {
            if (e.target.classList.contains('delete')) {
                let delID = e.target.dataset.id;
                taskArr.splice(delID, 1); // Удаляем задачу из массива
                localStorage.setItem('TODO', JSON.stringify(taskArr));
                loadList();
            }
        })
    );

    /*  
        Вешаем клик на TODO LIST. Вычисляем checkID задачи и меняем
        её состояние в TODO LIST и перезаписываем локальное хранилище
    */
    todoList.addEventListener(
        'click',
        (changeTask = e => {
            if (e.target.classList.contains('check')) {
                let checkID = e.target.dataset.id;
                taskArr[checkID].checked = !taskArr[checkID].checked; // TRUE или FALSE
                localStorage.setItem('TODO', JSON.stringify(taskArr));
                loadList();
            }
        })
    );

    /*
        Вешаем даблклик на TODO LIST. Вычисляем textID задачи и 
        перезаписываем локальное хранилище
    */
    todoList.addEventListener('dblclick', editTask);

    function editTask(e) {
        if (e.target.nodeName == 'P') {
            let textID = e.target.dataset.id;
            e.target.parentElement.classList.add('editing'); // Добавляем класс тегу 'LI'
            let editInput = e.target.parentElement.lastElementChild;
            editInput.focus(); // Устанавливаем фокус на открывшемся поле 'INPUT'
            editInput.selectionStart = editInput.value.length; // Фокус будет в конце текста
            // Вешаем событие нажатия клавиш на поле редактирования 'INPUT'
            editInput.addEventListener('keydown', function(event) {
                // Если нажата клавиша 'Enter' и поле после редактирования не пустое
                if ((event.key === 'Enter') & (editInput.value !== '')) {
                    let newName = editInput.value; // В поле будет текст нашей задачи
                    taskArr[textID].name = newName; // Меняем текст в массиве
                    e.target.parentElement.classList.remove('editing'); // Удаляем класс с тега 'LI'
                    localStorage.setItem('TODO', JSON.stringify(taskArr));
                    loadList();
                }
                // Если не хотим ничего менять, то при нажатии клавиши 'Escape', сбрасывается любое редактирование текста
                else if (event.key === 'Escape') {
                    e.target.parentElement.classList.remove('editing');
                    localStorage.setItem('TODO', JSON.stringify(taskArr));
                    loadList();
                }
            });
        }
    }

    /*
        Вешаем событие на кнопку выделяя все задачи из массива как выполненные
    */
    checkAll.addEventListener('change', function(e) {
        if (e.target.checked) {
            taskArr.forEach(item => {
                item.checked = true;
                checkAll.classList.remove('check-all');
                checkAll.classList.add('check');
                // checkAll.style. = 'none';
            });
        } else {
            taskArr.forEach(item => {
                item.checked = false;
                checkAll.classList.remove('check');
                checkAll.classList.add('check-all');
                // checkAll.style.color = '';
                // checkAll.style.transform = '';
            });
        }
        localStorage.setItem('TODO', JSON.stringify(taskArr));
        loadList();
    });

    /*
        Вешаем событие на кнопку удаляя все выделенные задачи
    */
    deleteComplete.addEventListener('click', function(e) {
        for (let i = taskArr.length - 1; i >= 0; i--) {
            if (taskArr[i].checked === true) {
                taskArr.splice(i, 1);
            }
        }
        localStorage.setItem('TODO', JSON.stringify(taskArr));
        loadList();
    });

    /* 
        Вешаем событие клик на список 'FILTER'
    */
    filter.addEventListener('click', function(e) {
        // При клике по тегу 'A' списка 'FILTER'
        if (e.target.tagName == 'A') {
            let tagA = document.querySelectorAll('.filters a');
            // Для всех тегов удаляется класс 'selected'
            tagA.forEach(item => {
                item.classList.remove('selected');
            });
            // При выборе определенного тега, присваиваем ему класс 'selected'
            e.target.classList.add('selected');
            if (e.target.id == 'active') {
                showActive(); // Если тег содержит 'ID=ACTIVE', показывать активные задачи
            } else if (e.target.id == 'completed') {
                showComplete(); // Если тег содержит 'ID=COMPLETED', показывать выполненные задачи
            } else {
                loadList(); // По умолчанию показывать все задачи
            }
        }
    });

    // Функция показа активных задач (не отмеченных)
    function showActive() {
        let out = '';
        let count = 0;
        taskArr.forEach((item, index) => {
            if (!item.checked) {
                out += `<li class="todo-item">
                            <i class="far fa-circle check" data-id="${index}"></i>
                            <p class="text" data-id="${index}">${item.name}</p>
                            <i class="far fa-trash-alt delete" data-id="${index}"></i>
                            <input class="edit" value="${item.name}">
                        </li>`;
                count++;
            }
        });
        todoList.innerHTML = out;
        taskCount.innerText = count;
    }

    // Функция показа выполненных задач (отмеченных)
    function showComplete() {
        let output = '';
        let count = 0;
        taskArr.forEach((item, index) => {
            if (item.checked) {
                output += `<li class="todo-item completed">
                                <i class="far fa-check-circle check" data-id="${index}"></i>
                                <p class="text line-through" data-id="${index}">${item.name}</p>
                                <i class="far fa-trash-alt delete" data-id="${index}"></i>
                                <input class="edit" value="${item.name}">
                            </li>`;
                count++;
            }
        });
        todoList.innerHTML = output;
        taskCount.innerText = count;
    }
})(window);
