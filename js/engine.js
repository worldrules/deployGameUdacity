/* Engine.js
 * Este arquivo mostra a funcionalidade do loop do jogo (render e entidades
 * de update), esboça o tabuleiro inicial do jogo na tela e, depois, chama
 * os métodos update e render para os objetos dos inimigos e de seu jogador
 * (definidos em seu app.js).
 *
 * Um mecanismo de jogo desenha toda a tela do jogo várias vezes, meio
 * como um folioscópio, que dá a ilusão de "animação" às imagens.
 * Quando seu jogador se move pela tela, pode parecer que apenas aquele(a)
 * imagem/personagem está se movendo ou sendo desenhado(a), mas esse não é
 * o caso. O que realmenbte ocorre é que toda a "cena" está sendo desenhada
 * diversas vezes, dando a ilusão de animação.
 *
 * Este mecanismo disponibiliza globalmente o objeto context (ctx)
 * do canvas, a fim de escrever app.js mais simples de lidar.
 */

var Engine = (function (global) {
    /* Pré-defina as variáveis que usaremos neste escopo,
     * crie o elemento canvas, pegue o contexto 2D desse
     * canvas, configure a altura/largura dos elementos do
     * canvas e adicione isso ao DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime,
        levelEndTime,
        gameToastTime;

    var toast = {
        msg: "0",
        row: 0,
        col: 0,
    };


    canvas.width = 707;
    canvas.height = 760;
    doc.body.appendChild(canvas);


    /* Esta função faz algumas configurações iniciais que só devem ocorrer
     * uma vez, especialmente a definição da variável lastTime, que é
     * exigida para o loop do jogo.
     */
    function init() {
        reset();
        lastTime = Date.now();

        // Selecao de personagem
        playerSelection();

    }

    /* Esta função não faz nada, mas pode ser um bom local para lidar com os
     * estados de reinicialização do jogo - talvez, um novo menu de jogo, uma
     * tela de fim de jogo ou coisas assim. É chamada só uma vez pelo
     * método init().
     */
    function reset() {
        game.reset();
        player.reset();
        allEnemies = [];
        for (var i = 0; i < 4; i++) {
            allEnemies.push(new Enemy());
        }
    }



    // Escolha de personagem !! 

    function playerSelection() {
        var characters = ['images/char-boy.png',
            'images/char-cat-girl.png',
            'images/char-horn-girl.png',
            'images/char-pink-girl.png',
            'images/char-princess-girl.png'
        ];
        var selector = {
            sprite: 'images/Selector.png',
            row: 3,
            col: 1
        };

        /* Mostra o seletor e os personagens disponiveis */
        displaySelectionWindow(characters, selector);

        /* Usando as teclas do teclado para mover e escolher. */
        document.addEventListener('keyup', function (e) {

            if (e.keyCode === 37 && selector.col > 1) {
                selector.col -= 1;
                displaySelectionWindow(characters, selector);
            } else if (e.keyCode === 39 && selector.col < 5) {

                selector.col += 1;
                displaySelectionWindow(characters, selector);
            } else if (e.keyCode === 13) {

                player.sprite = characters[selector.col - 1];
                player.reset();
                levelEndTime = Date.now();
                main();
            }
        });
    }



    // Colocando o personagem escolhido dentro do jogo !!
    function displaySelectionWindow(characters, selector) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "gray";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = "50pt impact";
        ctx.textAlign = "center";

        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;

        var line = "Escolha o Personagem";

        ctx.fillText(line, canvas.width / 2, canvas.height / 2 - 120);
        ctx.strokeText(line, canvas.width / 2, canvas.height / 2 - 120);

        line = "Aperte Enter";
        ctx.fillText(line, canvas.width / 2, canvas.height / 2 + 150);
        ctx.strokeText(line, canvas.width / 2, canvas.height / 2 + 150);


        ctx.drawImage(Resources.get(selector.sprite), selector.col * 101, selector.row * 83 + 20);

        for (var i = 1; i < 6; i++) {
            ctx.drawImage(Resources.get(characters[i - 1]), i * 101, 3 * 83);
        }
    }

    /* Esta função age como o ponto de largada do loop do jogo em si e
     * lida com as chamadas dos métodos render e update de forma adequada.
     */
    function main() {
        /* Obtenha a informação delta de tempo, que é exigida caso seu jogo
         * requeira uma animação fluida. Como cada computador processa
         * instruções em velocidades diferentes, precisamos de um valor
         * de constante que seja o mesmo para todos (independentemente da
         * velocidade do computador).
         * 
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;


        if (game.currentLevel === 11) {
            displayEnding();
        } else if (game.life === 0) {
            playerDead();
        } else {
            if (game.loading) {
                waitLevelLoading();
            } else {
                /* Chame suas funções update/render e passe o delta de tempo para a
                 * função update, pois ele pode ser usado para melhorar a animação.
                 */
                update(dt);
                render();


                if (game.toast) {
                    toastMessage();
                }

            }



            /* Defina a variável lastTime, que será usada para definir o delta
             * de tempo na próxima vez em que essa função for chamada.
             */
            lastTime = now;


            /* Use a função requestAnimationFrame do navegador para chamar essa
             * função novamente quando o navegador puder desenhar outro frame.
             */
            win.requestAnimationFrame(main);
        }

    } // FINAL DO MAIN


    // Criando o final do jogo e Recomecar o jogo

    function displayEnding() {
        ctx.fillStyle = "grey";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.fillRect(0, canvas.height / 3, canvas.width, canvas.height / 3);

        ctx.font = "50pt impact";
        ctx.textAlign = "center";

        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;

        var line = "Parabens !";
        ctx.fillText(line, canvas.width / 2, canvas.height / 3 - 40);
        ctx.strokeText(line, canvas.width / 2, canvas.height / 3 - 40);

        ctx.fillStyle = "grey";
        ctx.font = "50pt impact";

        line = "Sua pontuacao : " + game.score;
        ctx.fillText(line, canvas.width / 2, canvas.height / 3 + 80);
        line = "Level : 10";
        ctx.fillText(line, canvas.width / 2, canvas.height / 3 + 160);
        line = "Espaco para Recomecar";
        ctx.fillText(line, canvas.width / 2, canvas.height / 3 + 240);

        document.addEventListener('keyup', function (e) {
            if (e.keyCode === 32) {
                init();
            }
        });
    }


    // Verifica se o jogador morreu e reinicia
    function playerDead() {
        ctx.fillStyle = "grey";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.fillRect(0, canvas.height / 3, canvas.width, canvas.height / 3);

        ctx.font = "100pt impact";
        ctx.textAlign = "center";

        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;

        var line = "Fim de Jogo";
        ctx.fillText(line, canvas.width / 2, canvas.height / 3 - 40);
        ctx.strokeText(line, canvas.width / 2, canvas.height / 3 - 40);

        ctx.fillStyle = "grey";
        ctx.font = "50pt impact";

        line = "Pontuacao : " + game.score;
        ctx.fillText(line, canvas.width / 2, canvas.height / 3 + 80);
        line = "Level : " + game.currentLevel;
        ctx.fillText(line, canvas.width / 2, canvas.height / 3 + 160);
        line = "Espaco para Recomecar";
        ctx.fillText(line, canvas.width / 2, canvas.height / 3 + 240);

        document.addEventListener('keyup', function (e) {
            if (e.keyCode === 32) {
                init();
            }
        });
    }

    //Aguarda 2 segundos apos completar uma fase e inicia a proxima
    function waitLevelLoading() {
        if (Date.now() - levelEndTime < 2000) {
            displayLevelLoading();
        } else {
            game.nextLevelInitiation(allEnemies, gem, key, player);
            heart.reset();
            //Reseta as gemas , a chave , e o player;
            gem.reset();
            key.reset();
            player.reset();
            // Adiciona um ou mais inimigos
            allEnemies.push(new Enemy);
        }
    }



    // Carregamento de tela
    function displayLevelLoading() {
        ctx.fillStyle = "grey";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.fillRect(0, canvas.height / 3, canvas.width, canvas.height / 3);

        ctx.font = "60pt impact";
        ctx.textAlign = "center";

        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;

        var levelLine = "Level " + game.currentLevel;
        ctx.fillText(levelLine, canvas.width / 2, canvas.height / 2 + 50);
        ctx.strokeText(levelLine, canvas.width / 2, canvas.height / 2 + 50);
    }

    /* Esta função é chamada pela principal (o loop de nosso jogo), e ela
     * mesma chama todas as funções possivelmente necessárias para
     * atualizar os dados da entidade. Com base na implementação de sua
     * detecção de colisão (quando duas entidades ocupam o mesmo espaço -
     * por exemplo, quando seu personagem deve morrer), você pode achar
     * necessário adicionar mais uma chamada de função aqui. Por enquanto,
     * só fizemos comentários - você pode implementar essa funcionalidade
     * dessa maneira ou não (também pode implementar a detecção de colisão
     * apenas nas próprias entidades, em seu arquivo app.js).
     */
    function update(dt) {
        updateEntities(dt);
        // Verifica a colisao do jogo
        checkCollisions();

        if (game.gemCount !== game.currentLevel) {
            if (gem.checkGet(game, player)) {
                game.gemCount += 1;
                setToast("+15", player.row, player.col);
            }
        } else {
            if (key.checkGet(game, player)) {
                setToast("+25", player.row, player.col);
                game.loading = true;
                game.currentLevel += 1;
                levelEndTime = Date.now();
            }
        }

        if (heart.present) {
            if (heart.checkGet(game, player)) {
                setToast("+20", player.row, player.col);
                game.life += 1;
                heart.present = false;
            }
        } else {
            heart.generate(game.currentLevel);
        }

    }

    function checkCollisions() {
        if (game.board[player.row][player.col] === 2) {
            setToast("Ouch -30", player.row, player.col);
            game.playerDead();
            player.reset();
        } else {
            allEnemies.forEach(function (enemy) {
                if (player.row === enemy.row && player.col - 0.7 < enemy.col && player.col + 0.7 > enemy.col) {
                    setToast("Ouch -30", player.row, player.col);
                    game.playerDead();
                    player.reset();
                }
            });
        }
    }
    /* É chamada pela função update, faz loops por todos os objetos dentro
     * de sua array allEnemies, como definido no app.js, e chama
     * seus métodos update(). Então, chama a função update do objeto de
     * seu jogador. Esses métodos update devem focar apenas em atualizar
     * os dados/propriedades relacionados ao objeto. Faça seus desenhos
     * nos métodos render.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function (enemy) {
            enemy.update(dt);
        });
    }

    // Seta a mensagem para ser exibida
    function setToast(msg, row, col) {
        toast.msg = msg;
        toast.row = row;
        toast.col = col;
        game.toast = true;
        gameToastTime = Date.now();
    }
    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        game.renderBoard();
        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {


        if (game.gemCount != game.currentLevel) {
            gem.render();
        } else {
            key.render();
        }

        if (heart.present) {
            heart.render();
        }


        allEnemies.forEach(function (enemy) {
            enemy.render();
        });


        player.render();
    }

    //Apresenta a mensagem
    function toastMessage() {
        if (Date.now() - gameToastTime < 1000) {
            ctx.font = "20pt impact";
            ctx.textAlign = "center";

            ctx.fillStyle = "red";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;

            ctx.fillText(toast.msg, toast.col * 101 + 50, toast.row * 83 + 100);
            ctx.strokeText(toast.msg, toast.col * 101 + 50, toast.row * 83 + 100);
        } else {
            game.toast = false;
        }
    }

    // Recarrega as imagens do jogo
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/Selector.png',
        'images/gem-orange.png',
        'images/Key.png',
        'images/Heart.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas and canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use them more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
    global.canvas = canvas;
})(this);