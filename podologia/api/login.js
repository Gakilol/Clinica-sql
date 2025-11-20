import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
const users = [
  { id:1, username:'admin', passwordHash: bcrypt.hashSync('admin', 8), role:'admin' },
  { id:2, username:'cajero', passwordHash: bcrypt.hashSync('cajero', 8), role:'cajero' }
];
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).send('Method not allowed');
  const { username, password } = req.body||{};
  const u = users.find(x=>x.username===username);
  if(!u) return res.status(401).send('Usuario no encontrado');
  const ok = bcrypt.compareSync(password, u.passwordHash);
  if(!ok) return res.status(401).send('Credenciales invalidas');
  const token = jwt.sign({ id:u.id, username:u.username, role:u.role }, process.env.JWT_SECRET || 'dev', { expiresIn:'8h' });
  res.json({ id:u.id, username:u.username, role:u.role, token });
}
