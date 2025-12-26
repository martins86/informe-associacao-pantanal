// script.js — edições, geração de PDF e menu hamburguer responsivo
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reportDate').textContent = new Date().toLocaleDateString();

  setupToolbar();
  setupMobileMenuBehavior();
  bindSectionClicks();
  buildTOC();
});

let activeSection = null;

function setupToolbar(){
  // Desktop buttons
  document.getElementById('addSection').addEventListener('click', addSection);
  document.getElementById('addHeading').addEventListener('click', () => addHeadingToActive());
  document.getElementById('addParagraph').addEventListener('click', () => addParagraphToActive());
  document.getElementById('addImage').addEventListener('click', () => document.getElementById('imageInput').click());
  document.getElementById('deleteSection').addEventListener('click', deleteActiveSection);

  document.getElementById('generatePdf').addEventListener('click', generatePDF);
  document.getElementById('previewPrint').addEventListener('click', () => {
    buildTOC();
    window.print();
  });

  // Mobile menu buttons (duplicados no DOM para mobile)
  document.getElementById('mobile-addSection').addEventListener('click', () => { addSection(); closeMobileMenu(); });
  document.getElementById('mobile-addHeading').addEventListener('click', () => { addHeadingToActive(); closeMobileMenu(); });
  document.getElementById('mobile-addParagraph').addEventListener('click', () => { addParagraphToActive(); closeMobileMenu(); });
  document.getElementById('mobile-addImage').addEventListener('click', () => { document.getElementById('imageInput').click(); closeMobileMenu(); });
  document.getElementById('mobile-deleteSection').addEventListener('click', () => { deleteActiveSection(); closeMobileMenu(); });

  document.getElementById('mobile-generatePdf').addEventListener('click', () => { generatePDF(); closeMobileMenu(); });
  document.getElementById('mobile-previewPrint').addEventListener('click', () => { buildTOC(); window.print(); closeMobileMenu(); });

  document.getElementById('imageInput').addEventListener('change', handleImageUpload);
}

// Mobile menu toggle + close on outside click + close on resize
function setupMobileMenuBehavior(){
  const toggle = document.getElementById('mobileToggle');
  const menu = document.getElementById('mobileMenu');
  const breakpoint = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--mobile-breakpoint')) || 700;

  toggle.addEventListener('click', (ev) => {
    ev.stopPropagation();
    const open = menu.classList.toggle('open');
    menu.setAttribute('aria-hidden', !open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  // fechar ao clicar fora
  document.addEventListener('click', (ev) => {
    if (!menu.classList.contains('open')) return;
    if (ev.target.closest('.toolbar') === null) closeMobileMenu();
  });

  // fechar ao redimensionar para desktop
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (window.innerWidth > breakpoint && menu.classList.contains('open')) {
        closeMobileMenu();
      }
    }, 150);
  });
}

function closeMobileMenu(){
  const toggle = document.getElementById('mobileToggle');
  const menu = document.getElementById('mobileMenu');
  menu.classList.remove('open');
  menu.setAttribute('aria-hidden', 'true');
  toggle.setAttribute('aria-expanded', 'false');
}

// marca seção como ativa quando clicada / focada
function bindSectionClicks(){
  const container = document.getElementById('conteudo');
  container.addEventListener('click', (ev) => {
    const sec = ev.target.closest('.section');
    if (sec) setActiveSection(sec);
  });

  container.addEventListener('focusin', (ev) => {
    const sec = ev.target.closest('.section');
    if (sec) setActiveSection(sec);
  });

  const first = document.querySelector('.section');
  if (first) setActiveSection(first);
}

function setActiveSection(sec){
  if (!sec) return;
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  sec.classList.add('active');
  activeSection = sec;
}

function addSection(){
  const conteudo = document.getElementById('conteudo');
  const idBase = 'sec-' + Date.now();
  const article = document.createElement('article');
  article.className = 'section';
  article.tabIndex = 0;

  const controls = document.createElement('div');
  controls.className = 'section-controls no-print';
  controls.innerHTML = '<span class="hint">Seção</span>';
  article.appendChild(controls);

  const h2 = document.createElement('h2');
  h2.contentEditable = 'true';
  h2.id = idBase + '-h2';
  h2.textContent = 'Novo título';
  article.appendChild(h2);

  const p = document.createElement('p');
  p.contentEditable = 'true';
  p.textContent = 'Novo parágrafo — clique para editar...';
  article.appendChild(p);

  conteudo.appendChild(article);

  setActiveSection(article);
  h2.focus();
  buildTOC();
}

function addHeadingToActive(){
  if (!activeSection) { addSection(); return; }
  const h2 = document.createElement('h2');
  h2.contentEditable = 'true';
  h2.textContent = 'Título adicionado';
  activeSection.appendChild(h2);
  h2.focus();
  buildTOC();
}

function addParagraphToActive(){
  if (!activeSection) { addSection(); return; }
  const p = document.createElement('p');
  p.contentEditable = 'true';
  p.textContent = 'Parágrafo adicionado — clique para editar...';
  activeSection.appendChild(p);
  p.focus();
  buildTOC();
}

function deleteActiveSection(){
  if (!activeSection) return alert('Nenhuma seção ativa selecionada.');
  if (!confirm('Remover esta seção? Esta ação não pode ser desfeita.')) return;
  const next = activeSection.nextElementSibling || activeSection.previousElementSibling;
  activeSection.remove();
  activeSection = null;
  if (next && next.classList.contains('section')) setActiveSection(next);
  buildTOC();
}

function handleImageUpload(ev){
  const files = ev.target.files;
  if (!files || files.length === 0) return;
  const file = files[0];
  const reader = new FileReader();
  reader.onload = function(e){
    const dataUrl = e.target.result;
    insertImageToActive(dataUrl, file.name);
  };
  reader.readAsDataURL(file);
  ev.target.value = '';
}

function insertImageToActive(src, alt){
  if (!activeSection) addSection();
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt || 'Imagem';
  img.style.maxWidth = '100%';
  img.style.height = 'auto';
  img.title = 'Clique para selecionar; Ctrl+Click para remover';
  img.addEventListener('click', (ev) => {
    if (ev.ctrlKey || ev.metaKey) {
      if (confirm('Remover esta imagem?')) img.remove();
    } else {
      img.style.outline = '3px solid rgba(11,107,79,0.25)';
      setTimeout(()=> img.style.outline = '', 1000);
    }
    buildTOC();
  });
  activeSection.appendChild(img);
  buildTOC();
}

function buildTOC(){
  const tocList = document.getElementById('tocList');
  tocList.innerHTML = '';
  const headings = document.querySelectorAll('#conteudo h2');
  headings.forEach((h, idx) => {
    if (!h.id) h.id = 'heading-' + idx + '-' + Date.now();
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      document.getElementById(h.id).scrollIntoView({behavior:'smooth'});
      setActiveSection(h.closest('.section'));
    });
    li.appendChild(a);
    tocList.appendChild(li);
  });
  if (headings.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Nenhuma seção encontrada.';
    tocList.appendChild(li);
  }
}

// Gera PDF usando html2pdf — esconde elementos .no-print durante a captura
function generatePDF(){
  buildTOC();

  // fechar mobile menu se estiver aberto
  closeMobileMenu();

  const element = document.getElementById('pdf-content');

  const noPrintNodes = Array.from(document.querySelectorAll('.no-print'));
  const previousDisplays = noPrintNodes.map(n => n.style.display);
  noPrintNodes.forEach(n => n.style.display = 'none');

  const opt = {
    margin: [10, 10, 10, 10],
    filename: 'relatorio-associacao-pantanal.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2.5,
      useCORS: true,
      logging: false
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save().then(() => {
    noPrintNodes.forEach((n, i) => n.style.display = previousDisplays[i] || '');
  }).catch((err) => {
    noPrintNodes.forEach((n, i) => n.style.display = previousDisplays[i] || '');
    console.error('Erro ao gerar PDF', err);
    alert('Ocorreu um erro ao gerar o PDF. Veja o console para detalhes.');
  });

  setTimeout(() => {
    noPrintNodes.forEach((n, i) => n.style.display = previousDisplays[i] || '');
  }, 10000);
}
