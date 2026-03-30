const API_URL = "https://script.google.com/macros/s/AKfycbwt6q64g9AwpkeEQGHJlN4kkujp882TuVKWZE5mVMO6_RuSbw0ET_hu3xT_A3ytNVNz/exec";

function fazerLogin() {
  mostrarLoader();

  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;

  const mensagem = document.getElementById("mensagem");

  mensagem.innerText = "";

  if (!usuario || !senha) {
    esconderLoader();
    mensagem.innerText = "Preencha usuário e senha";
    return;
  }

  const url = `${API_URL}?acao=login&usuario=${encodeURIComponent(usuario)}&senha=${encodeURIComponent(senha)}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.status === "ok") {
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        window.location.href = "dashboard.html";
      } else {
        mensagem.innerText = data.mensagem;
      }
    })
    .catch(err => {
      console.error("Erro:", err);
      mensagem.innerText = "Erro ao conectar com o servidor";
    })
    .finally(() => esconderLoader());
}
function mostrarLoader() {
    document.getElementById("loader").classList.remove("hidden");
}

function esconderLoader() {
    document.getElementById("loader").classList.add("hidden");
}