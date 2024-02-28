# Hamburgueria da Kenzie

![Visualização da aplicação Hamburgueria da Kenzie](https://github.com/JrValerio/template-hamburgueria/blob/main/src/assets/Hamburgueria%20Kenzie.png)


## Descrição

Este projeto foi desenvolvido como atividade prática do Módulo 3 da Kenzie Academy Brasil. A Hamburgueria da Kenzie é uma aplicação web que simula um sistema de pedidos para uma hamburgueria, permitindo aos usuários visualizar produtos, adicionar itens ao carrinho de compras e gerenciar suas seleções.

## Tecnologias e Ferramentas Utilizadas

- **React:** Framework utilizado para construir a interface de usuário da aplicação.
- **Axios:** Biblioteca utilizada para fazer requisições HTTP à API de produtos.
- **React Icons:** Biblioteca utilizada para adicionar ícones de diversas coleções, como Material Design e FontAwesome.
- **SASS (SCSS):** Utilizado para estilizar os componentes da aplicação de forma mais organizada e com recursos avançados.
- **Local Storage:** Tecnologia do navegador utilizada para persistir os dados do carrinho de compras mesmo após o fechamento da página.
- **Hooks Personalizados:** Utilização de hooks personalizados como useOutsideClick e useEscapePress para adicionar funcionalidades específicas ao projeto.
- **Mobile First:** Abordagem de desenvolvimento focada na experiência do usuário em dispositivos móveis.

## Melhoria na Interação do Usuário com Hooks Personalizados

Um dos desafios na criação da Hamburgueria da Kenzie foi garantir uma experiência de usuário suave e intuitiva, especialmente no que diz respeito aos modais de carrinho de compras e busca de produtos. Para resolver isso, desenvolvi dois hooks personalizados: useOutsideClick e useEscapePress.

- O hook **useOutsideClick** foi utilizado no modal do carrinho de compras. Ele permite que o usuário feche o modal clicando fora da área do modal, proporcionando uma maneira rápida e conveniente de retornar à navegação na página sem a necessidade de buscar explicitamente um botão de fechar.

- Por outro lado, o hook **useEscapePress** foi aplicado tanto no modal do carrinho quanto no modal de busca. Esse hook detecta quando o usuário pressiona a tecla "Esc" e fecha o modal automaticamente. Essa funcionalidade é particularmente útil para usuários que preferem navegar usando o teclado, tornando a interação com a aplicação mais ágil e menos dependente de cliques do mouse.

A combinação desses hooks personalizados contribuiu significativamente para uma interação mais fluida e agradável na Hamburgueria da Kenzie, alinhando-se com os princípios de uma boa experiência do usuário.

## Funcionalidades

- Listagem de produtos com dados vindos de uma API.
- Adição e remoção de produtos no carrinho de compras.
- Visualização do carrinho de compras com opções de incrementar, decrementar e remover itens.
- Persistência do carrinho de compras no Local Storage.
- Busca de produtos com modal de resultados.
- Fechamento de modais ao clicar fora ou pressionar a tecla Esc.

## Aprendizados

- Aprofundamento no uso de React e gerenciamento de estado.
- Integração com APIs usando Axios.
- Uso de hooks personalizados para melhorar a interação do usuário.
- Prática de estilização avançada com SASS e abordagem Mobile First.

## Agradecimentos

Agradeço ao instrutor Fernando Feliciano pelo suporte e orientações durante o desenvolvimento deste projeto.

## Links

- [Projeto ao vivo](https://template-hamburgueria-orcin.vercel.app/)
- [Repositório no GitHub](https://github.com/JrValerio/template-hamburgueria)

Desenvolvido por [Amaro Júnior](https://www.linkedin.com/in/jrvalerio).