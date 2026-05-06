// ============================
// DATA
// ============================
const initialData = {
    id: "root",
    generation: 1,
    name: "Nguyễn Đình Quế",
    title: "Phúc Lan",
    spouseName: "Phùng Thị Dùng",
    spouseTitle: "Phúc Dụng",
    children: [
        { id: "gen2-1", generation: 2, name: "Nguyễn Thị Ngọc" },
        {
            id: "gen2-2", generation: 2, name: "Nguyễn Văn Nga", title: "Đức Nha", spouseName: "Tạ Thị Đầm", spouseTitle: "Diệu Tâm", children: [
                { id: "gen3-1", generation: 3, name: "Nguyễn Thị Vê" },
                { id: "gen3-2", generation: 3, name: "Nguyễn Thị Va" },
                { id: "gen3-3", generation: 3, name: "Nguyễn Văn Ngư", title: "Trực Bình" },
                {
                    id: "gen3-4", generation: 3, name: "Nguyễn Văn Nhạn", title: "Phúc Toan", spouseName: "Nguyễn Thị Hợi", spouseTitle: "Diệu Đa", children: [
                        { id: "gen4-1", generation: 4, name: "Nguyễn Thị Nhẫn", title: "Từ Dẫn" },
                        { id: "gen4-2", generation: 4, name: "Nguyễn Thị Nhàn" },
                        {
                            id: "gen4-3", generation: 4, name: "Nguyễn Văn Nhãn", spouseName: "Phùng Thị Biên", spouseTitle: "Diệu Ban", children: [
                                { id: "gen5-1", generation: 5, name: "Nguyễn Thị Hiền" },
                                { id: "gen5-2", generation: 5, name: "Nguyễn Thị Duyên" },
                                { id: "gen5-3", generation: 5, name: "Nguyễn Thị Hồng" },
                                { id: "gen5-4", generation: 5, name: "Nguyễn Thị Thái" },
                                { id: "gen5-5", generation: 5, name: "Nguyễn Văn Quý" },
                                {
                                    id: "gen5-6", generation: 5, name: "Nguyễn Việt Trì", spouseName: "Phùng Thị Nở", children: [
                                        {
                                            id: "gen6-1", generation: 6, name: "Nguyễn Việt Hà", spouseName: "Đặng Thị Tư", children: [
                                                { id: "gen7-1", generation: 7, name: "Nguyễn Đặng Chí Bảo" },
                                                { id: "gen7-2", generation: 7, name: "Nguyễn Đặng Hải Như" }
                                            ]
                                        },
                                        { id: "gen6-2", generation: 6, name: "Nguyễn Thị Thanh" },
                                        {
                                            id: "gen6-3", generation: 6, name: "Nguyễn Việt Tân", spouseName: "Nguyễn Thị Thanh Huế", children: [
                                                { id: "gen7-3", generation: 7, name: "Nguyễn Quỳnh Anh" },
                                                { id: "gen7-4", generation: 7, name: "Nguyễn Anh Khoa" }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    id: "gen5-7", generation: 5, name: "Nguyễn Văn Dật", spouseName: "Nguyễn Thị Thức", children: [
                                        { id: "gen6-4", generation: 6, name: "Nguyễn Viết Nam" },
                                        { id: "gen6-5", generation: 6, name: "Nguyễn Quốc Việt" }
                                    ]
                                },
                                { id: "gen5-8", generation: 5, name: "Nguyễn Thị Đức" }
                            ]
                        },
                        { id: "gen4-4", generation: 4, name: "Nguyễn Văn Kiến" }
                    ]
                },
                { id: "gen3-5", generation: 3, name: "Nguyễn Văn Ngơi" }
            ]
        },
        { id: "gen2-3", generation: 2, name: "Nguyễn Văn Nghiễm", title: "Trực Liễm" },
        { id: "gen2-4", generation: 2, name: "Nguyễn Văn Lục", title: "Trực Chất" },
        { id: "gen2-5", generation: 2, name: "Nguyễn Văn Lực", title: "Trực Cường" },
    ]
};

// ============================
// STATE
// ============================
let treeData = null;
let scale = 1;
let translateX = 0;
let translateY = 0;
let isEditMode = false;
let currentAction = 'edit';
let currentNodeId = null;
let strokeWidth = 3;
let strokeOpacity = 0.85;

// ============================
// INIT
// ============================
function init() {
    const savedData = localStorage.getItem('giaPhaData');
    if (savedData) {
        try {
            treeData = JSON.parse(savedData);
        } catch(e) {
            treeData = initialData;
            saveData();
        }
    } else {
        treeData = initialData;
        saveData();
    }

    renderTree();
    initPanZoom();
    initNodeDrag();

    setTimeout(() => {
        drawLines();
    }, 100);

    // Setup modal form submit
    const nodeForm = document.getElementById('nodeForm');
    if (nodeForm) {
        nodeForm.onsubmit = handleFormSubmit;
    }

    // Close modal on outside click
    const modal = document.getElementById('nodeModal');
    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
}

function saveData() {
    localStorage.setItem('giaPhaData', JSON.stringify(treeData));
}

function findNodeAndParent(data, id, parent = null) {
    if (data.id === id) return { node: data, parent: parent };
    if (data.children) {
        for (let child of data.children) {
            const result = findNodeAndParent(child, id, data);
            if (result) return result;
        }
    }
    return null;
}

// ============================
// STYLE OBSERVER (resize)
// ============================
const styleObserver = new MutationObserver(mutations => {
    let changed = false;
    mutations.forEach(mutation => {
        if (mutation.attributeName === 'style') {
            const card = mutation.target;
            const result = findNodeAndParent(treeData, card.id);
            if (result && result.node) {
                if (card.style.width) { result.node.customWidth = card.style.width; changed = true; }
                if (card.style.height) { result.node.customHeight = card.style.height; changed = true; }
            }
        }
    });
    if (changed) { saveData(); drawLines(); }
});

// ============================
// EDIT MODE TOGGLE
// ============================
function toggleEditMode() {
    isEditMode = !isEditMode;
    document.body.classList.toggle('edit-mode-active', isEditMode);

    const btn = document.getElementById('editToggleBtn');
    const txt = document.getElementById('editToggleText');
    if (isEditMode) {
        btn.style.background = 'rgba(212, 175, 55, 0.9)';
        btn.style.color = '#111';
        txt.textContent = 'Xem thường';
    } else {
        btn.style.background = '';
        btn.style.color = '';
        txt.textContent = 'Chỉnh sửa';
    }

    renderTree();
}

// ============================
// RENDER
// ============================
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

    if (node.dx !== undefined || node.dy !== undefined) {
        card.style.left = (node.dx || 0) + 'px';
        card.style.top = (node.dy || 0) + 'px';
    }
    if (node.customWidth) card.style.width = node.customWidth;
    if (node.customHeight) card.style.height = node.customHeight;

    let html = `<div class="node-generation">Đời ${node.generation}</div>`;
    html += `<div class="node-name">${node.name}</div>`;
    if (node.title) html += `<div class="node-title">Hiệu: ${node.title}</div>`;
    if (node.spouseName) {
        html += `<div class="node-spouse"><div class="node-name">${node.spouseName}</div>`;
        if (node.spouseTitle) html += `<div class="node-title">Hiệu: ${node.spouseTitle}</div>`;
        html += `</div>`;
    }

    // Edit mode: show action buttons
    if (isEditMode) {
        html += `
            <div class="action-group view-action-group">
                <button class="action-btn edit-btn" onclick="event.stopPropagation(); openEditModal('${node.id}')" title="Sửa"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" onclick="event.stopPropagation(); confirmDeleteNode('${node.id}')" title="Xóa" style="display: ${node.id === 'root' ? 'none' : 'flex'}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        html += `<button class="add-btn view-add-btn" onclick="event.stopPropagation(); openAddModal('${node.id}', ${node.generation + 1})" title="Thêm con"><i class="fas fa-plus"></i></button>`;
    }

    card.innerHTML = html;
    li.appendChild(card);

    styleObserver.observe(card, { attributes: true, attributeFilter: ['style'] });

    if (node.children && node.children.length > 0) {
        const ul = document.createElement('ul');
        node.children.forEach(child => ul.appendChild(createNodeElement(child)));
        li.appendChild(ul);
    }
    return li;
}

// ============================
// SVG LINE DRAWING
// ============================
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
                // Dùng inline style để override CSS (CSS attribute < inline style)
                path.style.stroke = `rgba(140, 38, 38, ${strokeOpacity})`;
                path.style.strokeWidth = strokeWidth + 'px';
                path.style.fill = 'none';
                path.style.strokeLinecap = 'round';
                path.style.strokeLinejoin = 'round';

                svg.appendChild(path);
            }
            traverseAndDraw(child);
        });
    }

    if (treeData) traverseAndDraw(treeData);
}

// ============================
// PAN & ZOOM
// ============================
let isPanning = false;
let startPanX, startPanY;

function initPanZoom() {
    const wrapper = document.getElementById('treeWrapper');

    wrapper.addEventListener('mousedown', (e) => {
        if (e.target.closest('.node-card')) return;
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

    wrapper.addEventListener('mouseup', () => { isPanning = false; wrapper.style.cursor = 'grab'; });
    wrapper.addEventListener('mouseleave', () => { isPanning = false; wrapper.style.cursor = 'grab'; });

    wrapper.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomSensitivity = 0.001;
        const delta = e.deltaY * zoomSensitivity;
        let newScale = scale - delta;
        newScale = Math.max(0.1, Math.min(newScale, 3));
        scale = newScale;
        updateTransform();
    }, { passive: false });
}

function updateTransform() {
    const tree = document.getElementById('treeContainer');
    tree.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

// ============================
// NODE DRAGGING
// ============================
let draggingNode = null;
let nodeStartX = 0, nodeStartY = 0;
let initialDx = 0, initialDy = 0;

function initNodeDrag() {
    document.addEventListener('mousedown', (e) => {
        const card = e.target.closest('.node-card');
        if (!card) return;
        if (e.target.closest('.action-btn') || e.target.closest('.add-btn')) return;

        const rect = card.getBoundingClientRect();
        const isResizeCorner = (e.clientX > rect.right - 20) && (e.clientY > rect.bottom - 20);
        if (isResizeCorner) return;

        draggingNode = card;
        nodeStartX = e.clientX;
        nodeStartY = e.clientY;

        const result = findNodeAndParent(treeData, card.id);
        if (!result) return;
        initialDx = result.node.dx || 0;
        initialDy = result.node.dy || 0;

        card.style.zIndex = 100;
        e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
        if (!draggingNode) return;
        const deltaX = (e.clientX - nodeStartX) / scale;
        const deltaY = (e.clientY - nodeStartY) / scale;
        const newDx = initialDx + deltaX;
        const newDy = initialDy + deltaY;

        draggingNode.style.left = newDx + 'px';
        draggingNode.style.top = newDy + 'px';

        const result = findNodeAndParent(treeData, draggingNode.id);
        if (result && result.node) { result.node.dx = newDx; result.node.dy = newDy; }
        drawLines();
    });

    document.addEventListener('mouseup', () => {
        if (draggingNode) {
            draggingNode.style.zIndex = 2;
            saveData();
            draggingNode = null;
        }
    });
}

// ============================
// SETTINGS / CONTROLS
// ============================
// BASE constants for proportional scaling
const BASE_FONT_SIZE = 1.1;   // rem
const BASE_NODE_WIDTH = 140;  // px

function updateFontSize(val) {
    const fontSize = parseFloat(val) || BASE_FONT_SIZE;
    document.documentElement.style.setProperty('--node-font-size', fontSize + 'rem');

    // Scale min-height theo tỷ lệ font (không scale width — giãn dọc là chính)
    const newHeight = Math.round(80 * (fontSize / BASE_FONT_SIZE));
    document.documentElement.style.setProperty('--node-min-height', Math.max(60, newHeight) + 'px');

    // Xóa customWidth/Height để thẻ tự tính lại
    clearCustomWidths();

    // Re-render để áp dụng kích thước mới
    setTimeout(() => renderTree(), 50);
}

function updateTitleFont(val) {
    document.documentElement.style.setProperty('--title-font-size', val + 'rem');
    setTimeout(() => drawLines(), 300);
}

function updateHP(type, val) {
    if (type === 'width') document.documentElement.style.setProperty('--hp-width', val + 'px');
    else if (type === 'height') document.documentElement.style.setProperty('--hp-height', val + 'px');
    else if (type === 'font') document.documentElement.style.setProperty('--hp-font', val + 'px');
}

function updateNodeWidth(val) {
    document.documentElement.style.setProperty('--node-width', val + 'px');
    setTimeout(() => drawLines(), 300);
}

function updateNodeSpacing(val) {
    document.documentElement.style.setProperty('--node-spacing', val + 'px');
    setTimeout(() => drawLines(), 300);
}

// Xóa customWidth/customHeight khỏi toàn bộ node và inline style DOM
function clearCustomWidths() {
    function traverse(node) {
        delete node.customWidth;
        delete node.customHeight;
        // Xóa luôn inline style trên DOM element nếu đang tồn tại
        const el = document.getElementById(node.id);
        if (el) {
            el.style.width = '';
            el.style.height = '';
        }
        if (node.children) node.children.forEach(traverse);
    }
    if (treeData) {
        traverse(treeData);
        saveData();
    }
}


function updateStrokeWidth(val) {
    strokeWidth = parseFloat(val) || 3;
    drawLines();
}

function updateStrokeOpacity(val) {
    strokeOpacity = Math.max(0.05, Math.min(1, parseFloat(val) || 0.85));
    drawLines();
}

// ============================
// MODAL / CRUD LOGIC
// ============================
function openEditModal(id) {
    currentAction = 'edit';
    currentNodeId = id;
    document.getElementById('modalTitle').innerText = 'Chỉnh sửa thông tin';
    document.getElementById('btnDelete').style.display = id === 'root' ? 'none' : 'inline-block';

    const result = findNodeAndParent(treeData, id);
    if (!result) return;
    const node = result.node;

    document.getElementById('nodeName').value = node.name || '';
    document.getElementById('nodeTitle').value = node.title || '';
    document.getElementById('nodeSpouseName').value = node.spouseName || '';
    document.getElementById('nodeSpouseTitle').value = node.spouseTitle || '';

    document.getElementById('nodeModal').classList.add('active');
}

function openAddModal(parentId, childGeneration) {
    currentAction = 'add';
    currentNodeId = parentId;
    document.getElementById('modalTitle').innerText = `Thêm con (Đời ${childGeneration})`;
    document.getElementById('btnDelete').style.display = 'none';
    document.getElementById('nodeForm').reset();
    document.getElementById('nodeModal').classList.add('active');
}

function closeModal() {
    document.getElementById('nodeModal').classList.remove('active');
}

function handleFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('nodeName').value;
    const title = document.getElementById('nodeTitle').value;
    const spouseName = document.getElementById('nodeSpouseName').value;
    const spouseTitle = document.getElementById('nodeSpouseTitle').value;

    if (currentAction === 'edit') {
        const result = findNodeAndParent(treeData, currentNodeId);
        if (!result) return;
        const node = result.node;
        node.name = name;
        node.title = title;
        node.spouseName = spouseName;
        node.spouseTitle = spouseTitle;
    } else if (currentAction === 'add') {
        const result = findNodeAndParent(treeData, currentNodeId);
        if (!result) return;
        const node = result.node;
        if (!node.children) node.children = [];
        node.children.push({
            id: 'node-' + Date.now(),
            generation: node.generation + 1,
            name,
            title,
            spouseName,
            spouseTitle,
            dx: 0, dy: 0
        });
    }

    saveData();
    renderTree();
    closeModal();
}

function deleteNode() {
    confirmDeleteNode(currentNodeId);
}

function confirmDeleteNode(id) {
    if (confirm("Bạn có chắc chắn muốn xóa thành viên này và toàn bộ con cháu của họ?")) {
        const result = findNodeAndParent(treeData, id);
        if (result && result.parent) {
            result.parent.children = result.parent.children.filter(c => c.id !== id);
            saveData();
            renderTree();
            closeModal();
        }
    }
}

// ============================
// PDF EXPORT
// ============================
function exportPDF() {
    const format = document.getElementById('pdfFormat').value;
    const element = document.getElementById('treeContainer');
    const svg = document.getElementById('svgCanvas');

    const currentWidth = element.offsetWidth;
    element.style.width = currentWidth + 'px';
    element.style.minWidth = currentWidth + 'px';

    window.scrollTo(0, 0);
    document.body.classList.add('pdf-exporting');

    const oldTransform = element.style.transform;
    element.style.transform = 'none';

    svg.style.width = '100%';
    svg.style.height = '100%';

    const oldScale = scale;
    scale = 1;

    setTimeout(() => {
        let maxBottom = element.scrollHeight;
        let maxRight = element.scrollWidth;
        const tRect = element.getBoundingClientRect();
        document.querySelectorAll('.node-card').forEach(c => {
            const rect = c.getBoundingClientRect();
            const bottom = rect.bottom - tRect.top;
            const right = rect.right - tRect.left;
            if (bottom > maxBottom) maxBottom = bottom;
            if (right > maxRight) maxRight = right;
        });

        maxBottom += 100;
        maxRight += 100;

        element.style.minHeight = maxBottom + 'px';
        element.style.minWidth = maxRight + 'px';
        svg.style.height = maxBottom + 'px';
        svg.style.width = maxRight + 'px';

        drawLines();

        const maxDimension = Math.max(maxRight, maxBottom);
        const exportScale = Math.min(2, 15000 / maxDimension);

        html2canvas(element, {
            scale: exportScale,
            useCORS: true,
            backgroundColor: '#f4eee1',
            logging: false,
            width: maxRight,
            height: maxBottom
        }).then(canvas => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('landscape', 'mm', format);

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            const padding = 5;
            const availableWidth = pdfWidth - padding * 2;
            const availableHeight = pdfHeight - padding * 2;
            const fitRatio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);

            const finalWidth = imgWidth * fitRatio;
            const finalHeight = imgHeight * fitRatio;
            const x = (pdfWidth - finalWidth) / 2;
            const y = (pdfHeight - finalHeight) / 2;

            pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
            pdf.save(`GiaPha_TrungBay_${format.toUpperCase()}.pdf`);

            scale = oldScale;
            element.style.transform = oldTransform;
            element.style.width = '';
            element.style.minWidth = 'min-content';
            element.style.height = '';
            element.style.minHeight = '';
            element.style.background = 'transparent';
            svg.style.width = '100%';
            svg.style.height = '100%';
            document.body.classList.remove('pdf-exporting');
            drawLines();
        });
    }, 300);
}

// Handle window resize
window.addEventListener('resize', () => drawLines());

// Start
init();
