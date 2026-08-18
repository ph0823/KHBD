// ==========================================
// 1. KHỞI TẠO BỘ NHỚ VÀ CHỈ MỤC TÌM KIẾM
// ==========================================
localforage.config({ name: 'AI_KHBD_DB' });

let documentIndex = null;
let documentsData = [];

// Phân đoạn văn bản (Chunking) để tối ưu độ chính xác tìm kiếm
function chunkText(text, maxWords = 300) {
    const words = text.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += maxWords) {
        chunks.push(words.slice(i, i + maxWords).join(' '));
    }
    return chunks;
}

// Lập chỉ mục tìm kiếm văn bản với LunrJS
function buildIndex(docs) {
    documentsData = docs;
    documentIndex = lunr(function () {
        this.ref('id');
        this.field('content');
        docs.forEach(doc => this.add(doc));
    });
}

// ==========================================
// 2. BỘ ĐỌC FILE ĐA ĐỊNH DẠNG (TXT, DOCX, PDF)
// ==========================================
async function extractTextFromFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'txt') {
        return await file.text();
    } 
    if (extension === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        return result.value;
    } 
    if (extension === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => item.str).join(' ') + '\n';
        }
        return fullText;
    }

    throw new Error('Định dạng không hỗ trợ. Vui lòng chọn .docx, .pdf hoặc .txt.');
}

// ==========================================
// 3. TẢI LÊN, XỬ LÝ VÀ LƯU VÀO CƠ SỞ DỮ LIỆU
// ==========================================
async function uploadAndIndexFiles() {
    const fileInput = document.getElementById('file-input');
    const loadingEl = document.getElementById('doc-loading');
    const files = fileInput.files;

    if (!files || files.length === 0) {
        alert('Vui lòng chọn ít nhất một file!');
        return;
    }

    loadingEl.style.display = 'block';

    try {
        let docs = (await localforage.getItem('khbd_documents')) || [];

        for (let file of files) {
            const rawText = await extractTextFromFile(file);
            const chunks = chunkText(rawText);
            
            // Lưu từng đoạn text đi kèm tên file
            chunks.forEach((chunk, index) => {
                docs.push({
                    id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`,
                    fileName: file.name,
                    content: chunk,
                    createdAt: new Date().toLocaleDateString('vi-VN')
                });
            });
        }

        await localforage.setItem('khbd_documents', docs);
        buildIndex(docs);

        // Đặt lại trạng thái giao diện
        fileInput.value = '';
        document.getElementById('selected-files-text').innerText = 'Chưa chọn file nào';
        document.getElementById('btn-process-file').style.display = 'none';

        await renderDocList();
        alert('✅ Đã tải lên và lập chỉ mục tài liệu thành công!');
    } catch (error) {
        alert('❌ Lỗi khi đọc file: ' + error.message);
    } finally {
        loadingEl.style.display = 'none';
    }
}

// ==========================================
// 4. HIỂN THỊ VÀ XÓA TÀI LIỆU TRÊN GIAO DIỆN
// ==========================================
async function renderDocList() {
    const docListEl = document.getElementById('doc-list');
    if (!docListEl) return;

    const docs = (await localforage.getItem('khbd_documents')) || [];
    if (docs.length === 0) {
        docListEl.innerHTML = '<li style="color: #888; font-style: italic;">Chưa có tài liệu nào trong kho.</li>';
        return;
    }

    if (!documentIndex) buildIndex(docs);

    // Lọc danh sách tên file duy nhất để hiển thị
    const uniqueFiles = [...new Set(docs.map(d => d.fileName))];

    docListEl.innerHTML = uniqueFiles.map(fileName => `
        <li style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #fff; margin-bottom: 8px; border-radius: 6px; border: 1px solid #cbd5e1;">
            <div><strong>📄 ${fileName}</strong></div>
            <button onclick="deleteDocByName('${fileName}')" style="background: #ef4444; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; border-radius: 4px;">🗑️ Xóa</button>
        </li>
    `).join('');
}

async function deleteDocByName(fileName) {
    if (!confirm(`Bạn có chắc muốn xóa tài liệu "${fileName}"?`)) return;
    let docs = (await localforage.getItem('khbd_documents')) || [];
    docs = docs.filter(d => d.fileName !== fileName);
    
    await localforage.setItem('khbd_documents', docs);
    buildIndex(docs);
    await renderDocList();
}

// ==========================================
// 5. TRÍCH XUẤT NGỮ CẢNH (RAG SEARCH)
// ==========================================
async function searchKnowledgeBase(query) {
    const docs = (await localforage.getItem('khbd_documents')) || [];
    if (docs.length === 0) return "Không có tài liệu ưu tiên trong kho. AI sẽ sử dụng kiến thức nền.";
    
    if (!documentIndex) buildIndex(docs);

    const results = documentIndex.search(query);
    if (results.length === 0) return "Không tìm thấy nội dung liên quan trực tiếp trong tài liệu tải lên.";
    
    let context = "";
    results.slice(0, 3).forEach(res => {
        const doc = documentsData.find(d => d.id === res.ref);
        if (doc) context += `[Nguồn: ${doc.fileName}]:\n${doc.content}\n\n`;
    });
    return context;
}