# API de Concursos Públicos do Brasil (Versão Deno)

Uma API para consultar concursos públicos abertos e previstos por estado, com dados atualizados a cada 1 hora.

## Pré-requisitos

- [Deno](https://deno.land/) instalado.

## Execução

1.  **Clone o repositório ou salve o arquivo `main.ts`.**

2.  **Inicie o servidor com o comando:**

    ```bash
    deno run --allow-net main.ts
    ```

    O Deno irá baixar e cachear as dependências automaticamente. A flag `--allow-net` é necessária para permitir que a aplicação acesse a internet.

## Como Usar

- A documentação da API está disponível na rota principal: `http://localhost:8000/`
- Para consultar os concursos de um estado, acesse a rota `/{UF}`. Por exemplo: `http://localhost:8000/sp` para São Paulo.
