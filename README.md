# 🛒 ComprasApp

O **ComprasApp** é um aplicativo mobile desenvolvido em React Native com Expo, projetado para otimizar e organizar listas de compras de supermercado de forma prática e inteligente. Com ele, o usuário pode gerenciar itens no carrinho, atualizar quantidades de forma dinâmica, escanear/fotografar produtos e salvar o histórico de suas compras concluídas.

---

## 🚀 Funcionalidades Principais

* **🔐 Autenticação com Firebase:** Sistema de login seguro integrado ao Firebase Authentication para garantir que cada usuário tenha sua lista exclusiva.
* **📸 Captura de Imagens:** Integração com a câmera para registrar e armazenar localmente a foto real de cada produto na gôndola.
* **🗄️ Banco de Dados Local (SQLite):** Persistência robusta de dados utilizando o SQLite para gerenciar o carrinho atual de forma offline e rápida.
* **➕ Controles Dinâmicos:** Ajuste de quantidade de itens diretamente no card do produto com recálculo automático de valores totais.
* **📜 Histórico de Compras:** Encerramento do carrinho com persistência dos dados agrupados por data e volume no histórico do usuário.
* **🎨 Interface Moderna & Clean:** Layout profissional e responsivo utilizando uma paleta de cores sofisticada (Slate/Dark Mode e tons funcionais).

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes tecnologias e ecossistemas:

* **React Native** & **Expo Framework** (Managed Workflow)
* **TypeScript** (Tipagem estática e segurança de código)
* **React Navigation** (Navegação nativa entre telas)
* **Firebase Auth** (Autenticação de usuários)
* **Expo FileSystem** & **SQLite** (Armazenamento de mídia e banco de dados local estruturado)
* **React Native Safe Area Context** (Garantia de layout correto em dispositivos com notch)

---

## 📦 Como Instalar e Rodar o Projeto

Siga os passos abaixo para configurar o ambiente localmente.

### Pré-requisitos
* **Node.js** instalado (versão LTS recomendada).
* **Expo Go** instalado no seu smartphone (Android/iOS) ou um emulador configurado.

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/SEU_USUARIO/ComprasApp.git](https://github.com/SEU_USUARIO/ComprasApp.git)
   cd ComprasApp
