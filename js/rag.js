// ==========================================
// rag.js - BỘ TRA CỨU RAG NGỮ NGHĨA & ĐA TỪ KHÓA
// ==========================================
localforage.config({ name: 'AI_KHBD_DB' });

let documentIndex = null;
let documentsData = [];

// Phân đoạn ngữ nghĩa dựa trên tiêu đề mục và trang SGK
function chunkTextBySections(text, fileName) {
    const lines = text.split(/\r?\n/);
    const chunks = [];
    let currentChunk = [];
    let currentHeader = "Nội dung chung";
    let currentPage = "Chưa rõ trang";

    lines.forEach(line => {
        const trimmed = line.trim();
        const pageMatch = trimmed.match(/(?:Trang|Tr\.)\s*(\d+)/i);
        if (pageMatch) currentPage = `Trang ${pageMatch[1]}`;

        const isHeader = /^(Mục|Bài|\d+\.|\bHoạt động\b|\bLuyện tập\b|\bVận dụng\b|\bGhi nhớ\b)/i.test(trimmed);
        
        if (isHeader && currentChunk.length > 30) {
            chunks.push({
                header: currentHeader,
                page: currentPage,
                content: currentChunk.join('\n')
            });
            currentChunk = [];
            currentHeader = trimmed;
        } else {
            currentChunk.push(line);
        }
    });

    if (currentChunk.length > 0) {
        chunks.push({
            header: currentHeader,
            page: currentPage,
            content: currentChunk.join('\n')
        });
    }

    return chunks;
}

function buildIndex(docs) {
    documentsData = docs;
    documentIndex = lunr(function () {
        this.ref('id');
        this.field('content');
        this.field('header');
        docs.forEach(doc => this.add(doc));
    });
}

async function uploadAndIndexFiles() {
    const fileInput = document.getElementById('file-input');
    const loadingEl = document.getElementById('doc-loading');
    const files = fileInput.files;

    if (!files || files.length === 0) return alert('Vui lòng chọn file!');
    loadingEl.style.display = 'block';

    try {
        let docs = (await localforage.getItem('khbd_documents')) || [];

        for (let file of files) {
            const rawText = await extractTextFromFile(file);
            const sectionChunks = chunkTextBySections(rawText, file.name);
            
            sectionChunks.forEach((chunk, idx) => {
                docs.push({
                    id: `${Date.now()}_${idx}`,
                    fileName: file.name,
                    header: chunk.header,
                    page: chunk.page,
                    content: `[File: ${file.name} | ${chunk.page} | Mục: ${chunk.header}]\n${chunk.content}`,
                    createdAt: new Date().toLocaleDateString('vi-VN')
                });
            });
        }

        await localforage.setItem('khbd_documents', docs);
        buildIndex(docs);
        fileInput.value = '';
        await renderDocList();
        alert('✅ Đã tải lên và phân đoạn ngữ nghĩa tài liệu thành công!');
    } catch (e) {
        alert('❌ Lỗi xử lý file: ' + e.message);
    } finally {
        loadingEl.style.display = 'none';
    }
}

// Search tra cứu đa chiều theo 5 khía cạnh sư phạm
async function searchKnowledgeBase(lessonName) {
    const docs = (await localforage.getItem('khbd_documents')) || [];
    if (docs.length === 0) return "Không có tài liệu SGK trong kho. AI tự động dùng tri thức chuẩn GDPT 2018.";
    if (!documentIndex) buildIndex(docs);

    const keywords = [lessonName, `${lessonName} mục tiêu`, `${lessonName} hoạt động`, `${lessonName} luyện tập`, `${lessonName} ghi nhớ`];
    let combinedResults = new Set();

    keywords.forEach(kw => {
        try {
            const res = documentIndex.search(kw);
            res.slice(0, 3).forEach(r => combinedResults.add(r.ref));
        } catch (e) {}
    });

    let context = "";
    Array.from(combinedResults).slice(0, 8).forEach(refId => {
        const doc = documentsData.find(d => d.id === refId);
        if (doc) context += `${doc.content}\n\n------------------------\n\n`;
    });

    return context || "Không tìm thấy nội dung liên quan trực tiếp trong tài liệu tải lên.";
}