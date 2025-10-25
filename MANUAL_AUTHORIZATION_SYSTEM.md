# Sistema de Autorização Manual

## Visão Geral

Este sistema implementa um controle de acesso manual onde usuários podem se cadastrar no Firebase, mas só conseguem acessar o sistema após autorização manual do administrador.

## Como Funciona

### 1. Cadastro de Usuários
- Usuários fazem login com Google normalmente
- Se é a primeira vez, um perfil é criado automaticamente no Firestore
- O usuário fica com status `pendingAuthorization: true` e `isAuthorized: false`
- O usuário não consegue acessar o sistema até ser autorizado

### 2. Autorização Manual
- Apenas administradores podem autorizar usuários
- Lista de administradores está definida no componente `UserManagement.jsx`
- Administradores podem ver todos os usuários pendentes na aba "Admin"
- Administradores podem autorizar ou negar acesso

### 3. Estrutura de Dados no Firestore

#### Coleção: `users`
```javascript
{
  email: "usuario@exemplo.com",
  displayName: "Nome do Usuário",
  photoURL: "https://...",
  isAuthorized: false,           // true quando autorizado
  pendingAuthorization: true,     // true quando aguardando
  createdAt: timestamp,
  lastLogin: timestamp,
  authorizedAt: timestamp,       // quando foi autorizado
  authorizedBy: "adminUserId"    // quem autorizou
}
```

## Componentes Principais

### AuthContext.jsx
- Gerencia o estado de autenticação
- Verifica autorização no Firestore
- Funções: `checkUserAuthorization`, `authorizeUser`, `getPendingUsers`

### UserManagement.jsx
- Interface para administradores
- Lista usuários pendentes
- Botões para autorizar/negar acesso
- Apenas administradores podem acessar

### Login.jsx
- Mostra status de autorização pendente
- Interface melhorada para usuários aguardando

### UnauthorizedAccess.jsx
- Tela para usuários não autorizados
- Diferencia entre "aguardando" e "negado"

## Configuração de Administradores

Para adicionar/remover administradores, edite o arquivo `src/components/UserManagement.jsx`:

```javascript
const adminEmails = [
  'mauriciogear4@gmail.com',
  'contato.yanphelipe@gmail.com',
  'contatomauriciosts@gmail.com'
];
```

## Fluxo de Uso

1. **Usuário faz login** → Perfil criado no Firestore com `pendingAuthorization: true`
2. **Usuário vê tela de "Aguardando Autorização"** → Não consegue acessar o sistema
3. **Administrador acessa aba "Admin"** → Vê lista de usuários pendentes
4. **Administrador clica "Autorizar"** → Usuário pode acessar o sistema
5. **Usuário faz login novamente** → Acesso liberado

## Segurança

- Apenas emails de administradores podem acessar a interface de gerenciamento
- Verificação de autorização acontece a cada login
- Usuários não autorizados são automaticamente deslogados
- Dados sensíveis ficam no Firestore com regras de segurança

## Vantagens

✅ **Controle total**: Você decide quem pode acessar
✅ **Segurança**: Mesmo cadastrado, usuário não entra sem autorização
✅ **Auditoria**: Histórico de quem autorizou e quando
✅ **Flexibilidade**: Pode autorizar/negar a qualquer momento
✅ **Interface amigável**: Administradores têm interface visual para gerenciar

## Próximos Passos

- [ ] Implementar notificações por email quando usuário for autorizado
- [ ] Adicionar logs de auditoria mais detalhados
- [ ] Implementar diferentes níveis de acesso (admin, user, etc.)
- [ ] Adicionar filtros na interface de administração

