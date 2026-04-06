let usuarioAtual = "";

const supabaseUrl = 'https://upmbqjwqwotmdqlfijxc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbWJxandxd290bWRxbGZpanhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNjEzOTQsImV4cCI6MjA5MDczNzM5NH0.grgeLJj2IrPxag60qalvbf_-DMRpBi6rbGWD7aUJ0vQ'

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// ================= EMPRESAS =================
async function carregarEmpresas() {
    const { data, error } = await supabaseClient.from("empresas").select("*");

    if (error) return console.error(error);

    const select = document.getElementById("empresaSelect");

    data.forEach(emp => {
        const option = document.createElement("option");
        option.value = emp.id;
        option.textContent = emp.nome;
        select.appendChild(option);
    });
}

// ================= EVENTOS =================
async function carregarEventos() {

    usuarioAtual = document.getElementById("usuarioSelect").value;

    if (!usuarioAtual) {
        alert("Selecione um usuário");
        return;
    }

    const empresaId = document.getElementById("empresaSelect").value;

    if (!empresaId) {
        alert("Selecione uma empresa");
        return;
    }

    const lista = document.getElementById("lista-eventos");
    lista.innerHTML = "Carregando...";

    const { data, error } = await supabaseClient
        .from("eventos")
        .select("*")
        .eq("empresa_id", empresaId);

    if (error) {
        console.error(error);
        return;
    }

    lista.innerHTML = "";

    data.forEach(evento => {
        const item = document.createElement("li");

        item.innerHTML = `
            <span style="color:${getCorStatus(evento.status)}">
                ${evento.titulo} - <strong>${evento.status}</strong>
            </span>
            ${normalizar(evento.prioridade) === 'urgente' ? '🚨 URGENTE' : ''}
            <button onclick="verDetalhes('${evento.id}')">Ver</button>
        `;

        lista.appendChild(item);
    });

    atualizarResumo(data);
}

// ================= DETALHES =================
async function verDetalhes(id) {

    const { data, error } = await supabaseClient
        .from("eventos")
        .select("*")
        .eq("id", id)
        .limit(1);

    if (error) return console.error(error);

    const evento = data[0];
    const div = document.getElementById("detalhes-evento");

    if (!evento) {
        div.innerHTML = "Evento não encontrado";
        return;
    }

    div.innerHTML = `
        <h3>${evento.titulo}</h3>
        <p>${evento.descricao || "Sem descrição"}</p>
        <p><strong>Status:</strong> ${evento.status}</p>

        <button onclick="iniciarAtendimento('${evento.id}')">
            ▶️ Iniciar Atendimento
        </button>

        <button onclick="concluirAtendimento('${evento.id}')">
            ✅ Concluir Atendimento
        </button>

        <hr>

        <h4>💬 Novo Comentário</h4>
        <textarea id="novoComentario"></textarea><br>
        <button onclick="adicionarComentario('${evento.id}')">Comentar</button>

        <h4>📜 Histórico</h4>
        <ul id="lista-comentarios"></ul>
    `;

    carregarComentarios(id);
}

// ================= COMENTÁRIOS =================
async function adicionarComentario(eventoId) {

    const texto = document.getElementById("novoComentario").value;

    if (!texto) return alert("Digite um comentário");

    const { error } = await supabaseClient
        .from("comentarios_evento")
        .insert([{
            evento_id: eventoId,
            comentario: texto,
            autor: usuarioAtual
        }]);

    if (error) return alert("Erro ao salvar");

    document.getElementById("novoComentario").value = "";

    carregarComentarios(eventoId);
}

async function carregarComentarios(eventoId) {

    const { data, error } = await supabaseClient
        .from("comentarios_evento")
        .select("*")
        .eq("evento_id", eventoId)
        .order("data_criacao", { ascending: true });

    const lista = document.getElementById("lista-comentarios");

    if (error) return lista.innerHTML = "Erro";

    lista.innerHTML = "";

    data.forEach(c => {
        const item = document.createElement("li");

        item.innerHTML = `
            <strong>${c.autor}</strong>: ${c.comentario}
            <br><small>${new Date(c.data_criacao).toLocaleString()}</small>
        `;

        lista.appendChild(item);
    });
}

// ================= STATUS =================
async function iniciarAtendimento(id) {

    await supabaseClient
        .from("eventos")
        .update({ status: "em atendimento" })
        .eq("id", id);

    await supabaseClient.from("comentarios_evento").insert([{
        evento_id: id,
        autor: usuarioAtual,
        comentario: "Iniciou o atendimento"
    }]);

    carregarEventos();
    verDetalhes(id);
}

async function concluirAtendimento(id) {

    await supabaseClient
        .from("eventos")
        .update({ status: "concluído" })
        .eq("id", id);

    await supabaseClient.from("comentarios_evento").insert([{
        evento_id: id,
        autor: usuarioAtual,
        comentario: "Concluiu o atendimento"
    }]);

    carregarEventos();
    verDetalhes(id);
}

// ================= UTIL =================
function normalizar(texto) {
    return texto?.toLowerCase().trim();
}

function getCorStatus(status) {
    const s = normalizar(status);

    if (s === "pendente") return "orange";
    if (s === "em atendimento") return "blue";
    if (s === "concluido" || s === "concluído") return "green";

    return "black";
}

function atualizarResumo(eventos) {

    let pendente = 0;
    let atendimento = 0;
    let concluido = 0;
    let urgente = 0;

    eventos.forEach(e => {

        const status = normalizar(e.status);
        const prioridade = normalizar(e.prioridade);

        if (status === "pendente") pendente++;
        if (status === "em atendimento") atendimento++;
        if (status === "concluido" || status === "concluído") concluido++;
        if (prioridade === "urgente") urgente++;
    });

    document.getElementById("resumo").innerHTML = `
        🟡 ${pendente} | 🔵 ${atendimento} | 🟢 ${concluido} | 🚨 ${urgente}
    `;
}

// INIT
carregarEmpresas();