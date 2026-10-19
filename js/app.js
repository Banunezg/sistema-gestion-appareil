const supabaseUrl = 'https://qboawjjuzgijgtyjzqiw.supabase.co';
const supabaseKey = 'sb_publishable_HAuwDGL-5bWi5E2GHUBUKA_euUS1ig7'; 
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// =========================================================================
// VARIABLES GLOBALES Y ELEMENTOS DEL DOM
// =========================================================================
let savedOffers = [];
let valorDolar = 0; 
let currentDetailId = null; 
let invData = []; 
let selectedFiles = []; 
let chartEstadosInstance = null;
let chartMontosInstance = null;
let chartEvolucionInstance = null; 

const navOfertas = document.getElementById('nav-ofertas');
const navInventario = document.getElementById('nav-inventario');
const navGraficos = document.getElementById('nav-graficos');
const navAjustes = document.getElementById('nav-ajustes');

const vistaLicitaciones = document.getElementById('vista-licitaciones');
const vistaInventario = document.getElementById('vista-inventario');
const vistaGraficos = document.getElementById('vista-graficos');
const vistaAjustes = document.getElementById('vista-ajustes');

const headerMainTitle = document.getElementById('header-main-title');
const headerFiltersLicitaciones = document.getElementById('header-filters-licitaciones');
const headerRightBtn = document.querySelector('.header-right .btn-primary');
const headerKameInfo = document.getElementById('header-kame-info'); 

const searchGlobalInput = document.getElementById('searchGlobal');
const filterWorkerSelect = document.getElementById('filterWorker');
const calendarEl = document.getElementById('calendar');
const offerForm = document.getElementById('offerForm');
const modal = document.getElementById('offerModal');
const deleteOfferBtn = document.getElementById('deleteOfferBtn');
const portalSelect = document.getElementById('portal');
const titleInput = document.getElementById('title');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const detailModal = document.getElementById('detailModal');
const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
const btnGoToEdit = document.getElementById('btnGoToEdit');

const fileDropZone = document.getElementById('fileDropZone');
const offerFiles = document.getElementById('offerFiles');
const fileList = document.getElementById('fileList');

// =========================================================================
// AUTH, SESIÓN Y PERFILES
// =========================================================================
supabaseClient.auth.getSession().then(async ({ data: { session }, error }) => {
    if (error || !session) window.location.replace('index.html');
    else {
        const email = session.user.email || "usuario@appareil.cl";
        
        // Buscar perfil en Supabase
        const { data: perfilData } = await supabaseClient.from('perfiles').select('*').eq('email', email).single();
        
        let nombre = "";
        let apellido = "";
        let cargo = "Ejecutivo de Ventas"; 
        
        if (perfilData) {
            nombre = perfilData.nombre || "";
            apellido = perfilData.apellido || "";
            cargo = perfilData.cargo || "";
        } else {
            const nombresEquipo = {
                "bnunez@appareil.cl": "Bastián Núñez",
                "alopez@appareil.cl": "Andrea López",
                "dserrano@appareil.cl": "Diego Serrano",
                "mbarrientos@appareil.cl": "Matias Barrientos",
                "mpaz@appareil.cl": "Matias Paz",
                "dparra@appareil.cl": "David Parra",
                "eibanez@appareil.cl": "Emilio Ibañez",
                "vyanez@appareil.cl": "Veronica Yañez"
            };
            const nombreMostrar = nombresEquipo[email] || "Usuario";
            const partesNombre = nombreMostrar.split(" ");
            nombre = partesNombre[0] || "";
            apellido = partesNombre.slice(1).join(" ") || "";
        }

        const nombreMostrar = `${nombre} ${apellido}`.trim() || "Usuario";
        const logoHTML = `<img src="img/imagen_gira.gif" class="logo-animado" style="width: 100%; height: 100%; border-radius: 50%; object-fit: contain;">`;
        
        if(document.getElementById("userAvatar")) document.getElementById("userAvatar").innerHTML = logoHTML;
        if(document.getElementById("userAvatarLg")) document.getElementById("userAvatarLg").innerHTML = logoHTML;
        if(document.getElementById("userNameMenu")) document.getElementById("userNameMenu").innerText = nombreMostrar;
        if(document.getElementById("userEmailMenu")) document.getElementById("userEmailMenu").innerText = email;
        if(document.getElementById("ajustes-email")) document.getElementById("ajustes-email").innerText = nombreMostrar;

        if(document.getElementById("ajustes-email-input")) document.getElementById("ajustes-email-input").value = email;
        if(document.getElementById("ajustes-nombre")) document.getElementById("ajustes-nombre").value = nombre;
        if(document.getElementById("ajustes-apellido")) document.getElementById("ajustes-apellido").value = apellido;
        if(document.getElementById("ajustes-cargo")) document.getElementById("ajustes-cargo").value = cargo;
        
        const tarjetaKame = document.getElementById("tarjeta-kame");
        if (tarjetaKame) {
            if (email === "bnunez@appareil.cl") {
                tarjetaKame.style.display = "block";
            } else {
                tarjetaKame.style.display = "none";
            }
        }
    }
});

supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || !session) window.location.replace('index.html');
});

if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        window.location.href = 'index.html';
    });
}

document.addEventListener('click', () => {
    const menu = document.getElementById('myUserMenu');
    if (menu && menu.classList.contains('show-menu')) menu.classList.remove('show-menu');
});

// =========================================================================
// GUARDAR PERFIL (NOMBRE, APELLIDO, CARGO)
// =========================================================================
const btnGuardarPerfil = document.getElementById('btn-guardar-perfil');
if (btnGuardarPerfil) {
    btnGuardarPerfil.addEventListener('click', async () => {
        const email = document.getElementById('ajustes-email-input').value;
        const nombre = document.getElementById('ajustes-nombre').value.trim();
        const apellido = document.getElementById('ajustes-apellido').value.trim();
        const cargo = document.getElementById('ajustes-cargo').value.trim();

        if (!nombre) return alert('El nombre no puede estar vacío.');

        btnGuardarPerfil.textContent = "Guardando...";
        btnGuardarPerfil.disabled = true;

        const datosPerfil = {
            email: email,
            nombre: nombre,
            apellido: apellido,
            cargo: cargo
        };

        const { error } = await supabaseClient.from('perfiles').upsert([datosPerfil]);

        if (error) {
            alert("Error al guardar perfil: " + error.message);
        } else {
            alert("¡Perfil actualizado con éxito!");
            const nombreMostrar = `${nombre} ${apellido}`.trim();
            if(document.getElementById("userNameMenu")) document.getElementById("userNameMenu").innerText = nombreMostrar;
        }

        btnGuardarPerfil.textContent = "Guardar cambios";
        btnGuardarPerfil.disabled = false;
    });
}

// =========================================================================
// CONTROLADOR DE PESTAÑAS (SPA)
// =========================================================================
function ocultarTodasLasVistas() {
    if(vistaLicitaciones) vistaLicitaciones.style.display = 'none';
    if(vistaInventario) vistaInventario.style.display = 'none';
    if(vistaGraficos) vistaGraficos.style.display = 'none';
    if(vistaAjustes) vistaAjustes.style.display = 'none';
    
    if(navOfertas) navOfertas.classList.remove('active');
    if(navInventario) navInventario.classList.remove('active');
    if(navGraficos) navGraficos.classList.remove('active');
    if(navAjustes) navAjustes.classList.remove('active');
}

if (navOfertas) {
    navOfertas.addEventListener('click', () => {
        ocultarTodasLasVistas();
        navOfertas.classList.add('active');
        vistaLicitaciones.style.display = 'flex';
        
        if(headerMainTitle) headerMainTitle.innerText = "Gestión de Licitaciones";
        if(headerFiltersLicitaciones) headerFiltersLicitaciones.style.display = 'flex';
        if(headerRightBtn) headerRightBtn.style.display = 'block';
        if(headerKameInfo) headerKameInfo.style.display = 'none'; 

        if (typeof calendar !== 'undefined') calendar.updateSize();
    });
}

if (navInventario) {
    navInventario.addEventListener('click', () => {
        ocultarTodasLasVistas();
        navInventario.classList.add('active');
        vistaInventario.style.display = 'flex';
        
        if(headerMainTitle) headerMainTitle.innerText = "Catálogo de Inventario";
        if(headerFiltersLicitaciones) headerFiltersLicitaciones.style.display = 'none';
        if(headerRightBtn) headerRightBtn.style.display = 'none';
        if(headerKameInfo) headerKameInfo.style.display = 'flex'; 
        
        if (invData.length === 0) cargarInventario();
    });
}

if (navGraficos) {
    navGraficos.addEventListener('click', () => {
        ocultarTodasLasVistas();
        navGraficos.classList.add('active');
        vistaGraficos.style.display = 'flex';
        
        if(headerMainTitle) headerMainTitle.innerText = "Dashboard Analítico";
        if(headerFiltersLicitaciones) headerFiltersLicitaciones.style.display = 'none';
        if(headerRightBtn) headerRightBtn.style.display = 'none';
        if(headerKameInfo) headerKameInfo.style.display = 'none'; 
        
        setTimeout(renderizarGraficos, 50); 
    });
}

if (navAjustes) {
    navAjustes.addEventListener('click', () => {
        ocultarTodasLasVistas();
        navAjustes.classList.add('active');
        vistaAjustes.style.display = 'flex';
        if(headerMainTitle) headerMainTitle.innerText = "Configuración del Sistema";
        if(headerFiltersLicitaciones) headerFiltersLicitaciones.style.display = 'none';
        if(headerRightBtn) headerRightBtn.style.display = 'none';
        if(headerKameInfo) headerKameInfo.style.display = 'none'; 
    });
}

// =========================================================================
// LÓGICA DE INVENTARIO
// =========================================================================
function setearFechaActual() {
    const el = document.getElementById('current-date-display');
    if (el) {
        const opciones = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        el.innerHTML = `📅 ${new Date().toLocaleDateString('es-CL', opciones)}`;
    }
}
setearFechaActual(); 

async function cargarInventario() {
    const tbody = document.getElementById('inv-table-body');
    const { data, error } = await supabaseClient.from('inventario').select('*');
    
    if (error) {
        if(tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">Error al cargar: ${error.message}</td></tr>`;
        return;
    }
    
    invData = data || [];
    renderizarInventario(invData);
    calcularKPIsInventario(invData);
    llenarFiltrosInventario(invData);
}

function renderizarInventario(datos) {
    const tbody = document.getElementById('inv-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center;">No hay productos registrados.</td></tr>`;
        return;
    }

    datos.forEach((item, index) => {
        const tr = document.createElement('tr');
        const saldo = Number(item.saldo_bodega || 0);
        let estadoBadge = `<span class="badge-stock stock-ok">En Stock</span>`;
        if (saldo === 0) estadoBadge = `<span class="badge-stock stock-out">Agotado</span>`;
        else if (saldo <= 3) estadoBadge = `<span class="badge-stock stock-low">Bajo Stock</span>`;

        const skuLimpio = item.sku ? item.sku.toString().trim() : '';
        const imgUrl = skuLimpio ? `https://qboawjjuzgijgtyjzqiw.supabase.co/storage/v1/object/public/fotos_productos/${skuLimpio}.png` : 'https://via.placeholder.com/60x60?text=IMG';

        tr.innerHTML = `
            <td style="text-align: center;">
                <img src="${imgUrl}" class="prod-mini-img" onerror="this.onerror=null; this.src='https://via.placeholder.com/60x60?text=img';">
            </td>
            <td style="font-weight: 700; color: var(--texto-secundario);">${item.sku || '-'}</td>
            <td style="font-weight: 700;">${item.articulo || 'Sin nombre'}</td>
            <td>${item.bodega || '-'}</td>
            <td>${item.familia || '-'}</td>
            <td style="text-align: right; font-weight: 800; font-size: 14px;">${saldo}</td>
            <td style="text-align: center;">${estadoBadge}</td>
            <td style="text-align: center;">
                <button class="btn-action-icon" onclick="abrirModalProducto(${index})"><i class="fas fa-eye"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.abrirModalProducto = function(index) {
    const dataFiltrada = obtenerDatosFiltradosInventario();
    const item = dataFiltrada[index];
    if(!item) return;

    if(document.getElementById('prod-modal-sku')) document.getElementById('prod-modal-sku').innerText = item.sku || '-';
    if(document.getElementById('prod-modal-familia')) document.getElementById('prod-modal-familia').innerText = item.familia || '-';
    if(document.getElementById('prod-modal-nombre')) document.getElementById('prod-modal-nombre').innerText = item.articulo || 'Sin nombre';
    if(document.getElementById('prod-modal-bodega')) document.getElementById('prod-modal-bodega').innerText = item.bodega || '-';
    if(document.getElementById('prod-modal-stock')) document.getElementById('prod-modal-stock').innerText = item.saldo_bodega || '0';
    
    const skuLimpio = item.sku ? item.sku.toString().trim() : '';
    const imgUrl = skuLimpio ? `https://qboawjjuzgijgtyjzqiw.supabase.co/storage/v1/object/public/fotos_productos/${skuLimpio}.png` : 'https://via.placeholder.com/200x200?text=Sin+Foto';
    
    const modalImg = document.getElementById('prod-modal-img');
    if(modalImg) {
        modalImg.src = imgUrl;
        modalImg.onerror = function() { 
            this.onerror=null; 
            this.src='https://via.placeholder.com/200x200?text=Sin+Foto'; 
        };
    }

    if(document.getElementById('productModal')) document.getElementById('productModal').style.display = 'flex';
}

if(document.getElementById('closeProductModalBtn')){
    document.getElementById('closeProductModalBtn').addEventListener('click', () => {
        document.getElementById('productModal').style.display = 'none';
    });
}

function calcularKPIsInventario(datos) {
    let totalAgotados = 0;
    let totalPocoStock = 0;
    const bodegasUnicas = new Set();

    datos.forEach(item => {
        const saldo = Number(item.saldo_bodega || 0);
        if (saldo === 0) totalAgotados++;
        else if (saldo <= 3) totalPocoStock++;
        if (item.bodega) bodegasUnicas.add(item.bodega);
    });

    if (document.getElementById('inv-kpi-productos')) document.getElementById('inv-kpi-productos').textContent = datos.length;
    if (document.getElementById('inv-kpi-agotados')) document.getElementById('inv-kpi-agotados').textContent = totalAgotados;
    if (document.getElementById('inv-kpi-poco')) document.getElementById('inv-kpi-poco').textContent = totalPocoStock;
    if (document.getElementById('inv-kpi-bodegas')) document.getElementById('inv-kpi-bodegas').textContent = bodegasUnicas.size;
}

function llenarFiltrosInventario(datos) {
    const selectBodega = document.getElementById('inv-filter-bodega');
    const selectFamilia = document.getElementById('inv-filter-familia');
    if (!selectBodega || !selectFamilia) return;
    
    const bodegas = [...new Set(datos.map(d => d.bodega).filter(Boolean))].sort();
    const familias = [...new Set(datos.map(d => d.familia).filter(Boolean))].sort();

    bodegas.forEach(b => selectBodega.innerHTML += `<option value="${b}">${b}</option>`);
    familias.forEach(f => selectFamilia.innerHTML += `<option value="${f}">${f}</option>`);
}

function obtenerDatosFiltradosInventario() {
    const texto = document.getElementById('inv-search') ? document.getElementById('inv-search').value.toLowerCase() : '';
    const familia = document.getElementById('inv-filter-familia') ? document.getElementById('inv-filter-familia').value : '';
    const bodega = document.getElementById('inv-filter-bodega') ? document.getElementById('inv-filter-bodega').value : '';

    return invData.filter(item => {
        const articuloStr = item.articulo ? String(item.articulo).toLowerCase() : '';
        const skuStr = item.sku ? String(item.sku).toLowerCase() : '';
        
        const matchTexto = articuloStr.includes(texto) || skuStr.includes(texto);
        const matchFamilia = familia === "" || item.familia === familia;
        const matchBodega = bodega === "" || item.bodega === bodega;
        
        return matchTexto && matchFamilia && matchBodega;
    });
}

function aplicarFiltrosInventario() {
    const filtrados = obtenerDatosFiltradosInventario();
    renderizarInventario(filtrados);
}

if (document.getElementById('inv-search')) document.getElementById('inv-search').addEventListener('input', aplicarFiltrosInventario);
if (document.getElementById('inv-filter-familia')) document.getElementById('inv-filter-familia').addEventListener('change', aplicarFiltrosInventario);
if (document.getElementById('inv-filter-bodega')) document.getElementById('inv-filter-bodega').addEventListener('change', aplicarFiltrosInventario);

// =========================================================================
// LÓGICA DE LICITACIONES
// =========================================================================
if (portalSelect && titleInput) {
    portalSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (titleInput.value.trim() === '' || titleInput.value.match(/^[A-Z]+-$/)) {
            if (val === 'Mercado Público') titleInput.value = 'MP-';
            else if (val === 'SAP Ariba') titleInput.value = 'SAP-';
            else if (val === 'Asmar') titleInput.value = 'ASM-';
            else if (val === 'Coupa') titleInput.value = 'CPA-';
            else if (val === 'Unilink') titleInput.value = 'UNI-'; 
            else titleInput.value = ''; 
        }
    });
}

const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth', locale: 'es', height: 'auto', contentHeight: 'auto',
    headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' },
    buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana' },
    events: function(info, successCallback, failureCallback) {
        successCallback(formatOffersForCalendar(obtenerOfertasFiltradas()));
    },
    eventClick: function(info) { abrirModalDetalle(info.event.id); } 
});
calendar.render();
window.addEventListener('resize', () => { setTimeout(() => { calendar.updateSize(); }, 100); });

async function obtenerValorDolar() {
    try {
        const response = await fetch('https://mindicador.cl/api/dolar');
        const data = await response.json();
        valorDolar = data.serie[0].valor; 
        if(document.getElementById('valor-dolar-text')) document.getElementById('valor-dolar-text').textContent = "$" + Math.round(valorDolar);
    } catch (error) {
        if(document.getElementById('valor-dolar-text')) document.getElementById('valor-dolar-text').textContent = "$900 (Aprox)"; valorDolar = 900; 
    }
}

async function inicializarDashboard() {
    await obtenerValorDolar(); 
    const { data, error } = await supabaseClient.from('ofertas').select('*');
    if (!error) {
        savedOffers = data || []; 
        calendar.refetchEvents(); renderizarInterfazCompleta();
    }
}
inicializarDashboard();

if (searchGlobalInput) searchGlobalInput.addEventListener('input', filtrarYRefrescar);
if (filterWorkerSelect) filterWorkerSelect.addEventListener('change', filtrarYRefrescar);

function formatearMonto(monto, moneda, mostrarSimboloMoneda = true) {
    const num = Number(monto || 0);
    if (moneda === 'USD') return (mostrarSimboloMoneda ? 'US$' : '') + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return (mostrarSimboloMoneda ? '$' : '') + num.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

if (fileDropZone && offerFiles) {
    fileDropZone.addEventListener('click', () => offerFiles.click());
    fileDropZone.addEventListener('dragover', (e) => { e.preventDefault(); fileDropZone.classList.add('dragover'); });
    fileDropZone.addEventListener('dragleave', () => { fileDropZone.classList.remove('dragover'); });
    fileDropZone.addEventListener('drop', (e) => {
        e.preventDefault(); fileDropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    });
    offerFiles.addEventListener('change', () => { handleFiles(offerFiles.files); });
}

function handleFiles(files) {
    selectedFiles = [...selectedFiles, ...Array.from(files)];
    renderFileList();
}

function renderFileList() {
    if(!fileList) return;
    fileList.innerHTML = '';
    selectedFiles.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90%;">📎 ${file.name}</span> 
            <span style="color: var(--rojo); cursor: pointer; font-weight: bold; padding: 0 5px;" onclick="removeFile(event, ${index})">✕</span>
        `;
        fileList.appendChild(div);
    });
}

window.removeFile = function(e, index) {
    e.stopPropagation(); 
    selectedFiles.splice(index, 1);
    renderFileList();
}

if (offerForm) {
    offerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const idActual = document.getElementById('offerId').value;
        const btnGuardar = document.getElementById('saveOfferBtn');
        btnGuardar.textContent = 'Guardando y subiendo archivos...'; 
        btnGuardar.disabled = true;

        let archivosSubidosNombres = [];
        
        if (selectedFiles.length > 0) {
            for (let file of selectedFiles) {
                const uniqueName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
                const { data: uploadData, error: uploadError } = await supabaseClient.storage.from('licitaciones_archivos').upload(uniqueName, file);
                
                if (uploadError) {
                    alert("Error subiendo el archivo: " + uploadError.message);
                    btnGuardar.textContent = 'Guardar licitación'; 
                    btnGuardar.disabled = false;
                    return; 
                } else {
                    archivosSubidosNombres.push(uniqueName);
                }
            }
        }

        const datos = {
            portal: document.getElementById('portal').value, title: document.getElementById('title').value,
            worker: document.getElementById('worker').value, amount: Number(document.getElementById('amount').value),
            currency: document.getElementById('currency').value, status: document.getElementById('status').value,
            participationDate: document.getElementById('dateParticipation').value, endDate: document.getElementById('endDate').value
        };

        if (archivosSubidosNombres.length > 0) {
            datos.archivos = archivosSubidosNombres.join(',');
        }

        let errorSupabase = null;
        if (idActual) {
            const { error } = await supabaseClient.from('ofertas').update(datos).eq('id', Number(idActual)); errorSupabase = error;
        } else {
            const { error } = await supabaseClient.from('ofertas').insert([datos]); errorSupabase = error;
        }

        if (!errorSupabase) { 
            if(modal) modal.style.display = 'none'; 
            selectedFiles = [];
            renderFileList();
            await inicializarDashboard(); 
        } 
        else { alert("Error: " + errorSupabase.message); }

        btnGuardar.textContent = 'Guardar licitación'; btnGuardar.disabled = false;
    });
}

if (deleteOfferBtn) {
    deleteOfferBtn.addEventListener('click', async () => {
        const idActual = document.getElementById('offerId').value;
        if (idActual && confirm('¿Eliminar esta licitación permanentemente?')) {
            const { error } = await supabaseClient.from('ofertas').delete().eq('id', Number(idActual));
            if (!error) { if(modal) modal.style.display = 'none'; await inicializarDashboard(); }
        }
    });
}

function formatOffersForCalendar(offers) {
    return offers.map(off => {
        let bg = 'var(--azul-claro)'; let col = 'var(--azul-texto)';
        if(off.status === 'Aceptado') { bg = '#E9F5EC'; col = 'var(--verde-texto)'; }
        if(off.status === 'Perdido') { bg = '#FCE8E8'; col = 'var(--rojo)'; }
        return { id: off.id, title: off.title, start: off.endDate, backgroundColor: bg, borderColor: bg, textColor: col };
    });
}

function obtenerOfertasFiltradas() {
    if (!searchGlobalInput || !filterWorkerSelect) return savedOffers;
    const busqueda = searchGlobalInput.value.toLowerCase();
    const trabajadorSeleccionado = filterWorkerSelect.value;
    return savedOffers.filter(off => {
        const cumpleBusqueda = off.title.toLowerCase().includes(busqueda) || off.portal.toLowerCase().includes(busqueda);
        const cumpleTrabajador = trabajadorSeleccionado === "" || off.worker === trabajadorSeleccionado;
        return cumpleBusqueda && cumpleTrabajador;
    });
}

function filtrarYRefrescar() {
    calendar.refetchEvents(); 
    renderizarListaLateral(obtenerOfertasFiltradas()); 
    actualizarVistaFinanciera(obtenerOfertasFiltradas());
}

function poblarFiltroTrabajadores() {
    if (!filterWorkerSelect) return;
    const trabajadorActual = filterWorkerSelect.value;
    const lista = [
        {email: "alopez@appareil.cl", name: "A. López"}, {email: "dserrano@appareil.cl", name: "D. Serrano"},
        {email: "mbarrientos@appareil.cl", name: "M. Barrientos"}, {email: "mpaz@appareil.cl", name: "M. Paz"},
        {email: "dparra@appareil.cl", name: "D. Parra"}, {email: "eibanez@appareil.cl", name: "E. Ibañez"},
        {email: "vyanez@appareil.cl", name: "V. Yañez"}, {email: "bnunez@appareil.cl", name: "B. Nuñez"}
    ];
    filterWorkerSelect.innerHTML = '<option value="">👤 Trabajadores</option>';
    lista.forEach(t => {
        const selected = t.email === trabajadorActual ? 'selected' : '';
        filterWorkerSelect.innerHTML += `<option value="${t.email}" ${selected}>${t.name}</option>`;
    });
}

function actualizarVistaFinanciera(ofertas) {
    const statAcceptedTotal = document.getElementById('stat-accepted-total');
    if (!statAcceptedTotal) return;

    if(document.getElementById('offerCount')) document.getElementById('offerCount').textContent = `${ofertas.length} activas`; 
    
    const acCLP = ofertas.filter(o => o.status === 'Aceptado' && (o.currency === 'CLP' || !o.currency)).reduce((a, b) => a + Number(b.amount || 0), 0);
    const acUSD = ofertas.filter(o => o.status === 'Aceptado' && o.currency === 'USD').reduce((a, b) => a + Number(b.amount || 0), 0);
    statAcceptedTotal.textContent = formatearMonto(acCLP + (acUSD * valorDolar), 'CLP');
    if(document.getElementById('stat-accepted-sub')) document.getElementById('stat-accepted-sub').textContent = `${formatearMonto(acCLP, 'CLP')} CLP · ${formatearMonto(acUSD, 'USD')} USD`;

    const prCLP = ofertas.filter(o => o.status === 'En Proceso' && (o.currency === 'CLP' || !o.currency)).reduce((a, b) => a + Number(b.amount || 0), 0);
    const prUSD = ofertas.filter(o => o.status === 'En Proceso' && o.currency === 'USD').reduce((a, b) => a + Number(b.amount || 0), 0);
    if(document.getElementById('stat-process-total')) document.getElementById('stat-process-total').textContent = formatearMonto(prCLP + (prUSD * valorDolar), 'CLP');
    if(document.getElementById('stat-process-sub')) document.getElementById('stat-process-sub').textContent = `${formatearMonto(prCLP, 'CLP')} CLP · ${formatearMonto(prUSD, 'USD')}`;

    const mesActual = new Date().getMonth();
    const perdidasMes = ofertas.filter(o => o.status === 'Perdido' && new Date(o.endDate).getMonth() === mesActual).length;
    if(document.getElementById('stat-lost-count')) document.getElementById('stat-lost-count').textContent = perdidasMes;
}

function renderizarInterfazCompleta() {
    const ofertas = obtenerOfertasFiltradas();
    actualizarVistaFinanciera(ofertas); poblarFiltroTrabajadores(); renderizarListaLateral(ofertas);
}

function renderizarListaLateral(ofertas) {
    const offersListEl = document.getElementById('offersList');
    if (!offersListEl) return;
    offersListEl.innerHTML = '';
    if(ofertas.length === 0) return;

    const ordenadas = [...ofertas].sort((a,b) => new Date(a.endDate) - new Date(b.endDate));
    const listaNombres = [{email: "alopez@appareil.cl", name: "A. López"}, {email: "dserrano@appareil.cl", name: "D. Serrano"}, {email: "mbarrientos@appareil.cl", name: "M. Barrientos"}, {email: "mpaz@appareil.cl", name: "M. Paz"}, {email: "dparra@appareil.cl", name: "D. Parra"}, {email: "eibanez@appareil.cl", name: "E. Ibañez"}, {email: "vyanez@appareil.cl", name: "V. Yañez"}, {email: "bnunez@appareil.cl", name: "B. Nuñez"}];

    ordenadas.forEach(off => {
        const item = document.createElement('div');
        item.className = 'offer-card';

        let badgeClase = 'badge-cerrado'; let badgeTexto = 'Cerrado';
        if (off.endDate) {
            const hoy = new Date(); hoy.setHours(0,0,0,0);
            const fc = new Date(off.endDate + 'T00:00:00');
            const diff = Math.ceil((fc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

            if (off.status !== 'En Proceso') badgeTexto = 'Cerrado'; 
            else if (diff < 0) badgeTexto = 'Vencido';
            else if (diff === 0) { badgeTexto = '¡Hoy!'; badgeClase = 'badge-urgente'; } 
            else if (diff <= 15) { badgeTexto = `Faltan ${diff} d`; badgeClase = 'badge-urgente'; } 
            else { badgeTexto = `Faltan ${diff} d`; badgeClase = 'badge-tranquilo'; }
        }

        const obj = listaNombres.find(t => t.email === off.worker);
        const nVisible = obj ? obj.name : (off.worker || 'Sin asignar');
        let dotColor = 'var(--azul-texto)';
        if(off.status === 'Aceptado') dotColor = 'var(--verde-texto)';
        if(off.status === 'Perdido') dotColor = 'var(--rojo)';

        item.innerHTML = `
            <div class="offer-top">
                <div class="offer-name">${off.title || 'Sin título'}</div>
                <span class="badge ${badgeClase}">${badgeTexto}</span>
            </div>
            <div class="offer-meta">${off.portal} · ${nVisible}</div>
            <div class="offer-bottom">
                <span class="offer-amount">${formatearMonto(off.amount, off.currency)}</span>
                <span class="status-indicator"><span class="dot" style="background: ${dotColor};"></span>${off.status || 'En Proceso'}</span>
            </div>
        `;
        item.addEventListener('click', () => { abrirModalDetalle(off.id); });
        offersListEl.appendChild(item);
    });
}

if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
        if(offerForm) offerForm.reset(); 
        if(document.getElementById('offerId')) document.getElementById('offerId').value = '';
        if(document.getElementById('modalTitle')) document.getElementById('modalTitle').textContent = 'Registrar Nueva Licitación';
        if(document.getElementById('dateParticipation')) document.getElementById('dateParticipation').value = new Date().toISOString().split('T')[0];
        
        selectedFiles = [];
        renderFileList();

        if (portalSelect) portalSelect.dispatchEvent(new Event('change'));
        if(deleteOfferBtn) deleteOfferBtn.style.display = 'none'; 
        if(modal) modal.style.display = 'flex';
    });
}

function abrirModalParaEditar(id) {
    const off = savedOffers.find(o => o.id == id);
    if (!off) return;
    if(document.getElementById('offerId')) document.getElementById('offerId').value = off.id; 
    if(document.getElementById('portal')) document.getElementById('portal').value = off.portal;
    if(document.getElementById('title')) document.getElementById('title').value = off.title; 
    if(document.getElementById('worker')) document.getElementById('worker').value = off.worker;
    if(document.getElementById('amount')) document.getElementById('amount').value = off.amount || 0; 
    if(document.getElementById('currency')) document.getElementById('currency').value = off.currency || 'CLP';
    if(document.getElementById('status')) document.getElementById('status').value = off.status; 
    if(document.getElementById('dateParticipation')) document.getElementById('dateParticipation').value = off.participationDate;
    if(document.getElementById('endDate')) document.getElementById('endDate').value = off.endDate; 
    if(document.getElementById('modalTitle')) document.getElementById('modalTitle').textContent = 'Modificar Licitación';
    
    selectedFiles = [];
    renderFileList();

    if(deleteOfferBtn) deleteOfferBtn.style.display = 'block'; 
    if(modal) modal.style.display = 'flex';
}

if (closeModalBtn) closeModalBtn.addEventListener('click', () => { if(modal) modal.style.display = 'none'; });

function abrirModalDetalle(id) {
    const off = savedOffers.find(o => o.id == id);
    if (!off) return;
    currentDetailId = id; 

    let bgEstado = '#eaf1fc'; let colorEstado = '#2563eb'; let borderEstado = '#cddcf8'; 
    if(off.status === 'Aceptado') { bgEstado = '#e9f7f0'; colorEstado = '#0f8a5f'; borderEstado = '#b8e4ce'; }
    if(off.status === 'Perdido') { bgEstado = '#fbebee'; colorEstado = '#c23b4f'; borderEstado = '#f1c6ce'; }

    if(document.getElementById('detailBadges')) document.getElementById('detailBadges').innerHTML = `
        <span style="background: var(--verde-oscuro); color: #fff; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 20px; display: flex; align-items: center; gap: 6px;">📁 ${off.portal || 'Otro'}</span>
        <span style="background: ${bgEstado}; color: ${colorEstado}; border: 1px solid ${borderEstado}; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 20px; display: flex; align-items: center; gap: 6px;">● ${off.status || 'En Proceso'}</span>
    `;
    
    let textoCompleto = off.title || 'Sin título';
    let idOferta = ""; let tituloReal = textoCompleto;
    if (textoCompleto.includes(' - ')) {
        const partes = textoCompleto.split(' - ');
        idOferta = partes.shift().trim(); tituloReal = partes.join(' - ').trim(); 
    } else { idOferta = "ID no especificado"; }

    if(document.getElementById('detailPortal')) document.getElementById('detailPortal').textContent = idOferta;
    if(document.getElementById('detailTitle')) document.getElementById('detailTitle').textContent = tituloReal;
    
    const listaNombres = [{email: "alopez@appareil.cl", name: "A. López"}, {email: "dserrano@appareil.cl", name: "D. Serrano"}, {email: "mbarrientos@appareil.cl", name: "M. Barrientos"}, {email: "mpaz@appareil.cl", name: "M. Paz"}, {email: "dparra@appareil.cl", name: "D. Parra"}, {email: "eibanez@appareil.cl", name: "E. Ibañez"}, {email: "vyanez@appareil.cl", name: "V. Yañez"}, {email: "bnunez@appareil.cl", name: "B. Nuñez"}];
    const obj = listaNombres.find(t => t.email === off.worker);
    if(document.getElementById('detailWorker')) document.getElementById('detailWorker').textContent = obj ? obj.name : (off.worker || 'Sin asignar');
    if(document.getElementById('detailAmount')) document.getElementById('detailAmount').textContent = formatearMonto(off.amount, off.currency);
    
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Sin fecha';
        const [y, m, d] = dateStr.split('-');
        return `${d}-${m}-${y}`;
    };
    
    if(document.getElementById('detailPartDate')) document.getElementById('detailPartDate').textContent = formatDate(off.participationDate);
    if(document.getElementById('detailEndDate')) document.getElementById('detailEndDate').textContent = formatDate(off.endDate);

    const urgEl = document.getElementById('detailUrgency');
    if (off.status === 'En Proceso' && off.endDate && urgEl) {
        const hoy = new Date(); hoy.setHours(0,0,0,0);
        const fc = new Date(off.endDate + 'T00:00:00');
        const diff = Math.ceil((fc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        
        urgEl.style.display = 'flex';
        if (diff < 0) { 
            urgEl.innerHTML = `⚠️ Venció hace ${Math.abs(diff)} días — ${formatDate(off.endDate)}`; 
            urgEl.style.background = '#fbebee'; urgEl.style.color = '#c23b4f'; urgEl.style.borderColor = '#f1c6ce';
        }
        else if (diff === 0) { 
            urgEl.innerHTML = `⏱ ¡Cierra HOY! — ${formatDate(off.endDate)}`; 
            urgEl.style.background = '#fdf3de'; urgEl.style.color = '#92650b'; urgEl.style.borderColor = '#f4e2b3'; 
        }
        else { 
            urgEl.innerHTML = `⏱ Cierra en ${diff} días — ${formatDate(off.endDate)}`; 
            urgEl.style.background = '#fdf3de'; urgEl.style.color = '#92650b'; urgEl.style.borderColor = '#f4e2b3';
        }
    } else if(urgEl) { urgEl.style.display = 'none'; }

    let btnContenedor = document.getElementById('botones-archivos-detalle');
    if (!btnContenedor) {
        btnContenedor = document.createElement('div');
        btnContenedor.id = 'botones-archivos-detalle';
        btnContenedor.style.margin = "16px 24px 0 24px";
        if(urgEl && urgEl.parentElement) {
            urgEl.parentElement.insertBefore(btnContenedor, urgEl);
        }
    }
    btnContenedor.innerHTML = '';
    
    if (off.archivos) {
        const listaArchivos = off.archivos.split(',');
        btnContenedor.innerHTML = `<p style="font-size: 11px; font-weight: 700; color: var(--texto-secundario); margin-bottom: 8px;">ARCHIVOS ADJUNTOS</p>`;
        listaArchivos.forEach(archivo => {
            const linkUrl = `https://qboawjjuzgijgtyjzqiw.supabase.co/storage/v1/object/public/licitaciones_archivos/${archivo}`;
            btnContenedor.innerHTML += `<a href="${linkUrl}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; background: #FAFAFA; border: 1px solid var(--borde); padding: 8px 12px; border-radius: var(--radio-sm); font-size: 12px; font-weight: 600; color: var(--texto-primario); text-decoration: none; margin-right: 8px; margin-bottom: 8px;">📄 Descargar Archivo</a>`;
        });
    }

    if(detailModal) detailModal.style.display = 'flex';
}

if (closeDetailModalBtn) closeDetailModalBtn.addEventListener('click', () => { if(detailModal) detailModal.style.display = 'none'; });

if (btnGoToEdit) {
    btnGoToEdit.addEventListener('click', () => {
        if(detailModal) detailModal.style.display = 'none';
        abrirModalParaEditar(currentDetailId);
    });
}

// =========================================================================
// GRÁFICOS
// =========================================================================
function renderizarGraficos() {
    const ofertas = obtenerOfertasFiltradas(); 
    const ctxEstados = document.getElementById('chartEstados');
    const ctxMontos = document.getElementById('chartMontos');
    const ctxEvolucion = document.getElementById('chartEvolucion'); 
    
    if (!ctxEstados || !ctxMontos || !ctxEvolucion) return;

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const today = new Date();
    const labelsEvolucion = [];
    const dataEnviadas = [0,0,0,0,0,0];
    const dataGanadas = [0,0,0,0,0,0];

    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        labelsEvolucion.push(monthNames[d.getMonth()]);
    }

    ofertas.forEach(o => {
        if (!o.participationDate) return;
        const oDate = new Date(o.participationDate + 'T00:00:00');
        const monthDiff = (today.getFullYear() - oDate.getFullYear()) * 12 + (today.getMonth() - oDate.getMonth());
        
        if (monthDiff >= 0 && monthDiff <= 5) {
            const index = 5 - monthDiff;
            dataEnviadas[index]++; 
            if (o.status === 'Aceptado') {
                dataGanadas[index]++; 
            }
        }
    });

    if (chartEvolucionInstance) chartEvolucionInstance.destroy();
    chartEvolucionInstance = new Chart(ctxEvolucion, {
        type: 'line',
        data: {
            labels: labelsEvolucion,
            datasets: [
                {
                    label: 'Enviadas',
                    data: dataEnviadas,
                    borderColor: '#cbd5e1', 
                    backgroundColor: '#cbd5e1',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 4
                },
                {
                    label: 'Ganadas',
                    data: dataGanadas,
                    borderColor: '#89A66C', 
                    backgroundColor: 'rgba(137, 166, 108, 0.15)', 
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8 } } },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } },
                x: { grid: { display: false } }
            }
        }
    });

    const cantAceptado = ofertas.filter(o => o.status === 'Aceptado').length;
    const cantPerdido = ofertas.filter(o => o.status === 'Perdido').length;
    const cantProceso = ofertas.filter(o => o.status === 'En Proceso').length;

    const montoAceptado = ofertas.filter(o => o.status === 'Aceptado').reduce((acc, o) => acc + (o.currency === 'USD' ? o.amount * valorDolar : o.amount), 0);
    const montoPerdido = ofertas.filter(o => o.status === 'Perdido').reduce((acc, o) => acc + (o.currency === 'USD' ? o.amount * valorDolar : o.amount), 0);
    const montoProceso = ofertas.filter(o => o.status === 'En Proceso').reduce((acc, o) => acc + (o.currency === 'USD' ? o.amount * valorDolar : o.amount), 0);

    const colorVerde = '#89A66C'; 
    const colorRojo = '#c23b4f';
    const colorAzul = '#3174E0';

    if (chartEstadosInstance) chartEstadosInstance.destroy();
    if (chartMontosInstance) chartMontosInstance.destroy();

    chartEstadosInstance = new Chart(ctxEstados, {
        type: 'doughnut',
        data: {
            labels: ['Aceptadas', 'Perdidas', 'En Proceso'],
            datasets: [{
                data: [cantAceptado, cantPerdido, cantProceso],
                backgroundColor: [colorVerde, colorRojo, colorAzul],
                borderWidth: 0, hoverOffset: 4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } } }
    });

    chartMontosInstance = new Chart(ctxMontos, {
        type: 'bar',
        data: {
            labels: ['Aceptadas', 'Perdidas', 'En Proceso'],
            datasets: [{
                data: [montoAceptado, montoPerdido, montoProceso],
                backgroundColor: [colorVerde, colorRojo, colorAzul],
                borderRadius: 6
            }]
        },
        options: { 
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { 
                y: { beginAtZero: true, grid: { display: false }, ticks: { callback: function(value) { return '$' + value.toLocaleString('es-CL'); } } },
                x: { grid: { display: false } }
            }
        }
    });
}

// =========================================================================
// ACTUALIZAR CONTRASEÑA EN SUPABASE
// =========================================================================
const btnUpdatePwd = document.getElementById('btn-update-pwd');
if(btnUpdatePwd) {
    btnUpdatePwd.addEventListener('click', async () => {
        const pwd1 = document.getElementById('pwd-nueva').value;
        const pwd2 = document.getElementById('pwd-confirmar').value;
        
        if(!pwd1 || !pwd2) return alert('Por favor, ingresa la contraseña en ambos campos.');
        if(pwd1 !== pwd2) return alert('Las contraseñas no coinciden. Intenta de nuevo.');
        if(pwd1.length < 6) return alert('La contraseña debe tener mínimo 6 caracteres.');
        
        btnUpdatePwd.textContent = "Actualizando...";
        btnUpdatePwd.disabled = true;

        const { error } = await supabaseClient.auth.updateUser({ password: pwd1 });
        
        if(error) {
            alert('Error al actualizar contraseña: ' + error.message);
        } else {
            alert('¡Contraseña actualizada con éxito! La próxima vez que inicies sesión usa la nueva.');
            document.getElementById('pwd-nueva').value = '';
            document.getElementById('pwd-confirmar').value = '';
        }
        
        btnUpdatePwd.textContent = "Actualizar contraseña";
        btnUpdatePwd.disabled = false;
    });
}

// =========================================================================
// SINCRONIZACIÓN DE KAME ERP (CSV)
// =========================================================================
const kameDropZone = document.getElementById("kame-drop-zone");
const kameFileInput = document.getElementById("kame-file-input");
const btnSyncKame = document.getElementById("btn-sync-kame");
const kameTextZone = document.getElementById("kame-text-zone");
let kameFileSelected = null;

if (kameDropZone && kameFileInput) {
    kameDropZone.addEventListener('click', () => kameFileInput.click());
    
    kameDropZone.addEventListener('dragover', (e) => { 
        e.preventDefault(); 
        kameDropZone.style.borderColor = "var(--verde-oscuro)"; 
        kameDropZone.style.background = "#F0F5F1";
    });
    kameDropZone.addEventListener('dragleave', () => { 
        kameDropZone.style.borderColor = "#cbd5e1"; 
        kameDropZone.style.background = "#f8fafc";
    });
    
    kameDropZone.addEventListener('drop', (e) => {
        e.preventDefault(); 
        kameDropZone.style.borderColor = "#cbd5e1";
        kameDropZone.style.background = "#f8fafc";
        if (e.dataTransfer.files.length) procesarArchivoKame(e.dataTransfer.files[0]);
    });
    
    kameFileInput.addEventListener('change', (e) => {
        if (e.target.files.length) procesarArchivoKame(e.target.files[0]);
    });
}

function procesarArchivoKame(file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
        return alert("¡Alto ahí! El archivo debe ser obligatoriamente formato .CSV");
    }
    
    kameFileSelected = file;
    
    kameTextZone.innerHTML = `
        <span style="font-size: 32px;">✅</span><br>
        <strong style="color: var(--verde-oscuro); font-size: 16px;">${file.name}</strong><br>
        <small style="color: #94a3b8; font-size: 14px;">Archivo listo para sincronizar</small>
    `;
    
    btnSyncKame.style.background = "var(--verde-oscuro)";
    btnSyncKame.style.color = "#ffffff";
    btnSyncKame.style.cursor = "pointer";
    btnSyncKame.disabled = false;
}

if (btnSyncKame) {
    btnSyncKame.addEventListener('click', () => {
        if (!kameFileSelected) return;
        
        if(!confirm("⚠️ ESTO BORRARÁ EL INVENTARIO ACTUAL Y LO REEMPLAZARÁ POR EL DEL ARCHIVO CSV.\n\n¿Estás completamente seguro de continuar?")) return;

        btnSyncKame.textContent = "Leyendo archivo...";
        btnSyncKame.disabled = true;

        Papa.parse(kameFileSelected, {
            header: true, 
            skipEmptyLines: true,
            complete: async function(results) {
                const data = results.data;
                if(data.length === 0) {
                    alert("El archivo CSV parece estar vacío.");
                    resetBtnKame();
                    return;
                }

                const inventarioNuevo = data.map(row => {
                    const keys = Object.keys(row);
                    const getVal = (possibleNames) => {
                        const key = keys.find(k => possibleNames.includes(k.toLowerCase().trim()));
                        return key ? row[key] : "";
                    };

                    return {
                        sku: getVal(['sku', 'código', 'codigo', 'id_producto']),
                        articulo: getVal(['articulo', 'artículo', 'nombre', 'descripción', 'descripcion', 'producto']),
                        bodega: getVal(['bodega', 'sucursal', 'ubicacion', 'ubicación']),
                        familia: getVal(['familia', 'categoria', 'categoría', 'marca']),
                        saldo_bodega: Number(getVal(['saldo', 'stock', 'cantidad', 'saldo_bodega', 'disponible'])) || 0
                    };
                }).filter(item => item.sku !== ""); 

                btnSyncKame.textContent = "Vaciando base de datos anterior...";
                
                const { error: errDelete } = await supabaseClient.from('inventario').delete().neq('sku', -1);
                if (errDelete) {
                    alert("Error al borrar inventario viejo: " + errDelete.message);
                    resetBtnKame();
                    return;
                }

                btnSyncKame.textContent = "Sincronizando nuevo inventario...";

                const { error: errInsert } = await supabaseClient.from('inventario').insert(inventarioNuevo);
                
                if (errInsert) {
                    alert("Error al insertar los nuevos datos: " + errInsert.message);
                } else {
                    alert(`¡Sincronización exitosa! ✅\n\nSe cargaron ${inventarioNuevo.length} productos correctamente.`);
                    invData = []; 
                    await cargarInventario(); 
                }
                resetBtnKame();
            },
            error: function(err) {
                alert("Error técnico al leer el CSV: " + err.message);
                resetBtnKame();
            }
        });
    });
}

function resetBtnKame() {
    btnSyncKame.textContent = "Sincronizar Base de Datos";
    btnSyncKame.style.background = "#cbd5e1";
    btnSyncKame.style.color = "#475569";
    btnSyncKame.style.cursor = "not-allowed";
    btnSyncKame.disabled = true;
    kameFileSelected = null;
    if(kameFileInput) kameFileInput.value = '';
    kameTextZone.innerHTML = `
        <span style="font-size: 32px;">📊</span><br>
        <strong style="color: #475569; font-size: 16px;">Arrastra el archivo de KAME aquí</strong><br>
        <small style="color: #94a3b8; font-size: 14px;">Formato obligatorio: .CSV</small>
    `;
}