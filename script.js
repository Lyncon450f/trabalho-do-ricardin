/* Notificações internas do site (não usa notificações do Chrome) */
function notificarSite(mensagem, tipo = 'sucesso') {
    let area = document.getElementById('notificacoesSite');
    if (!area) {
        area = document.createElement('div');
        area.id = 'notificacoesSite';
        area.className = 'notificacoes-site';
        area.setAttribute('aria-live', 'polite');
        area.setAttribute('aria-atomic', 'true');
        document.body.appendChild(area);
    }
    const aviso = document.createElement('div');
    aviso.className = 'aviso-site aviso-' + tipo;
    aviso.textContent = mensagem;
    area.appendChild(aviso);
    requestAnimationFrame(() => aviso.classList.add('visivel'));
    window.setTimeout(() => {
        aviso.classList.remove('visivel');
        window.setTimeout(() => aviso.remove(), 300);
    }, 4000);
}
// Estado inicial com livros de exemplo

const livrosIniciais = [
    { titulo: "Dom Casmurro", autor: "Machado de Assis", categoria: "Ficção", preco: 39.90, estoque: 5, emprestados: 0, vendidos: 0 },
    { titulo: "A Revolução dos Bichos", autor: "George Orwell", categoria: "Ficção", preco: 34.90, estoque: 4, emprestados: 0, vendidos: 0 },
    { titulo: "Harry Potter e a Pedra Filosofal", autor: "J. K. Rowling", categoria: "Ficção", preco: 49.90, estoque: 3, emprestados: 0, vendidos: 0 },
    { titulo: "O Hobbit", autor: "J. R. R. Tolkien", categoria: "Ficção", preco: 44.90, estoque: 4, emprestados: 0, vendidos: 0 },
    { titulo: "O Pequeno Príncipe", autor: "Antoine de Saint-Exupéry", categoria: "Ficção", preco: 29.90, estoque: 6, emprestados: 0, vendidos: 0 },
    { titulo: "Sapiens: Uma Breve História da Humanidade", autor: "Yuval Noah Harari", categoria: "História", preco: 59.90, estoque: 3, emprestados: 0, vendidos: 0 },
    { titulo: "Código Limpo (Clean Code)", autor: "Robert C. Martin", categoria: "Tecnologia", preco: 89.90, estoque: 2, emprestados: 0, vendidos: 0 }
];

// Capas de edições reais, localizadas pelo ISBN no catálogo Open Library.
const capasPorTitulo = {
    "Dom Casmurro": "9788535902778",
    "A Revolução dos Bichos": "9788535909555",
    "Harry Potter e a Pedra Filosofal": "9788532511010",
    "O Hobbit": "9788595084742",
    "O Pequeno Príncipe": "9788522031445",
    "Sapiens: Uma Breve História da Humanidade": "9788525432186",
    "Código Limpo (Clean Code)": "9780132350884"
};

// ISBNs usados para carregar as capas das edições correspondentes.
Object.assign(capasPorTitulo, {
    "1984": "9788535914849",
    "A cabeça do santo": "9788535923698",
    "Torto Arado": "9788535932691",
    "A hora da estrela": "9788532508126",
    "Vidas Secas": "9788501114785",
    "O diário de uma princesa desastrada": "9786559571803",
    "O diário de uma princesa desastrada 2": "9786559572503",
    "Diário de um Banana": "9788576831303",
    "Extraordinário": "9788580573015",
    "Percy Jackson e o Ladrão de Raios": "9788580575397",
    "Coraline": "9788551006642",
    "Anne de Green Gables": "9786555520080",
    "A garota que bebeu a lua": "9788579803262",
    "A psicologia financeira": "9788539004119",
    "Hábitos Atômicos": "9788550807560",
    "Sapiens: Uma Breve História da Humanidade": "9788525432186",
    "O guia do mochileiro das galáxias": "9788599296945",
    "O Pequeno Príncipe": "9788522031445",
    "O Hobbit": "9788595084742",
    "Harry Potter e a Pedra Filosofal": "9788532511010"
});

function obterCapaLivro(livro) {
    const isbn = capasPorTitulo[livro.titulo];
    return isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : "";
}



let livros = JSON.parse(localStorage.getItem('biblioteca_livros')) || livrosIniciais;
const supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

async function carregarLivrosDoBanco() {
    const { data, error } = await supabaseClient
        .from('livros')
        .select('*')
        .order('id', { ascending: true });

    if (error) throw error;

    if (data.length > 0) {
        livros = data.map(l => ({
            ...l,
            preco: Number(l.preco),
            estoque: Number(l.estoque),
            emprestados: Number(l.emprestados),
            vendidos: Number(l.vendidos)
        }));
    } else {
        // Banco vazio permanece vazio; evita recriar livros após o usuário apagar o acervo.
        livros = [];
    }

    localStorage.setItem('biblioteca_livros', JSON.stringify(livros));
}



// Elementos do Formulário e Catálogo

const livroForm = document.getElementById('livroForm');

const livroIdInput = document.getElementById('livroId');

const tituloInput = document.getElementById('titulo');

const autorInput = document.getElementById('autor');

const categoriaInput = document.getElementById('categoria');

const precoInput = document.getElementById('preco');

const estoqueInput = document.getElementById('estoque');



const formTitulo = document.getElementById('formTitulo');

const btnSalvar = document.getElementById('btnSalvar');

const btnCancelar = document.getElementById('btnCancelar');

const listaLivrosEl = document.getElementById('listaLivros');




// Elementos da Aba de Pesquisa Avançada

const pesquisaTexto = document.getElementById('pesquisaTexto');

const filtroCategoria = document.getElementById('filtroCategoria');

const filtroStatus = document.getElementById('filtroStatus');

const filtroOrdenacao = document.getElementById('filtroOrdenacao');

const btnLimparPesquisa = document.getElementById('btnLimparPesquisa');

const resultadosPesquisaEl = document.getElementById('resultadosPesquisa');

const contadorResultadosEl = document.getElementById('contadorResultados');



// Busca rápida da barra de navegação

const inputBuscaTopo = document.getElementById('inputBuscaTopo');

const btnBuscaTopo = document.getElementById('btnBuscaTopo');



// Salva no navegador e atualiza tudo

async function salvarDados() {
    localStorage.setItem('biblioteca_livros', JSON.stringify(livros));
    atualizarPainelResumo();

    const { error } = await supabaseClient
        .from('livros')
        .upsert(livros, { onConflict: 'id' });

    if (error) {
        console.error('Erro ao salvar no Supabase:', error);
        alert('Erro ao salvar no Supabase: ' + error.message + '\\nVerifique as permissões da tabela public.livros e a chave pública.');
    }
}



function atualizarTudo() {

    renderizarPesquisa();

    renderizarCatalogoCompleto();

    atualizarPainelResumo();

}



// Atualiza contadores do resumo

function atualizarPainelResumo() {

    document.getElementById('totalLivros').textContent = livros.length;

    document.getElementById('totalDisponiveis').textContent = livros.reduce((acc, l) => acc + l.estoque, 0);

    document.getElementById('totalEmprestados').textContent = livros.reduce((acc, l) => acc + l.emprestados, 0);

    document.getElementById('totalVendidos').textContent = livros.reduce((acc, l) => acc + l.vendidos, 0);

}



// Cria o HTML de um card de livro (reutilizado na Pesquisa e no Catálogo)

function criarCardLivro(livro) {

    const card = document.createElement('div');

    card.className = 'livro-card';



    const capa = obterCapaLivro(livro);
    const tituloSeguro = String(livro.titulo).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const autorSeguro = String(livro.autor).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    card.innerHTML = `
        <div>
            ${capa ? `<img class="capa-livro" src="${capa}" alt="Capa de ${tituloSeguro}" loading="lazy" onerror="this.style.display='none';">` : ''}
            <span class="livro-badge">${livro.categoria}</span>
            <h4>${tituloSeguro}</h4>
            <p class="livro-autor">por ${autorSeguro}</p>
            <div class="livro-detalhes">
                <div class="livro-preco">R$ ${livro.preco.toFixed(2).replace('.', ',')}</div>
                <div><strong>Disponível em estoque:</strong> ${livro.estoque} un.</div>
                <div><strong>Emprestados:</strong> ${livro.emprestados} un.</div>
                <div><strong>Vendidos:</strong> ${livro.vendidos} un.</div>
            </div>
        </div>
        <div class="livro-acoes">
            <button class="btn-acao btn-emprestar" onclick="emprestarLivro(${livro.id})" ${livro.estoque === 0 ? 'disabled' : ''}>Emprestar</button>
            <button class="btn-acao btn-devolver" onclick="devolverLivro(${livro.id})" ${livro.emprestados === 0 ? 'disabled' : ''}>Devolver</button>
            <button class="btn-acao btn-comprar" onclick="comprarLivro(${livro.id})" ${livro.estoque === 0 ? 'disabled' : ''}>Comprar</button>
            <button class="btn-acao btn-editar" onclick="prepararEdicao(${livro.id})">Editar</button>
            <button class="btn-acao btn-excluir" onclick="excluirLivro(${livro.id})">Excluir do Acervo</button>
        </div>
    `;

    return card;

}



// Renderiza a aba exclusiva de Pesquisa Avançada

function renderizarPesquisa() {

    const termo = pesquisaTexto.value.toLowerCase().trim();

    const categoria = filtroCategoria.value;

    const status = filtroStatus.value;

    const ordenacao = filtroOrdenacao.value;



    let filtrados = livros.filter(livro => {

        // Filtro por texto (título ou autor)

        const bateTexto = livro.titulo.toLowerCase().includes(termo) ||

                          livro.autor.toLowerCase().includes(termo);



        // Filtro por categoria

        const bateCategoria = categoria === 'todas' || livro.categoria === categoria;



        // Filtro por disponibilidade

        let bateStatus = true;

        if (status === 'disponivel') bateStatus = livro.estoque > 0;

        if (status === 'emprestado') bateStatus = livro.emprestados > 0;

        if (status === 'esgotado')   bateStatus = livro.estoque === 0;



        return bateTexto && bateCategoria && bateStatus;

    });



    // Ordenação

    if (ordenacao === 'az') {

        filtrados.sort((a, b) => a.titulo.localeCompare(b.titulo));

    } else if (ordenacao === 'menor-preco') {

        filtrados.sort((a, b) => a.preco - b.preco);

    } else if (ordenacao === 'maior-preco') {

        filtrados.sort((a, b) => b.preco - a.preco);

    } else if (ordenacao === 'maior-estoque') {

        filtrados.sort((a, b) => b.estoque - a.estoque);

    } else {

        filtrados.sort((a, b) => b.id - a.id);

    }



    // Atualiza contador

    contadorResultadosEl.textContent = filtrados.length === 1

        ? '1 livro encontrado'

        : `${filtrados.length} livros encontrados`;



    // Renderiza resultados

    resultadosPesquisaEl.innerHTML = '';

    if (filtrados.length === 0) {

        resultadosPesquisaEl.innerHTML = `

            <div class="sem-resultados">

                <h4>Nenhum livro encontrado</h4>

                <p>Tente buscar por outro termo ou clique em "Limpar Filtros".</p>

            </div>

        `;

        return;

    }



    filtrados.forEach(livro => {

        resultadosPesquisaEl.appendChild(criarCardLivro(livro));

    });

}



// Renderiza a lista completa na seção Gerenciar Livros

function renderizarCatalogoCompleto() {

    listaLivrosEl.innerHTML = '';

    if (livros.length === 0) {

        listaLivrosEl.innerHTML = '<p>Nenhum livro cadastrado no acervo.</p>';

        return;

    }



    livros.forEach(livro => {

        listaLivrosEl.appendChild(criarCardLivro(livro));

    });

}



// Eventos dos filtros da aba Pesquisa

pesquisaTexto.addEventListener('input', () => {

    inputBuscaTopo.value = pesquisaTexto.value;

    renderizarPesquisa();

});



filtroCategoria.addEventListener('change', renderizarPesquisa);

filtroStatus.addEventListener('change', renderizarPesquisa);

filtroOrdenacao.addEventListener('change', renderizarPesquisa);



// Botão Limpar Filtros

btnLimparPesquisa.addEventListener('click', () => {

    pesquisaTexto.value = '';

    inputBuscaTopo.value = '';

    filtroCategoria.value = 'todas';

    filtroStatus.value = 'todos';

    filtroOrdenacao.value = 'recentes';

    renderizarPesquisa();

});



// Sincroniza busca rápida do menu superior com a aba de Pesquisa

function executarBuscaTopo() {

    pesquisaTexto.value = inputBuscaTopo.value;

    renderizarPesquisa();

    document.getElementById('pesquisa').scrollIntoView({ behavior: 'smooth' });

}



btnBuscaTopo.addEventListener('click', executarBuscaTopo);

inputBuscaTopo.addEventListener('keypress', (e) => {

    if (e.key === 'Enter') executarBuscaTopo();

});



// Ao clicar em um card de Categoria na home, leva direto para a aba de Pesquisa já filtrada

function filtrarPorCategoria(nomeCategoria) {

    if (document.body.dataset.page === 'inicio') {
        window.location.href = 'pesquisa.html?categoria=' + encodeURIComponent(nomeCategoria);
        return;
    }

    filtroCategoria.value = nomeCategoria;

    renderizarPesquisa();

    document.getElementById('pesquisa').scrollIntoView({ behavior: 'smooth' });

}



// Cadastrar ou Salvar Edição diretamente no Supabase
livroForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const dadosLivro = {
        titulo: tituloInput.value.trim(),
        autor: autorInput.value.trim(),
        categoria: categoriaInput.value,
        preco: Number(precoInput.value),
        estoque: Number.parseInt(estoqueInput.value, 10)
    };

    if (!dadosLivro.titulo || !dadosLivro.autor ||
        !Number.isFinite(dadosLivro.preco) || dadosLivro.preco < 0 ||
        !Number.isInteger(dadosLivro.estoque) || dadosLivro.estoque < 0) {
        notificarSite('Preencha os campos corretamente antes de cadastrar.', 'erro');
        return;
    }

    btnSalvar.disabled = true;
    btnSalvar.textContent = 'Salvando...';

    try {
        const id = livroIdInput.value;
        let livroSalvo;

        if (id) {
            const { data, error } = await supabaseClient
                .from('livros')
                .update(dadosLivro)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            livroSalvo = data;
            const index = livros.findIndex(l => String(l.id) === String(id));
            if (index !== -1) livros[index] = {
                ...livroSalvo,
                preco: Number(livroSalvo.preco),
                estoque: Number(livroSalvo.estoque),
                emprestados: Number(livroSalvo.emprestados),
                vendidos: Number(livroSalvo.vendidos)
            };
            notificarSite('Livro atualizado com sucesso!');
        } else {
            const { data, error } = await supabaseClient
                .from('livros')
                .insert({ ...dadosLivro, emprestados: 0, vendidos: 0 })
                .select()
                .single();

            if (error) throw error;
            livroSalvo = data;
            livros.push({
                ...livroSalvo,
                preco: Number(livroSalvo.preco),
                estoque: Number(livroSalvo.estoque),
                emprestados: Number(livroSalvo.emprestados),
                vendidos: Number(livroSalvo.vendidos)
            });
            notificarSite('Livro cadastrado com sucesso!');
        }

        localStorage.setItem('biblioteca_livros', JSON.stringify(livros));
        resetarFormulario();
        atualizarTudo();
    } catch (error) {
        console.error('Erro ao salvar livro:', error);
        notificarSite('Não foi possível salvar: ' + error.message, 'erro');
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = livroIdInput.value ? 'Salvar Alterações' : 'Cadastrar Livro';
    }
});



// Preenche o formulário para edição

function prepararEdicao(id) {

    const livro = livros.find(l => l.id === id);

    if (!livro) return;



    livroIdInput.value = livro.id;

    tituloInput.value = livro.titulo;

    autorInput.value = livro.autor;

    categoriaInput.value = livro.categoria;

    precoInput.value = livro.preco;

    estoqueInput.value = livro.estoque;



    formTitulo.textContent = `Editando: ${livro.titulo}`;

    btnSalvar.textContent = 'Salvar Alterações';

    btnCancelar.style.display = 'inline-block';



    document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });

}



function resetarFormulario() {

    livroForm.reset();

    livroIdInput.value = '';

    formTitulo.textContent = 'Cadastrar Novo Livro';

    btnSalvar.textContent = 'Cadastrar Livro';

    btnCancelar.style.display = 'none';

}



btnCancelar.addEventListener('click', resetarFormulario);



// Emprestar

function emprestarLivro(id) {

    const livro = livros.find(l => l.id === id);

    if (!livro || livro.estoque <= 0) return;



    const leitor = prompt(`Informe o nome do leitor que vai pegar "${livro.titulo}" emprestado:`);

    if (!leitor || leitor.trim() === '') return;



    livro.estoque -= 1;

    livro.emprestados += 1;



    salvarDados();

    atualizarTudo();

    notificarSite(`Empréstimo registrado para ${leitor.trim()}!`);

}



// Devolver

function devolverLivro(id) {

    const livro = livros.find(l => l.id === id);

    if (!livro || livro.emprestados <= 0) return;



    livro.emprestados -= 1;

    livro.estoque += 1;



    salvarDados();

    atualizarTudo();

    notificarSite(`Devolução de "${livro.titulo}" registrada com sucesso!`);

}



// Comprar

function comprarLivro(id) {

    const livro = livros.find(l => l.id === id);

    if (!livro || livro.estoque <= 0) return;



    const confirmar = confirm(`Confirmar a compra de "${livro.titulo}" por R$ ${livro.preco.toFixed(2).replace('.', ',')}?`);

    if (!confirmar) return;



    livro.estoque -= 1;

    livro.vendidos += 1;



    salvarDados();

    atualizarTudo();

    notificarSite(`Compra realizada! Obrigado por adquirir "${livro.titulo}".`);

}



// Excluir

async function excluirLivro(id) {

    const livro = livros.find(l => l.id === id);

    if (!livro) return;



    if (confirm(`Tem certeza que deseja excluir "${livro.titulo}" do acervo?`)) {

        const { error } = await supabaseClient.from('livros').delete().eq('id', id);
        if (error) {
            console.error('Erro ao excluir no Supabase:', error);
            notificarSite('Não foi possível excluir o livro do banco de dados.', 'erro');
            return;
        }
        livros = livros.filter(l => l.id !== id);

        salvarDados();

        atualizarTudo();

    }

}





// Inicializa a aplicação carregando os dados compartilhados do Supabase.
(async function iniciarAplicacao() {
    try {
        const categoriaInicial = new URLSearchParams(window.location.search).get('categoria');
        if (categoriaInicial && [...filtroCategoria.options].some(opcao => opcao.value === categoriaInicial)) {
            filtroCategoria.value = categoriaInicial;
        }
        await carregarLivrosDoBanco();
        atualizarTudo();
    } catch (error) {
        console.error('Erro ao conectar ao Supabase:', error);
        notificarSite('Erro ao conectar ao banco: ' + error.message, 'erro');
        atualizarTudo();
    }
})();