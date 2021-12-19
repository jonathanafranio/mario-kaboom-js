kaboom({
    global: true,
    fullscreen: true,
    scale: 2,
    debug: true,
    clearColor: [0, 0, 0, 1],
})

const MOVE_SPEED = 120
const JUMP_FORCE = 390
const BIG_JUMP_FORCE = 550
let CURRENT_JUMP_FORCE = JUMP_FORCE
let isJumping = true
let isBig = false
let lives_init = 3;
const FALL_DEATH = 400
const isDeadLine = 300

//https://imgur.com/a/SBMDYMl
//https://imgur.com/a/F8Jkryq

loadRoot('https://i.imgur.com/')

loadSprite('bloco', 'M6rwarW.png')
loadSprite('goomba', 'KPO3fR9.png')
loadSprite('surprisa', 'gesQ1KP.png')
loadSprite('unboxed', 'bdrLpi6.png')
loadSprite('moeda', 'wbKxhcd.png')
loadSprite('cogumelo', '0wMd92p.png')

loadSprite('tijolo', 'pogC9x5.png')
loadSprite('tubo-top-left', 'ReTPiWY.png')
loadSprite('tubo-top-right', 'hj2GK4n.png')
loadSprite('tubo-bottom-left', 'c1cYSbt.png')
loadSprite('tubo-bottom-right', 'nqQ79eI.png')

loadSprite('blue-bloco', 'fVscIbn.png')
loadSprite('blue-tijolo', '3e5YRQd.png')
loadSprite('blue-aco', 'gqVoI2b.png')
loadSprite('blue-goomba', 'SvV4ueD.png')
loadSprite('blue-surprisa', 'RMqCc1G.png')

//loadSprite('mario', 'Wb1qfhK.png') // estático
loadSprite('mario', 'OzrEnBy.png',{
    sliceX: 3.9,
    anims: {
        //quando tiver parado
        idle: { from: 0, to: 0 },
        //em movimento
        move: {
            from: 1,
            to: 2
        }
    }
}) // dinamico

scene("game", ({ level, score, deadLine, big, lives }) => {
    layers(['bg', 'obj', 'ui'], 'obj')

    const maps = [
        [
            '                                       ',
            '                                       ',
            '                                       ',
            '                                       ',
            '                                       ',
            '       %~=*=%=                        ',
            '                                       ',
            '                                     -+',
            '                   ^    ^            ()',
            '================================   ====',
        ],
        [
            '/                                            /',
            '/                                            /',
            '/                                            /',
            '/                                            /',
            '/                                            /',
            '/          @@@@@@                x  x        /',
            '/                             x  x  x        /',
            '/                          x  x  x  x  x   -+/',
            '/                 z   z  x x  x  x  x  x   ()/',
            '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
        ],
        [
            '/                                            /',
            '/       ////////////////////////////         /',
            '/                                            /',
            '/                                            /',
            '/                                            /',
            '/          @@@@@@                x  x        /',
            '/                             x  x  x        /',
            '/                          x  x  x  x  x     /',
            '/                 z   z  x x  x  x  x  x     /',
            '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  !',
            '/                                            /',
            '/                                            /',
            '/-+                        x  x  x  x  x     /',
            '/()               z   z  x x  x  x  x  x     /',
            '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
        ],
    ]

    const levelCfg = {
        width: 20,
        height: 20,
        '=': [sprite('bloco'), solid()],
        '$': [sprite('moeda'), 'moeda'],
        '%': [sprite('surprisa'), solid(), 'moeda-surprisa'],
        '*': [sprite('surprisa'), solid(), 'congumelo-surprisa'],
        '}': [sprite('unboxed'), solid()],
        '^': [sprite('goomba'), body(), 'dangerous', { dir: -1 }],
        '#': [sprite('cogumelo'), 'cogumelo', body()],

        '~': [sprite('tijolo'), solid(), 'tijolo'],

        '(': [sprite('tubo-bottom-left'), solid(), 'base-tubo', scale(0.5)],
        ')': [sprite('tubo-bottom-right'), solid(), 'base-tubo', scale(0.5)],
        '-': [sprite('tubo-top-left'), solid(), 'tubo', scale(0.5)],
        '+': [sprite('tubo-top-right'), solid(), 'tubo', scale(0.5)],

        '!': [sprite('blue-bloco'), solid(), scale(0.5)],
        '/': [sprite('blue-tijolo'), solid(), 'tijolo', scale(0.5)],
        'z': [sprite('blue-goomba'), body(), 'dangerous', scale(0.5), { dir: -1 }],
        '@': [sprite('blue-surprisa'), solid(), scale(0.5) , 'moeda-surprisa'],
        'x': [sprite('blue-aco'), solid(), 'aco', scale(0.5)],
    }

    const gameLevel = addLevel(maps[level], levelCfg)

    const scoreLabel = add([
        text(`Moedas ${score}`, 10),
        pos(35,5),
        layer('ui'),
        {
            value: score,
        }
    ])

    const timeLabel = add([
        text(`Tempo: ${deadLine}`, 10),
        pos(35,-35),
        layer('ui'),
        {
            value: deadLine,
        }
    ])

    add([
        text(`Level: ${parseInt(level + 1 )}`, 10),
        pos(35,20),
        layer('ui'),
    ])

    add([
        text(`Vidas: ${lives}`, 10),
        pos(35,35),
        layer('ui'),
    ])

    function big() {
        return {
            isBig() {
                return isBig
            },
            smallify() {
                this.scale = vec2(1)
                CURRENT_JUMP_FORCE = JUMP_FORCE
                isBig = false
            },
            biggify() {
                this.scale = vec2(1.5)
                CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
                isBig = true
            }
        }
    }

    let tDeath = setInterval(timeDeath, 1000);
    
    function timeDeath() {
        deadLine = deadLine -1;
        
        timeLabel.value--
        timeLabel.text = `Tempo: ${timeLabel.value}`

        if(deadLine < 1) {
            clearInterval(tDeath);
            go('lose', ({ score: scoreLabel.value }));
        }
    }

    const player = add([
        sprite('mario', {
            animSpeed: 0.1,
            frame: 0
        }),
        solid(),
        pos(40, 0),
        body(),
        big(),
        origin('bot'),
        {
            speed: 120
        }
    ])

    if(isBig) {
        player.biggify()
    }

    keyDown('left', () => {
        player.flipX(true)
        player.move(-MOVE_SPEED, 0)
    })

    keyDown('right', () => {
        player.flipX(false)
        player.move(MOVE_SPEED, 0)
    })

    keyPress('space', () => {
        if(player.grounded()){
            isJumping = true
            player.jump(CURRENT_JUMP_FORCE)
        }
    })

    keyPress('left', () => {
        player.flipX(true)
        player.play('move')
    })

    keyPress('right', () => {
        player.flipX(false)
        player.play('move')
    })

    //animar parado
    keyRelease('left', () => {
        player.play('idle')
    })

    keyRelease('right', () => {
        player.play('idle')
    })

    const ENEMY_SPEED = 20

    action('dangerous', (d) => {
        //d.move(-ENEMY_SPEED, 0)
        d.move(d.dir * ENEMY_SPEED, 0)
    })

    const changeDirectionDangerous = [
        'tijolo',
        'aco',
        'base-tubo'
    ];

    changeDirectionDangerous.forEach((item) => {
        collides('dangerous', item, (d) => {
            let direction = d.dir;
            // -1 é para esquerda (-1 * ENEMY_SPEED) || 1 é para direita (1 * ENEMY_SPEED) 
            direction < 0 ? d.dir = 1 : d.dir = -1
            d.move(d.dir * ENEMY_SPEED, 0)
        })
    })

    player.action(() => {
        if(player.grounded()){
            isJumping = false
        }
    })

    player.on("headbutt", (obj) => {
        if(obj.is('moeda-surprisa')) {
            gameLevel.spawn('$', obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0, 0))
        }
        if(obj.is('congumelo-surprisa')) {
            gameLevel.spawn('#', obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0, 0))
        }
    })

    action('cogumelo', (m) => {
        m.move(20, 0)
    })

    player.collides('cogumelo', (c) => {
        destroy(c)
        player.biggify()
    })

    //player.collides('dangerous', (d) => {
    player.overlaps('dangerous', (d) => {
        if(isJumping) {
            destroy(d)
        } else {
            if(isBig) {
                player.smallify()
            } else {
                clearInterval(tDeath);
                if(lives > 1) {
                    let livesLess = lives - 1;
                    //level
                    go("game", ({ level: level, score: scoreLabel.value, deadLine: isDeadLine, big: isBig, lives: livesLess }))
                } else {
                    go('lose', ({ score: scoreLabel.value }))
                }
            }
        }
    })

    player.collides('moeda', (m) => {
        destroy(m)
        scoreLabel.value++
        scoreLabel.text = `Moedas: ${scoreLabel.value}`
    })

    player.collides('tubo', (t) => {
        keyPress('down', ()=> {
            go("game", {
                level: (level + 1) % maps.length,
                score: scoreLabel.value,
                deadLine: isDeadLine,
                big: isBig,
                lives: lives
            })
        })
    })

    player.collides('tijolo', (t) => {
        if(isJumping){
            destroy(t)
        }
    })


    //se cair no buraco
    player.action(() => {
        camPos(player.pos)
        if(player.pos.y >= FALL_DEATH) {
            clearInterval(tDeath);
            if(lives > 1) {
                let livesLess = lives - 1;
                //level
                go("game", ({ level: level, score: scoreLabel.value, deadLine: isDeadLine, big: isBig, lives: livesLess }))
            } else {
                go('lose', ({ score: scoreLabel.value }))
            }
            //go('lose', { score: scoreLabel.value })
        }
    })

})

scene('lose', ({score}) => {
    add([
        text(`SI FUDEU, KKKKKKK...`, 18),
        origin('center'),
        pos(width()/2, height()/2)
    ])

    add([
        text(`Score: ${score}`, 12),
        origin('top'),
        pos(width()/2, 30)
    ])

    add([
        text('Aperte espaco para recomecar', 10),
        pos(width()/3, height()-30)
    ])

    keyPress('space', () => {
        isBig ? isBig = false : isBig
        go("game", { level: 0, score: 0, deadLine: isDeadLine, big: isBig, lives: lives_init })
    })
})

go("game", ({ level: 0, score: 0, deadLine: isDeadLine, big: isBig, lives: lives_init }))