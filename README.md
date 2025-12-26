# Informe — Associação Pantanal

Breve projeto front-end para criação de um relatório em A4 (HTML → PDF) com capa corporativa, sumário e conteúdo totalmente editável no cliente.

Este repositório contém uma página estática (HTML + CSS + JS) que permite:
- editar todo o texto diretamente na página (contentEditable),
- adicionar/remover seções, títulos, parágrafos e imagens (upload local),
- gerar um PDF do documento (A4, portrait) no cliente usando html2pdf (jsPDF + html2canvas),
- manter uma capa corporativa personalizável (logo, cores, forma decorativa),
- gerar um sumário (TOC) automaticamente a partir dos `h2`,
- toolbar fixa no topo e menu hamburguer responsivo em telas pequenas.

Tecnologias
- HTML, CSS, JavaScript (puro)
- html2pdf.js (cdn) — combina jsPDF + html2canvas
- Google Fonts (Montserrat + Inter) via CDN

Status
- Funcionalidade principal concluída: edição inline, inserção de imagem (data-URL), geração de PDF, sumário dinâmico.
- UI responsiva com toolbar fixa e menu hamburguer em mobile.
- Recursos adicionais planejados listados em FUTURE.md.

Arquivos principais
- index.html — página principal (conteúdo editável, capa, sumário, controles)
- styles.css — estilos (A4, capa corporativa, toolbar fixa, mobile)
- script.js — lógica de edição, construção do TOC, upload de imagem, geração de PDF, comportamento do menu mobile

Como usar (rápido)
1. Clone / baixe o repositório e abra `index.html` no navegador (Chrome/Firefox recomendados).
2. Edite textos clicando sobre eles.
3. Para adicionar seção/título/parágrafo/imagem use os botões da toolbar (desktop) ou o menu hamburguer (mobile).
4. Ao inserir imagem, escolha um arquivo local — ele será convertido para data-URL e incorporado ao documento (sem problemas de CORS).
5. Clique em "Gerar PDF" para exportar o documento como `relatorio-associacao-pantanal.pdf`.

Observações importantes
- A toolbar possui a classe `.no-print` e é temporariamente ocultada durante a geração do PDF e na impressão (CSS @media print).
- A capa usa uma imagem de fundo (substitua o `src` por sua arte) e um logo no canto superior esquerdo (recomendo PNG com fundo transparente).
- As imagens inseridas via upload são convertidas em data-URL com FileReader — isso garante incorporação no PDF, mas arquivos muito grandes podem aumentar significativamente o tamanho do PDF.
- A qualidade da captura é controlada por `html2canvas.scale` (no script). Valores maiores tornam o PDF com visual mais nítido mas aumentam o tempo de processamento e o tamanho do arquivo.

Personalização rápida
- Cores e identidade: altere as variáveis CSS no topo do `styles.css`:
  - `--primary` — cor principal
  - `--accent` — cor secundária/destaque
  - `--muted` — cor de texto secundário
  - `--logo-width` — largura do logo na capa
- Tipografia: fontes carregadas via Google Fonts em `index.html`. Troque ou adicione conforme desejo.
- Imagem da capa: substitua o `src` da `.cover-image` no `index.html`.

Limitations / Known issues
- O sumário lista os `h2`, mas não contém números de página. Calcular números de página exatos requer mapeamento offsets → páginas (px → mm) considerando escala do html2canvas; não foi implementado nesta versão.
- Reordenação de seções (drag & drop) não implementada.
- Persistência (salvar/recuperar documento editado) não implementada — ao recarregar a página o conteúdo volta ao estado inicial.
- Alguns navegadores móveis podem ter limites de memória/tempo ao gerar PDFs muito grandes com muitas imagens.

Boas práticas e dicas
- Utilize imagens otimizadas (dimensões próximas ao necessário) para reduzir tamanho do PDF.
- Teste a exportação em diferentes navegadores; o Chrome costuma ter melhor desempenho com html2canvas.
- Se for necessário controle profissional de impressão (tipografia e cores de impressão), considere gerar PDF no servidor com uma ferramenta de render de HTML/CSS (wkhtmltopdf, Puppeteer).

Contribuindo
- Abra issues / pull requests com melhorias (ver FUTURE.md para ideias).
- Se precisar que eu implemente alguma das melhorias (ex.: paginação no sumário, reordenar seções, salvar/recuperar JSON, drawer mobile), diga qual e eu adapto o código.

Licença
- Coloque a licença desejada (ex.: MIT) na raiz do repositório, se for público.

Contato
- Projeto feito sob demanda — se quiser que eu gere melhorias específicas, diga qual recurso priorizar.
