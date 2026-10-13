'use strict';

// PARTE 1 — Validei os pedidos antes de calcular o faturamento.
const pedidos = [
  { cliente: 'Bia', valor: 120, status: 'pago' },
  { cliente: 'Frank', valor: 80.5, status: 'pago' },
  { cliente: 'Ana', valor: 60, status: 'pendente' },
  { cliente: ' ', valor: 50, status: 'pago' },
  { cliente: 'Bruno', valor: -10, status: 'pago' },
  { cliente: 'Carla', valor: '30', status: 'pago' },
];
function validarPedido(pedido) {
  return pedido !== null && typeof pedido === 'object'
    && typeof pedido.cliente === 'string' && pedido.cliente.trim() !== ''
    && typeof pedido.valor === 'number' && Number.isFinite(pedido.valor)
    && pedido.valor > 0;
}
const pedidosValidos = pedidos.filter(validarPedido);
const pedidosPagos = pedidosValidos.filter((pedido) => pedido.status === 'pago');
const totalFaturado = pedidosPagos.reduce((total, pedido) => total + pedido.valor, 0);
const textosPedidos = pedidosPagos.map((pedido) => `${pedido.cliente.trim()} — R$ ${pedido.valor.toFixed(2)}`);
console.log('Pedidos válidos:', pedidosValidos);
console.log('Pedidos pagos:', pedidosPagos);
console.log('Textos:', textosPedidos);
console.log(`Total faturado: R$ ${totalFaturado.toFixed(2)}`);
textosPedidos.forEach((texto) => {
  const item = document.createElement('li');
  item.textContent = texto;
  document.querySelector('#pedidos').append(item);
});
document.querySelector('#total').textContent = `Total faturado: R$ ${totalFaturado.toFixed(2)}`;

// Uso estados explícitos e insiro os dados externos somente como texto.
function mostrarEstado(status, estado, mensagem) {
  status.dataset.estado = estado;
  status.textContent = mensagem;
}
function mensagemErro(erro) {
  if (erro.name === 'TimeoutError' || erro.name === 'AbortError') {
    return 'A busca demorou demais. Tente novamente.';
  }
  return 'Falha na conexão ou no serviço. Tente novamente.';
}
async function buscarDados(url) {
  // Fetch retorna uma Promise; await espera sua resposta sem bloquear a tela.
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) {
    const erro = new Error(`Erro HTTP ${response.status}`);
    erro.status = response.status;
    throw erro;
  }
  return await response.json();
}

// PARTE 2 — Buscador de CEP com histórico em um array de objetos.
const historicoCeps = [];
const formCep = document.querySelector('#form-cep');
const campoCep = document.querySelector('#cep');
const botaoCep = document.querySelector('#buscar-cep');
const statusCep = document.querySelector('#status-cep');
const resultadoCep = document.querySelector('#resultado-cep');
const listaHistorico = document.querySelector('#historico');
let buscandoCep = false;

formCep.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (buscandoCep) return;
  resultadoCep.replaceChildren();
  // Removo espaços das extremidades, mas rejeito letras e pontuação.
  const cep = campoCep.value.trim();
  if (!/^\d{8}$/.test(cep)) {
    mostrarEstado(statusCep, 'erro', 'Informe um CEP com exatamente 8 dígitos, sem letras ou pontuação.');
    return;
  }
  buscandoCep = true;
  botaoCep.disabled = true;
  resultadoCep.setAttribute('aria-busy', 'true');
  mostrarEstado(statusCep, 'carregando', 'Buscando...');
  try {
    const dados = await buscarDados(`https://viacep.com.br/ws/${cep}/json/`);
    if (!dados || typeof dados !== 'object') throw new Error('Resposta inválida');
    if (Object.hasOwn(dados, 'erro')) {
      mostrarEstado(statusCep, 'vazio', 'CEP não encontrado');
      return;
    }
    if (typeof dados.localidade !== 'string' || typeof dados.uf !== 'string') {
      throw new Error('Resposta incompleta');
    }
    resultadoCep.replaceChildren();
    const campos = [
      ['Rua', dados.logradouro], ['Bairro', dados.bairro],
      ['Cidade', dados.localidade], ['UF', dados.uf],
    ];
    campos.forEach(([rotulo, valor]) => {
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = rotulo;
      dd.textContent = typeof valor === 'string' && valor ? valor : 'Não informado';
      resultadoCep.append(dt, dd);
    });
    historicoCeps.push({ cep, cidade: dados.localidade, uf: dados.uf });
    listaHistorico.replaceChildren();
    historicoCeps.forEach((consulta) => {
      const item = document.createElement('li');
      item.textContent = `${consulta.cep} — ${consulta.cidade}/${consulta.uf}`;
      listaHistorico.append(item);
    });
    mostrarEstado(statusCep, 'sucesso', '');
  } catch (erro) {
    resultadoCep.replaceChildren();
    mostrarEstado(statusCep, 'erro', mensagemErro(erro));
    console.error('Falha na consulta de CEP:', erro);
  } finally {
    buscandoCep = false;
    botaoCep.disabled = false;
    resultadoCep.setAttribute('aria-busy', 'false');
  }
});

// PARTE 3 — Mini Pokédex: trato 404 como resultado não encontrado.
const formPokemon = document.querySelector('#form-pokemon');
const campoPokemon = document.querySelector('#pokemon');
const botaoPokemon = document.querySelector('#buscar-pokemon');
const statusPokemon = document.querySelector('#status-pokemon');
const resultadoPokemon = document.querySelector('#resultado-pokemon');
let buscandoPokemon = false;

formPokemon.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (buscandoPokemon) return;
  resultadoPokemon.replaceChildren();
  const nome = campoPokemon.value.trim().toLowerCase();
  if (nome === '') {
    mostrarEstado(statusPokemon, 'erro', 'Digite o nome de um Pokémon.');
    return;
  }
  buscandoPokemon = true;
  botaoPokemon.disabled = true;
  resultadoPokemon.setAttribute('aria-busy', 'true');
  mostrarEstado(statusPokemon, 'carregando', 'Buscando...');
  try {
    const dados = await buscarDados(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nome)}`);
    if (!dados || typeof dados.name !== 'string' || !Array.isArray(dados.types)) {
      throw new Error('Resposta inválida');
    }
    const titulo = document.createElement('h3');
    titulo.textContent = dados.name;
    const tipos = document.createElement('p');
    tipos.textContent = `Tipos: ${dados.types.map((item) => item.type.name).join(', ')}`;
    resultadoPokemon.append(titulo);
    if (dados.sprites?.front_default) {
      const imagem = document.createElement('img');
      const urlImagem = new URL(dados.sprites.front_default);
      if (urlImagem.protocol !== 'https:') throw new Error('URL de imagem inválida');
      imagem.src = urlImagem.href;
      imagem.alt = `Imagem de ${dados.name}`;
      imagem.addEventListener('error', () => {
        const aviso = document.createElement('p');
        aviso.textContent = 'Não foi possível carregar a imagem.';
        imagem.replaceWith(aviso);
      }, { once: true });
      resultadoPokemon.append(imagem);
    } else {
      const aviso = document.createElement('p');
      aviso.textContent = 'Imagem não disponível para este Pokémon.';
      resultadoPokemon.append(aviso);
    }
    resultadoPokemon.append(tipos);
    mostrarEstado(statusPokemon, 'sucesso', '');
  } catch (erro) {
    resultadoPokemon.replaceChildren();
    if (erro.status === 404) {
      mostrarEstado(statusPokemon, 'vazio', 'Pokémon não encontrado');
    } else {
      mostrarEstado(statusPokemon, 'erro', mensagemErro(erro));
      console.error('Falha na consulta de Pokémon:', erro);
    }
  } finally {
    buscandoPokemon = false;
    botaoPokemon.disabled = false;
    resultadoPokemon.setAttribute('aria-busy', 'false');
  }
});
