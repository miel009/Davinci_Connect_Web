// admin.js: UI helpers for admin.html 

(async function () {

  const API_BASE = window.location.hostname.includes("localhost")
    ? "http://localhost:4000"
    : "https://davinci-connect-web.onrender.com";

  function apiUrl(path) {
    return `${API_BASE}${path}`;
  }

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

  window.showSection = function (section) {
    const sections = {
      usuarios: "adminUsers",
      comentarios: "adminComments",
      contenidos: "adminContents",
      solicitudes: "adminSolicitudes",
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
      if (section === "solicitudes") loadSolicitudes();
    }
  };

  /*  USUARIOS – listar */
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
      const res = await fetch(apiUrl("/api/admin/users?all=true"), {
        headers: { Authorization: "Bearer " + token }
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        cont.innerHTML = e.error || "Error cargando usuarios.";
        return;
      }

      const usuarios = await res.json();

      if (!Array.isArray(usuarios) || usuarios.length === 0) {
        cont.innerHTML = "No hay usuarios registrados.";
        return;
      }

      cont.innerHTML = `<div style="margin-bottom:8px;color:#aaa">Mostrando ${usuarios.length} usuarios</div>` +
        usuarios.map(u => `
        <div style="
          padding:10px;
          border-bottom:1px solid rgba(255,255,255,0.04);
          display:flex; 
          justify-content:space-between;
          align-items:center;">

          <div style="text-align:left">
            <strong>${u.email}</strong><br>
            <small style='color:#777'>UID: ${u.uid}</small><br>
            ${u.admin ? "<small style='color:#a445ff'>Administrador</small><br>" : ""}
            ${u.lastSignInTime ? `<small style='color:#777'>Último ingreso: ${u.lastSignInTime}</small><br>` : ""}
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
  window.deleteUsuario = async function (uid) {
    if (!confirm("¿Eliminar este usuario definitivamente?")) return;

    const token = await getToken();
    if (!token) return show("No estás autenticado", "error");

    try {
      const res = await fetch(apiUrl("/api/admin/users/" + uid), {
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

  // ACEPTAR USUARIO
  window.aceptarUsuario = async function(uid, email) {
    const token = await getToken();
    if (!token) return show("No autenticado", "error");

    try {
      const res = await fetch(apiUrl("/api/admin/aceptar-user"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ uid, email })
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        return show(e.error || "Error aceptando usuario", "error");
      }

      show("Usuario aceptado correctamente", "success");
      loadSolicitudes();

    } catch (err) {
      console.error(err);
      show("Error aceptando usuario", "error");
    }
  };

 
  window.rechazarUsuario = async function(uid) {
    const token = await getToken();
    if (!token) return show("No autenticado", "error");

    try {
      const res = await fetch(apiUrl("/api/admin/rechazar-user/" + uid), {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        return show(e.error || "Error rechazando usuario", "error");
      }

      show("Solicitud rechazada", "success");
      loadSolicitudes();

    } catch (err) {
      console.error(err);
      show("Error rechazando usuario", "error");
    }
  };

  /* SOLICITUDES – listar */
  async function loadSolicitudes() {
    const cont = document.getElementById("adminSolicitudesList");
    if (!cont) return;

    cont.innerHTML = "Cargando solicitudes...";

    const token = await getToken();
    if (!token) {
      cont.innerHTML = "No autenticado.";
      return;
    }

    try {
      const res = await fetch(apiUrl("/api/admin/solicitudes"), {
        headers: { Authorization: "Bearer " + token }
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        cont.innerHTML = e.error || "Error cargando solicitudes.";
        return;
      }

      const solicitudes = await res.json();

      if (!Array.isArray(solicitudes.pendientes) || solicitudes.pendientes.length === 0) {
        cont.innerHTML = "No hay solicitudes pendientes.";
        return;
      }

      cont.innerHTML = solicitudes.pendientes.map(s => `
      <div style="
        padding:10px;
        border-bottom:1px solid rgba(255,255,255,0.04);
        display:flex; 
        justify-content:space-between;
        align-items:center;">
        
        <div style="text-align:left">
          <strong>${s.email}</strong><br>
          <small style='color:#777'>UID: ${s.uid}</small><br>
        </div>

        <div style="display:flex; gap:8px;">
          <button class="btn" style="background:#2ecc71"
            onclick="aceptarUsuario('${s.uid}', '${s.email}')">
            Aceptar
          </button>

          <button class="btn" style="background:#e74c3c"
            onclick="rechazarUsuario('${s.uid}')">
            Rechazar
          </button>
        </div>

      </div>
    `).join("");

    } catch (err) {
      console.error(err);
      cont.innerHTML = "Error cargando solicitudes.";
    }
  }

  /* COMENTARIOS – LISTAR / ELIMINAR */
  async function loadComentarios() {
    const lista = document.getElementById("adminComments");
    if (!lista) return;

    lista.innerHTML = "Cargando...";

    try {
      const res = await fetch(apiUrl("/api/admin/comentarios"));
      const data = await res.json();

      lista.innerHTML = "";

      if (!Array.isArray(data) || data.length === 0) {
        lista.innerHTML = "No hay comentarios.";
        return;
      }

      for (const c of data) {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.padding = "10px";
        row.style.borderBottom = "1px solid rgba(255,255,255,0.04)";

        row.innerHTML = `
          <div style="flex:1">
            <strong>${c.usuario}</strong>
            <small style="color:#888">${c.email}</small>
            <div style="color:#ddd">${c.mensaje}</div>
          </div>
        `;

        const btn = document.createElement("button");
        btn.className = "btn";
        btn.innerText = "Eliminar";

        btn.addEventListener("click", async () => {
          if (!confirm("¿Eliminar comentario?")) return;

          const token = await getToken();
          if (!token) return show("No autenticado", "error");

          const del = await fetch(apiUrl("/api/admin/comments/" + c.id), {
            method: "DELETE",
            headers: { Authorization: "Bearer " + token }
          });

          const resp = await del.json().catch(() => ({}));

          if (!del.ok) {
            return show(resp.error || "Error eliminando comentario", "error");
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

  /* LOGIN ADMIN */
  const adminLoginFormLocal = document.getElementById("adminLoginFormLocal");
  const adminSignOutBtn = document.getElementById("adminSignOut");

  async function verifyCurrentUser() {
    const token = await getToken();
    if (!token) return setAuthenticatedUI(false);

    try {
      const res = await fetch(apiUrl("/api/admin/verify"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({})
      });

      if (!res.ok) {
        setAuthenticatedUI(false);
        show("Acceso denegado: no eres administrador", "error");
        try { await window.__davinciFirebase.signOut(); } catch {};
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

      try {
        await window.__davinciFirebase.signIn(email, pwd);
        await verifyCurrentUser();

      } catch (err) {
        show("Credenciales inválidas", "error");
      }
    });
  }

  if (adminSignOutBtn) {
    adminSignOutBtn.addEventListener("click", async () => {
      try { await window.__davinciFirebase.signOut(); } catch {};
      setAuthenticatedUI(false);
      show("Sesión cerrada", "success");
    });
  }

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
        const res = await fetch(apiUrl("/api/admin/set-admin"), {
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

        show(
          `Ahora el usuario (${data.email || email}) es administrador.`,
          "success"
        );

        setAdminForm.reset();

      } catch (err) {
        console.error(err);
        show(
          err.message || "Error inesperado asignando administrador",
          "error"
        );
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (window.__davinciFirebase?.onAuthStateChanged) {
      window.__davinciFirebase.onAuthStateChanged(async (u) => {
        if (u) await verifyCurrentUser();
        else setAuthenticatedUI(false);
      });
    }
    verifyCurrentUser();
  });

})();
