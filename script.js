// (adicionados trechos relacionados à capa; mantenha o restante do arquivo existente)

// dentro DOMContentLoaded we already call bindLogoControls(); add bindCoverControls() there as well
// -> ensure: bindCoverControls() is called on load (I included it in the earlier file)

// Bind overlay buttons for cover
function bindCoverControls(){
  const coverEditBtn = document.getElementById('coverEditBtn');
  const coverRemoveBtn = document.getElementById('coverRemoveBtn');
  const coverInput = document.getElementById('coverInput');

  if (coverEditBtn && coverInput) {
    coverEditBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      coverInput.click();
    });
  }
  if (coverRemoveBtn) {
    coverRemoveBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      removeCover();
    });
  }

  // menu restore already wired to restoreCover button
  const restoreCoverBtn = document.getElementById('restoreCover');
  if (restoreCoverBtn) {
    restoreCoverBtn.addEventListener('click', () => {
      restoreDefaultCover();
      closeMenu();
    });
  }

  // coverInput change handler
  const cin = document.getElementById('coverInput');
  if (cin) cin.addEventListener('change', handleCoverUpload);
}

// Resize + compress cover before saving (bigger limits than logo)
function handleCoverUpload(ev){
  const files = ev.target.files;
  if (!files || files.length === 0) return;
  const file = files[0];

  const urlReader = new FileReader();
  urlReader.onload = () => {
    const originalDataUrl = urlReader.result;
    const img = new Image();
    img.onload = () => {
      const MAX_WIDTH = 1400;
      const MAX_HEIGHT = 1000;
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

      const quality = 0.9;
      const resizedDataUrl = canvas.toDataURL(outputType, outputType === 'image/jpeg' ? quality : undefined);

      setCover(resizedDataUrl);
      try { localStorage.setItem('pantanal_cover', resizedDataUrl); } catch(e) { console.warn('Could not save cover to localStorage', e); }
    };
    img.onerror = () => {
      setCover(originalDataUrl);
      try { localStorage.setItem('pantanal_cover', originalDataUrl); } catch(e) { console.warn('Could not save cover to localStorage', e); }
    };
    img.src = originalDataUrl;
  };
  urlReader.readAsDataURL(file);
  ev.target.value = '';
}

function setCover(dataUrl){
  const cover = document.getElementById('siteCover');
  if (!cover) return;
  cover.src = dataUrl;
  cover.style.display = '';
}

function removeCover(){
  const cover = document.getElementById('siteCover');
  if (!cover) return;
  cover.style.display = 'none';
  try { localStorage.setItem('pantanal_cover', 'NONE'); } catch(e) { console.warn('Could not save cover state', e); }
}

function restoreDefaultCover(){
  const cover = document.getElementById('siteCover');
  if (!cover) return;
  const defaultSrc = 'https://picsum.photos/1200/1600?grayscale&blur=1';
  cover.src = defaultSrc;
  cover.style.display = '';
  try { localStorage.setItem('pantanal_cover', defaultSrc); } catch(e) { console.warn('Could not save cover state', e); }
}

function loadCoverFromStorage(){
  const cover = document.getElementById('siteCover');
  if (!cover) return;
  try {
    const stored = localStorage.getItem('pantanal_cover');
    if (!stored) return;
    if (stored === 'NONE') {
      cover.style.display = 'none';
    } else {
      cover.src = stored;
      cover.style.display = '';
    }
  } catch(e) {
    console.warn('Could not read cover from localStorage', e);
  }
}
