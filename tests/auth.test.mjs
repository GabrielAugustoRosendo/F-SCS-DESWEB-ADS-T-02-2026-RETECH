import * as vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const source = await readFile(new URL('../js/retech-supabase.js', import.meta.url), 'utf8');
const authTests = [];
async function testarAuth(caso) {
 const user = { id: 'u1', email: 'teste@example.com', identities: [{}], user_metadata: { nome: 'Teste' } };
 const status = { textContent: '', className: '' };
 const botao = { disabled: false };
 let submit, callback, gravacoes = 0, chamadasAuth = 0;
 const link = { classList: { remove() {}, toggle() {} } };
 const form = { id: caso.login ? 'formulario-login' : 'formulario-cadastro', reportValidity: () => true,
  querySelector: s => s === '[role=status]' ? status : botao,
  addEventListener: (_e, fn) => { submit = fn; }, reset() {} };
 const db = {
  auth: {
   onAuthStateChange(fn) { callback = fn; },
   getSession: async () => ({ data: { session: caso.sessaoInicial ? {user} : null } }),
   getUser: async () => { chamadasAuth++; return {data:{user}}; },
   signUp: async () => caso.duplicada ? {data:{user:{...user, identities:[]}},error:null} :
     caso.falhaAuth ? {error:{message:'User already registered'}} :
     {data:{user,session: caso.semSessao ? null : {user}}},
   signInWithPassword: async () => caso.senhaErrada ? {error:{message:'Invalid login credentials'}} : {data:{user,session:{user}}},
   signOut: async () => ({error: caso.falhaSaida ? {message:'Falha ao sair'} : null})
  },
  from() { return {
   select() { return this; }, eq() { return this; },
   maybeSingle: async () => ({data:caso.perfilExiste ? {id:user.id}:null,error:null}),
   upsert() { gravacoes++; return this; },
   single: async () => caso.falhaPerfil ? {error:{message:'RLS negou'}} : {data:{id:user.id}}
  }; }
 };
 const loc = {pathname:caso.home ? '/index.html':'/login.html',href:'',search:''};
 const document = {
  querySelectorAll(s) { if(s === '.formulario-login') return [form]; if(s === '.acoes-cabecalho .entrar') return [link]; return []; },
  querySelector() {return null;},
  getElementById(id) {return ['email','senha'].includes(id)?{value:'',focus(){}}:null;}
 };
 const context = vm.createContext({window:{retechDB:db,location:loc},document,URLSearchParams,
  FormData:class{get(key){return {nome:'Teste',email:user.email,senha:'senha123','confirmar-senha':caso.senhasDiferentes?'outra':'senha123'}[key];}}
 });
 new vm.Script(source).runInContext(context);
 await Promise.resolve(); await Promise.resolve();
 if(caso.home) {
  assert.equal(link.href,'perfil.html');
  callback('SIGNED_OUT',null); assert.equal(link.href,'login.html');
  callback('SIGNED_IN',{user}); assert.equal(link.href,'perfil.html');
  assert.equal(chamadasAuth,0);
 } else {
  await submit({preventDefault(){}});
  assert.equal(botao.disabled,false);
  if(caso.sucesso) assert.match(status.textContent,/Conta e perfil criados com sucesso/);
  else if(caso.login && !caso.senhaErrada && !caso.falhaPerfil) assert.equal(loc.href,'perfil.html');
  else {assert.notEqual(status.className,'perfil-status-sucesso'); assert.ok(status.textContent);}
  if(caso.duplicada || caso.semSessao || caso.falhaAuth || caso.senhasDiferentes || caso.senhaErrada) assert.equal(gravacoes,0);
  if(caso.falhaPerfil) assert.equal(loc.href,'');
 }
 authTests.push(caso.nome);
}
for (const caso of [
  {
    "nome": "Sessão inicial, saída e nova entrada no cabeçalho",
    "home": true,
    "sessaoInicial": true
  },
  {
    "nome": "Cadastro com perfil confirmado",
    "sucesso": true
  },
  {
    "nome": "Cadastro com perfil já existente",
    "sucesso": true,
    "perfilExiste": true
  },
  {
    "nome": "Resposta ofuscada de e-mail duplicado",
    "duplicada": true
  },
  {
    "nome": "Erro de e-mail já cadastrado",
    "falhaAuth": true
  },
  {
    "nome": "Cadastro sem sessão",
    "semSessao": true
  },
  {
    "nome": "Falha de gravação do perfil",
    "falhaPerfil": true
  },
  {
    "nome": "Falha de saída após cadastro",
    "falhaSaida": true
  },
  {
    "nome": "Confirmação de senha diferente",
    "senhasDiferentes": true
  },
  {
    "nome": "Login válido recupera perfil ausente",
    "login": true
  },
  {
    "nome": "Login com senha incorreta",
    "login": true,
    "senhaErrada": true
  },
  {
    "nome": "Login com falha de perfil não redireciona",
    "login": true,
    "falhaPerfil": true
  }
]) await testarAuth(caso);
console.log(authTests.length + ' cenários de autenticação aprovados.');
