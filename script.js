// script.js — compressão do logo (resize + quality), drag & drop das seções (SortableJS) e ícones de ação na logo
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reportDate').textContent = new Date().toLocaleDateString();

  setupToolbar();
  setupMenuBehavior();
  bindSectionClicks();
  bindLogoControls();
  loadLogoFromStorage();
  initSortableSections();
  buildTOC();
});

let activeSection = null;

/* -------------------------
   Toolbar & menu bindings
   ------------------------- */
function setupToolbar(){
  document.getElementById('generatePdf').addEventListener('click', generatePDF);

  document.getElementById('previewPrint').addEventListener('click', () => { buildTOC(); window.print(); closeMenu(); });
  document.getElementById('addSection').addEventListener('click', () => { addSection(); closeMenu(); });
  document.getElementById('addHeading').addEventListener('click', () => { addHeadingToActive(); closeMenu(); });
  document.getElementById('addParagraph').addEventListener('click', () => { addParagraphToActive(); closeMenu(); });
  document.getElementById('addImage').addEventListener('click', () => { document.getElementById('imageInput').click(); closeMenu(); });
  document.getElementById('deleteSection').addEventListener('click', () => { deleteActiveSection(); closeMenu(); });

  // Logo controls in menu (restore only) — edit/remove are overlayed in the logo area
  document.getElementById('restoreLogo').addEventListener('click', () => { restoreDefaultLogo(); closeMenu(); });

  document.getElementById('imageInput').addEventListener('change', handleImageUpload);
  document.getElementById('logoInput').addEventListener('change', handleLogoUpload);
}

/* -------------------------
   Menu behavior
   ------------------------- */
function setupMenuBehavior(){
  const toggle = document.getElementById('mobileToggle');
  const menu = document.getElementById('mobileMenu');

  toggle.addEventListener('click', (ev) => {
    ev.stopPropagation();
    const open = menu.classList.toggle('open');
    menu.setAttribute('aria-hidden', !open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', (ev) => {
    if (!menu.classList.contains('open')) return;
    if (ev.target.closest('.toolbar') === null) closeMenu();
  });

  window.addEventListener('resize', () => { if (menu.classList.contains('open')) closeMenu(); });
}

function closeMenu(){
  const toggle = document.getElementById('mobileToggle');
  const menu = document.getElementById('mobileMenu');
  menu.classList.remove('open');
  menu.setAttribute('aria-hidden', 'true');
  toggle.setAttribute('aria-expanded', 'false');
}

/* -------------------------
   Sections logic (add/delete/reorder)
   ------------------------- */
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
  controls.innerHTML = '<span class="drag-handle" title="Arraste para reordenar">≡</span><span class="hint">Seção</span>';
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

/* -------------------------
   Image insertion (content)
   ------------------------- */
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

/* -------------------------
   Logo upload / compress / remove / restore
   ------------------------- */

function bindLogoControls(){
  // wire the overlay buttons on the logo
  const editBtn = document.getElementById('logoEditBtn');
  const removeBtn = document.getElementById('logoRemoveBtn');
  const logoInput = document.getElementById('logoInput');

  if (editBtn && logoInput) {
    editBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      logoInput.click();
    });
  }
  if (removeBtn) {
    removeBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      removeLogo();
    });
  }
}

// Resize + compress logo before saving
function handleLogoUpload(ev){
  const files = ev.target.files;
  if (!files || files.length === 0) return;
  const file = files[0];

  // Read file as data URL and resize using Image + canvas
  const urlReader = new FileReader();
  urlReader.onload = () => {
    const originalDataUrl = urlReader.result;
    const img = new Image();
    img.onload = () => {
      const MAX_WIDTH = 600;
      const MAX_HEIGHT = 200;
      const ratio = Math.min(1, MAX_WIDTH / img.width, MAX_HEIGHT / img.height);
      const targetWidth = Math.round(img.width * ratio);
      const targetHeight = Math.round(img.height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      if (outputType === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const quality = 0.85;
      const resizedDataUrl = canvas.toDataURL(outputType, outputType === 'image/jpeg' ? quality : undefined);

      setLogo(resizedDataUrl);
      try { localStorage.setItem('pantanal_logo', resizedDataUrl); } catch(e) { console.warn('Could not save logo to localStorage', e); }
    };
    img.onerror = () => {
      setLogo(originalDataUrl);
      try { localStorage.setItem('pantanal_logo', originalDataUrl); } catch(e) { console.warn('Could not save logo to localStorage', e); }
    };
    img.src = originalDataUrl;
  };
  urlReader.readAsDataURL(file);
  ev.target.value = '';
}

function setLogo(dataUrl){
  const logo = document.getElementById('siteLogo');
  if (!logo) return;
  logo.src = dataUrl;
  logo.style.display = '';
  logo.setAttribute('data-custom', 'true');
}

function removeLogo(){
  const logo = document.getElementById('siteLogo');
  if (!logo) return;
  logo.style.display = 'none';
  logo.removeAttribute('data-custom');
  try { localStorage.setItem('pantanal_logo', 'NONE'); } catch(e) { console.warn('Could not save logo state', e); }
}

function restoreDefaultLogo(){
  const logo = document.getElementById('siteLogo');
  if (!logo) return;
  const defaultSrc = 'https://via.placeholder.com/220x80?text=Logo';
  logo.src = defaultSrc;
  logo.style.display = '';
  logo.removeAttribute('data-custom');
  try { localStorage.setItem('pantanal_logo', defaultSrc); } catch(e) { console.warn('Could not save logo state', e); }
}

function loadLogoFromStorage(){
  const logo = document.getElementById('siteLogo');
  if (!logo) return;
  try {
    const stored = localStorage.getItem('pantanal_logo');
    if (!stored) return;
    if (stored === 'NONE') {
      logo.style.display = 'none';
    } else {
      logo.src = stored;
      logo.style.display = '';
    }
  } catch(e) {
    console.warn('Could not read logo from localStorage', e);
  }
}



/* -------------------------
   Drag & drop (SortableJS)
   ------------------------- */
function initSortableSections(){
  const container = document.getElementById('conteudo');
  if (!container || typeof Sortable === 'undefined') return;

  window.sortableSections = new Sortable(container, {
    handle: '.drag-handle',
    animation: 150,
    draggable: '.section',
    onEnd: function () {
      buildTOC();
    }
  });
}

/* -------------------------
   PDF generation
   ------------------------- */
function generatePDF(){
  buildTOC();
  closeMenu();

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
