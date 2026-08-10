// Đọc file và Client-side Search
// Khởi tạo DB
localforage.config({ name: 'AI_KHBD_DB' });

let documentIndex = null;
let documentsData = [];

// Xử lý text thành các đoạn nhỏ (chunking)
function chunkText(text, maxWords = 500) {
    const words = text.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += maxWords) {
        chunks.push(words.slice(i, i + maxWords).join(' '));
    }
    return chunks;
}

// Lập chỉ mục Lunr
function buildIndex(docs) {
    documentIndex = lunr(function () {
        this.ref('id');
        this.field('content');
        docs.forEach(doc => this.add(doc));
    });
}

async function searchKnowledgeBase(query) {
    if (!documentIndex) return "Không có tài liệu ưu tiên. AI sẽ sử dụng kiến thức nền.";
    const results = documentIndex.search(query);
    if (results.length === 0) return "Không tìm thấy nội dung cụ thể trong tài liệu tải lên.";
    
    // Lấy top 3 chunks liên quan nhất
    let context = "";
    results.slice(0, 3).forEach(res => {
        const doc = documentsData.find(d => d.id === res.ref);
        if (doc) context += doc.content + "\n\n";
    });
    return context;
}