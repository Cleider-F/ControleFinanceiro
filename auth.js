import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export function protegerPagina(tiposPermitidos) {

  onAuthStateChanged(auth, async (user) => {

    if (!user) {
      window.location = "login.html";
      return;
    }

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert("Usuário sem permissão");
      return;
    }

    const dados = snap.data();

    if (!tiposPermitidos.includes(dados.tipo)) {
      alert("Acesso negado");
      window.location = "index.html";
      return;
    }

  });

}