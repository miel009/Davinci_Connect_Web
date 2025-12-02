// admin.js: UI helpers for admin.html 

(async function () {

  let adminMsgTimer = null;
  

  function show(msg, type, autoHide = true, hideAfterMs = 5000) {
    const el = document.getElementById("adminMessage");
    if (!el) return;

    el.classList.remove("hide");
    el.innerText = msg;

    el.classList.remove("admin-message", "success", "error");
    el.classList.add("admin-message");

    if (type === "success") el.classList.add("success");
    if (type === "error") el.classList.add("error");

    if (adminMsgTimer) clearTimeout(adminMsgTimer);

    if (autoHide) {
      adminMsgTimer = setTimeout(() => {
        el.classList.add("hide");
        setTimeout(() => {
          el.innerText = "";
          el.classList.remove("admin-message", "success", "error", "hide");
        }, 260);
      }, hideAfterMs);
    }
  }

  async function getToken() {
    if (!window.__davinciFirebase) return null;
    return await window.__davinciFirebase.getCurrentUserToken();
  }

    function setAuthenticatedUI(isAuth, email) {
    document.getElementById("adminAuth").style.display = isAuth ? "none" : "";
    document.getElementById("adminTools").style.display = isAuth ? "" : "none";
    document.getElementById("adminUserInfo").style.display = isAuth ? "" : "none";
    document.getElementById("adminUserEmail").innerText = isAuth ? email : "";
  }

  /* CAMBIO DE SECCIONES DEL PANEL*/
  window.showSection = function(section) {
    const sections = {
      usuarios: "adminUsers",
      comentarios: "adminComments",
      contenidos: "adminContents",
      configuracion: "adminConfig",
    };

    Object.values(sections).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });

    const target = document.getElementById(sections[section]);
    if (target) {
      target.style.display = "block";

      if (section === "usuarios") loadUsuarios();
      if (section === "comentarios") loadComentarios();
    }
  };

  /*  USUARIOS – listar*/
  async function loadUsuarios() {
    const cont = document.getElementById("adminUsersList");
    if (!cont) return;

    cont.innerHTML = "Cargando usuarios...";

    const token = await getToken();
    if (!token) {
      cont.innerHTML = "No autenticado.";
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: "Bearer " + token }
      });

      if (!res.ok) {
        cont.innerHTML = "Error cargando usuarios.";
        return;
      }

      const usuarios = await res.json();

      if (!usuarios.length) {
        cont.innerHTML = "No hay usuarios registrados.";
        return;
      }

      cont.innerHTML = usuarios.map(u => `
        <div style="
          padding:10px;
          border-bottom:1px solid rgba(255,255,255,0.04);
          display:flex; 
          justify-content:space-between;
          align-items:center;">
          
          <div>
            <strong>${u.email}</strong><br>
            <small style='color:#777'>UID: ${u.uid}</small><br>
            ${u.admin ? "<small style='color:#a445ff'>Administrador</small>" : ""}
          </div>

          <div>
            <button class="btn" onclick="deleteUsuario('${u.uid}')">Eliminar</button>
          </div>
        </div>
      `).join("");

    } catch (err) {
      console.error(err);
      cont.innerHTML = "Error cargando usuarios.";
    }
  }

  /* USUARIOS – eliminar */
  window.deleteUsuario = async function(uid) {
    if (!confirm("¿Eliminar este usuario definitivamente?")) return;

    const token = await getToken();
    if (!token) return show("No estás autenticado", "error");

    try {
      const res = await fetch("/api/admin/users/" + uid, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return show(data.error || "No se pudo eliminar el usuario", "error");
      }

      show("Usuario eliminado", "success");
      loadUsuarios();

    } catch (err) {
      console.error(err);
      show("Error eliminando usuario", "error");
    }
  };
  /*  ASIGNAR ADMINISTRADOR */
  const setAdminForm = document.getElementById("setAdminForm");
  if (setAdminForm) {
    setAdminForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("makeAdminEmail").value.trim();
      if (!email || !email.includes("@"))
        return show("Ingresa un email válido", "error");

      const token = await getToken();
      if (!token)
        return show("No estás autenticado. Inicia sesión primero.", "error");

      try {
        const res = await fetch("/api/admin/set-admin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ email }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          return show(data.error || "No se pudo asignar administrador", "error");
        }

        show(`Ahora ${data.name} (${data.email}) es administrador.`, "success");
        setAdminForm.reset();

      } catch (err) {
        console.error(err);
        show(err.message || "Error inesperado asignando administrador", "error");
      }
    });
  }

  /* COMENTARIOS (listar y eliminar) */
  async function loadComentarios() {
    const lista = document.getElementById("adminComments");
    if (!lista) return;
    lista.innerHTML = "Cargando...";

    try {
      const res = await fetch("/api/comentarios");
      const data = await res.json();

      lista.innerHTML = "";

      for (const c of data) {
        const row = document.createElement("div");
        row.className = "admin-comment-row";
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.gap = "12px";
        row.style.padding = "10px";
        row.style.borderBottom = "1px solid rgba(255,255,255,0.04)";

        row.innerHTML = `
          <div style="flex:1">
            <strong>${c.usuario}</strong>
            <small style="color:#999">${c.email}</small>
            <div style="color:#ddd">${c.mensaje}</div>
          </div>
        `;

        const btn = document.createElement("button");
        btn.className = "btn";
        btn.innerText = "Eliminar";
        btn.addEventListener("click", async () => {
          if (!confirm("¿Eliminar comentario?")) return;

          const token = await getToken();
          if (!token) return show("No estás autenticado.", "error");

          const del = await fetch("/api/admin/comments/" + c.id, {
            method: "DELETE",
            headers: { Authorization: "Bearer " + token },
          });

          if (!del.ok) {
            const d = await del.json().catch(() => ({}));
            return show(d.error || "Error eliminando comentario", "error");
          }

          show("Comentario eliminado", "success");
          loadComentarios();
        });

        row.appendChild(btn);
        lista.appendChild(row);
      }
    } catch (err) {
      console.error(err);
      lista.innerHTML = "No se pudieron cargar comentarios.";
    }
  }

  /*   LOGIN ADMIN*/
  const adminLoginFormLocal = document.getElementById("adminLoginFormLocal");
  const adminSignOutBtn = document.getElementById("adminSignOut");

  async function verifyCurrentUser() {
    const token = await getToken();
    if (!token) return setAuthenticatedUI(false);

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        setAuthenticatedUI(false);
        show("Acceso denegado: no eres administrador", "error");
        try { await window.__davinciFirebase.signOut(); } catch {
            // Ignorar error de signOut

        }
        return;
      }

      const info = await res.json();
      setAuthenticatedUI(true, info.email);
      show(`Conectado como administrador: ${info.email}`, "success");
      loadComentarios();

    } catch (err) {
      console.error(err);
      setAuthenticatedUI(false);
    }
  }

  if (adminLoginFormLocal) {
    adminLoginFormLocal.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("adminLocalEmail").value.trim();
      const pwd = document.getElementById("adminLocalPassword").value;

      if (!window.__davinciFirebase)
        return show("Firebase cliente no configurado", "error");

      try {
        await window.__davinciFirebase.signIn(email, pwd);
        await verifyCurrentUser();
      } catch (err) {
        console.error("Error en login:", err);
        show("Credenciales inválidas", "error");
      }
    });
  }

  /*  RESET PASSWORD */
  const sendResetEmailBtn = document.getElementById("sendResetEmailBtn");
  if (sendResetEmailBtn) {
    sendResetEmailBtn.addEventListener("click", async () => {
      const email = document.getElementById("adminLocalEmail").value.trim();
      if (!email) return show("Ingresa un email", "error");

      try {
        await window.__davinciFirebase.sendPasswordResetEmail(email);
        show(`Correo enviado a ${email}`, "success");
      } catch (err) {
        console.error("Error enviando reestablecimiento", err);
        show("Error enviando restablecimiento", "error");
      }
    });
  }

  if (adminSignOutBtn) {
    adminSignOutBtn.addEventListener("click", async () => {
      try { await window.__davinciFirebase.signOut(); } catch 
      {
          // Ignorar error de signOut
      }
      setAuthenticatedUI(false);
      show("Sesión cerrada", "success");
    });
  }

  /* INIT EVENTS*/
  document.addEventListener("DOMContentLoaded", () => {
    if (window.__davinciFirebase?.onAuthStateChanged) {
      window.__davinciFirebase.onAuthStateChanged(async (u) => {
        if (u) await verifyCurrentUser();
        else setAuthenticatedUI(false);
      });
    }
    verifyCurrentUser();
  });

  setInterval(async () => {
    const token = await getToken();
    if (token) loadComentarios();
  }, 10000);

})();
