"use strict";

// подключаем либу для работы с сокетами
let WebSocketServer = require('ws');

// получаем свободный для работы порт
let portNumber = process.env.PORT || 5000;

// запускаем сервер
let  webSocketServer = new WebSocketServer.Server({
    port: portNumber
});

// выводим информацию об успешном запуске сервера
console.log("Server port:" + portNumber);
console.log("------------------------------------");

/////////////////////////////////////////

// объект для хранения клиентов
let clients = {};
// счётчик для генерации имени нового клиента
let nameCounter = 1;

/////////////////////////////////////////

/**
 * функция для отправки сообщения абсолютно всем клиентам
 * @param message - текст сообщения
 */
function sendAll(message) {
    // пробегаемся по всем клиентам
    for (let key in clients) {
        // пытаемся отправить сообщение определённому клиенту
        try {
            clients[key].send(message);
        } catch (err) {
            // sending error
        }
    }
}

/**
 * функция для отправки сообщения одному клиенту
 * @param key - имя клиента
 * @param message - текст сообщения
 */
function sendOne(key, message) {
    // пытаемся отправить сообщение определённому клиенту
    try {
        clients[key].send(message);
    } catch (err) {
        // sending error
    }
}

/////////////////////////////////////////

// массив комнат
let rooms = [];
// счётчик для генерации имени комнаты
let room_index = 0;

/**
 * функция для создания новой комнаты
 * @param id - имя первого игрока в комнате
 * @param roomName - имя комнаты
 */
function createRoom(id, roomName) {
    /**
     * объект с информацией о комнате (имя комнаты, имя первого игрока, имя второго игрока, объект для управления игрой внутри комнаты)
     * @type {{roomName: string, player_first: *, player_second: undefined, game: Game}}
     */
    const obj = {
        roomName: roomName + "_" + room_index,
        player_first: id,
        player_second: undefined,
        game: new Game(),
    };
    // добавляем объект в массив комнат
    rooms.push(obj);
}

/**
 * функция для присоединения к комнате второго игрока
 * @param id - имя второго игрока
 * @param roomName - имя комнаты
 */
function joinRoom(id, roomName) {
    // ищем комнату с данным именем в массиве комнат
    // пробегаемся по комнатам
    for(let i = 0; i < rooms.length; i++) {
        // берём комнату
        const room = rooms[i];
        // если комната найдена
        if(room.roomName === roomName) {
            // задаём в комнате второго игрока
            room.player_second = id;
            /////
            // получаем имена двух игроков в комнате
            const id_1 = room.player_first;
            const id_2 = room.player_second;
            ////
            // формируем сообщение о том, что комната заполнена и можно начать играть
            const message = JSON.stringify({
                play: "P_START"
            });
            ///
            // отправляем сообщение о начале игры обоим игрокам в комнате
            sendOne(id_1, message);
            sendOne(id_2, message);
            ///
            // инициализируем имена игроков в игре и запускаем игру
            room.game.initPlayers(id_1, id_2);
        }
    }
}

/**
 * функция для передачи действия игрока в определённую комнату
 * @param id - имя игрока
 * @param value - действие игрока
 */
function makeAction(id, value) {
    // бежим по всем комнатам
    rooms.forEach((room) => {
       // если игрок находится в данной комнате
       if(room.game.id_1 === id || room.game.id_2 === id) {
           // передаём действия игрока в найденную комнату
           room.game.makeGameAction(id, value);
       }
    });
}

/**
 * функция для удаления комнаты, в которой находится определённый пользователь
 * @param id - имя пользователя
 */
function deleteRoom(id) {
    // ищем номер комнаты для её удаления
    // find room for deleting
    let number = -1;
    // бежим по всем комнатам
    for(let i = 0; i < rooms.length; i++) {
        // берём комнату
        const room = rooms[i];
        // если в комнате находится данный пользователь
        if(room.player_first === id || room.player_second === id) {
            // сохраняем номер комнаты
            number = i;
            // выходим из цикла
            break;
        }
    }

    // если номер комнаты найден
    if(number !== -1) {
        // формируем сообщение об удалении комнаты
        const message = JSON.stringify({
           delete: "D_R_OK"
        });
        // берём найденную комнату
        const room = rooms[number];
        // отправляем сообщение игрокам комнаты, что данная комната удалена
        sendOne(room.player_first, message);
        sendOne(room.player_second, message);
        // удаляем комнату из массива
        rooms.splice(number, 1);
    }
}

/////////////////////////////////////////

// описание игровых констант

// максимальное значение счётчика (при превышении данного значения счётчик обнуляется)
const MAX_COUNT = 30;
// позиция по оси X, на которой создаются метеориты
const CREATE_ENEMY_POSITION = 700;
// позиция по оси X, при достижении которой метеориты удаляются
const DEAD_POSITION = 20;
// позиция по оси X, на которой создаются патроны
const CREATE_FIRE_POSITION = 150;
// скорость движения патронов
const FIRE_SPEED = 15;
// позиция по оси X, при достижении которой патроны удаляются
const FIRE_DELETE_POS = 650;

/**
 * класс для управления процессом игры
 */
class Game {
    constructor() {
        // вывод сообщения о создании экземпляра объекта
        console.log("create Game");
        // создание полей для хранения имён игроков
        this.id_1 = undefined;
        this.id_2 = undefined;
        // говорим, что игра ещё не началась
        this.gameStart = false;
        // объект с сущностями игры (включает два массива врагов, два массива патронов)
        this.mainObj = {
            game: true,
            e_1: [],
            e_2: [],
            b_1: [],
            b_2: [],
        };
        // скорость движения врагов (метеоритов)
        this.speed = 10;
        // обнуление счётчика
        this.count = 0;
        // говорим, что пока ни кто не проиграл
        this.gameOver = false;
    }

    // функция для выстрела первого игрока
    addFireP1() {
        // если на экране не слишком много пуль первого игрока
        if(this.mainObj.b_1.length < 3) {
            // добавляем пулю в массив пуль первого игрока
            this.mainObj.b_1.push({
                x: CREATE_FIRE_POSITION,
                y: this.mainObj.p1 * 80 + 110,
            });
        }
    }

    // функция для выстрела второго игрока
    addFireP2() {
        // если на экране не слишком много пуль второго игрока
        if(this.mainObj.b_2.length < 3) {
            // добавляем пулю в массив пуль второго игрока
            this.mainObj.b_2.push({
                x: CREATE_FIRE_POSITION,
                y: this.mainObj.p2 * 80 + 350,
            });
        }
    }

    /**
     * функция передачи игре действия пользователя
     * @param id - имя пользователя
     * @param value - действие
     */
    makeGameAction(id, value) {
        // если игра не закончена
        if(this.gameOver === false) {
            // если действие совершил первый игрок
            if (id === this.id_1) {
                if (value === "UP" && this.mainObj.p1 !== 0) this.mainObj.p1--;
                if (value === "DOWN" && this.mainObj.p1 !== 2) this.mainObj.p1++;
                if (value === "FIRE") this.addFireP1();
            }

            // если действие совершил второй игрок
            if (id === this.id_2) {
                if (value === "UP" && this.mainObj.p2 !== 0) this.mainObj.p2--;
                if (value === "DOWN" && this.mainObj.p2 !== 2) this.mainObj.p2++;
                if (value === "FIRE") this.addFireP2();
            }
        }
    }

    /**
     * получения флага начала игры (началась ли игра)
     * @returns {boolean}
     */
    getGameStart() {
        return this.gameStart;
    }

    /**
     * инициализация двух игроков комнаты и запуск игры
     * @param id_1
     * @param id_2
     */
    initPlayers(id_1, id_2) {
        // инициализация игроков
        this.id_1 = id_1;
        this.id_2 = id_2;
        // говорим, что игра началась
        this.gameStart = true;
        // задаём начальное положение игроков
        this.mainObj.p1 = 1;
        this.mainObj.p2 = 1;
    }

    // метод для отправки сообщения игроку
    static sendOne(key, message) {
        // пытаемся отправить сообщение игроку
        try {
            clients[key].send(message);
        } catch (err) {
            // sending error
        }
    }

    // метод для генерации линии метеоритов
    static getLine() {
        // выбираем случайное число: 0, 1, 2
        const r = parseInt(Math.random() * 1000) % 3;

        // в зависимости от значения случайного числа выдаём определённый массив

        // 1 - метеорит
        // 0 - пустое место

        if(r === 0) {
            return [0,1,1];
        }

        if(r === 1) {
            return [1,0,1];
        }

        if(r === 2) {
            return [1,1,0];
        }

        return null;
    }

    /**
     * метод для добавления линии метеоритов
     */
    addLine() {
        // получаем линию из метеоритов
        const lineFirst = Game.getLine();
        // пробегаемся по линии метеоритов
        lineFirst.forEach((value, i) => {
           // если значение 1, то это метеорит (если 0, то пустое место)
           if(value === 1) {
               // добавляем метеорит
               this.mainObj.e_1.push({
                   y: i * 80 + 110,
                   x: CREATE_ENEMY_POSITION,
               })
           }
        });

        // получаем линию метеоритов
        const lineSecond = Game.getLine();
        // пробегаемся по линии метеоритов
        lineSecond.forEach((value, i) => {
            // если значение 1, то это метеорит (если 0, то пустое пространство)
            if(value === 1) {
                // добавляем метеорит
                this.mainObj.e_2.push({
                    y: i * 80 + 350,
                    x: CREATE_ENEMY_POSITION + 80,
                })
            }
        });
    }

    // функция удаления метеоритов (удалить метеориты, которые залетели за определённую позицию)
    controlDead() {
        let buffer = null;

        buffer = [];
        // бежим по всем метеоритам
        this.mainObj.e_1.forEach((e) => {
           if(e.x <= DEAD_POSITION) {
               // kill
           } else {
               buffer.push(e);
           }
        });
        // перезаписываем массив метеоритов
        this.mainObj.e_1 = buffer;

        buffer = [];
        // бежим по всем метеоритам
        this.mainObj.e_2.forEach((e) => {
            if(e.x <= DEAD_POSITION) {
                // kill
            } else {
                buffer.push(e);
            }
        });
        // перезаписываем массив метеоритов
        this.mainObj.e_2 = buffer;
    }

    /**
     * метод для удаления патронов (удалить патроны, залетевшие за определённую позицию)
     */
    controlFireDelete() {
        let buffer = null;

        buffer = [];
        // бежим по всем патронам
        this.mainObj.b_1.forEach((b) => {
            // если патрон не залетел за запретную границу
            if(b.x < FIRE_DELETE_POS) {
                buffer.push(b);
            }
        });
        // перезаписываем массив патронов
        this.mainObj.b_1 = buffer;

        buffer = [];
        // бежим по всем патронам
        this.mainObj.b_2.forEach((b) => {
            // если патрон не залетел за запретную границу
            if(b.x < FIRE_DELETE_POS) {
                buffer.push(b);
            }
        });
        // перезаписываем массив патронов
        this.mainObj.b_2 = buffer;
    }

    /**
     * метод для проверки столкновения патронов и метеоритов
     */
    controlHitBallEnemy() {
        // пробегаемся по всем метеоритам
        this.mainObj.e_1.forEach((e) => {
            // пробегаемся по всем патронам
           this.mainObj.b_1.forEach((b) => {
               // если у метеорита и патрона совпадают координаты по оси Y
              if(e.y === b.y) {
                  // берём центры по оси X
                  const eX = e.x + 40;
                  const bX = b.x + 40;
                  // если расстояние между центрами меньше определённого значения
                  if(Math.abs(eX - bX) < 60) {
                      // если метеорит был в верхней части игрового поля
                      if(e.y < 350) {
                          // перекидываем его вниз
                          e.y += 240;
                      } else {
                          // перекидываем его вверх
                          e.y -= 240;
                      }
                  }
              }
           });

            this.mainObj.b_2.forEach((b) => {
                if(e.y === b.y) {
                    const eX = e.x + 40;
                    const bX = b.x + 40;
                    if(Math.abs(eX - bX) < 60) {
                        if(e.y < 350) {
                            e.y += 240;
                        } else {
                            e.y -= 240;
                        }
                    }
                }
            });
        });

        /////////////

        this.mainObj.e_2.forEach((e) => {
            this.mainObj.b_1.forEach((b) => {
                if(e.y === b.y) {
                    const eX = e.x + 40;
                    const bX = b.x + 40;
                    if(Math.abs(eX - bX) < 60) {
                        if(e.y < 350) {
                            e.y += 240;
                        } else {
                            e.y -= 240;
                        }
                    }
                }
            });

            this.mainObj.b_2.forEach((b) => {
                if(e.y === b.y) {
                    const eX = e.x + 40;
                    const bX = b.x + 40;
                    if(Math.abs(eX - bX) < 60) {
                        if(e.y < 350) {
                            e.y += 240;
                        } else {
                            e.y -= 240;
                        }
                    }
                }
            });
        });
    }

    /**
     * проверка столкновения героем и врагов
     */
    controlHittingHeroesAndEnemies() {
        // получаем середину обоих героев по оси X
        const middle_hero_x = 140;
        // переменная для хранения оси Y героя
        let heroY = undefined;
        // результат проверки
        let result = "NORMAL";
        /////////////////////////////

        // получаем положение первого игрока
        heroY = this.mainObj.p1 * 80 + 110;

        // бежим по массиву врагов
        this.mainObj.e_1.forEach((e) => {
            // если положения врага совпадает с положением игрока по оси Y
            if(e.y === heroY) {
                // берём середину врага по оси X
                const eX = e.x + 40;
                // если расстояние между игроком и врагом маленькое
                if (Math.abs(eX - middle_hero_x) < 60) {
                    // изменяем результат проверки
                    result = "HERO_1_DEAD";
                }
            }
        });

        this.mainObj.e_2.forEach((e) => {
            if(e.y === heroY) {
                const eX = e.x + 40;
                if (Math.abs(eX - middle_hero_x) < 60) {
                    result = "HERO_1_DEAD";
                }
            }
        });

        ////////////////////////////////////////

        // получаем положение второго игрока
        heroY = this.mainObj.p2 * 80 + 350;

        this.mainObj.e_1.forEach((e) => {
            if(e.y === heroY) {
                const eX = e.x + 40;
                if (Math.abs(eX - middle_hero_x) < 60) {
                    result = "HERO_2_DEAD";
                }
            }
        });

        this.mainObj.e_2.forEach((e) => {
            if(e.y === heroY) {
                const eX = e.x + 40;
                if (Math.abs(eX - middle_hero_x) < 60) {
                    result = "HERO_2_DEAD";
                }
            }
        });

        // если один из игроков столкнулся с врагом
        if(result !== "NORMAL") {
            // формируем сообщение об окончании игры
            const message = JSON.stringify({
               gameOver: result.toString(),
            });
            // говорим, что игра окончена
            this.gameOver = true;
            // отправляем сообщение игрокам об окончании игры
            Game.sendOne(this.id_1, message);
            Game.sendOne(this.id_2, message);
        }
    }

    /**
     * вызов всех игровых процессов
     */
    gameProcess() {
        // движение всех врагов (метеоритов)
        // move enemies
        this.mainObj.e_1.forEach((enemy) => { enemy.x -= this.speed; });
        this.mainObj.e_2.forEach((enemy) => { enemy.x -= this.speed; });

        // двжение всех патронов
        // move fire
        this.mainObj.b_1.forEach((b) => { b.x += FIRE_SPEED});
        this.mainObj.b_2.forEach((b) => { b.x += FIRE_SPEED});

        // проверка столкновений патронов и метеоритов
        this.controlHitBallEnemy();

        // inc count
        this.count++;
        // control count
        if(this.count >= MAX_COUNT) {
            // zero count
            this.count = 0;
            // create enemies line
            this.addLine();
        }

        // проверка столкновения игроков и врагов
        this.controlHittingHeroesAndEnemies();
        // удаление метеоритов, залетевших за границу
        this.controlDead();
        // удаление патронов, залетевших за границу
        this.controlFireDelete();
    }

    /**
     * метод для отправки данных клиентам и вызова игровых процессов
     */
    sendGameParamsToClients() {
        // если игра НЕ закончена
        if(this.gameOver === false) {
            // вызываем игровой процесс
            this.gameProcess();
        }
        // формируем сообщение для отправки
        const message = JSON.stringify(this.mainObj);
        //отправляем сообщение игрокам комнаты
        Game.sendOne(this.id_1, message);
        Game.sendOne(this.id_2, message);
    }
}

/////////////////////////////////////////

// при подключении нового клиента
webSocketServer.on("connection", function(ws) {
    // формируем имя клиента
    let id = "id_" + nameCounter;
    // увеличиваем счётчик клиентов
    nameCounter++;
    // сохраняем сокет клиента
    clients[id] = ws;
    // вывод информации о новом клиенте
    console.log("новое соединение " + id);

    // при получении сообщения от клиента
    ws.on("message", function(message) {
        // вывод полученного сообщения
        console.log("получено сообщение " + message + " от " + id);
        // если это сообщение для поддержания соединения
        if(message === "PING") {
            // выводим информацию, что это сообщение для поддержания соединения между клиентом и сервером
            console.log("PING MESSAGE");
        } else {
            // преобразуем сообщение от пользователя в объект
            const obj = JSON.parse(message);

            // если это запрос на создание комнаты
            if(obj.t === "r") {
                // получаем имя комнаты
                const roomName = obj.n.toString();
                // увеличиваем счётчик комнат
                room_index++;
                // создаём новую комнату
                createRoom(id, roomName);
                // отправляем сообщение клиенту, что комната успешно создана
                sendOne(id, JSON.stringify({
                    message: "R_OK",
                }));
            }

            // если это запрос на подключение к существующей комнате
            if(obj.t === "j") {
                // получаем имя комнаты
                const roomName = obj.n.toString();
                // добавляем клиента в комнату
                joinRoom(id, roomName);
            }

            // если это команда от клиента (движение или стрельба)
            if(obj.t === "c") {
                // получаем содержимое команды
                const value = obj.v.toString();
                // отправляем команду в комнату, в которой находится клиент
                makeAction(id, value);
            }
        }
    });

    // при закрытии соединения клиента с сервером
    ws.on("close", function() {
        // выводим информацию о закрытии соединения
        console.log('соединение закрыто ' + id);

        // удаляем комнату (если клиент находился в комнате)
        // delete room if she exists
        deleteRoom(id);

        // пытаемся удалить клиента
        try {
            delete clients[id];
        } catch (err) {
            // error of deleting
        }
    });
});

/////////////////////////////////////////


// интервал для передачи клиентам информации о комнатах
let mainInterval = setInterval(() => {
    // send obj with list of rooms to all users
    // массив для хранения названий комнат (массив строк)
    const roomNamesArr = [];
    // пробегаемся по всем комнатам
    rooms.forEach((room) => {
        // если в комнате есть места (нет второго игрока)
        if(room.player_second === undefined) {
            roomNamesArr.push(room.roomName);
        } else {
            roomNamesArr.push(room.roomName + " НЕТ МЕСТ");
        }
    });
    // кладём массив с именами комнат в объект
    const obj = {
      rooms: roomNamesArr,
    };
    // отправляем всем клиентам информацию о комнатах
    sendAll(JSON.stringify(obj));
}, 300);

/////////////////////////////////////////

// игровой интервал
let gameInterval = setInterval(() => {
    // send game info to players in every room
    // пробегаемся по всем комнатам
    rooms.forEach((room) => {
        // если в комнате началась игра
        if(room.game.getGameStart() === true) {
            // осуществляем действия в игре и отправляем информацию об игре клиентам комнаты
            room.game.sendGameParamsToClients();
        }
    });
}, 50);
