const _div = document.querySelector('#flappy-bird')
const canvas = document.querySelector('#canvas')
const pontuacao_display = document.querySelector('#pontuacao')
const obstaculo_respawn_left = '135%'
const max_height = 200
const min_height = 50
const left_locations_obstacule = ['60%', '80%', '100%', '120%', '140%', '160%', '180%']

const state = {
    id: null,
    delta: 5,
    delta_obstaculo: 10,
    orientation: -1,
    id_verificador_de_colisao: null
}

const colision = {
    up(elemento_top, walk, elemento_proximo_altura) {
        return (elemento_top + walk) <= elemento_proximo_altura
    }
}


const altera_altura = (elemento, elemento_proximo, move_to) => {
    const nova_pos = elemento.offsetTop + move_to
    if (nova_pos >= 0 && nova_pos <= elemento_proximo.offsetHeight - elemento.offsetHeight) {
        elemento.style.top = nova_pos + 'px'
    }
    else {
        elemento.style.top = nova_pos <= 0 ? (0 + 'px') : (elemento_proximo.offsetHeight - elemento.offsetHeight) + 'px'
    }
}

function move(e) {
    state.id = setInterval(() => {
        const item = e.target
        altera_altura(item, item.parentNode, state.delta * state.orientation)
    }, 60)
}


_div.onkeypress = e => {
    const obstaculos = document.querySelectorAll('.column-father')
    obstaculos.forEach((no, index) => {
        if (state[`obstaculo_id_${index}`] === undefined) {
            state[`obstaculo_id_${index}`] = setInterval(() => movimenta_obstaculo(no, index), 60)
        }
    })
    state.orientation = state.orientation === -1 ? 1 : -1
    if (state.id !== null) {
        clearInterval(state.id)
        state.id = null
    }
    move(e)
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const random_height = (no) => {
    let new_height = getRandomInt(min_height, max_height)
    no.style.height = new_height + 'px'
}

const respawn_obstaculo = (no) => {
    no.style.left = obstaculo_respawn_left
    Array.from(no).forEach(random_height)
}

const remove_obstaculo = (no, index) => {
    if (state[`obstaculo_id_${index}`] !== undefined) {
        canvas.removeChild(no)
        clearInterval(state[`obstaculo_id_${index}`])
        delete state[`obstaculo_id_${index}`]
    }
}

const cria_tubos = (elemento_pai) => {
    const tubo_1 = document.createElement('div')
    tubo_1.classList.add("tubo", "maior-grow", "borda", "tamanho-menorzinho")
    const local_borda_grossa = elemento_pai.id.includes("top") ? "borda-grossa-top" : "borda-grossa-bottom"

    const tubo_2 = document.createElement('div')
    tubo_2.classList.add("tubo", local_borda_grossa, "borda")

    if (elemento_pai.id.includes("top")) {
        elemento_pai.appendChild(tubo_1)
        elemento_pai.appendChild(tubo_2)
    }
    else{
        elemento_pai.appendChild(tubo_2)
        elemento_pai.appendChild(tubo_1)
    }
}

const cria_obstaculo = (elemento_pai) => {
    const obstaculo = document.createElement('div')
    obstaculo.classList.add('column-father')

    const barreira_superior = document.createElement('div')
    barreira_superior.id = "column-son-top"
    cria_tubos(barreira_superior)

    const barreira_inferior = document.createElement('div')
    barreira_inferior.id = "column-son-down"
    cria_tubos(barreira_inferior)

    obstaculo.appendChild(barreira_superior)
    obstaculo.appendChild(barreira_inferior)

    elemento_pai.appendChild(obstaculo)
}

const movimenta_obstaculo = (no, index) => {
    if (no.offsetLeft - state.delta_obstaculo < -1 * no.offsetWidth) {
        respawn_obstaculo(no)
        return
    }
    no.style.left = (no.offsetLeft - state.delta_obstaculo) + 'px'
}

const is_between = (position, left, right) => {
    return (position > left) && (position < right)
}

const colidiu = (height_top, height_bottom, threshold_top, threshold_bottom) => {
    if (height_top <= threshold_top) {
        return true
    }
    else if (height_bottom >= threshold_bottom) {
        return true
    }

    return false
}

const stop_game = () => {
    _div.onkeypress = null
    clearInterval(state.id)
    const obstaculos = document.querySelectorAll('.column-father')
    obstaculos.forEach((no, index) => {
        clearInterval(state[`obstaculo_id_${index}`])
    })
    clearInterval(state.id_verificador_de_colisao)
}

const verficadora_de_colisao = () => {
    const posicao_player = _div.offsetLeft
    const obstaculos = document.querySelectorAll('.column-father')
    obstaculos.forEach((obstaculo,index) => {
        const altura = obstaculo.offsetHeight
        const posicao_obstaculo = obstaculo.offsetLeft
        const altura_filho_1 = obstaculo.children[0].offsetHeight
        const altura_filho_2 = obstaculo.children[1].offsetHeight

        if (is_between(posicao_player, posicao_obstaculo, obstaculo.offsetWidth + posicao_obstaculo)) {
            if (colidiu(_div.offsetTop,
                _div.offsetTop + _div.offsetHeight,
                altura_filho_1,
                altura - altura_filho_2)) {
                stop_game()
            }
            else {
                pontuacao_display.innerHTML = (parseInt(pontuacao_display.innerHTML) + 1).toString()

            }
        }

    })
}

window.onload = () => {
    for (let i = 0; i < left_locations_obstacule.length; i++) {
        cria_obstaculo(canvas)
    }

    const obstaculos = document.querySelectorAll('.column-father')
    obstaculos.forEach((no, index) => {
        no.style.left = left_locations_obstacule[index]
        Array.from(no.children).forEach(random_height)
    })

    state.id_verificador_de_colisao = setInterval(() => verficadora_de_colisao(), 60)
} 