async function postJSON(url, data){
  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data),
    credentials: 'include'
  });
  return res.json();
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = { username: fd.get('username'), password: fd.get('password') };
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;
  btn.innerText = 'Ingresando...';
  try {
    const r = await postJSON('/api/auth/login', data);
    if (r.role === 'admin') {
      window.location = '/pages/admin.html';
    } else if (r.role === 'cajero') {
      window.location = '/pages/cajero.html';
    } else {
      document.getElementById('msg').innerText = r.message || 'Credenciales incorrectas';
    }
  } catch (err) {
    document.getElementById('msg').innerText = 'Error de conexión: ' + (err.message || err);
  } finally {
    btn.disabled = false;
    btn.innerText = 'Ingresar';
  }
});

document.getElementById('seed').addEventListener('click', async ()=>{
  const res = await fetch('/api/auth/seed-users', {method:'POST'});
  const j = await res.json();
  alert('Seed: ' + (j.message || JSON.stringify(j)));
});
