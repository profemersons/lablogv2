const API_URL = "https://script.google.com/macros/s/AKfycbwt6q64g9AwpkeEQGHJlN4kkujp882TuVKWZE5mVMO6_RuSbw0ET_hu3xT_A3ytNVNz/exec";
const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
    alert("Você precisa fazer login");
    window.location.href = "index.html";
}

// 🔹 Nome da empresa
document.getElementById("empresaNome").innerText =
    "Empresa " + usuario.empresa_id;


// 🚀 FUNÇÃO PRINCIPAL DE NAVEGAÇÃO
function carregarPagina(pagina) {
    const conteudo = document.getElementById("conteudo");

    const paginas = {
        dashboard: () => {
            conteudo.innerHTML = `
        <div class="top-bar">
          <h2>Dashboard</h2>
        </div>

        <div class="card">
          <strong>Usuário:</strong> ${usuario.nome}
        </div>

        <div class="card">
          <strong>Cargo:</strong> ${usuario.cargo}
        </div>

        <div class="card">
          <strong>Status:</strong> <span class="status-ok">● Online</span>
        </div>
      `;
        },

        cadastroFornecedor: () => {
            conteudo.innerHTML = `
        <h2>Cadastro de Fornecedores</h2>

        <div class="card">
          <input type="text" id="nomeFornecedor" placeholder="Nome">
          <input type="text" id="cnpjFornecedor" placeholder="CNPJ">
          <input type="text" id="contatoFornecedor" placeholder="Contato">
          <input type="text" id="emailFornecedor" placeholder="Email">
          <input type="text" id="tipoFornecedor" placeholder="Tipo de produto">

          <button onclick="salvarFornecedor()">Salvar</button>
        </div>
      `;
        },

        listaFornecedor: () => {
            conteudo.innerHTML = `
        <h2>Fornecedores</h2>

        <div class="card">
            <input type="text" id="filtroFornecedor" placeholder="Buscar por nome..." 
            onkeyup="filtrarFornecedores()">

            <select id="filtroStatus" onchange="filtrarFornecedores()">
            <option value="">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
            </select>

            <select id="filtroTipo" onchange="filtrarFornecedores()">
            <option value="">Todos os tipos</option>
            <option value="Informática">Informática</option>
            <option value="Alimentos">Alimentos</option>
            </select>

            <br><br>

            <div id="tabelaFornecedores">
            Carregando fornecedores...
            </div>
        </div>
        `;
            carregarFornecedores();
        },

        compras: () => {
            conteudo.innerHTML = `
        <h2>Compras</h2>
        <div class="card">
          <p>Solicitar compra (em breve)</p>
        </div>
      `;
        },

        logistica: () => {
            conteudo.innerHTML = `
        <h2>Logística</h2>
        <div class="card">
          <p>Simulação logística (em breve)</p>
        </div>
      `;
        },

        eventos: () => {
            carregarEventos();
        }
    };

    // executa a página
    if (paginas[pagina]) {
        paginas[pagina]();
    } else {
        conteudo.innerHTML = "<p>Página não encontrada</p>";
    }
}

// 🔹 LOGOUT
function logout() {
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
}


// 🔹 INICIA NA DASHBOARD
carregarPagina("dashboard");


// 🔥 EXEMPLO (vamos evoluir depois)
function salvarFornecedor() {
    mostrarLoader();

    const nome = document.getElementById("nomeFornecedor").value;
    const cnpj = document.getElementById("cnpjFornecedor").value;
    const contato = document.getElementById("contatoFornecedor").value;
    const email = document.getElementById("emailFornecedor").value;
    const tipo = document.getElementById("tipoFornecedor").value;

    if (!nome || !cnpj || !contato || !email || !tipo) {
        esconderLoader();
        alert("Preencha todos os campos");
        return;
    }

    const url = `${API_URL}?acao=salvarFornecedor&empresa_id=${usuario.empresa_id}&nome=${encodeURIComponent(nome)}&cnpj=${cnpj}&contato=${encodeURIComponent(contato)}&email=${encodeURIComponent(email)}&tipo_produto=${encodeURIComponent(tipo)}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.status === "ok") {
                mostrarToast("Fornecedor salvo com sucesso!");
                document.getElementById("nomeFornecedor").value = "";
                document.getElementById("cnpjFornecedor").value = "";
                document.getElementById("contatoFornecedor").value = "";
                document.getElementById("emailFornecedor").value = "";
                document.getElementById("tipoFornecedor").value = "";
            } else {
                alert("Erro ao salvar");
            }
        })
        .catch(err => {
            console.error("Erro:", err);
            alert("Erro na conexão");
        })
        .finally(() => esconderLoader());
}


function carregarFornecedores() {
    mostrarLoader();

    const url = `${API_URL}?acao=listarFornecedores&empresa_id=${usuario.empresa_id}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {

            if (data.status !== "ok") {
                alert("Erro ao carregar fornecedores");
                return;
            }

            window.listaFornecedores = data.dados;
            renderTabelaFornecedores(data.dados);
        })
        .catch(err => {
            console.error(err);
            alert("Erro na conexão");
        })
        .finally(() => esconderLoader());
}

function filtrarFornecedores() {
    const termo = document.getElementById("filtroFornecedor").value.toLowerCase();
    const status = document.getElementById("filtroStatus").value;
    const tipo = document.getElementById("filtroTipo").value;

    const filtrados = window.listaFornecedores.filter(f => {
        return (
            f.nome.toLowerCase().includes(termo) &&
            (status === "" || f.status === status) &&
            (tipo === "" || f.tipo === tipo)
        );
    });

    renderTabelaFornecedores(filtrados);
}

function renderTabelaFornecedores(lista) {
    let html = `
    <table border="1" width="100%" style="border-collapse: collapse;">
      <tr>
        <th>Nome</th>
        <th>Tipo</th>
        <th>Contato</th>
        <th>Email</th>
        <th>Status</th>
        <th>Ações</th>
      </tr>
  `;

    lista.forEach(f => {
        html += `
      <tr>
        <td>${f.nome}</td>
        <td>${f.tipo}</td>
        <td>${f.contato}</td>
        <td>${f.email}</td>
        <td>
          ${f.status === "ativo"
                ? '<span style="color:green">Ativo</span>'
                : '<span style="color:red">Inativo</span>'}
        </td>
        <td>
          <button onclick="editarFornecedor(${f.id})">✏️</button>
        </td>
      </tr>
    `;
    });

    html += `</table>`;

    document.getElementById("tabelaFornecedores").innerHTML = html;
}

function editarFornecedor(id) {
    const fornecedor = window.listaFornecedores.find(f => f.id == id);

    const conteudo = document.getElementById("conteudo");

    conteudo.innerHTML = `
        <h2>Editar Fornecedor</h2>

        <div class="card">
            <input type="text" id="editNome" value="${fornecedor.nome}">
            <input type="text" id="editCnpj" value="${fornecedor.cnpj}">
            <input type="text" id="editContato" value="${fornecedor.contato}">
            <input type="text" id="editEmail" value="${fornecedor.email}">
            <input type="text" id="editTipo" value="${fornecedor.tipo}">

            <select id="editStatus">
                <option value="ativo" ${fornecedor.status === "ativo" ? "selected" : ""}>Ativo</option>
                <option value="inativo" ${fornecedor.status === "inativo" ? "selected" : ""}>Inativo</option>
            </select>

            <br><br>

            <button onclick="atualizarFornecedor(${fornecedor.id})">Salvar</button>
            <button onclick="carregarPagina('listaFornecedor')">Cancelar</button>
        </div>
    `;
}
function atualizarFornecedor(id) {
    mostrarLoader();

    const nome = document.getElementById("editNome").value;
    const cnpj = document.getElementById("editCnpj").value;
    const contato = document.getElementById("editContato").value;
    const email = document.getElementById("editEmail").value;
    const tipo = document.getElementById("editTipo").value;
    const status = document.getElementById("editStatus").value;

    const url = `${API_URL}?acao=editarFornecedor&id=${id}&nome=${encodeURIComponent(nome)}&cnpj=${cnpj}&contato=${encodeURIComponent(contato)}&email=${encodeURIComponent(email)}&tipo_produto=${encodeURIComponent(tipo)}&status=${status}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.status === "ok") {
                alert("Fornecedor atualizado!");
                carregarPagina("listaFornecedor");
            } else {
                alert("Erro ao atualizar");
            }
        })
        .catch(err => {
            console.error(err);
            alert("Erro na conexão");
        })
        .finally(() => esconderLoader());
}
async function carregarEventos() {
    const conteudo = document.getElementById("conteudo");

    mostrarLoader();
    conteudo.innerHTML = "<p>Carregando eventos...</p>";

    try {
        const resEventos = await fetch(`${API_URL}?acao=listarEventos&empresa_id=${usuario.empresa_id}`);
        const dataEventos = await resEventos.json();

        if (dataEventos.status !== "ok") {
            conteudo.innerHTML = "<p>Erro ao carregar eventos</p>";
            return;
        }

        const eventos = dataEventos.dados;

        let statusLista = [];

        try {
            const resStatus = await fetch(`${API_URL}?acao=listarEventoStatus&empresa_id=${usuario.empresa_id}`);
            const dataStatus = await resStatus.json();

            if (dataStatus.status === "ok") {
                statusLista = dataStatus.dados || [];
            }

        } catch (e) {
            console.warn("Status não carregado");
        }

        renderEventos(eventos, statusLista);

    } catch (erro) {
        console.error(erro);
        conteudo.innerHTML = "<p>Erro na conexão</p>";
    }

    esconderLoader();
}
function renderEventos(eventos, statusLista) {
    const conteudo = document.getElementById("conteudo");

    let html = "<h2>Eventos</h2>";

    eventos.forEach(ev => {

        const statusObj = statusLista.find(s => s.evento_id == ev.id);

        let status = statusObj ? statusObj.status : "aberto";

        let cor = "#64748b";
        if (status === "concluido") cor = "green";
        if (status === "falhou") cor = "red";
        if (status === "em_andamento") cor = "orange";

        html += `
            <div class="card">
                <h3>${ev.tipo}</h3>
                <p>${ev.descricao}</p>

                <p>Status: <strong style="color:${cor}">${status}</strong></p>

                <select id="status_${ev.id}">
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="falhou">Falhou</option>
                </select>

                <input type="text" id="motivo_${ev.id}" placeholder="Motivo (opcional)">

                <button onclick="atualizarStatus(${ev.id})">
                    Atualizar
                </button>
            </div>
        `;
    });

    conteudo.innerHTML = html;
}

async function atualizarStatus(evento_id) {
    mostrarLoader();

    const status = document.getElementById("status_" + evento_id).value;
    const motivo = document.getElementById("motivo_" + evento_id).value;

    const url = `${API_URL}?acao=atualizarEventoStatus&evento_id=${evento_id}&empresa_id=${usuario.empresa_id}&status=${status}&motivo=${encodeURIComponent(motivo)}&usuario=${encodeURIComponent(usuario.nome)}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === "atualizado" || data.status === "criado") {
            alert("Atualizado!");
            carregarEventos();
        } else {
            alert("Erro ao atualizar");
            console.log(data);
        }

    } catch (erro) {
        console.error(erro);
        alert("Erro na conexão");
    }

    esconderLoader();
}
function mostrarLoader() {
    document.getElementById("loader").classList.remove("hidden");
}

function esconderLoader() {
    document.getElementById("loader").classList.add("hidden");
}
function mostrarToast(mensagem, tipo = "sucesso") {
    const toast = document.getElementById("toast");

    toast.innerText = mensagem;
    toast.className = `toast show ${tipo}`;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}