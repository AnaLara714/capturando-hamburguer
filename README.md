# 🍔 Cesta de Bolinhas - Jogo em Three.js

Um jogo interativo 3D desenvolvido com **Three.js**, onde o jogador controla uma bandeja (balde) para capturar hambúrgueres que caem do topo da tela. Desvie dos hambúrgueres de penalidade e acumule o máximo de pontos!

## Link para Visualização no Youtube
```bash
https://youtu.be/wsfgx6vmgC8
```

## 🎮 Como jogar

- **Controle a bandeja** com o mouse para movimentá-la horizontalmente.
- **Pegue os hambúrgueres normais** para ganhar pontos.
- **Evite os hambúrgueres de penalidade** (diferentes ou com cor vermelha), que retiram pontos.
- O jogo termina após determinado tempo ou condição (definir aqui se aplicável).

## 🧠 Tecnologias utilizadas

- [Three.js](https://threejs.org/) – biblioteca principal para gráficos 3D.
- [Cannon-es](https://github.com/pmndrs/cannon-es) – para a física dos objetos (gravidade, colisões).
- [GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader) – para carregar modelos 3D (bandeja, hambúrgueres).
- [JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
- HTML5, CSS3

## ✨ Funcionalidades

- Sistema de gerar queda contínua dos hambúrgueres.
- Modelos `.glb/.gltf` otimizados e iluminados com `DirectionalLight`, `PointLight` e `AmbientLight`.
- Sistema de pontuação em tempo real.
- Colisões com física realista.
- Interface leve e responsiva.


## 📦 Como rodar localmente

```bash
# Clone o repositório
git clone https://github.com/AnaLara714/capturando-hamburguer.git

# Acesse a pasta
cd nome-do-repositorio

# Inicie um servidor local (Exemplo com Live Server do VSCode ou use Vite/Parcel se desejar)
```

## Estrutura do projeto
```bash
📦 public/
┣ 📂 assets/
┃ ┣ 📂 hamburguer/
┃ ┣ 📂 balde-pegar/
┃ ┗ 📂 desconta-pontos-hamburguer/
┣ 📂 src/
┣  ┗ main.js
┣ index.html
┣ style.css
┣ README.md
```

## Desenvolvedores

Alunos do curso de Engenharia de Computação

- Ana Lara, Bianka Aparecida, Eric da Costa, Priscila Áquila e Pedro Eric
