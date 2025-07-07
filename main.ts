import { Application, Router, Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { IRequest } from "https://deno.land/x/oak@v12.6.1/request.ts";

const app = new Application();
const router = new Router();

// Dicionário para armazenar os dados dos concursos em memória (cache)
const concursosData: Record<string, any[]> = {};

// Lista de Unidades Federativas do Brasil
const UFS: Record<string, string> = {
    "ac": "Acre", "al": "Alagoas", "ap": "Amapá", "am": "Amazonas", "ba": "Bahia",
    "ce": "Ceará", "df": "Distrito Federal", "es": "Espírito Santo", "go": "Goiás",
    "ma": "Maranhão", "mt": "Mato Grosso", "ms": "Mato Grosso do Sul", "mg": "Minas Gerais",
    "pa": "Pará", "pb": "Paraíba", "pr": "Paraná", "pe": "Pernambuco", "pi": "Piauí",
    "rj": "Rio de Janeiro", "rn": "Rio Grande do Norte", "rs": "Rio Grande do Sul",
    "ro": "Rondônia", "rr": "Roraima", "sc": "Santa Catarina", "sp": "São Paulo",
    "se": "Sergipe", "to": "Tocantins"
};

// Busca e extrai os dados de concursos para uma UF específica.
async function fetchAndExtractData(uf: string): Promise<any[]> {
    const url = `https://concursosnobrasil.com/concursos/${uf}/`;
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            console.error(`Erro de status HTTP ao buscar dados para ${uf.toUpperCase()}: ${response.status}`);
            return [];
        }

        const text = await response.text();
        const doc = new DOMParser().parseFromString(text, "text/html");
        const table = doc?.querySelector("table");

        if (!table) {
            console.warn(`Nenhuma tabela encontrada na página para a UF: ${uf.toUpperCase()}`);
            return [];
        }

        const headersArray = Array.from(table.querySelectorAll("th")).map(th => th.textContent.trim());
        const rows = [];

        for (const row of Array.from(table.querySelectorAll("tr")).slice(1)) {
            const cells = Array.from(row.querySelectorAll("td")).map(td => td.textContent.trim());
            if (cells.length === headersArray.length) {
                const rowData = headersArray.reduce((obj, header, index) => {
                    obj[header] = cells[index];
                    return obj;
                }, {} as Record<string, string>);
                rows.push(rowData);
            }
        }
        return rows;

    } catch (e) {
        console.error(`Erro inesperado ao processar dados para ${uf.toUpperCase()}: ${e}`);
        return [];
    }
}

// Tarefa que executa em segundo plano para atualizar os dados de todos os estados.
async function periodicUpdateTask() {
    console.log("Iniciando ciclo de atualização dos dados de concursos...");
    const ufsKeys = Object.keys(UFS);
    const results = await Promise.all(ufsKeys.map(uf => fetchAndExtractData(uf)));

    results.forEach((data, index) => {
        const uf = ufsKeys[index];
        if (data && data.length > 0) {
            concursosData[uf] = data;
            console.log(`Dados para ${uf.toUpperCase()} atualizados com ${data.length} registros.`);
        } else {
            if (!concursosData[uf]) {
                concursosData[uf] = [];
            }
            console.warn(`Não foi possível obter novos dados para ${uf.toUpperCase()}. Mantendo dados antigos (se existirem).`);
        }
    });
    console.log("Ciclo de atualização concluído. Próxima atualização em 1 hora.");
}

// Rota principal com a documentação
router.get("/", (ctx: Context) => {
    let ufListHtml = "";
    for (const [uf, nome] of Object.entries(UFS)) {
        ufListHtml += `<li><a href="/${uf}" target="_blank">${uf.toUpperCase()}</a> - ${nome}</li>`;
    }

    const body = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API de Concursos Públicos</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; padding: 2em; background-color: #000; color: #f1f1f1; }
            .container { max-width: 800px; margin: 0 auto; background: #1a1a1a; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); }
            h1, h2, h3 { color: #61afef; }
            code { background-color: green; padding: 0.2em 0.4em; border-radius: 3px; font-family: "Courier New", Courier, monospace; color: #f1f1f1; }
            a { color: #61afef; text-decoration: none; }
            a:hover { text-decoration: underline; }
            .endpoint { background: #2c2c2c; padding: 1em; border-left: 4px solid #61afef; margin: 1em 0; word-break: break-all; }
            footer { text-align: center; margin-top: 2em; padding-top: 1em; border-top: 1px solid #333; font-weight: normal; color: #888; }
            .uf-list { column-count: 4; list-style-type: none; padding: 0; }
            .uf-list li { margin-bottom: 0.5em; }
            pre { background-color: #282c34; color: #bbb; padding: 1em; border-radius: 5px; overflow-x: auto;}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>API de Concursos Públicos do Brasil</h1>
            <p>Bem-vindo à API de Concursos Públicos. Esta API fornece dados atualizados sobre concursos abertos e previstos em todos os estados do Brasil.</p>
            
            <h2>Como Usar</h2>
            <p>Para consultar os concursos de um estado específico, utilize o endpoint abaixo, substituindo <code>{UF}</code> pela sigla do estado desejado.</p>
            <div class="endpoint">
                <code>GET /{UF}</code>
            </div>
            <p><b>Exemplo:</b> Para ver os concursos do estado do Pará, acesse a rota: <code><a href="/pa" target="_blank">/pa</a></code></p>
            
            <h3>Estrutura da Resposta</h3>
            <p>A resposta será um objeto JSON com duas listas principais: <code>concursos_abertos</code> e <code>concursos_previstos</code>.</p>
            <pre><code>{
  "desenvolvido_por": "Jeiel Miranda",
  "estado": "Pará",
  "uf": "pa",
  "concursos_abertos": [
    {
      "Órgão": "Prefeitura de ...",
      "Situação": "Inscrições Abertas",
      ...
    }
  ],
  "concursos_previstos": [
    {
      "Órgão": "Tribunal de ... (previsto)",
      "Situação": "Autorizado",
      ...
    }
  ]
}</code></pre>

            <h2>UFs Disponíveis</h2>
            <ul class="uf-list">${ufListHtml}</ul>
            <footer>
                <p>Desenvolvido por Jeiel Miranda</p>
            </footer>
        </div>
    </body>
    </html>`;

    ctx.response.body = body;
    ctx.response.type = "html";
});

// Rota para obter dados de um estado específico
router.get("/:state_uf", (ctx: Context) => {
    const { state_uf } = ctx.params;
    const ufLower = state_uf.toLowerCase();

    if (!UFS[ufLower]) {
        ctx.response.status = 404;
        ctx.response.body = { error: `UF '${state_uf}' não encontrada. UFs válidas: ${Object.keys(UFS).join(', ')}` };
        return;
    }

    const data = concursosData[ufLower];

    if (!data || data.length === 0) {
        ctx.response.body = {
            "desenvolvido_por": "Jeiel Miranda",
            "estado": UFS[ufLower],
            "uf": ufLower,
            "message": "Os dados estão sendo coletados ou não há concursos disponíveis no momento. Tente novamente em alguns segundos."
        };
        return;
    }

    const concursosAbertos = [];
    const concursosPrevistos = [];

    for (const concurso of data) {
        const isPrevisto = Object.values(concurso).some(value =>
            typeof value === 'string' && value.toLowerCase().includes('previsto')
        );

        if (isPrevisto) {
            concursosPrevistos.push(concurso);
        } else {
            concursosAbertos.push(concurso);
        }
    }

    ctx.response.body = {
        "desenvolvido_por": "Jeiel Miranda",
        "estado": UFS[ufLower],
        "uf": ufLower,
        "concursos_abertos": concursosAbertos,
        "concursos_previstos": concursosPrevistos
    };
});

// Middlewares
app.use(router.routes());
app.use(router.allowedMethods());

// Inicia o servidor e a tarefa de atualização
app.addEventListener("listen", ({ hostname, port }) => {
    console.log(`Servidor ouvindo em: http://${hostname}:${port}`);
    // Executa a primeira atualização imediatamente
    periodicUpdateTask();
    // Agenda atualizações a cada 1 hora (3600000 ms)
    setInterval(periodicUpdateTask, 3600 * 1000);
});

await app.listen({ port: 8000 });
