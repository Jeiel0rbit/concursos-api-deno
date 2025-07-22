# API de Concursos Públicos do Brasil (Versão Deno)

Uma API para consultar concursos públicos abertos e previstos por estado, com dados atualizados a cada 1 hora.

## Apresentação

Esta API foi desenvolvida para fornecer acesso programático e atualizado a informações sobre concursos públicos no Brasil. Os dados são extraídos do site [Concursos no Brasil](https://concursosnobrasil.com/) e atualizados a cada hora, garantindo que você sempre tenha acesso às informações mais recentes.

A API foi construída com [Deno](https://deno.land/), um ambiente de execução moderno e seguro para JavaScript e TypeScript.

## Como Usar

A documentação completa da API está disponível na rota principal:

- `http://localhost:8000/`

Para consultar os concursos de um estado específico, acesse a rota `/{UF}`. Por exemplo, para consultar os concursos de São Paulo, acesse:

- `http://localhost:8000/sp`

## Instalação e Execução

### Pré-requisitos

- [Deno](https://deno.land/) instalado.

### Execução

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/seu-usuario/concursos-api-deno.git
    cd concursos-api-deno
    ```

2.  **Inicie o servidor com o comando:**

    ```bash
    deno task start
    ```

    O Deno irá baixar e cachear as dependências automaticamente. A flag `--allow-net` é necessária para permitir que a aplicação acesse a internet.

## Contribuição

Contribuições são bem-vindas! Se você deseja melhorar esta API, siga os passos abaixo:

1.  **Faça um fork do projeto.**
2.  **Crie uma nova branch para sua feature:** `git checkout -b minha-feature`
3.  **Faça suas alterações e commit:** `git commit -m 'feat: Adiciona nova feature'`
4.  **Envie para sua branch:** `git push origin minha-feature`
5.  **Abra um Pull Request.**

### A Importância dos Testes

Para garantir a qualidade e a estabilidade da API, é fundamental que todas as contribuições sejam acompanhadas de testes. Os testes garantem que as novas funcionalidades não quebram o código existente e que a API se comporta como esperado.

Antes de enviar um Pull Request, certifique-se de que todos os testes estão passando. Para executar os testes, utilize o comando:

```bash
deno task test
```

Este comando irá executar todos os testes do projeto e garantir que suas alterações não introduziram nenhum erro.

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.