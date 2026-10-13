# Meu mini projeto — Objetos, Dados e Assincronismo (Semana 05)

Desenvolvi um projeto com validação de pedidos, um buscador de CEP e uma Mini Pokédex. Separei a estrutura e os estilos em `index.html` e a lógica em `app.js`, carregado com `defer`. As consultas usam APIs reais e precisam de internet.

## Como executo

Extraio o ZIP, mantenho `index.html` e `app.js` na mesma pasta e abro `index.html` no navegador. Também posso abrir a pasta no VS Code e usar o Live Server. Pressiono F12 e seleciono Console para acompanhar o exercício dos pedidos. Uso um navegador moderno, com suporte a `AbortSignal.timeout()`.

## Minha validação de pedidos

Usei um array de objetos `pedidos`. Considero válido um pedido com cliente do tipo string, não vazio após `trim()`, e valor do tipo number, finito e maior que zero. Rejeito valores negativos, zero, NaN, Infinity e strings numéricas.

Com `filter`, selecionei os pedidos válidos e depois somente os de status `pago`. Somei os valores com `reduce`, iniciando o acumulador em zero. Com `map` e `toFixed(2)`, gerei textos como `Bia — R$ 120.00`. Os dados de exemplo resultam em três pedidos válidos, dois pagos e faturamento de **R$ 200.50**.

## Meu buscador de CEP

Uso `trim()` para limpar espaços nas extremidades e `/^\d{8}$/` para exigir exatamente oito dígitos. Não removo letras ou pontuação, para não transformar um CEP inválido em uma consulta aparentemente válida. Por exemplo, `01001000` é aceito e `01001-000` é rejeitado.

Consulto `https://viacep.com.br/ws/{cep}/json/` com `fetch` e `async/await`. Verifico `response.ok` antes de converter o JSON. Se a resposta tiver a chave `erro`, mostro **CEP não encontrado**. Em sucesso, crio `dt` e `dd` para Rua, Bairro, Cidade e UF. Campos de endereço vazios aparecem como **Não informado**.

Guardo cada consulta encontrada em um array de objetos e mostro o histórico na tela. Consultas repetidas são mantidas; esse histórico fica na memória e é apagado ao recarregar.

## Minha Mini Pokédex

Limpo o nome com `trim()`, rejeito entrada vazia e converto para minúsculas com `toLowerCase()`. Uso `encodeURIComponent()` no nome inserido na URL. Consulto a PokéAPI e mostro nome, imagem de `sprites.front_default` e tipos. Trato HTTP 404 como **Pokémon não encontrado**; outros erros HTTP e falhas de rede produzem mensagem de erro. Se não houver imagem ou ela falhar ao carregar, mostro um aviso.

## Meus quatro estados

| Estado | Comportamento |
| --- | --- |
| Carregando | Exibo `Buscando...` e desabilito o botão da consulta. |
| Erro | Exibo mensagem de validação, falha de conexão/serviço ou tempo excedido. |
| Vazio | Exibo `CEP não encontrado` ou `Pokémon não encontrado`. |
| Sucesso | Exibo os dados e limpo a mensagem de status. |

Limpo os resultados anteriores com `replaceChildren()`, uso `createElement` e `textContent` para os dados externos e nunca insiro respostas com `innerHTML`. Uso `preventDefault()` no submit e `finally` para reativar o botão mesmo quando ocorre erro. Também evito buscas simultâneas no mesmo formulário. Cada busca tem limite de cinco segundos com `AbortSignal.timeout(5000)`.

## Minha reflexão: por que Promise.all pode ser mais rápido que vários await seguidos?

Quando faço `await fetch(url1)` e somente depois inicio `fetch(url2)`, a segunda requisição espera a primeira terminar. Com `Promise.all([fetch(url1), fetch(url2)])`, inicio as duas requisições antes de aguardar seus resultados, permitindo que os tempos de rede se sobreponham. Para buscas independentes, o tempo tende a ficar próximo ao da requisição mais lenta, em vez da soma das durações.

Entendi que `Promise.all` não inicia sozinho uma operação: quem inicia as requisições são as chamadas a `fetch` usadas para criar as promises. Se eu criar as duas promises antes dos awaits, elas também podem executar concorrentemente. Uso `Promise.all` para aguardar todos os resultados em conjunto; ele rejeita quando uma promise rejeita e não cancela automaticamente as outras. Não é indicado quando a segunda operação depende do resultado da primeira.

## Como verifico

- Confiro a validação dos pedidos e o total de R$ 200.50.
- Busco `01001000` e confiro os dados do endereço.
- Busco `99999999` para verificar CEP não encontrado.
- Tento CEP com letras, hífen ou menos de oito dígitos.
- Busco ` PIKACHU ` e confiro nome, imagem e tipos.
- Busco um nome inexistente para verificar o tratamento do 404.
- Envio um nome vazio e confiro a mensagem de validação.
- Simulo uma conexão indisponível nas ferramentas do navegador e verifico o estado de erro e a reativação do botão.
- Confiro que uma busca nova limpa os dados anteriores e que consultas de CEP encontradas aparecem no histórico.

## Fontes das APIs

- ViaCEP: https://viacep.com.br/
- PokéAPI: https://pokeapi.co/docs/v2

## Minha entrega

Crio um repositório no GitHub e envio `index.html`, `app.js` e `README.md` extraídos do ZIP usando **Add file > Upload files**. Deixo o repositório público ou libero acesso para avaliação. A publicação no GitHub ainda precisa ser feita.
