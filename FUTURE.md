# Registro de tarefas futuras / histórico técnico

Este arquivo lista tarefas futuras, melhorias recomendadas, decisões técnicas e notas que podem ser úteis para continuidade do projeto.

Prioridade alta
- Paginação no Sumário (estimativa e/ou precisa)
  - Objetivo: exibir números de página ao lado de cada entrada do sumário.
  - Abordagem: mapear offsetTop de cada heading para página usando altura de página em pixels:
    1. Renderizar o conteúdo no DOM (visível).
    2. Medir a altura em px que corresponde a 1 página A4 no ambiente atual (considerar padding/margins e escala do html2canvas).
    3. Calcular Math.floor((offsetTop - páginaInicialOffset) / alturaPaginaPx) + 1.
    4. Inserir número ao lado da entrada do TOC.
  - Riscos: diferenças entre navegadores, escala do canvas e imagens que causam elementos com quebras inesperadas.
  - Estimativa: médio (alguns ajustes por ambiente).

- Persistência (Salvar / Recarregar)
  - Exportar o documento editado para JSON (estrutura com seções, html/texto, imagens em data-URL).
  - Implementar import para reconstruir o DOM a partir do JSON.
  - Uso: permitir "salvar rascunho" no disco do usuário ou em backend.

- Reordenação de seções (drag & drop)
  - Permitir arrastar artigos (`.section`) para reordenar.
  - Pode usar HTML5 Drag & Drop ou biblioteca leve (SortableJS).
  - Atualizar TOC automaticamente após reorder.

Prioridade média
- Reduzir duplicação dos botões mobile
  - Em vez de duplicar os botões no DOM, mover o mesmo nó de controles para o mobile via JS (appendChild) ao invés de ter duplicatas.
  - Benefício: manter um ponto único de manutenção para handlers.

- Drawer mobile (em vez de dropdown)
  - Implementar menu que desliza da lateral (mais espaço e excelente UX).
  - Requer animação CSS/JS e trap focus para acessibilidade.

- Melhorias de acessibilidade (a11y)
  - Garantir labels/aria nos controles, navegação por teclado consistente, foco visível.
  - Marcar elementos editáveis com aria-labels apropriados.

- Otimização de imagens antes do embed
  - Compressão client-side (ex.: redimensionar em canvas antes de inserir) para reduzir tamanho do PDF.

Prioridade baixa / Nice-to-have
- Templates de capa (central, minimalista, com coluna esquerda, etc.) e switcher de paletas.
- Opção para remover background images na exportação (versão "clean" do PDF).
- Inserir cabeçalho/rodapé com números de página (usando jsPDF pós-processamento) — nota: html2pdf dificulta pós-edição por páginas; alternativa: montar PDF pagina a pagina via jsPDF.
- Exportar como HTML/ZIP com assets (em vez de só PDF).
- Integração com backend para geração de PDFs mais robusta (Puppeteer).

Histórico / mudanças relevantes
- Versão atual:
  - toolbar fixa no topo
  - toolbar responsiva com menu hamburguer em mobile
  - conteúdo totalmente editável (titles, paragraphs)
  - adição de seções e imagens via upload (data-URL)
  - sumário automático (lista de h2)
  - geração de PDF com html2pdf (A4 portrait)

Notas técnicas
- html2pdf.js:
  - Simples de usar para páginas com CSS básico; respeita `@media print` e `page-break-*` em muitos casos.
  - Para controle avançado de paginação e elementos por página, soluções de render server-side (Puppeteer, wkhtmltopdf) costumam ser mais previsíveis.

Contato / próximo passo
- Para priorizar uma das tarefas acima, indique qual prefere e eu implemento/forneço o código.
- Se quiser posso abrir uma checklist de issues com prioridades e estimativas (se desejar integração com GitHub).
