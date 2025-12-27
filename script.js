// script.js — edições, geração de PDF, menu hamburguer (sempre) e logo upload/remove/restore
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reportDate').textContent = new Date().toLocaleDateString();

  setupToolbar();
  setupMenuBehavior();
  bindSectionClicks();
  bindLogoControls();
  loadLogoFromStorage();
  buildTOC();
});

let activeSection = null;

function setupToolbar(){
  // Only Generate PDF button is in the visible toolbar
  document.getElementById('generatePdf').addEventListener('click', generatePDF);

  // Menu actions (all controls live inside the menu now)
  document.getElementById('previewPrint').addEventListener('click', () => { buildTOC(); window.print(); closeMenu(); });
  document.getElementById('addSection').addEventListener('click', () => { addSection(); closeMenu(); });
  document.getElementById('addHeading').addEventListener('click', () => { addHeadingToActive(); closeMenu(); });
  document.getElementById('addParagraph').addEventListener('click', () => { addParagraphToActive(); closeMenu(); });
  document.getElementById('addImage').addEventListener('click', () => { document.getElementById('imageInput').click(); closeMenu(); });
  document.getElementById('deleteSection').addEventListener('click', () => { deleteActiveSection(); closeMenu(); });

  // Logo controls
  document.getElementById('changeLogo').addEventListener('click', () => { document.getElementById('logoInput').click(); closeMenu(); });
  document.getElementById('removeLogo').addEventListener('click', () => { removeLogo(); closeMenu(); });
  document.getElementById('restoreLogo').addEventListener('click', () => { restoreDefaultLogo(); closeMenu(); });

  document.getElementById('imageInput').addEventListener('change', handleImageUpload);
  document.getElementById('logoInput').addEventListener('change', handleLogoUpload);



}

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

  window.addEventListener('resize', () => { if (document.getElementById('mobileMenu').classList.contains('open')) closeMenu(); });
