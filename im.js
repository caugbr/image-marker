
// Estado
let currentTool = 'pointer';
let imageLoaded = false;
let markups = [];
let selectedMarkupId = null;
let isDrawing = false;
let drawStart = null;
let currentColor = '#0ea5e9';
let zoomScale = 1;
let imgNaturalWidth = 0;
let imgNaturalHeight = 0;
let currentFileName = "";
let currentExportTab = 'html';

const colors = ['#0ea5e9', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

// Elementos
const imageInput = document.getElementById('imageInput');
const canvasWrapper = document.getElementById('canvasWrapper');
const canvasImage = document.getElementById('canvasImage');
const annotationsLayer = document.getElementById('annotationsLayer');
const selectionRect = document.getElementById('selectionRect');
const markupList = document.getElementById('markupList');
const emptyCanvas = document.getElementById('emptyCanvas');
const zoomControls = document.getElementById('zoomControls');
const btnClear = document.getElementById('btnClear');
const btnExport = document.getElementById('btnExport');
const folderPath = document.getElementById('folderPath');

document.addEventListener('DOMContentLoaded', () => {
    let folder;
    if (folder = window.localStorage.getItem('folderPath')) {
        folderPath.value = folder;
    }
    setTimeout(() => {
        if (folderPath.value == '') {
            folderPath.focus();
        }
    }, 100);
});

folderPath.addEventListener('blur', () => {
    window.localStorage.setItem('folderPath', folderPath.value.trim());
});

// Tool switching
document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTool = btn.dataset.tool;
        canvasWrapper.classList.toggle('selecting', currentTool !== 'pointer');
    });
});

// Carregar imagem
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    currentFileName = file.name;

    const reader = new FileReader();
    reader.onload = (event) => {
        canvasImage.src = event.target.result;
        canvasImage.onload = () => {
            imgNaturalWidth = canvasImage.naturalWidth;
            imgNaturalHeight = canvasImage.naturalHeight;
            imageLoaded = true;
            emptyCanvas.style.display = 'none';
            canvasWrapper.style.display = 'block';
            zoomControls.style.display = 'flex';
            btnClear.disabled = false;
            btnExport.disabled = false;
            resetZoom();
            renderAnnotations();
        };
    };
    reader.readAsDataURL(file);
});

function zoom(delta) {
    zoomScale = Math.max(0.3, Math.min(3, zoomScale + delta));
    applyZoom();
}
function resetZoom() {
    zoomScale = 1;
    applyZoom();
}
function applyZoom() {
    canvasImage.style.transform = `scale(${zoomScale})`;
    canvasImage.style.transformOrigin = 'top left';
    document.getElementById('zoomLevel').textContent = Math.round(zoomScale * 100) + '%';
    annotationsLayer.style.width = '100%';
    annotationsLayer.style.height = '100%';
    annotationsLayer.style.position = 'absolute';
    annotationsLayer.style.top = '0';
    annotationsLayer.style.left = '0';
}

canvasWrapper.addEventListener('mousedown', (e) => {
    if (currentTool === 'pointer' || !imageLoaded) return;

    const rect = canvasWrapper.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomScale;
    const y = (e.clientY - rect.top) / zoomScale;

    if (currentTool === 'point') {
        addMarkup('point', x, y);
    } else if (currentTool === 'area') {
        isDrawing = true;
        drawStart = { x, y };
        selectionRect.style.display = 'block';
        selectionRect.style.left = x + 'px';
        selectionRect.style.top = y + 'px';
        selectionRect.style.width = '0px';
        selectionRect.style.height = '0px';
    }
});

canvasWrapper.addEventListener('mousemove', (e) => {
    if (!isDrawing || currentTool !== 'area') return;

    const rect = canvasWrapper.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomScale;
    const y = (e.clientY - rect.top) / zoomScale;

    const left = Math.min(drawStart.x, x);
    const top = Math.min(drawStart.y, y);
    const width = Math.abs(x - drawStart.x);
    const height = Math.abs(y - drawStart.y);

    selectionRect.style.left = left + 'px';
    selectionRect.style.top = top + 'px';
    selectionRect.style.width = width + 'px';
    selectionRect.style.height = height + 'px';
});

canvasWrapper.addEventListener('mouseup', (e) => {
    if (!isDrawing || currentTool !== 'area') return;

    const rect = canvasWrapper.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomScale;
    const y = (e.clientY - rect.top) / zoomScale;

    const left = Math.min(drawStart.x, x);
    const top = Math.min(drawStart.y, y);
    const width = Math.abs(x - drawStart.x);
    const height = Math.abs(y - drawStart.y);

    if (width > 10 && height > 10) {
        addMarkup('area', left, top, width, height);
    }

    isDrawing = false;
    selectionRect.style.display = 'none';
});

function addMarkup(type, x, y, width, height) {
    const id = Date.now().toString();
    
    const rect = canvasWrapper.getBoundingClientRect();
    const currentWidth = rect.width / zoomScale;
    const currentHeight = rect.height / zoomScale;

    const markup = {
        id,
        type,
        x: (x / currentWidth) * 100,
        y: (y / currentHeight) * 100,
        width: width ? (width / currentWidth) * 100 : 0,
        height: height ? (height / currentHeight) * 100 : 0,
        // title: type === 'point' ? `Ponto ${markups.filter(m => m.type === 'point').length + 1}` : `Área ${markups.filter(m => m.type === 'area').length + 1}`,
        title: 'Clique aqui',
        color: currentColor
    };
    markups.push(markup);
    selectedMarkupId = id;
    renderAnnotations();
    renderMarkupList();
}

function renderAnnotations() {
    annotationsLayer.innerHTML = '';
    markups.forEach(m => {
        const el = document.createElement('div');
        el.className = 'annotation';
        el.style.color = m.color;

        if (m.type === 'point') {
            const point = document.createElement('div');
            point.className = 'annotation-point';
            point.style.left = m.x + '%';
            point.style.top = m.y + '%';
            el.appendChild(point);

            const label = document.createElement('div');
            label.className = 'annotation-label';
            label.textContent = m.title;
            label.style.left = m.x + '%';
            label.style.top = m.y + '%';
            label.onclick = (e) => { e.stopPropagation(); selectMarkup(m.id); };
            el.appendChild(label);
        } else {
            const area = document.createElement('div');
            area.className = 'annotation-area';
            area.style.left = m.x + '%';
            area.style.top = m.y + '%';
            area.style.width = m.width + '%';
            area.style.height = m.height + '%';
            el.appendChild(area);

            const label = document.createElement('div');
            label.className = 'annotation-label';
            label.textContent = m.title;
            label.style.left = (m.x + m.width / 2) + '%';
            label.style.top = m.y + '%';
            label.onclick = (e) => { e.stopPropagation(); selectMarkup(m.id); };
            el.appendChild(label);
        }

        annotationsLayer.appendChild(el);
    });
}

function renderMarkupList() {
    if (markups.length === 0) {
        markupList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                </svg>
                <p>Nenhuma marcação ainda</p>
            </div>`;
        document.getElementById('countBadge').textContent = '0';
        return;
    }

    markupList.innerHTML = '';
    markups.forEach((m, index) => {
        const item = document.createElement('div');
        item.className = 'markup-item' + (m.id === selectedMarkupId ? ' selected' : '');
        item.innerHTML = `
            <div class="markup-item-header">
                <div class="markup-color" style="background: ${m.color}"></div>
                <span style="font-size: 0.75rem; color: #64748b;">#${index + 1}</span>
            </div>
            <input type="text" value="${m.title}" oninput="updateMarkup('${m.id}', 'title', this.value)" placeholder="Título">
            <div class="color-picker">
                ${colors.map(c => `<div class="color-option ${m.color === c ? 'active' : ''}" style="background: ${c}" onclick="updateMarkup('${m.id}', 'color', '${c}')"></div>`).join('')}
            </div>
            <div class="markup-actions">
                <!--button class="btn-edit" onclick="selectMarkup('${m.id}')">👁️ Ver</button>
                <button class="btn-duplicate" onclick="duplicateMarkup('${m.id}')">📋 Duplicar</button-->
                <button class="btn-delete" onclick="deleteMarkup('${m.id}')">🗑️</button>
            </div>
        `;
        markupList.appendChild(item);
        setTimeout(() => {
            if (m.id === selectedMarkupId) {
                const title = document.querySelector(`input[value="${m.title}"]`);
                title.focus();
                title.select();
            }
        }, 100);
    });
    document.getElementById('countBadge').textContent = markups.length;
}

function selectMarkup(id) {
    selectedMarkupId = id;
    renderAnnotations();
    renderMarkupList();
}

function updateMarkup(id, field, value) {
    const m = markups.find(x => x.id === id);
    if (m) {
        m[field] = value;
        renderAnnotations(); 
        // renderMarkupList();
    }
}

function deleteMarkup(id) {
    markups = markups.filter(m => m.id !== id);
    if (selectedMarkupId === id) selectedMarkupId = null;
    renderAnnotations();
    renderMarkupList();
}

function duplicateMarkup(id) {
    const m = markups.find(x => x.id === id);
    if (m) {
        const newM = { ...m, id: Date.now().toString(), x: m.x + 2, y: m.y + 2 };
        markups.push(newM);
        selectedMarkupId = newM.id;
        renderAnnotations();
        renderMarkupList();
    }
}

function clearAll() {
    if (!confirm('Tem certeza que deseja remover todas as marcações?')) return;
    markups = [];
    selectedMarkupId = null;
    renderAnnotations();
    renderMarkupList();
}

// Gerar HTML com CLASSES (sem inline styles)
function generateHTMLWithClasses() {
    let folder = folderPath.value.trim();
    if (folder && !folder.endsWith('/')) folder += '/';
    const finalSrc = folder + currentFileName;

    const annotationsHTML = markups.map(m => {
        if (m.type === 'point') {
            return `
    <div class="marker-point" style="left: ${m.x.toFixed(2)}%; top: ${m.y.toFixed(2)}%; --marker-color: ${m.color};">
        <div class="marker-point-dot"></div>
        <div class="marker-label">${escapeHtml(m.title)}</div>
    </div>`;
        } else {
            return `
    <div class="marker-area" style="left: ${m.x.toFixed(2)}%; top: ${m.y.toFixed(2)}%; width: ${m.width.toFixed(2)}%; height: ${m.height.toFixed(2)}%; --marker-color: ${m.color};">
        <div class="marker-area-overlay"></div>
        <div class="marker-label">${escapeHtml(m.title)}</div>
    </div>`;
        }
    }).join('\n');

    return `<!-- Image Marker - Gerado pelo Image Maker -->
<div class="image-marker-container">
    <img src="${finalSrc}" alt="${escapeHtml(currentFileName)}" class="image-marker-img">
    ${annotationsHTML}
</div>`;
}

// Gerar CSS separado
function generateCSS() {
    return `/* CSS para as marcações - Gerado pelo Image Maker */
.image-marker-container {
    position: relative;
    display: inline-block;
    max-width: 100%;
    line-height: 0;
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
}

.image-marker-img {
    max-width: 100%;
    height: auto;
    display: block;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

/* Marcador de ponto */
.marker-point {
    position: absolute;
    z-index: 10;
    transform: translate(-50%, -50%);
}

.marker-point-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 0 2px var(--marker-color, #0ea5e9), 0 4px 12px rgba(0, 0, 0, 0.4);
    background: var(--marker-color, #0ea5e9);
    animation: marker-pulse 2s infinite;
}

/* Marcador de área */
.marker-area {
    position: absolute;
    z-index: 10;
}

.marker-area-overlay {
    width: 100%;
    height: 100%;
    border: 3px solid white;
    box-shadow: 0 0 0 2px var(--marker-color, #0ea5e9), 0 4px 12px rgba(0, 0, 0, 0.4);
    background: var(--marker-color, #0ea5e9);
    opacity: 0.3;
    border-radius: 30px;
}

/* Label comum para ambos */
.marker-label {
    position: absolute;
    left: 50%;
    bottom: 100%;
    transform: translateX(-50%);
    margin-bottom: 8px;
    color: var(--marker-color);
    background: white;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
    text-align: center;
    border: 1px solid var(--marker-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    line-height: 1.2;
    pointer-events: none;
}

.marker-label::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: var(--marker-color);
}

/* Ajuste para área: label acima */
.marker-area .marker-label {
    bottom: 100%;
    top: auto;
    transform: translateX(-50%);
    margin-bottom: 8px;
}

/* Ajuste para ponto: label acima do ponto */
.marker-point .marker-label {
    bottom: 100%;
    top: auto;
    transform: translateX(-50%);
    margin-bottom: 8px;
}

/* Animação de pulso para pontos */
@keyframes marker-pulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.2);
    }
}

/* Responsivo: texto menor em telas pequenas */
@media (max-width: 640px) {
    .marker-label {
        font-size: 0.65rem;
        padding: 2px 6px;
        white-space: normal;
        max-width: 120px;
        text-align: center;
    }

    .marker-point-dot {
        width: 18px;
        height: 18px;
    }
}`;
}

// Gerar versão combinada (HTML + CSS inline para fallback)
function generateCombined() {
    const html = generateHTMLWithClasses();
    const css = generateCSS();
    return `<style>\n${css}\n</style>\n${html}`;
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
        return c;
    });
}

function switchExportTab(tab) {
    currentExportTab = tab;
    document.querySelectorAll('.export-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    let output = '';
    if (tab === 'html') {
        output = generateHTMLWithClasses();
    } else if (tab === 'css') {
        output = generateCSS();
    } else {
        output = generateCombined();
    }
    document.getElementById('codeOutput').textContent = output;
}

function generateCode() {
    if (!imageLoaded || markups.length === 0) {
        alert('Carregue uma imagem e adicione pelo menos uma marcação.');
        return;
    }
    
    switchExportTab('html');
    document.getElementById('exportModal').classList.add('active');
}

function closeModal() {
    document.getElementById('exportModal').classList.remove('active');
}

function copyCode() {
    const code = document.getElementById('codeOutput').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const msg = document.createElement('span');
        msg.textContent = 'Código copiado!';
        document.querySelector('.modal-footer').prepend(msg);
        setTimeout(() => msg.remove(), 2000);
    });
}

function downloadCurrent() {
    const code = document.getElementById('codeOutput').textContent;
    let filename = '';
    let mimeType = 'text/plain';
    
    if (currentExportTab === 'html') {
        filename = 'manual-markup.html';
        mimeType = 'text/html';
    } else if (currentExportTab === 'css') {
        filename = 'marker-styles.css';
        mimeType = 'text/css';
    } else {
        filename = 'manual-completo.html';
        mimeType = 'text/html';
    }
    
    const blob = new Blob([code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});