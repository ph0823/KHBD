// ============================================================
// slides.js - TẠO, CHỈNH SỬA VÀ QUẢN LÝ BÀI GIẢNG TRÌNH CHIẾU
// ============================================================

let currentPresentation = null;
let slidesTimerInterval = null;
let slidesSecondsCounter = 0;

const SLIDE_TYPES = [
    ["title", "Trang tiêu đề"],
    ["objectives", "Mục tiêu"],
    ["warmup", "Khởi động"],
    ["content", "Kiến thức"],
    ["activity", "Hoạt động"],
    ["quiz", "Câu hỏi nhanh"],
    ["practice", "Luyện tập"],
    ["application", "Vận dụng"],
    ["summary", "Tóm tắt"],
    ["mindmap", "Sơ đồ tư duy"],
    ["message", "Thông điệp"]
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

function syncSlidesFormFromKHBD() {
    const grade = document.getElementById("sel-grade")?.value;
    const book = document.getElementById("sel-book")?.value;
    const lessonName = document.getElementById("lesson-name")?.value;
    const duration = document.getElementById("lesson-duration")?.value;

    if (grade && document.getElementById("slide-grade")) {
        document.getElementById("slide-grade").value = grade;
        if (typeof updateSlideLessonOptions === "function") updateSlideLessonOptions();
    }
    if (book && document.getElementById("slide-book")) {
        document.getElementById("slide-book").value = book;
    }
    if (lessonName && document.getElementById("slide-lesson-name")) {
        const slideLessonSelect = document.getElementById("slide-lesson-name");
        if ([...slideLessonSelect.options].some(option => option.value === lessonName)) {
            slideLessonSelect.value = lessonName;
        }
    }
    if (duration && document.getElementById("slide-duration")) {
        const durationSelect = document.getElementById("slide-duration");
        if ([...durationSelect.options].some(option => option.value === duration)) {
            durationSelect.value = duration;
        }
    }
}

function summarizeKHBDForPresentation(khbd) {
    if (!khbd) return "";

    const objectives = [
        ...(khbd.objectives?.knowledge || []),
        ...(khbd.objectives?.informaticsCompetencies || [])
    ].slice(0, 12);

    const activities = [];
    (khbd.periods || []).forEach(period => {
        (period.activities || []).forEach(activity => {
            activities.push([
                activity.name,
                `Mục tiêu: ${(activity.objectives || []).join("; ")}`,
                `Nội dung: ${activity.content || ""}`,
                `Sản phẩm: ${activity.products || ""}`
            ].join("\n"));
        });
    });

    return [
        "TÓM TẮT KHBD VỪA TẠO",
        `Tên bài: ${khbd.lesson?.title || ""}`,
        `Thời lượng: ${khbd.lesson?.duration || ""}`,
        `Mục tiêu chính:\n- ${objectives.join("\n- ")}`,
        `Tiến trình:\n${activities.slice(0, 20).join("\n\n")}`
    ].join("\n\n");
}

function getPresentationRequestData() {
    return {
        grade: document.getElementById("slide-grade")?.value || "7",
        book: document.getElementById("slide-book")?.value || "Kết nối tri thức",
        lessonName: document.getElementById("slide-lesson-name")?.value || "",
        duration: document.getElementById("slide-duration")?.value || "2 tiết",
        slideCount: document.getElementById("slide-count")?.value || "auto",
        source: document.getElementById("slide-source")?.value || "combined",
        theme: document.getElementById("slide-theme")?.value || "education",
        extra: document.getElementById("slide-extra")?.value.trim() || ""
    };
}

async function buildPresentationContext(requestData) {
    const contexts = [];

    if (requestData.source === "sgk" || requestData.source === "combined") {
        const sgkContext = await searchKnowledgeBase(requestData.lessonName);
        contexts.push(`NGUỒN TRA CỨU TỪ KHO TÀI LIỆU:\n${sgkContext}`);
    }

    if (requestData.source === "khbd" || requestData.source === "combined") {
        if (typeof currentKHBD !== "undefined" && currentKHBD) {
            contexts.push(summarizeKHBDForPresentation(currentKHBD));
        } else if (requestData.source === "khbd") {
            throw new Error("Chưa có KHBD. Hãy tạo KHBD trước hoặc chọn nguồn SGK trong kho.");
        } else {
            contexts.push("Chưa có KHBD vừa tạo; chỉ sử dụng dữ liệu tìm được trong Kho tài liệu.");
        }
    }

    return contexts.join("\n\n============================================================\n\n");
}

function normalizePresentation(data, requestData) {
    const normalized = data && typeof data === "object" ? data : {};
    normalized.presentation = normalized.presentation || {};
    normalized.presentation.title = normalized.presentation.title || requestData.lessonName;
    normalized.presentation.subtitle = normalized.presentation.subtitle || `Tin học ${requestData.grade}`;
    normalized.presentation.grade = normalized.presentation.grade || requestData.grade;
    normalized.presentation.book = normalized.presentation.book || requestData.book;
    normalized.presentation.duration = normalized.presentation.duration || requestData.duration;
    normalized.presentation.theme = requestData.theme || normalized.presentation.theme || "education";
    normalized.presentation.overview = normalized.presentation.overview || "Bài giảng được tạo từ tài liệu giáo viên cung cấp.";

    normalized.slides = Array.isArray(normalized.slides) ? normalized.slides : [];
    normalized.slides = normalized.slides.map((slide, index) => ({
        id: slide?.id || `slide-${Date.now()}-${index}`,
        type: SLIDE_TYPES.some(([type]) => type === slide?.type) ? slide.type : "content",
        title: slide?.title || `Trang ${index + 1}`,
        minutes: Number(slide?.minutes) > 0 ? Number(slide.minutes) : 3,
        learningGoal: slide?.learningGoal || "",
        content: Array.isArray(slide?.content) ? slide.content.map(item => String(item)) : [],
        visual: {
            kind: slide?.visual?.kind || "minh họa",
            prompt: slide?.visual?.prompt || "",
            caption: slide?.visual?.caption || ""
        },
        interaction: {
            instruction: slide?.interaction?.instruction || "",
            question: slide?.interaction?.question || "",
            options: Array.isArray(slide?.interaction?.options) ? slide.interaction.options.map(item => String(item)) : [],
            answer: slide?.interaction?.answer || ""
        },
        teacherNotes: slide?.teacherNotes || "",
        transition: slide?.transition || ""
    }));

    return normalized;
}

function validatePresentation(data) {
    const errors = [];
    if (!data?.presentation?.title) errors.push("Thiếu tên bài giảng.");
    if (!Array.isArray(data?.slides) || data.slides.length < 3) errors.push("Bài giảng cần có ít nhất 3 trang chiếu.");

    (data?.slides || []).forEach((slide, index) => {
        if (!slide.title) errors.push(`Trang ${index + 1} thiếu tiêu đề.`);
        if (!Array.isArray(slide.content)) errors.push(`Trang ${index + 1} có nội dung không đúng định dạng.`);
    });
    return errors;
}

async function generatePresentation() {
    const generateButton = document.getElementById("btn-generate-slides");
    const loading = document.getElementById("slides-loading");
    const resultBox = document.getElementById("slides-result");

    hideSlidesMessage();
    if (generateButton) {
        generateButton.disabled = true;
        generateButton.textContent = "⏳ Đang tạo bài giảng...";
    }
    if (loading) loading.style.display = "flex";
    if (resultBox) resultBox.style.display = "none";
    startSlidesTimer();

    try {
        const requestData = getPresentationRequestData();
        if (!requestData.lessonName) throw new Error("Vui lòng chọn tên bài dạy.");

        const context = await buildPresentationContext(requestData);
        const prompt = buildPresentationPrompt(context, requestData);
        const promptBox = document.getElementById("slide-prompt-preview");
        if (promptBox) promptBox.value = prompt;

        const generated = await callPresentationAI(context, requestData);
        currentPresentation = normalizePresentation(generated, requestData);

        const errors = validatePresentation(currentPresentation);
        if (errors.length > 0) {
            throw new Error(errors.join(" "));
        }

        renderPresentationEditor();
        document.getElementById("btn-export-pptx").disabled = false;
        document.getElementById("btn-add-slide").disabled = false;
        showSlidesMessage(`Đã tạo ${currentPresentation.slides.length} trang chiếu. Có thể chỉnh sửa trực tiếp trước khi xuất PowerPoint.`, "success");
    } catch (error) {
        console.error("Presentation generation error:", error);
        showSlidesMessage(`Không thể tạo bài giảng: ${error.message}`, "error");
    } finally {
        stopSlidesTimer();
        if (loading) loading.style.display = "none";
        if (generateButton) {
            generateButton.disabled = false;
            generateButton.textContent = "✨ AI tạo bài giảng";
        }
    }
}

function getSlideTypeOptions(selectedType) {
    return SLIDE_TYPES.map(([value, label]) =>
        `<option value="${value}" ${selectedType === value ? "selected" : ""}>${label}</option>`
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
            <div class="form-group meta-overview">
                <label>Mô tả chung</label>
                <textarea rows="2" oninput="updatePresentationMeta('overview', this.value)">${escapeSlidesHTML(currentPresentation.presentation.overview)}</textarea>
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
                        <select onchange="updateSlideField(${index}, 'type', this.value)">${getSlideTypeOptions(slide.type)}</select>
                        <label>Phút <input type="number" min="1" max="45" value="${escapeSlidesHTML(slide.minutes)}" onchange="updateSlideField(${index}, 'minutes', Number(this.value))"></label>
                    </div>
                </div>
                <div class="slide-order-actions">
                    <button type="button" title="Đưa lên" onclick="moveSlide(${index}, -1)" ${index === 0 ? "disabled" : ""}>↑</button>
                    <button type="button" title="Đưa xuống" onclick="moveSlide(${index}, 1)" ${index === currentPresentation.slides.length - 1 ? "disabled" : ""}>↓</button>
                    <button type="button" title="Nhân bản" onclick="duplicateSlide(${index})">⧉</button>
                    <button type="button" class="danger-small" title="Xóa" onclick="deleteSlide(${index})">×</button>
                </div>
            </div>

            <div class="slide-editor-grid">
                <div class="form-group slide-main-content">
                    <label>Nội dung trên trang <small>(mỗi dòng là một ý)</small></label>
                    <textarea rows="7" oninput="updateSlideContent(${index}, this.value)">${escapeSlidesHTML(slide.content.join("\n"))}</textarea>
                </div>
                <div class="form-group">
                    <label>Mục tiêu của trang</label>
                    <textarea rows="3" oninput="updateSlideField(${index}, 'learningGoal', this.value)">${escapeSlidesHTML(slide.learningGoal)}</textarea>
                </div>
                <div class="form-group">
                    <label>Gợi ý hình ảnh</label>
                    <textarea rows="3" oninput="updateNestedSlideField(${index}, 'visual', 'prompt', this.value)">${escapeSlidesHTML(slide.visual.prompt)}</textarea>
                </div>
                <div class="form-group">
                    <label>Câu hỏi / tương tác</label>
                    <textarea rows="3" oninput="updateNestedSlideField(${index}, 'interaction', 'question', this.value)">${escapeSlidesHTML(slide.interaction.question)}</textarea>
                </div>
                <div class="form-group">
                    <label>Phương án trả lời <small>(mỗi dòng một phương án)</small></label>
                    <textarea rows="3" oninput="updateSlideOptions(${index}, this.value)">${escapeSlidesHTML(optionText)}</textarea>
                </div>
                <div class="form-group">
                    <label>Đáp án / kết quả mong đợi</label>
                    <textarea rows="3" oninput="updateNestedSlideField(${index}, 'interaction', 'answer', this.value)">${escapeSlidesHTML(slide.interaction.answer)}</textarea>
                </div>
                <div class="form-group slide-main-content">
                    <label>Ghi chú giáo viên</label>
                    <textarea rows="4" oninput="updateSlideField(${index}, 'teacherNotes', this.value)">${escapeSlidesHTML(slide.teacherNotes)}</textarea>
                </div>
                <div class="form-group">
                    <label>Câu chuyển tiếp</label>
                    <textarea rows="2" oninput="updateSlideField(${index}, 'transition', this.value)">${escapeSlidesHTML(slide.transition)}</textarea>
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
    updatePresentationSummaryOnly();
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

function updatePresentationSummaryOnly() {
    if (!currentPresentation) return;
    const summary = document.getElementById("presentation-summary");
    const totalMinutes = currentPresentation.slides.reduce((total, slide) => total + (Number(slide.minutes) || 0), 0);
    if (summary) summary.textContent = `${currentPresentation.slides.length} trang • khoảng ${totalMinutes} phút • có thể chỉnh sửa trực tiếp`;
}

function moveSlide(index, direction) {
    if (!currentPresentation) return;
    const target = index + direction;
    if (target < 0 || target >= currentPresentation.slides.length) return;
    [currentPresentation.slides[index], currentPresentation.slides[target]] = [currentPresentation.slides[target], currentPresentation.slides[index]];
    renderPresentationEditor();
}

function duplicateSlide(index) {
    if (!currentPresentation?.slides?.[index]) return;
    const clone = JSON.parse(JSON.stringify(currentPresentation.slides[index]));
    clone.id = `slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    clone.title = `${clone.title} (bản sao)`;
    currentPresentation.slides.splice(index + 1, 0, clone);
    renderPresentationEditor();
}

function deleteSlide(index) {
    if (!currentPresentation?.slides?.[index]) return;
    if (!confirm(`Xóa trang ${index + 1}: ${currentPresentation.slides[index].title}?`)) return;
    currentPresentation.slides.splice(index, 1);
    renderPresentationEditor();
}

function addBlankSlide() {
    if (!currentPresentation) {
        showSlidesMessage("Hãy tạo hoặc mở một bài giảng trước khi thêm trang.", "error");
        return;
    }

    currentPresentation.slides.push({
        id: `slide-${Date.now()}`,
        type: "content",
        title: "Trang mới",
        minutes: 3,
        learningGoal: "",
        content: ["Nhập nội dung tại đây"],
        visual: { kind: "minh họa", prompt: "", caption: "" },
        interaction: { instruction: "", question: "", options: [], answer: "" },
        teacherNotes: "",
        transition: ""
    });
    renderPresentationEditor();
}

function savePresentationDraft() {
    if (!currentPresentation) {
        showSlidesMessage("Chưa có bài giảng để lưu.", "error");
        return;
    }
    localStorage.setItem("khbd_presentation_draft", JSON.stringify(currentPresentation));
    showSlidesMessage("Đã lưu bản nháp bài giảng trên trình duyệt này.", "success");
}

function loadPresentationDraft() {
    const saved = localStorage.getItem("khbd_presentation_draft");
    if (!saved) return;
    try {
        currentPresentation = JSON.parse(saved);
        if (validatePresentation(currentPresentation).length === 0) {
            renderPresentationEditor();
            document.getElementById("btn-export-pptx").disabled = false;
            document.getElementById("btn-add-slide").disabled = false;
        }
    } catch (error) {
        console.warn("Không thể nạp bản nháp bài giảng:", error);
    }
}

function initializeSlidesFeature() {
    if (typeof updateSlideLessonOptions === "function") updateSlideLessonOptions();
    loadPresentationDraft();
}

window.addEventListener("DOMContentLoaded", initializeSlidesFeature);
