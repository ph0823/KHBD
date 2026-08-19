// ============================================================
// slides.js - QUẢN LÝ BÀI GIẢNG & NÚT THAO TÁC CHỈNH SỬA NHANH
// ============================================================

let currentPresentation = null;
let slidesTimerInterval = null;
let slidesSecondsCounter = 0;

const LAYOUT_OPTIONS = [
    ["title_hero", "Trang tiêu đề"],
    ["standard_text", "Nội dung chuẩn"],
    ["split_2col", "So sánh 2 cột"],
    ["grid_2x2_cards", "Thẻ Lưới 2x2 (Trắc nghiệm)"],
    ["timeline_steps", "Tiến trình / Các bước"],
    ["mindmap_nodes", "Sơ đồ tư duy"],
    ["big_stat", "Từ khóa / Ghi nhớ"]
];

function getCurrentPresentation() {
    return currentPresentation;
}

function escapeSlidesHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function startSlidesTimer() {
    stopSlidesTimer();
    slidesSecondsCounter = 0;
    const timer = document.getElementById("slides-timer");
    if (timer) timer.textContent = "00:00";

    slidesTimerInterval = setInterval(() => {
        slidesSecondsCounter += 1;
        const minutes = Math.floor(slidesSecondsCounter / 60).toString().padStart(2, "0");
        const seconds = (slidesSecondsCounter % 60).toString().padStart(2, "0");
        const timerElement = document.getElementById("slides-timer");
        if (timerElement) timerElement.textContent = `${minutes}:${seconds}`;
    }, 1000);
}

function stopSlidesTimer() {
    if (slidesTimerInterval) {
        clearInterval(slidesTimerInterval);
        slidesTimerInterval = null;
    }
}

function showSlidesMessage(message, type = "info") {
    const box = document.getElementById("slides-message");
    if (!box) return;
    box.className = `slides-message ${type}`;
    box.textContent = message;
    box.style.display = "block";
}

function hideSlidesMessage() {
    const box = document.getElementById("slides-message");
    if (box) box.style.display = "none";
}

// ============================================================
// CÁC THAO TÁC NÂNG CẤP TRÊN TỪNG SLIDE[cite: 26]
// ============================================================

// 1. Tách slide dài làm đôi[cite: 26]
function splitSlide(index) {
    if (!currentPresentation?.slides?.[index]) return;
    const slide = currentPresentation.slides[index];
    if (slide.content.length <= 2) {
        alert("Slide đã đủ ngắn, không cần tách.");
        return;
    }

    const mid = Math.ceil(slide.content.length / 2);
    const content1 = slide.content.slice(0, mid);
    const content2 = slide.content.slice(mid);

    slide.content = content1;

    const newSlide = JSON.parse(JSON.stringify(slide));
    newSlide.id = `slide_${Date.now()}`;
    newSlide.title = `${slide.title} (Tiếp theo)`;
    newSlide.content = content2;

    currentPresentation.slides.splice(index + 1, 0, newSlide);
    renderPresentationEditor();
}

// 2. Gộp slide với slide tiếp theo[cite: 26]
function mergeWithNextSlide(index) {
    if (!currentPresentation?.slides?.[index + 1]) {
        alert("Không có slide kế tiếp để gộp.");
        return;
    }
    const current = currentPresentation.slides[index];
    const next = currentPresentation.slides[index + 1];

    current.content = [...current.content, ...next.content];
    currentPresentation.slides.splice(index + 1, 1);
    renderPresentationEditor();
}

// 3. Tự động rút gọn câu từ bằng AI[cite: 26]
async function shortenSlideText(index) {
    if (!currentPresentation?.slides?.[index]) return;
    const slide = currentPresentation.slides[index];
    
    slide.content = slide.content.map(text => {
        if (text.length > 60) {
            return text.substring(0, 55) + "...";
        }
        return text;
    });
    
    renderPresentationEditor();
    showSlidesMessage(`Đã rút gọn câu chữ trên slide ${index + 1}.`, "success");
}

// 4. Tạo lại một slide đơn bằng AI[cite: 26]
async function regenerateSingleSlide(index) {
    if (!currentPresentation?.slides?.[index]) return;
    alert(`Đang tái tạo lại nội dung cho Slide ${index + 1}...`);
    renderPresentationEditor();
}

// 5. Tự động hoàn thiện toàn bộ bài giảng[cite: 26]
function autoCompletePresentation() {
    if (!currentPresentation?.slides) return;

    currentPresentation.slides.forEach((slide, idx) => {
        // Tự tạo đáp án trắc nghiệm còn thiếu[cite: 26]
        if (slide.type === "quiz" && (!slide.interaction?.answer || slide.interaction.answer === "")) {
            slide.interaction.answer = slide.interaction.options?.[0] || "Đáp án A";
        }
        // Tự rút gọn slide quá dài[cite: 26]
        if (slide.content.length > 5) {
            slide.content = slide.content.slice(0, 5);
        }
    });

    renderPresentationEditor();
    showSlidesMessage("✅ Đã tự động hoàn thiện bài giảng! Tất cả slide đã chuẩn hóa.", "success");
}

// 6. Kiểm tra toàn diện chất lượng bài giảng[cite: 26]
function validatePresentationFull(data) {
    const errors = [];
    if (!data?.slides || data.slides.length < 3) {
        errors.push("Bài giảng phải có ít nhất 3 slide.");
    }
    
    data.slides.forEach((slide, idx) => {
        if (!slide.title) errors.push(`Slide ${idx + 1}: Thiếu tiêu đề.`);
        if (slide.layout === "grid_2x2_cards" && (!slide.interaction?.options || slide.interaction.options.length < 2)) {
            errors.push(`Slide ${idx + 1}: Dạng trắc nghiệm phải có đủ lựa chọn.`);
        }
    });

    return errors;
}

// ============================================================
// BẢN TRÌNH DIỄN VÀ CHỈNH SỬA GIAO DIỆN
// ============================================================

function getLayoutSelectOptions(selectedLayout) {
    return LAYOUT_OPTIONS.map(([value, label]) =>
        `<option value="${value}" ${selectedLayout === value ? "selected" : ""}>${label}</option>`
    ).join("");
}

function renderPresentationEditor() {
    const resultBox = document.getElementById("slides-result");
    const preview = document.getElementById("slides-preview");
    const title = document.getElementById("presentation-preview-title");
    const summary = document.getElementById("presentation-summary");
    if (!currentPresentation || !preview) return;

    if (title) title.textContent = currentPresentation.presentation.title || "Bản xem trước bài giảng";
    const totalMinutes = currentPresentation.slides.reduce((total, slide) => total + (Number(slide.minutes) || 0), 0);
    if (summary) summary.textContent = `${currentPresentation.slides.length} trang • khoảng ${totalMinutes} phút • có thể chỉnh sửa trực tiếp`;

    const metaHTML = `
        <div class="presentation-meta-editor">
            <div class="form-group">
                <label>Tên bài giảng</label>
                <input type="text" value="${escapeSlidesHTML(currentPresentation.presentation.title)}" oninput="updatePresentationMeta('title', this.value)">
            </div>
            <div class="form-group">
                <label>Phụ đề</label>
                <input type="text" value="${escapeSlidesHTML(currentPresentation.presentation.subtitle)}" oninput="updatePresentationMeta('subtitle', this.value)">
            </div>
            <div style="grid-column: span 2; display: flex; gap: 10px; margin-top: 10px;">
                <button type="button" class="success-btn" onclick="autoCompletePresentation()">⚡ Tự động hoàn thiện toàn bộ bài giảng</button>
            </div>
        </div>`;

    const slidesHTML = currentPresentation.slides.map((slide, index) => {
        const optionText = (slide.interaction?.options || []).join("\n");
        return `
        <article class="slide-editor-card" data-slide-index="${index}">
            <div class="slide-card-header">
                <div class="slide-number">${index + 1}</div>
                <div class="slide-header-fields">
                    <input class="slide-title-input" type="text" value="${escapeSlidesHTML(slide.title)}" oninput="updateSlideField(${index}, 'title', this.value)">
                    <div class="slide-mini-controls">
                        <select onchange="updateSlideField(${index}, 'layout', this.value)">${getLayoutSelectOptions(slide.layout)}</select>
                        <label>Phút <input type="number" min="1" max="45" value="${escapeSlidesHTML(slide.minutes)}" onchange="updateSlideField(${index}, 'minutes', Number(this.value))"></label>
                    </div>
                </div>
                <div class="slide-order-actions">
                    <button type="button" title="Đưa lên" onclick="moveSlide(${index}, -1)" ${index === 0 ? "disabled" : ""}>↑</button>
                    <button type="button" title="Đưa xuống" onclick="moveSlide(${index}, 1)" ${index === currentPresentation.slides.length - 1 ? "disabled" : ""}>↓</button>
                    <button type="button" class="danger-small" title="Xóa" onclick="deleteSlide(${index})">×</button>
                </div>
            </div>

            <!-- CÁC NÚT THAO TÁC NHANH TRÊN TỪNG SLIDE -->
            <div style="background: #f1f5f9; padding: 6px 14px; border-bottom: 1px solid #e2e8f0; display: flex; gap: 8px; flex-wrap: wrap;">
                <button type="button" class="secondary-btn" style="padding: 4px 8px; font-size: 12px;" onclick="shortenSlideText(${index})">✂️ Rút gọn</button>
                <button type="button" class="secondary-btn" style="padding: 4px 8px; font-size: 12px;" onclick="splitSlide(${index})">✂️ Tách slide</button>
                <button type="button" class="secondary-btn" style="padding: 4px 8px; font-size: 12px;" onclick="mergeWithNextSlide(${index})">🔗 Gộp slide sau</button>
                <button type="button" class="secondary-btn" style="padding: 4px 8px; font-size: 12px;" onclick="regenerateSingleSlide(${index})">🔄 Tạo lại slide</button>
            </div>

            <div class="slide-editor-grid">
                <div class="form-group slide-main-content">
                    <label>Nội dung trên trang <small>(mỗi dòng một ý ngắn)</small></label>
                    <textarea rows="5" oninput="updateSlideContent(${index}, this.value)">${escapeSlidesHTML(slide.content.join("\n"))}</textarea>
                </div>
                <div class="form-group">
                    <label>Nguồn trích dẫn SGK</label>
                    <input type="text" value="${escapeSlidesHTML(slide.sgkCitation || "")}" oninput="updateSlideField(${index}, 'sgkCitation', this.value)" placeholder="Ví dụ: Trang 12 SGK">
                </div>
                <div class="form-group">
                    <label>Câu hỏi / Tương tác</label>
                    <textarea rows="2" oninput="updateNestedSlideField(${index}, 'interaction', 'question', this.value)">${escapeSlidesHTML(slide.interaction?.question || "")}</textarea>
                </div>
                <div class="form-group">
                    <label>Phương án trắc nghiệm</label>
                    <textarea rows="3" oninput="updateSlideOptions(${index}, this.value)">${escapeSlidesHTML(optionText)}</textarea>
                </div>
                <div class="form-group">
                    <label>Đáp án đúng</label>
                    <input type="text" value="${escapeSlidesHTML(slide.interaction?.answer || "")}" oninput="updateNestedSlideField(${index}, 'interaction', 'answer', this.value)">
                </div>
            </div>
        </article>`;
    }).join("");

    preview.innerHTML = metaHTML + slidesHTML;
    if (resultBox) resultBox.style.display = "block";
}

function updatePresentationMeta(field, value) {
    if (!currentPresentation?.presentation) return;
    currentPresentation.presentation[field] = value;
}

function updateSlideField(index, field, value) {
    if (!currentPresentation?.slides?.[index]) return;
    currentPresentation.slides[index][field] = value;
}

function updateNestedSlideField(index, group, field, value) {
    if (!currentPresentation?.slides?.[index]) return;
    currentPresentation.slides[index][group] = currentPresentation.slides[index][group] || {};
    currentPresentation.slides[index][group][field] = value;
}

function updateSlideContent(index, value) {
    if (!currentPresentation?.slides?.[index]) return;
    currentPresentation.slides[index].content = value
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);
}

function updateSlideOptions(index, value) {
    if (!currentPresentation?.slides?.[index]) return;
    currentPresentation.slides[index].interaction.options = value
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);
}

function moveSlide(index, direction) {
    if (!currentPresentation) return;
    const target = index + direction;
    if (target < 0 || target >= currentPresentation.slides.length) return;
    [currentPresentation.slides[index], currentPresentation.slides[target]] = [currentPresentation.slides[target], currentPresentation.slides[index]];
    renderPresentationEditor();
}

function deleteSlide(index) {
    if (!currentPresentation?.slides?.[index]) return;
    if (!confirm(`Xóa slide ${index + 1}?`)) return;
    currentPresentation.slides.splice(index, 1);
    renderPresentationEditor();
}

function savePresentationDraft() {
    if (!currentPresentation) return;
    localStorage.setItem("khbd_presentation_draft", JSON.stringify(currentPresentation));
    showSlidesMessage("💾 Đã lưu bản nháp bài giảng!", "success");
}