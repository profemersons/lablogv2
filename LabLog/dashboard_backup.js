function carregarDashboard() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario) {
    alert("Você precisa fazer login");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("usuarioNome").innerText = usuario.nome;
  document.getElementById("usuarioCargo").innerText = usuario.cargo;

  // 🔥 aqui depois vamos puxar da planilha
  document.getElementById("empresaNome").innerText = "Empresa " + usuario.empresa_id;
}

function logout() {
  localStorage.removeItem("usuario");
  window.location.href = "index.html";
}

carregarDashboard();