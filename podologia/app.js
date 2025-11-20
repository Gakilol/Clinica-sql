// client-side app.js (modal CRUD)
const api = (path, opts={})=>{
  const token = localStorage.getItem('token');
  opts.headers = opts.headers || {};
  if(token) opts.headers['Authorization'] = 'Bearer ' + token;
  return fetch('/api' + path, opts).then(async r=>{
    if(!r.ok){
      const txt = await r.text();
      throw new Error(txt || 'Error');
    }
    return r.json?.().catch(()=>null);
  });
};
const $ = id => document.getElementById(id);
const show = el=> el.classList.remove('hidden');
const hide = el=> el.classList.add('hidden');

const sessionArea = $('session-area');
const loginSection = $('login-section');
const welcome = $('welcome');
const dashboard = $('dashboard');
const roleControls = $('role-controls');
const viewArea = $('view-area');
const modalClient = $('modal-client');
const modalProduct = $('modal-product');

function renderSession(user){
  sessionArea.innerHTML = user ? `<div>${user.username} (${user.role}) <button id="btn-logout" class="btn">Cerrar</button></div>` : '';
  if(user) document.getElementById('btn-logout').onclick = ()=>{ localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.reload(); };
}
function setUser(user, token){
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  renderSession(user);
  show(dashboard); hide(loginSection); hide(welcome);
  renderDashboard();
}
async function doLogin(username, password){
  try{
    const res = await fetch('/api/login',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username,password})});
    if(!res.ok) throw new Error(await res.text());
    const body = await res.json();
    setUser({username: body.username, role: body.role}, body.token);
  }catch(e){ $('login-error').textContent = e.message; }
}
$('btn-show-login').onclick = ()=>{ hide(welcome); show(loginSection); };
$('btn-demo-admin').onclick = ()=>{ $('username').value='admin'; $('password').value='admin'; };
$('btn-demo-cajero').onclick = ()=>{ $('username').value='cajero'; $('password').value='cajero'; };
$('login-form').onsubmit = e=>{ e.preventDefault(); doLogin($('username').value, $('password').value); };

function getStoredUser(){ const t = localStorage.getItem('token'); const u = localStorage.getItem('user'); return t && u ? JSON.parse(u): null; }

async function renderDashboard(){
  const user = getStoredUser();
  renderSession(user);
  roleControls.innerHTML = '';
  viewArea.innerHTML = '';
  if(user.role === 'admin'){
    roleControls.innerHTML = `
      <button id="btn-crud-clients" class="btn">CRUD clientes</button>
      <button id="btn-crud-products" class="btn">CRUD productos</button>
      <button id="btn-inventory" class="btn">Inventario</button>
      <button id="btn-sell" class="btn primary">Vender</button>
    `;
  } else {
    roleControls.innerHTML = `
      <button id="btn-sell" class="btn primary">Vender</button>
      <button id="btn-add-client" class="btn">Añadir cliente</button>
    `;
  }
  document.getElementById('btn-add-client')?.addEventListener('click', ()=> openClientModal());
  document.getElementById('btn-crud-clients')?.addEventListener('click', ()=> showClientsCrud());
  document.getElementById('btn-crud-products')?.addEventListener('click', ()=> showProductsCrud());
  document.getElementById('btn-inventory')?.addEventListener('click', ()=> showInventory());
  document.getElementById('btn-sell')?.addEventListener('click', ()=> showSell());
  showSummary();
}

async function showSummary(){
  viewArea.innerHTML = `<div class="card"><div class="kpi"><div class="item"><div>Total clientes</div><div id="k-clients">...</div></div><div class="item"><div>Total productos</div><div id="k-products">...</div></div></div></div>`;
  try{
    const clients = await api('/clients');
    const inv = await api('/inventory');
    $('k-clients').textContent = clients.length;
    $('k-products').textContent = inv.length;
  }catch(e){ console.error(e); }
}

// MODAL helpers
function openClientModal(client){
  $('modal-client-title').textContent = client ? 'Editar cliente' : 'Añadir cliente';
  $('m-nombre').value = client?.nombre||'';
  $('m-apellido').value = client?.apellido||'';
  $('m-cedula').value = client?.cedula||'';
  $('m-dire').value = client?.direccion||'';
  modalClient.dataset.editId = client?.ID_cliente || '';
  show(modalClient);
}
function closeClientModal(){ hide(modalClient); modalClient.dataset.editId=''; }
function openProductModal(prod){
  $('modal-product-title').textContent = prod ? 'Editar producto' : 'Añadir producto';
  $('p-nombre').value = prod?.nombre||'';
  $('p-desc').value = prod?.descripcion||'';
  $('p-precio').value = prod?.precio_unitario||'';
  $('p-prov').value = prod?.ID_proveedor||'';
  modalProduct.dataset.editId = prod?.ID_producto || '';
  show(modalProduct);
}
function closeProductModal(){ hide(modalProduct); modalProduct.dataset.editId=''; }

// Clients CRUD
async function showClientsCrud(){
  viewArea.innerHTML = '<h3>Clientes</h3><div id="clients-list"></div>';
  const list = document.getElementById('clients-list');
  const clients = await api('/clients');
  clients.forEach(c=>{
    const el = document.createElement('div'); el.className='card client-card';
    el.innerHTML = `<div><div class="name">${c.nombre} ${c.apellido}</div><div class="meta">${c.cedula||'-'} • ${c.direccion||'-'}</div></div>`;
    const actions = document.createElement('div');
    const edit = document.createElement('button'); edit.className='btn'; edit.textContent='Editar';
    const del = document.createElement('button'); del.className='btn'; del.textContent='Eliminar';
    edit.onclick = ()=> openClientModal(c);
    del.onclick = async ()=>{ if(!confirm('Eliminar?')) return; await api('/clients?id='+c.ID_cliente,{method:'DELETE'}); alert('Eliminado'); showClientsCrud(); };
    actions.appendChild(edit); actions.appendChild(del);
    el.appendChild(actions);
    list.appendChild(el);
  });
}

// Product CRUD
async function showProductsCrud(){
  viewArea.innerHTML = '<h3>Productos</h3><div id="products-list"></div><div style="margin-top:12px"><button id="btn-add-product" class="btn">Añadir producto</button></div>';
  document.getElementById('btn-add-product').onclick = ()=> openProductModal();
  const list = document.getElementById('products-list');
  const prods = await api('/products');
  prods.forEach(p=>{
    const el = document.createElement('div'); el.className='card client-card';
    el.innerHTML = `<div><div class="name">${p.nombre}</div><div class="meta">${p.descripcion||''} • $${p.precio_unitario}</div></div>`;
    const actions = document.createElement('div');
    const edit = document.createElement('button'); edit.className='btn'; edit.textContent='Editar';
    const del = document.createElement('button'); del.className='btn'; del.textContent='Eliminar';
    edit.onclick = ()=> openProductModal(p);
    del.onclick = async ()=>{ if(!confirm('Eliminar?')) return; await api('/products?id='+p.ID_producto,{method:'DELETE'}); alert('Eliminado'); showProductsCrud(); };
    actions.appendChild(edit); actions.appendChild(del);
    el.appendChild(actions);
    list.appendChild(el);
  });
}

// Modal form handlers
$('m-cancel').onclick = closeClientModal;
$('p-cancel').onclick = closeProductModal;
document.getElementById('modal-client-form').onsubmit = async e=>{
  e.preventDefault();
  const id = modalClient.dataset.editId;
  const payload = { nombre:$('m-nombre').value, apellido:$('m-apellido').value, cedula:$('m-cedula').value, direccion:$('m-dire').value };
  if(id){
    await api('/clients?id='+id, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    alert('Actualizado');
  } else {
    await api('/clients', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    alert('Creado');
  }
  closeClientModal();
  showClientsCrud();
};
document.getElementById('modal-product-form').onsubmit = async e=>{
  e.preventDefault();
  const id = modalProduct.dataset.editId;
  const payload = { nombre:$('p-nombre').value, descripcion:$('p-desc').value, precio_unitario:parseFloat($('p-precio').value)||0, ID_proveedor: parseInt($('p-prov').value)||null };
  if(id){
    await api('/products?id='+id, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    alert('Actualizado');
  } else {
    await api('/products', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    alert('Creado');
  }
  closeProductModal();
  showProductsCrud();
};

// Inventory and sell unchanged (simple)
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
    const payload = { clienteId: sc.value, productoId: sp.value, cantidad: Number($('sell-qty').value) };
    const res = await api('/sell', {method:'POST', body: JSON.stringify(payload), headers:{'Content-Type':'application/json'}});
    alert('Venta registrada. Total: $' + (res.total || 'N/A'));
    renderDashboard();
  };
}

// Init
(function init(){
  const user = getStoredUser();
  if(user){ renderDashboard(); } else { renderSession(null); }
})();
