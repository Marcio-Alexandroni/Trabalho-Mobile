// =============================
// CONFIG
// =============================

// ID da pizzaria usada pelo backend
const PIZZARIA_ID = 'pizzaria_queijo_maravilha';
// Host do backend
const BASE_URL = 'https://backend-s0hl.onrender.com';

// =============================
// VARIÁVEIS GLOBAIS
// =============================

let applista, appcadastro, listaPizzasDiv;
let imagemDiv, pizzaInput, precoInput;

let listaPizzasCadastradas = [];
let pizzaSelecionadaIndex = null;
let pizzaSelecionadaId = null; // _id vindo do backend

// se você ainda usar a parte de mensagem:
let mensagem = null;
let msgInformada = null;

// =============================
// DEVICEREADY
// =============================

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('deviceready disparado');

    // IMPORTANTE para o cordova-plugin-advanced-http
    cordova.plugin.http.setDataSerializer('json');

    // Referências de elementos da tela de pizzas
    applista       = document.getElementById('applista');
    appcadastro    = document.getElementById('appcadastro');
    listaPizzasDiv = document.getElementById('listaPizzas');

    imagemDiv      = document.getElementById('imagem');
    pizzaInput     = document.getElementById('pizza');
    precoInput     = document.getElementById('preco');

    // Botões / eventos da tela de pizzas
    document.getElementById('btnNovo').onclick        = abrirCadastroNovo;
    document.getElementById('btnVoltarLista').onclick = voltarParaLista;
    document.getElementById('btnCancelar').onclick    = voltarParaLista;
    document.getElementById('btnFoto').onclick        = tirarFoto;
    document.getElementById('btnSalvar').onclick      = salvarPizza;
    document.getElementById('btnExcluir').onclick     = excluirPizza;

    // Se ainda estiver usando a atividade de "mensagem":
    const btnMsg = document.getElementById('exibeMensagem');
    if (btnMsg) {
        mensagem    = document.getElementById('mensagem');
        msgInformada = document.getElementById('msgInformada');
        btnMsg.addEventListener('click', exibirMensagem);
    }

    // Carrega lista do backend
    carregarPizzas();
}

// =============================
// MENSAGEM (se precisar)
// =============================

function exibirMensagem() {
    if (mensagem && msgInformada) {
        mensagem.innerHTML = msgInformada.value;
    }
}

// =============================
// CONTROLE DE TELAS
// =============================

function mostrarLista() {
    applista.style.display    = 'flex';
    appcadastro.style.display = 'none';
}

function mostrarCadastro() {
    applista.style.display    = 'none';
    appcadastro.style.display = 'flex';
}

function abrirCadastroNovo() {
    pizzaSelecionadaIndex = null;
    pizzaSelecionadaId    = null;

    pizzaInput.value = '';
    precoInput.value = '';
    imagemDiv.style.backgroundImage = '';
    imagemDiv.textContent = 'Toque em “Foto” para adicionar a imagem da pizza';

    mostrarCadastro();
}

function voltarParaLista() {
    mostrarLista();
}

// =============================
// "CÂMERA" – ESCOLHENDO IMAGEM MOCK
// =============================

function tirarFoto() {
    const opcao = prompt(
        "Escolha a foto:\n" +
        "1 - Calabresa\n" +
        "2 - Mussarela\n" +
        "3 - Pepperoni"
    );

    let caminho;

    if (opcao === '1') {
        caminho = 'img/pizza_calabresa.png';
    } else if (opcao === '2') {
        caminho = 'img/pizza_mussarela.png';
    } else if (opcao === '3') {
        caminho = 'img/pizza_pepperoni.png';
    } else {
        alert('Opção inválida.');
        return;
    }

    imagemDiv.style.backgroundImage = `url('${caminho}')`;
    imagemDiv.textContent = '';
}

// =============================
// LISTA DE PIZZAS (GET)
// =============================

function carregarPizzas() {
    listaPizzasDiv.innerHTML = 'Carregando...';

    const url = `${BASE_URL}/admin/pizzas/${PIZZARIA_ID}`;
    console.log('GET', url);

    cordova.plugin.http.get(
        url,
        {},
        {},
        function (response) {
            console.log('GET OK', response.status, response.data);
            try {
                if (response.data && response.data !== "") {
                    listaPizzasCadastradas = JSON.parse(response.data);
                } else {
                    listaPizzasCadastradas = [];
                }
            } catch (e) {
                console.log('Erro ao parsear JSON', e);
                listaPizzasCadastradas = [];
            }
            montarListaPizzas();
        },
        function (error) {
            console.log('Erro ao carregar pizzas', JSON.stringify(error));
            let msg = 'Erro ao carregar pizzas.\n';
            if (error.status)    msg += 'Status: ' + error.status + '\n';
            if (error.error)     msg += 'Erro: ' + error.error + '\n';
            if (error.exception) msg += 'Ex: ' + error.exception + '\n';
            alert(msg);
            listaPizzasDiv.innerHTML =
                '<div class="linha">Não foi possível carregar as pizzas.</div>';
        }
    );
}

function montarListaPizzas() {
    listaPizzasDiv.innerHTML = '';

    if (!listaPizzasCadastradas.length) {
        listaPizzasDiv.innerHTML = '<div class="linha">Nenhuma pizza cadastrada.</div>';
        return;
    }

    listaPizzasCadastradas.forEach((item, idx) => {
        const novo = document.createElement('div');
        novo.classList.add('linha');
        const precoFormatado = item.preco ? ` — R$ ${Number(item.preco).toFixed(2)}` : '';
        novo.innerHTML = item.pizza + precoFormatado;
        novo.id = idx;
        novo.onclick = function () {
            carregarDadosPizza(novo.id);
        };
        listaPizzasDiv.appendChild(novo);
    });
}

// =============================
// CADASTRO / EDIÇÃO
// =============================

function carregarDadosPizza(id) {
    const idx = Number(id);
    const pizza = listaPizzasCadastradas[idx];

    pizzaSelecionadaIndex = idx;
    pizzaSelecionadaId    = pizza._id;

    pizzaInput.value = pizza.pizza || '';
    precoInput.value = pizza.preco || '';

    if (pizza.imagem) {
        imagemDiv.style.backgroundImage = pizza.imagem;
        imagemDiv.textContent = '';
    } else {
        imagemDiv.style.backgroundImage = '';
        imagemDiv.textContent = 'Toque em “Foto” para adicionar a imagem da pizza';
    }

    mostrarCadastro();
}

function montarPayloadPizza() {
    return {
        pizzaria: PIZZARIA_ID,
        pizza: pizzaInput.value,
        preco: precoInput.value,
        imagem: imagemDiv.style.backgroundImage
    };
}

function salvarPizza() {
    const payload = montarPayloadPizza();

    if (!payload.pizza || !payload.preco) {
        alert('Preencha nome e preço da pizza.');
        return;
    }

    if (pizzaSelecionadaId) {
        payload.pizzaid = pizzaSelecionadaId;
        atualizarPizza(payload);
    } else {
        criarPizza(payload);
    }
}

// =============================
// POST (CRIAR)
// =============================

function criarPizza(payload) {
    const url = `${BASE_URL}/admin/pizza/`;
    console.log('POST', url, payload);

    cordova.plugin.http.post(
        url,
        payload,
        { 'Content-Type': 'application/json' },
        function (response) {
            console.log('POST OK', response.status, response.data);
            alert('Pizza cadastrada com sucesso!');
            mostrarLista();
            carregarPizzas();
        },
        function (error) {
            console.log('Erro ao salvar pizza', JSON.stringify(error));
            let msg = 'Erro ao salvar pizza.\n';
            if (error.status)    msg += 'Status: ' + error.status + '\n';
            if (error.error)     msg += 'Erro: '   + error.error + '\n';
            if (error.exception) msg += 'Ex: '     + error.exception + '\n';
            alert(msg);
        }
    );
}

// =============================
// PUT (ATUALIZAR)
// =============================

function atualizarPizza(payload) {
    const url = `${BASE_URL}/admin/pizza/`;
    console.log('PUT', url, payload);

    cordova.plugin.http.put(
        url,
        payload,
        { 'Content-Type': 'application/json' },
        function (response) {
            console.log('PUT OK', response.status, response.data);
            alert('Pizza atualizada com sucesso!');
            mostrarLista();
            carregarPizzas();
        },
        function (error) {
            console.log('Erro ao atualizar pizza', JSON.stringify(error));
            let msg = 'Erro ao atualizar pizza.\n';
            if (error.status)    msg += 'Status: ' + error.status + '\n';
            if (error.error)     msg += 'Erro: '   + error.error + '\n';
            if (error.exception) msg += 'Ex: '     + error.exception + '\n';
            alert(msg);
        }
    );
}

// =============================
// DELETE
// =============================

function excluirPizza() {
    if (pizzaSelecionadaIndex === null || pizzaSelecionadaIndex === undefined) {
        alert('Selecione uma pizza na lista ou abra um cadastro para excluir.');
        return;
    }

    const pizza = listaPizzasCadastradas[pizzaSelecionadaIndex];
    const nomePizza = pizza.pizza;

    if (!confirm(`Excluir a pizza "${nomePizza}"?`)) {
        return;
    }

    const url = `${BASE_URL}/admin/pizza/${PIZZARIA_ID}/${encodeURIComponent(nomePizza)}`;
    console.log('DELETE', url);

    cordova.plugin.http.delete(
        url,
        {},
        {},
        function (response) {
            console.log('DELETE OK', response.status, response.data);
            alert('Pizza excluída com sucesso!');
            mostrarLista();
            carregarPizzas();
        },
        function (error) {
            console.log('Erro ao excluir pizza', JSON.stringify(error));
            let msg = 'Erro ao excluir pizza.\n';
            if (error.status)    msg += 'Status: ' + error.status + '\n';
            if (error.error)     msg += 'Erro: '   + error.error + '\n';
            if (error.exception) msg += 'Ex: '     + error.exception + '\n';
            alert(msg);
        }
    );
}
