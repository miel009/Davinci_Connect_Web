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
      if (section === "contenidos") loadContents();
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
      // Solicitar todos los usuarios al backend (usa paginación interna si hay >1000)
      const res = await fetch("/api/admin/users?all=true", {
        headers: { Authorization: "Bearer " + token }
      });

      if (!res.ok) {
        const e = await res.json().catch(()=>({}));
        cont.innerHTML = e.error || "Error cargando usuarios.";
        return;
      }

      const usuarios = await res.json();

      if (!Array.isArray(usuarios) || usuarios.length === 0) {
        cont.innerHTML = "No hay usuarios registrados.";
        return;
      }

      cont.innerHTML = `<div style="margin-bottom:8px;color:#aaa">Mostrando ${usuarios.length} usuarios</div>` + usuarios.map(u => `
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

  /* CONTENIDOS - listar, subir y eliminar */
  let contentsNextPageToken = null;
  let contentsPrefix = '';
  const contentsPageSize = 50;

  async function loadContents(reset = true) {
    const cont = document.getElementById('adminContentsList');
    if (!cont) return;
    if (reset) {
      cont.innerHTML = 'Cargando contenidos...';
      contentsNextPageToken = null;
    }

    const token = await getToken();
    if (!token) return cont.innerHTML = 'No autenticado.';

    try {
      // Para la vista árbol pedimos prefixes/directorios
      let url = `/api/admin/contents?max=${contentsPageSize}&dirs=true`;
      if (contentsPrefix) url += `&prefix=${encodeURIComponent(contentsPrefix)}`;
      if (contentsNextPageToken && !reset) url += `&pageToken=${encodeURIComponent(contentsNextPageToken)}`;

      const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
      if (!res.ok) {
        const e = await res.json().catch(()=>({}));
        cont.innerHTML = e.error || 'Error cargando contenidos.';
        return;
      }

      const data = await res.json();
      // En modo dirs=true la respuesta incluye prefixes (subcarpetas) y items
      const prefixes = data.prefixes || [];
      const items = data.items || [];
      const next = data.nextPageToken || null;

      if (reset) cont.innerHTML = '';

      // Renderizar carpetas (prefixes) como elementos <details> con contador y carga paginada
      for (const p of prefixes) {
        const folderName = p.replace(contentsPrefix || '', '').replace(/\/$/, '');
        const countObj = (data.prefixCounts && data.prefixCounts[p]) || null;
        const countText = countObj ? (countObj.count + (countObj.truncated ? '+' : '')) : '...';

        const details = document.createElement('details');
        details.style.padding = '8px';
        details.style.borderBottom = '1px solid rgba(255,255,255,0.04)';
        const summary = document.createElement('summary');
        summary.style.cursor = 'pointer';
        summary.style.color = '#a445ff';
        summary.innerText = `📁 ${folderName || p} (${countText})`;
        const inner = document.createElement('div');
        inner.style.marginLeft = '16px';
        inner.innerHTML = '<em>Cargando...</em>';

        // carga bajo demanda al abrir (soporta paginación por carpeta)
        details.addEventListener('toggle', async () => {
          if (!details.open) return;
          if (inner.getAttribute('data-loaded') === '1') return;
          inner.innerHTML = 'Cargando...';
          const fullPrefix = p;
          try {
            const token2 = await getToken();
            const res2 = await fetch(`/api/admin/contents?dirs=true&max=${contentsPageSize}&prefix=${encodeURIComponent(fullPrefix)}`, { headers: { Authorization: 'Bearer ' + token2 } });
            if (!res2.ok) {
              inner.innerHTML = 'Error cargando carpeta.';
              return;
            }
            const d2 = await res2.json();
            inner.innerHTML = '';
            const subPrefixes = d2.prefixes || [];
            const subItems = d2.items || [];
            const folderNext = d2.nextPageToken || null;

            // render subfolders as nested <details>
            for (const sp of subPrefixes) {
              const subFolderName = sp.replace(fullPrefix, '').replace(/\/$/, '');
              const subDetails = document.createElement('details');
              const subSummary = document.createElement('summary');
              subSummary.style.color = '#a445ff';
              // include count if available
              const subCountObj = (d2.prefixCounts && d2.prefixCounts[sp]) || null;
              const subCountText = subCountObj ? (subCountObj.count + (subCountObj.truncated ? '+' : '')) : '';
              subSummary.innerText = `📁 ${subFolderName || sp}${subCountText ? ' ('+subCountText+')' : ''}`;
              subDetails.appendChild(subSummary);
              const subInner = document.createElement('div');
              subInner.style.marginLeft = '16px';
              subInner.innerHTML = '<em>Haz click para cargar</em>';
              subDetails.appendChild(subInner);
              inner.appendChild(subDetails);
            }

            // render files at this level
            for (const it of subItems) {
              const row = document.createElement('div');
              row.style.display = 'flex';
              row.style.justifyContent = 'space-between';
              row.style.alignItems = 'center';
              row.style.padding = '6px 0';
              row.innerHTML = `<div style="max-width:70%"><strong>${it.name}</strong><br><small style='color:#777'>${it.contentType || ''} ${it.size ? '| ' + it.size + ' bytes' : ''}</small></div>`;
              const btns = document.createElement('div');
              if (it.url) {
                const a = document.createElement('a');
                a.href = it.url;
                a.target = '_blank';
                a.innerText = 'Descargar';
                a.style.color = '#a445ff';
                a.style.marginRight = '8px';
                btns.appendChild(a);
              }
              const del = document.createElement('button');
              del.className = 'btn';
              del.innerText = 'Eliminar';
              del.addEventListener('click', async () => {
                if (!confirm('¿Eliminar este archivo?')) return;
                const token3 = await getToken();
                const res3 = await fetch('/api/admin/contents/' + encodeURIComponent(it.name), { method: 'DELETE', headers: { Authorization: 'Bearer ' + token3 } });
                if (!res3.ok) return show('Error eliminando archivo', 'error');
                inner.removeChild(row);
                show('Archivo eliminado', 'success');
              });
              btns.appendChild(del);
              row.appendChild(btns);
              inner.appendChild(row);
            }

            // pagination for this folder
            if (folderNext) {
              const moreBtn = document.createElement('button');
              moreBtn.className = 'btn';
              moreBtn.innerText = 'Cargar más';
              moreBtn.style.display = '';
              moreBtn.addEventListener('click', async () => {
                moreBtn.disabled = true;
                try {
                  const token4 = await getToken();
                  const r3 = await fetch(`/api/admin/contents?dirs=true&max=${contentsPageSize}&prefix=${encodeURIComponent(fullPrefix)}&pageToken=${encodeURIComponent(folderNext)}`, { headers: { Authorization: 'Bearer ' + token4 } });
                  if (!r3.ok) { show('Error cargando más archivos', 'error'); moreBtn.disabled = false; return; }
                  const d3 = await r3.json();
                  const moreItems = d3.items || [];
                  const nextToken = d3.nextPageToken || null;
                  for (const it of moreItems) {
                    const row = document.createElement('div');
                    row.style.display = 'flex';
                    row.style.justifyContent = 'space-between';
                    row.style.alignItems = 'center';
                    row.style.padding = '6px 0';
                    row.innerHTML = `<div style="max-width:70%"><strong>${it.name}</strong><br><small style='color:#777'>${it.contentType || ''} ${it.size ? '| ' + it.size + ' bytes' : ''}</small></div>`;
                    const btns = document.createElement('div');
                    if (it.url) {
                      const a = document.createElement('a'); a.href = it.url; a.target = '_blank'; a.innerText = 'Descargar'; a.style.color = '#a445ff'; a.style.marginRight = '8px'; btns.appendChild(a);
                    }
                    const del = document.createElement('button'); del.className = 'btn'; del.innerText = 'Eliminar'; del.addEventListener('click', async () => {
                      if (!confirm('¿Eliminar este archivo?')) return; const token5 = await getToken(); const res5 = await fetch('/api/admin/contents/' + encodeURIComponent(it.name), { method: 'DELETE', headers: { Authorization: 'Bearer ' + token5 } }); if (!res5.ok) return show('Error eliminando archivo', 'error'); inner.removeChild(row); show('Archivo eliminado', 'success');
                    });
                    btns.appendChild(del);
                    row.appendChild(btns);
                    inner.insertBefore(row, moreBtn);
                  }
                  if (!nextToken) moreBtn.style.display = 'none'; else { folderNext = nextToken; moreBtn.disabled = false; }
                } catch (err) { console.error(err); show('Error cargando más', 'error'); moreBtn.disabled = false; }
              });
              inner.appendChild(moreBtn);
            }

            inner.setAttribute('data-loaded', '1');
          } catch (e) {
            inner.innerHTML = 'Error cargando carpeta.';
          }
        });

        details.appendChild(summary);
        details.appendChild(inner);
        cont.appendChild(details);
      }

      // render files at current prefix
      const filesHtml = items.map(it => `
        <div style="padding:8px; border-bottom:1px solid rgba(255,255,255,0.04); display:flex; justify-content:space-between; align-items:center;">
          <div style="max-width:70%"><strong>${it.name}</strong><br><small style='color:#777'>${it.contentType || ''} ${it.size ? '| ' + it.size + ' bytes' : ''}</small></div>
          <div>
            ${it.url ? `<a href="${it.url}" target="_blank" style="color:#a445ff; margin-right:8px;">Descargar</a>` : ''}
            <button class="btn" onclick="deleteContent('${encodeURIComponent(it.name)}')">Eliminar</button>
          </div>
        </div>
      `).join('');

      if (filesHtml) cont.innerHTML += filesHtml;

      contentsNextPageToken = next;
      const loadMoreBtn = document.getElementById('loadMoreContentsBtn');
      if (loadMoreBtn) loadMoreBtn.style.display = contentsNextPageToken ? '' : 'none';

    } catch (err) {
      console.error(err);
      cont.innerHTML = 'Error cargando contenidos.';
    }
  }

  // Subir contenido
  const uploadContentForm = document.getElementById('uploadContentForm');
  if (uploadContentForm) {
    uploadContentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('contentFileInput');
      const pathInput = document.getElementById('contentPathInput');
      if (!input || !input.files || !input.files[0]) return show('Selecciona un archivo', 'error');

      const file = input.files[0];
      const form = new FormData();
      form.append('file', file);
      if (pathInput && pathInput.value) form.append('path', pathInput.value.trim());

      const token = await getToken();
      if (!token) return show('No autenticado', 'error');

      try {
        const res = await fetch('/api/admin/contents', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token },
          body: form
        });

        const data = await res.json().catch(()=>({}));
        if (!res.ok) return show(data.error || 'Error subiendo archivo', 'error');

        show('Archivo subido', 'success');
        input.value = '';
        pathInput.value = '';
        loadContents();
      } catch (err) {
        console.error(err);
        show('Error subiendo archivo', 'error');
      }
    });
  }

  // Eliminar contenido
  window.deleteContent = async function(nameEncoded) {
    if (!confirm('¿Eliminar este archivo?')) return;
    const token = await getToken();
    if (!token) return show('No autenticado', 'error');

    try {
      const res = await fetch('/api/admin/contents/' + nameEncoded, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token }
      });

      const data = await res.json().catch(()=>({}));
      if (!res.ok) return show(data.error || 'No se pudo eliminar', 'error');
      show('Contenido eliminado', 'success');
      loadContents();
    } catch (err) {
      console.error(err);
      show('Error eliminando contenido', 'error');
    }
  };

  // Formulario filtro y cargar más
  const contentFilterForm = document.getElementById('contentFilterForm');
  const clearFilterBtn = document.getElementById('clearFilterBtn');
  const loadMoreBtn = document.getElementById('loadMoreContentsBtn');

  if (contentFilterForm) {
    contentFilterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const v = document.getElementById('contentFilterInput').value.trim();
      contentsPrefix = v;
      await loadContents(true);
    });
  }

  if (clearFilterBtn) {
    clearFilterBtn.addEventListener('click', async () => {
      document.getElementById('contentFilterInput').value = '';
      contentsPrefix = '';
      await loadContents(true);
    });
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', async () => {
      await loadContents(false);
    });
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
