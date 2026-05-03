const initialData = {
    id: "root",
    generation: 1,
    name: "Nguyễn Đình Quế",
    title: "Phúc Lan",
    spouseName: "Phùng Thị Dùng",
    spouseTitle: "Phúc Dung",
    children: [
        { id: "gen2-1", generation: 2, name: "Nguyễn Thị Ngọc" },
        {
            id: "gen2-2", generation: 2, name: "Nguyễn Văn Nga", title: "Đức Nha", spouseName: "Tạ Thị Đấm", spouseTitle: "Diệu Tâm", children: [
                { id: "gen3-1", generation: 3, name: "Nguyễn Thị Vệ" },
                { id: "gen3-2", generation: 3, name: "Nguyễn Thị Va" },
                { id: "gen3-3", generation: 3, name: "Nguyễn Văn Ngự", title: "Trực Bình" },
                {
                    id: "gen3-4", generation: 3, name: "Nguyễn Văn Nhạn", title: "Phúc Toàn", spouseName: "Nguyễn Thị Hợi", spouseTitle: "Diệu Đa", children: [
                        { id: "gen4-1", generation: 4, name: "Nguyễn Thị Nhẫn", title: "Từ Dẫn" },
                        { id: "gen4-2", generation: 4, name: "Nguyễn Thị Nhàn" },
                        {
                            id: "gen4-3", generation: 4, name: "Nguyễn Văn Nhãn", spouseName: "Phùng Thị Biên", spouseTitle: "Diệu Ban", children: [
                                { id: "gen5-1", generation: 5, name: "Nguyễn Thị Hiển" },
                                { id: "gen5-2", generation: 5, name: "Nguyễn Thị Duyên" },
                                { id: "gen5-3", generation: 5, name: "Nguyễn Thị Hồng" },
                                { id: "gen5-4", generation: 5, name: "Nguyễn Thị Thái" },
                                { id: "gen5-5", generation: 5, name: "Nguyễn Văn Quý" },
                                {
                                    id: "gen5-6", generation: 5, name: "Nguyễn Việt Trì",  spouseName: "Phùng Thị Nở" ,children: [
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
                { id: "gen3-5", generation: 3, name: "Nguyễn Văn Ngợi" }
            ]
        },
        { id: "gen2-3", generation: 2, name: "Nguyễn Văn Lục", title: "Trực Chất" },
        { id: "gen2-4", generation: 2, name: "Nguyễn Văn Lực", title: "Trực Cường" },
        { id: "gen2-5", generation: 2, name: "Nguyễn Văn Nghiễm", title: "Trực Liêm" }
    ]
};

let treeData = null;
let currentAction = 'edit';
let currentNodeId = null;

const resizeObserver = new ResizeObserver(entries => {
    let changed = false;
    for (let entry of entries) {
        const id = entry.target.id;
        const { node } = findNodeAndParent(treeData, id);
        if (node) {
            // Save new width and height
            const w = entry.contentRect.width;
            const h = entry.contentRect.height;
            // padding and border are included in offsetWidth, so better use offsetWidth
            node.width = entry.target.offsetWidth;
            node.height = entry.target.offsetHeight;
            changed = true;
        }
    }
    drawLines();
    // Do not save to localstorage on every micro resize tick to avoid lag, but this is fine for now
});

function init() {
    const savedData = localStorage.getItem('giaPhaData');
    if (savedData) {
        try {
            treeData = JSON.parse(savedData);
        } catch (e) {
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

    // Draw initial lines after a small delay to ensure DOM is ready
    setTimeout(() => {
        drawLines();
    }, 100);
}

function saveData() {
    localStorage.setItem('giaPhaData', JSON.stringify(treeData));
}

function resetData() {
    if (confirm("Bạn có chắc chắn muốn khôi phục dữ liệu về ban đầu? Toàn bộ thay đổi sẽ bị xóa.")) {
        localStorage.removeItem('giaPhaData');
        location.reload();
    }
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
    card.dataset.id = node.id;

    // Apply saved positions and sizes
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

    // Actions
    html += `
        <div class="action-group no-print">
            <button class="action-btn edit-btn" onclick="event.stopPropagation(); openEditModal('${node.id}')" title="Sửa"><i class="fas fa-edit"></i></button>
            <button class="action-btn delete-btn" onclick="event.stopPropagation(); deleteNode('${node.id}')" title="Xóa" style="display: ${node.id === 'root' ? 'none' : 'flex'}"><i class="fas fa-trash"></i></button>
        </div>
    `;

    html += `<button class="add-btn no-print" onclick="event.stopPropagation(); openAddModal('${node.id}', ${node.generation + 1})" title="Thêm con"><i class="fas fa-plus"></i></button>`;

    card.innerHTML = html;
    li.appendChild(card);

    // Observe for resize
    resizeObserver.observe(card);

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

        // Calculate relative to tree container (considering current scale/pan)
        // Since getBoundingClientRect is affected by transform scale on the tree container,
        // we actually need to calculate coordinates un-scaled.
        // Wait, if the SVG is inside treeContainer, it scales with it!
        // So coordinates inside SVG should be unscaled local coordinates.
        // We can get local coordinates using offsetTop, offsetLeft, but because of flexbox it's hard.
        // Better: divide the client rect difference by the current scale.

        const px = (pRect.left - treeRect.left) / scale + pRect.width / scale / 2;
        const py = (pRect.bottom - treeRect.top) / scale;

        node.children.forEach(child => {
            const childCard = document.getElementById(child.id);
            if (childCard) {
                const cRect = childCard.getBoundingClientRect();
                const cx = (cRect.left - treeRect.left) / scale + cRect.width / scale / 2;
                const cy = (cRect.top - treeRect.top) / scale;

                // Draw path: vertical down, horizontal, vertical down
                const midY = py + (cy - py) / 2;

                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute('d', `M ${px} ${py} L ${px} ${midY} L ${cx} ${midY} L ${cx} ${cy}`);
                path.setAttribute('stroke', 'var(--line-color)');
                path.setAttribute('stroke-width', '2');
                path.setAttribute('fill', 'none');

                svg.appendChild(path);
            }
            traverseAndDraw(child);
        });
    }

    traverseAndDraw(treeData);
}


// Independent Node Dragging Logic
let draggingNode = null;
let nodeStartX = 0, nodeStartY = 0;
let initialDx = 0, initialDy = 0;

function initNodeDrag() {
    document.addEventListener('mousedown', (e) => {
        // Find if we clicked on a card
        const card = e.target.closest('.node-card');
        if (!card) return;

        // If clicking on actions or add button or resize handle (bottom right), ignore drag
        if (e.target.closest('.action-btn') || e.target.closest('.add-btn')) return;

        // Check if clicking near bottom right corner (resize handle area)
        const rect = card.getBoundingClientRect();
        const isResizeCorner = (e.clientX > rect.right - 20) && (e.clientY > rect.bottom - 20);
        if (isResizeCorner) return;

        draggingNode = card;
        nodeStartX = e.clientX;
        nodeStartY = e.clientY;

        const { node } = findNodeAndParent(treeData, card.id);
        initialDx = node.dx || 0;
        initialDy = node.dy || 0;

        card.style.zIndex = 100;
        e.stopPropagation(); // prevent tree pan
    });

    document.addEventListener('mousemove', (e) => {
        if (!draggingNode) return;

        // Calculate movement, adjusting for current zoom scale
        const deltaX = (e.clientX - nodeStartX) / scale;
        const deltaY = (e.clientY - nodeStartY) / scale;

        const newDx = initialDx + deltaX;
        const newDy = initialDy + deltaY;

        // Fix: Use left/top instead of transform
        draggingNode.style.left = newDx + 'px';
        draggingNode.style.top = newDy + 'px';

        const { node } = findNodeAndParent(treeData, draggingNode.id);
        if (node) {
            node.dx = newDx;
            node.dy = newDy;
        }

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


// Search node by id
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

// Modal Logic
const modal = document.getElementById('nodeModal');
const nodeForm = document.getElementById('nodeForm');

function openEditModal(id) {
    currentAction = 'edit';
    currentNodeId = id;
    document.getElementById('modalTitle').innerText = 'Chỉnh sửa thông tin';
    document.getElementById('btnDelete').style.display = id === 'root' ? 'none' : 'inline-block';

    const { node } = findNodeAndParent(treeData, id);

    document.getElementById('nodeName').value = node.name || '';
    document.getElementById('nodeTitle').value = node.title || '';
    document.getElementById('nodeSpouseName').value = node.spouseName || '';
    document.getElementById('nodeSpouseTitle').value = node.spouseTitle || '';

    modal.classList.add('active');
}

function openAddModal(parentId, childGeneration) {
    currentAction = 'add';
    currentNodeId = parentId;
    document.getElementById('modalTitle').innerText = `Thêm con (Đời ${childGeneration})`;
    document.getElementById('btnDelete').style.display = 'none';
    nodeForm.reset();
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

window.onclick = function (event) {
    if (event.target == modal) {
        closeModal();
    }
}

nodeForm.onsubmit = function (e) {
    e.preventDefault();
    const name = document.getElementById('nodeName').value;
    const title = document.getElementById('nodeTitle').value;
    const spouseName = document.getElementById('nodeSpouseName').value;
    const spouseTitle = document.getElementById('nodeSpouseTitle').value;

    if (currentAction === 'edit') {
        const { node } = findNodeAndParent(treeData, currentNodeId);
        node.name = name;
        node.title = title;
        node.spouseName = spouseName;
        node.spouseTitle = spouseTitle;
    } else if (currentAction === 'add') {
        const { node } = findNodeAndParent(treeData, currentNodeId);
        if (!node.children) node.children = [];

        const newNodeId = 'node-' + Date.now();
        node.children.push({
            id: newNodeId,
            generation: node.generation + 1,
            name: name,
            title: title,
            spouseName: spouseName,
            spouseTitle: spouseTitle,
            dx: 0, dy: 0
        });
    }

    saveData();
    renderTree();
    closeModal();
};

function deleteNode(id = currentNodeId) {
    if (confirm("Bạn có chắc chắn muốn xóa thành viên này và toàn bộ con cháu của họ?")) {
        const { node, parent } = findNodeAndParent(treeData, id);
        if (parent) {
            parent.children = parent.children.filter(c => c.id !== id);
            saveData();
            renderTree();
            closeModal();
        }
    }
}

// Settings logic
function updateSpacing(val) {
    document.documentElement.style.setProperty('--node-spacing', val + 'px');
    setTimeout(() => drawLines(), 300); // redraw lines after transition
}

function updateWidth(val) {
    document.documentElement.style.setProperty('--node-width', val + 'px');
    setTimeout(() => drawLines(), 300); // wait for css transition
}

function updateFontSize(val) {
    document.documentElement.style.setProperty('--node-font-size', val + 'rem');
    setTimeout(() => drawLines(), 300);
}

function updateFontFamily(val) {
    document.documentElement.style.setProperty('--node-font-family', val);
    setTimeout(() => drawLines(), 300);
}

// Pan & Zoom Logic
let scale = 1;
let translateX = 0;
let translateY = 0;
let isPanning = false;
let startPanX, startPanY;

function initPanZoom() {
    const wrapper = document.getElementById('treeWrapper');
    const tree = document.getElementById('treeContainer');

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

    wrapper.addEventListener('mouseup', () => {
        isPanning = false;
        wrapper.style.cursor = 'grab';
    });

    wrapper.addEventListener('mouseleave', () => {
        isPanning = false;
        wrapper.style.cursor = 'grab';
    });

    wrapper.addEventListener('wheel', (e) => {
        if (e.target.closest('.modal')) return;
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
    // No need to redraw SVG lines because they are inside treeContainer and scale with it!
}

function zoomIn() {
    scale = Math.min(scale + 0.1, 3);
    updateTransform();
}

function zoomOut() {
    scale = Math.max(scale - 0.1, 0.1);
    updateTransform();
}

function resetZoom() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    updateTransform();
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
    element.style.background = '#ffffff';

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
            backgroundColor: '#ffffff',
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
            pdf.save(`GiaPha_${format.toUpperCase()}.pdf`);

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
