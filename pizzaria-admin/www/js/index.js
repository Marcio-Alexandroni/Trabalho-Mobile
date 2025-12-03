// js/index.js

// TROCAR PELO ID DA SUA PIZZARIA
const PIZZARIA_ID = 'pizzaria_queijo_maravilha';

let applista, appcadastro, listaPizzasDiv;
let imagemDiv, pizzaInput, precoInput;

let listaPizzasCadastradas = [];
let pizzaSelecionadaIndex = null;
let pizzaSelecionadaId = null; // _id da pizza no backend

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Importante para o cordova-plugin-advanced-http
    cordova.plugin.http.setDataSerializer('json');

    // Referências de elementos
    applista       = document.getElementById('applista');
    appcadastro    = document.getElementById('appcadastro');
    listaPizzasDiv = document.getElementById('listaPizzas');

    imagemDiv      = document.getElementById('imagem');
    pizzaInput     = document.getElementById('pizza');
    precoInput     = document.getElementById('preco');

    // Eventos
    document.getElementById('btnNovo').onclick        = abrirCadastroNovo;
    document.getElementById('btnVoltarLista').onclick = voltarParaLista;
    document.getElementById('btnCancelar').onclick    = voltarParaLista;
    document.getElementById('btnFoto').onclick        = tirarFoto;
    document.getElementById('btnSalvar').onclick      = salvarPizza;
    document.getElementById('btnExcluir').onclick     = excluirPizza;

    // Carregar lista ao iniciar
    carregarPizzas();
}

/* ===========================
   CONTROLE DE TELAS
   =========================== */

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

/* ===========================
   CÂMERA REAL + FOTO MOCKADA
   =========================== */

// caminhos relativos às imagens dentro de www/img/
const IMAGENS_PIZZA = [
    { nome: 'Queijo',    caminho: 'img/pizza_mussarela.png' },   // padrão
    { nome: 'Calabresa', caminho: 'img/pizza_calabresa.png' },
    { nome: 'Pepperoni', caminho: 'img/pizza_pepperoni.png' }
];

// Função chamada pelo botão "Foto"
function tirarFoto() {
    if (!navigator.camera) {
        alert('Camera plugin não disponível (navigator.camera undefined).');
        return;
    }

    const options = {
        quality: 70,
        destinationType: Camera.DestinationType.DATA_URL,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        sourceType: Camera.PictureSourceType.CAMERA,
        targetWidth: 600,
        targetHeight: 600,
        correctOrientation: true
    };

    // ABRE A CÂMERA REAL
    navigator.camera.getPicture(
        onFotoCameraSucesso,
        onFotoErro,
        options
    );
}

// callback chamado PELO PLUGIN (foto real foi tirada)
function onFotoCameraSucesso(imageDataFromCamera) {
    console.log('Foto real capturada, tamanho base64:', imageDataFromCamera.length);

    const escolha = prompt(
        "Escolha a foto da pizza:\n" +
        "1 - Queijo\n" +
        "2 - Calabresa\n" +
        "3 - Pepperoni"
    );

    let index = null;
    if (escolha === '1') index = 0;
    else if (escolha === '2') index = 1;
    else if (escolha === '3') index = 2;

    if (index === null) {
        alert('Opção inválida.');
        return;
    }

    const caminho = IMAGENS_PIZZA[index].caminho;

    // carrega a imagem local, converte pra base64 e aplica como se fosse a foto
    carregarImagemComoBase64(caminho)
        .then((base64) => {
            const dataUrl = "url('data:image/png;base64," + base64 + "')";
            imagemDiv.style.backgroundImage = dataUrl;
            imagemDiv.textContent = '';
        })
        .catch(onFotoErro);
}

// helper: carrega img/www e converte para base64 (retorna Promise)
function carregarImagemComoBase64(caminhoRelativo) {
    return new Promise((resolve, reject) => {
        fetch(caminhoRelativo)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Falha ao carregar imagem: ' + response.status);
                }
                return response.blob();
            })
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = function () {
                    const dataUrl = reader.result; // "data:image/png;base64,AAAA..."
                    const base64 = dataUrl.split(',')[1]; // só a parte base64
                    resolve(base64);
                };
                reader.onerror = function (e) {
                    reject('Erro ao ler imagem: ' + e);
                };
                reader.readAsDataURL(blob);
            })
            .catch(err => reject(err));
    });
}

function onFotoErro(message) {
    alert('Erro ao tirar foto: ' + message);
}

/* ===========================
   LISTA DE PIZZAS
   =========================== */

function carregarPizzas() {
    listaPizzasDiv.innerHTML = 'Carregando...';

    const url = 'https://backend-s0hl.onrender.com/admin/pizzas/' + PIZZARIA_ID;

    cordova.plugin.http.get(
        url,
        {},
        {},
        function (response) {
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
            console.log('Erro ao carregar pizzas', error);
            alert('Erro ao carregar pizzas.');
            listaPizzasDiv.innerHTML = '';
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

/* ===========================
   CADASTRO / EDIÇÃO
   =========================== */

function carregarDadosPizza(id) {
    const idx = Number(id);
    const pizza = listaPizzasCadastradas[idx];

    pizzaSelecionadaIndex = idx;
    pizzaSelecionadaId    = pizza._id; // campo do backend

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
        imagem: imagemDiv.style.backgroundImage // segue o enunciado
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

function criarPizza(payload) {
    const url = 'https://backend-s0hl.onrender.com/admin/pizza/';

    cordova.plugin.http.post(
        url,
        payload,
        {},
        function (response) {
            alert('Pizza cadastrada com sucesso!');
            mostrarLista();
            carregarPizzas();
        },
        function (error) {
            console.log('Erro ao salvar pizza', error);
            alert('Erro ao salvar pizza.');
        }
    );
}

function atualizarPizza(payload) {
    const url = 'https://backend-s0hl.onrender.com/admin/pizza/';

    cordova.plugin.http.put(
        url,
        payload,
        {},
        function (response) {
            alert('Pizza atualizada com sucesso!');
            mostrarLista();
            carregarPizzas();
        },
        function (error) {
            console.log('Erro ao atualizar pizza', error);
            alert('Erro ao atualizar pizza.');
        }
    );
}

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

    const url = 'https://backend-s0hl.onrender.com/admin/pizza/' +
        PIZZARIA_ID + '/' + encodeURIComponent(nomePizza);

    cordova.plugin.http.delete(
        url,
        {},
        {},
        function (response) {
            alert('Pizza excluída com sucesso!');
            mostrarLista();
            carregarPizzas();
        },
        function (error) {
            console.log('Erro ao excluir pizza', error);
            alert('Erro ao excluir pizza.');
        }
    );
}
