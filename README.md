# Perfil Sensorial 2

## Instalação

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install --legacy-peer-deps
```

## Rodar localmente

```powershell
# Celular (Expo Go)
npx expo start --tunnel

# Navegador
npx expo start --web
```

---

## ── CONFIGURAÇÃO FIREBASE ──────────────────────────────────

### 1. Ativar Authentication
- console.firebase.google.com → seu projeto
- Build → Authentication → Get started
- Sign-in method → Email/Password → Ativar → Salvar

### 2. Criar Firestore
- Build → Firestore Database → Create database
- "Start in production mode"
- Região: **southamerica-east1**

### 3. Regras de segurança (Firestore → Rules → Publish)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Índices (automático)
Na primeira vez que abrir o app e carregar pacientes/avaliações, pode aparecer
um erro no console do navegador com um link para criar índice. Clique no link
— o Firebase cria em ~1 minuto.

---

## ── DEPLOY NA VERCEL (site + PWA) ─────────────────────────

### Passo 1 — GitHub
1. Crie uma conta em github.com (gratuito)
2. Crie um repositório novo (ex: `perfil-sensorial-2`)
3. Na pasta do projeto, rode:
```powershell
git init
git add .
git commit -m "inicial"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/perfil-sensorial-2.git
git push -u origin main
```

### Passo 2 — Vercel
1. Acesse vercel.com → criar conta com o GitHub
2. "Add New Project" → importe o repositório
3. Configure:
   - **Framework Preset:** Other
   - **Build Command:** `npx expo export --platform web`
   - **Output Directory:** `dist`
4. Clique em **Deploy**
5. Em ~2 minutos você recebe um link como `perfil-sensorial-2.vercel.app`

### Passo 3 — Adicionar à tela inicial (iPhone)
1. Abra o link no **Safari** do iPhone
2. Toque no ícone de **Compartilhar** (quadrado com seta)
3. "Adicionar à Tela de Início"
4. O app aparece como ícone, abre em tela cheia como app nativo ✅

---

## ── FUNCIONALIDADES ────────────────────────────────────────
- Login / Cadastro / Redefinir senha
- Dados na nuvem (Firebase) — sincronizados em todos os dispositivos
- Funciona em Android, iPhone (PWA) e computador (navegador)
- Exportar relatório em PDF com gráficos e comentários
