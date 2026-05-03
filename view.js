let treeData = null;
let scale = 1;
let translateX = 0;
let translateY = 0;

function init() {
    const savedData = localStorage.getItem('giaPhaData');
    if (savedData) {
        try {
            treeData = JSON.parse(savedData);
        } catch(e) {
            console.error("No valid data found in localStorage. Please open index.html and create data first.");
            return;
        }
    } else {
        console.error("No data found in localStorage. Please open index.html and create data first.");
        return;
    }
    
    renderTree();
    initPanZoom();
    
    setTimeout(() => {
        drawLines();
    }, 100);
}

// Rendering Logic
function renderTree() {
    const container = document.getElementById('treeNodesContainer');
    container.innerHTML = '';
    const rootUl = document.createElement('ul');
    rootUl.appendChild(createNodeElement(treeData));
    container.appendChild(rootUl);
    
    setTimeout(() => drawLines(), 50);
}

function createNodeElement(node) {
    const li = document.createElement('li');
    
    const card = document.createElement('div');
    card.className = 'node-card';
    card.id = node.id;
    
    // Apply saved positions and sizes (Read-only)
    // Fix: Use left/top instead of transform to prevent html2canvas bugs
    if (node.dx !== undefined || node.dy !== undefined) {
        card.style.left = (node.dx || 0) + 'px';
        card.style.top = (node.dy || 0) + 'px';
    }
    if (node.width) {
        card.style.width = node.width + 'px';
    }
    if (node.height) {
        card.style.height = node.height + 'px';
    }

    let html = `<div class="node-generation">Đời ${node.generation}</div>`;
    html += `<div class="node-name">${node.name}</div>`;
    if (node.title) {
        html += `<div class="node-title">Hiệu: ${node.title}</div>`;
    }
    if (node.spouseName) {
        html += `<div class="node-spouse">
                    <div class="node-name">${node.spouseName}</div>`;
        if (node.spouseTitle) {
            html += `<div class="node-title">Hiệu: ${node.spouseTitle}</div>`;
        }
        html += `</div>`;
    }
    
    card.innerHTML = html;
    li.appendChild(card);
    
    if (node.children && node.children.length > 0) {
        const ul = document.createElement('ul');
        node.children.forEach(child => {
            ul.appendChild(createNodeElement(child));
        });
        li.appendChild(ul);
    }
    return li;
}

// SVG Line Drawing Logic
function drawLines() {
    const svg = document.getElementById('svgCanvas');
    if (!svg) return;
    svg.innerHTML = '';
    
    const tree = document.getElementById('treeContainer');
    const treeRect = tree.getBoundingClientRect();

    function traverseAndDraw(node) {
        if (!node.children || node.children.length === 0) return;
        
        const parentCard = document.getElementById(node.id);
        if (!parentCard) return;
        const pRect = parentCard.getBoundingClientRect();
        
        const px = (pRect.left - treeRect.left) / scale + pRect.width / scale / 2;
        const py = (pRect.bottom - treeRect.top) / scale;

        node.children.forEach(child => {
            const childCard = document.getElementById(child.id);
            if (childCard) {
                const cRect = childCard.getBoundingClientRect();
                const cx = (cRect.left - treeRect.left) / scale + cRect.width / scale / 2;
                const cy = (cRect.top - treeRect.top) / scale;
                
                const midY = py + (cy - py) / 2;
                
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute('d', `M ${px} ${py} L ${px} ${midY} L ${cx} ${midY} L ${cx} ${cy}`);
                path.setAttribute('stroke', 'rgba(212, 175, 55, 0.6)'); // Gold stroke
                path.setAttribute('stroke-width', '2');
                path.setAttribute('fill', 'none');
                
                svg.appendChild(path);
            }
            traverseAndDraw(child);
        });
    }
    
    if (treeData) {
        traverseAndDraw(treeData);
    }
}

// Pan & Zoom Logic
let isPanning = false;
let startPanX, startPanY;

function initPanZoom() {
    const wrapper = document.getElementById('treeWrapper');

    wrapper.addEventListener('mousedown', (e) => {
        isPanning = true;
        startPanX = e.clientX - translateX;
        startPanY = e.clientY - translateY;
        wrapper.style.cursor = 'grabbing';
    });

    wrapper.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        e.preventDefault();
        translateX = e.clientX - startPanX;
        translateY = e.clientY - startPanY;
        updateTransform();
    });

    wrapper.addEventListener('mouseup', () => {
        isPanning = false;
        wrapper.style.cursor = 'grab';
    });

    wrapper.addEventListener('mouseleave', () => {
        isPanning = false;
        wrapper.style.cursor = 'grab';
    });

    wrapper.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const zoomSensitivity = 0.001;
        const delta = e.deltaY * zoomSensitivity;
        
        let newScale = scale - delta;
        newScale = Math.max(0.1, Math.min(newScale, 3));
        
        scale = newScale;
        updateTransform();
    }, { passive: false });
    
    // Initial center if needed, but keeping default (0,0) is fine for now
}

function updateTransform() {
    const tree = document.getElementById('treeContainer');
    tree.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

// Handle window resize to redraw lines properly
window.addEventListener('resize', () => {
    drawLines();
});

// Settings Logic
function updateFontSize(val) {
    document.documentElement.style.setProperty('--node-font-size', val + 'rem');
    setTimeout(() => drawLines(), 300);
}

function updateTitleFont(val) {
    document.documentElement.style.setProperty('--title-font-size', val + 'rem');
    setTimeout(() => drawLines(), 300);
}

function updateHP(type, val) {
    if (type === 'width') {
        document.documentElement.style.setProperty('--hp-width', val + 'px');
    } else if (type === 'height') {
        document.documentElement.style.setProperty('--hp-height', val + 'px');
    } else if (type === 'font') {
        document.documentElement.style.setProperty('--hp-font', val + 'px');
    }
}

// PDF Export Logic
function exportPDF() {
    const format = document.getElementById('pdfFormat').value;
    const element = document.getElementById('treeContainer');
    const svg = document.getElementById('svgCanvas');
    
    // 1. Freeze width to prevent flexbox shifting when html2canvas captures
    const currentWidth = element.offsetWidth;
    element.style.width = currentWidth + 'px';
    element.style.minWidth = currentWidth + 'px';

    window.scrollTo(0, 0);
    document.body.classList.add('pdf-exporting');
    
    // 2. Remove pan/zoom
    const oldTransform = element.style.transform;
    element.style.transform = 'none';
    // Removed explicit background so CSS background can apply

    // 3. Size SVG explicitly
    svg.style.width = currentWidth + 'px';
    svg.style.height = element.scrollHeight + 'px';

    const oldScale = scale;
    scale = 1;

    // 4. Wait for browser to reflow layout before drawing lines and capturing
    setTimeout(() => {
        drawLines();

        html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: null, // Allow CSS background
            logging: false
        }).then(canvas => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('landscape', 'mm', format);
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            
            const padding = 5; // 5mm margin
            const availableWidth = pdfWidth - padding * 2;
            const availableHeight = pdfHeight - padding * 2;
            
            const fitRatio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
            
            const finalWidth = imgWidth * fitRatio;
            const finalHeight = imgHeight * fitRatio;
            
            const x = (pdfWidth - finalWidth) / 2;
            const y = (pdfHeight - finalHeight) / 2;
            
            pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
            pdf.save(`GiaPha_TrungBay_${format.toUpperCase()}.pdf`);

            // Restore everything
            scale = oldScale;
            element.style.transform = oldTransform;
            element.style.width = '';
            element.style.minWidth = 'min-content';
            element.style.background = 'transparent';
            svg.style.width = '100%';
            svg.style.height = '100%';
            document.body.classList.remove('pdf-exporting');
            drawLines();
        });
    }, 300);
}

// Start
init();
