// app.js (cliente)
const api = (path, opts={})=>{
  const token = localStorage.getItem('token');
  opts.headers = opts.headers || {};
  if(token) opts.headers['Authorization'] = 'Bearer ' + token;
  return fetch('/api' + path, opts).then(async r=>{
    if(!r.ok){
      const text = await r.text();
      throw new Error(text || 'Error');
    }
    return r.json?.().catch(()=>null);
  });
};

const $ = id => document.getElementById(id);
const show = (el)=> el.classList.remove('hidden');
const hide = (el)=> el.classList.add('hidden');

const sessionArea = $('session-area');
const loginSection = $('login-section');
const welcome = $('welcome');
const dashboard = $('dashboard');
const roleControls = $('role-controls');
const viewArea = $('view-area');
const loginForm = $('login-form');
const loginError = $('login-error');

function renderSession(user){
  sessionArea.innerHTML = user ? `<div>${user.username} (${user.role}) <button id="btn-logout" class="btn">Cerrar</button></div>` : '';
  if(user) {
    document.getElementById('btn-logout').onclick = ()=>{ localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.reload(); };
  }
}

function setUser(user, token){
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  renderSession(user);
  show(dashboard); hide(loginSection); hide(welcome);
  renderDashboard();
}

async function doLogin(username, password){
  loginError.textContent = '';
  try{
    const res = await fetch('/api/login', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({username, password})
    });
    if(!res.ok) throw new Error(await res.text());
    const body = await res.json();
    setUser({username: body.username, role: body.role}, body.token);
  }catch(err){
    loginError.textContent = err.message;
  }
}

$('btn-show-login').onclick = ()=>{
  hide(welcome); show(loginSection);
};
$('btn-demo-admin').onclick = ()=>{ $('username').value='admin'; $('password').value='admin'; };
$('btn-demo-cajero').onclick = ()=>{ $('username').value='cajero'; $('password').value='cajero'; };

loginForm.onsubmit = (e)=>{
  e.preventDefault();
  doLogin($('username').value, $('password').value);
};

function getStoredUser(){
  const t = localStorage.getItem('token');
  const u = localStorage.getItem('user');
  return t && u ? JSON.parse(u): null;
}

// ---- UI: dashboard ----
async function renderDashboard(){
  const user = getStoredUser();
  renderSession(user);
  roleControls.innerHTML = '';
  viewArea.innerHTML = '';

  // Buttons by role
  if(user.role === 'admin'){
    roleControls.innerHTML = `
      <button id="btn-crud-clients" class="btn">CRUD clientes</button>
      <button id="btn-inventory" class="btn">Inventario</button>
      <button id="btn-sell" class="btn primary">Vender</button>
      <button id="btn-add-client" class="btn">Añadir cliente</button>
    `;
  } else {
    roleControls.innerHTML = `
      <button id="btn-sell" class="btn primary">Vender</button>
      <button id="btn-add-client" class="btn">Añadir cliente</button>
    `;
  }

  // handlers
  document.getElementById('btn-add-client').onclick = () => showAddClient();
  const sellBtn = document.getElementById('btn-sell'); if(sellBtn) sellBtn.onclick = ()=> showSell();
  const invBtn = document.getElementById('btn-inventory'); if(invBtn) invBtn.onclick = ()=> showInventory();
  const crudBtn = document.getElementById('btn-crud-clients'); if(crudBtn) crudBtn.onclick = ()=> showClientsCrud();

  // show summary
  showSummary();
}

async function showSummary(){
  viewArea.innerHTML = `<div class="card"><div class="kpi"><div class="item"><div>Total clientes</div><div id="k-clients">...</div></div><div class="item"><div>Total productos</div><div id="k-products">...</div></div></div></div>`;
  try{
    const clients = await api('/clients');
    const inv = await api('/inventory');
    document.getElementById('k-clients').textContent = clients.length;
    document.getElementById('k-products').textContent = inv.length;
  }catch(e){ console.error(e); }
}

// ---- Clients CRUD / add ----
function clientCard(c, showActions=true){
  const tpl = document.getElementById('tpl-client-card');
  const node = tpl.content.cloneNode(true);
  node.querySelector('.name').textContent = `${c.nombre} ${c.apellido}`;
  node.querySelector('.meta').textContent = `${c.cedula || '-'} • ${c.direccion || '-'}`;
  if(showActions){
    const actions = node.querySelector('.actions');
    const edit = document.createElement('button'); edit.className='btn'; edit.textContent='Editar';
    const del = document.createElement('button'); del.className='btn'; del.textContent='Eliminar';
    edit.onclick = ()=> showEditClient(c);
    del.onclick = async ()=> {
      if(!confirm('Eliminar?')) return;
      await api(`/clients/${c.ID_cliente}`, { method:'DELETE' });
      alert('Eliminado'); showClientsCrud();
    };
    actions.appendChild(edit); actions.appendChild(del);
  } else {
    node.querySelector('.actions').remove();
  }
  return node;
}

async function showClientsCrud(){
  viewArea.innerHTML = '<h3>Clientes</h3><div id="clients-list"></div>';
  const list = document.getElementById('clients-list');
  const clients = await api('/clients');
  clients.forEach(c=> list.appendChild(clientCard(c, true)));
}

function showAddClient(){
  viewArea.innerHTML = `<div class="card"><h3>Añadir cliente</h3>
  <form id="add-client-form">
    <input id="ac-nombre" class="input" placeholder="Nombre" required />
    <input id="ac-apellido" class="input" placeholder="Apellido" required />
    <input id="ac-cedula" class="input" placeholder="Cédula" />
    <input id="ac-dire" class="input" placeholder="Dirección" />
    <div class="row"><button class="btn primary">Guardar</button> <button type="button" id="ac-cancel" class="btn">Cancelar</button></div>
  </form></div>`;
  document.getElementById('ac-cancel').onclick = ()=> renderDashboard();
  document.getElementById('add-client-form').onsubmit = async (e)=>{
    e.preventDefault();
    const payload = {
      nombre: document.getElementById('ac-nombre').value,
      apellido: document.getElementById('ac-apellido').value,
      cedula: document.getElementById('ac-cedula').value,
      direccion: document.getElementById('ac-dire').value
    };
    await api('/clients', {method:'POST', body: JSON.stringify(payload), headers:{'Content-Type':'application/json'}});
    alert('Cliente añadido');
    renderDashboard();
  };
}

function showEditClient(client){
  viewArea.innerHTML = `<div class="card"><h3>Editar cliente</h3>
  <form id="edit-client-form">
    <input id="ec-nombre" class="input" value="${client.nombre}" required />
    <input id="ec-apellido" class="input" value="${client.apellido}" required />
    <input id="ec-cedula" class="input" value="${client.cedula || ''}" />
    <input id="ec-dire" class="input" value="${client.direccion || ''}" />
    <div class="row"><button class="btn primary">Guardar</button> <button type="button" id="ec-cancel" class="btn">Cancelar</button></div>
  </form></div>`;
  document.getElementById('ec-cancel').onclick = ()=> showClientsCrud();
  document.getElementById('edit-client-form').onsubmit = async (e)=>{
    e.preventDefault();
    const id = client.ID_cliente;
    const payload = {
      nombre: document.getElementById('ec-nombre').value,
      apellido: document.getElementById('ec-apellido').value,
      cedula: document.getElementById('ec-cedula').value,
      direccion: document.getElementById('ec-dire').value
    };
    await api(`/clients/${id}`, {method:'PUT', body: JSON.stringify(payload), headers:{'Content-Type':'application/json'}});
    alert('Cliente actualizado');
    showClientsCrud();
  };
}

// ---- Inventory ----
async function showInventory(){
  viewArea.innerHTML = '<h3>Inventario</h3><div id="inv-list"></div>';
  const list = document.getElementById('inv-list');
  const inv = await api('/inventory');
  inv.forEach(i=>{
    const el = document.createElement('div'); el.className='card';
    el.innerHTML = `<div style="display:flex;justify-content:space-between"><div><b>${i.nombre}</b><div class="label">Exist: ${i.existencia}</div></div><div><b>$${i.precio_unitario}</b></div></div>`;
    list.appendChild(el);
  });
}

// ---- Sell ----
async function showSell(){
  viewArea.innerHTML = `<div class="card"><h3>Vender producto</h3>
  <form id="sell-form">
    <label class="label">Cliente</label>
    <select id="sell-client" class="input"></select>
    <label class="label">Producto</label>
    <select id="sell-product" class="input"></select>
    <label class="label">Cantidad</label>
    <input id="sell-qty" class="input" type="number" min="1" value="1" />
    <div class="row"><button class="btn primary">Vender</button><button type="button" id="sell-cancel" class="btn">Cancelar</button></div>
  </form></div>`;
  document.getElementById('sell-cancel').onclick = ()=> renderDashboard();
  const clients = await api('/clients'); const inv = await api('/inventory');
  const sc = document.getElementById('sell-client'); const sp = document.getElementById('sell-product');
  clients.forEach(c=> sc.appendChild(new Option(c.nombre+' '+c.apellido, c.ID_cliente)));
  inv.forEach(i=> sp.appendChild(new Option(i.nombre+' (exist:'+i.existencia+')', i.ID_producto)));
  document.getElementById('sell-form').onsubmit = async (e)=>{
    e.preventDefault();
    const payload = { clienteId: sc.value, productoId: sp.value, cantidad: Number(document.getElementById('sell-qty').value) };
    const res = await api('/sell', {method:'POST', body: JSON.stringify(payload), headers:{'Content-Type':'application/json'}});
    alert('Venta registrada. Total: $' + (res.total || 'N/A'));
    renderDashboard();
  };
}

// On load: check token
(function init(){
  const user = getStoredUser();
  if(user){ renderDashboard(); } else { renderSession(null); }
})();
