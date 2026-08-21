// ============================================================
// pptx-export.js - XUẤT POWERPOINT ĐỒ HỌA THẬT (TÁCH BIỆT TYPE & LAYOUT)
// Thư viện hỗ trợ: PptxGenJS
// ============================================================

const PRESENTATION_THEMES = {
    education: {
        background: "F7FAFC",
        title: "173B6C",
        accent: "2B6CB0",
        accentSoft: "E6F0FA",
        text: "1F2937",
        muted: "5F6B7A",
        white: "FFFFFF"
    },
    playful: {
        background: "FFF9F0",
        title: "7A3E00",
        accent: "F28C28",
        accentSoft: "FFE7C2",
        text: "3F2A1D",
        muted: "765C4B",
        white: "FFFFFF"
    },
    minimal: {
        background: "FFFFFF",
        title: "111827",
        accent: "4B5563",
        accentSoft: "F3F4F6",
        text: "1F2937",
        muted: "6B7280",
        white: "FFFFFF"
    },
    dark: {
        background: "0F172A",
        title: "F8FAFC",
        accent: "38BDF8",
        accentSoft: "172554",
        text: "E2E8F0",
        muted: "94A3B8",
        white: "FFFFFF"
    }
};

function getPresentationTheme(themeName) {
    return PRESENTATION_THEMES[themeName] || PRESENTATION_THEMES.education;
}

function sanitizePresentationFileName(value) {
    return String(value || "bai-giang")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 80) || "bai-giang";
}

// Sửa lỗi ở đây: Sử dụng pptx.ShapeType thay vì các hằng số không xác định
function addPptxFooter(slide, pptx, slideNumber, totalSlides, theme) {
    slide.addShape(pptx.ShapeType.line, {
        x: 0.55, y: 7.12, w: 12.2, h: 0,
        line: { color: theme.accent, transparency: 60, width: 1 }
    });
    slide.addText(`AI Tin THCS  •  ${slideNumber}/${totalSlides}`, {
        x: 0.65, y: 7.15, w: 4.5, h: 0.2,
        fontFace: "Arial", fontSize: 8, color: theme.muted, margin: 0
    });
}

function addPptxTitleBar(slide, pptx, title, typeLabel, theme) {
    slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 13.333, h: 0.78,
        line: { color: theme.title, transparency: 100 },
        fill: { color: theme.title }
    });
    slide.addText(title || "Trang chiếu", {
        x: 0.55, y: 0.17, w: 10.2, h: 0.42,
        fontFace: "Arial", fontSize: 22, bold: true,
        color: theme.white, margin: 0, breakLine: false, fit: "shrink"
    });
    slide.addText(typeLabel || "", {
        x: 10.8, y: 0.2, w: 2.0, h: 0.32,
        fontFace: "Arial", fontSize: 10, bold: true,
        color: theme.title, align: "center", valign: "mid",
        fill: { color: theme.white, transparency: 4 },
        radius: 0.08, margin: 0.03, fit: "shrink"
    });
}

// Tự động kiểm tra tràn chữ và chỉnh cỡ phông phù hợp
function addPptxBullets(slide, items, options, theme) {
    const safeItems = (items || []).filter(Boolean).slice(0, 6);
    if (safeItems.length === 0) {
        slide.addText("Nội dung đang được bổ sung.", {
            ...options, fontFace: "Arial", fontSize: 18, italic: true, color: theme.muted, valign: "mid"
        });
        return;
    }

    // Tự động điều chỉnh cỡ chữ tránh tràn khung
    const totalChars = safeItems.join("").length;
    let fontSize = 20;
    if (totalChars > 250 || safeItems.length >= 5) fontSize = 16;
    else if (totalChars > 150) fontSize = 18;

    const lineHeight = options.h / safeItems.length;
    safeItems.forEach((item, index) => {
        slide.addText(String(item), {
            x: options.x,
            y: options.y + index * lineHeight,
            w: options.w,
            h: Math.max(0.42, lineHeight - 0.03),
            fontFace: "Arial",
            fontSize: fontSize,
            color: theme.text,
            bullet: { indent: 18 },
            hanging: 4,
            margin: 0.04,
            breakLine: false,
            valign: "mid",
            fit: "shrink"
        });
    });
}

// ============================================================
// BỐ CỤC THIẾT KẾ ĐỒ HỌA THẬT (NO PLACEHOLDERS)
// ============================================================

// 1. Title Hero Layout
function addTitlePptxSlide(slide, pptx, presentation, slideData, index, totalSlides, theme) {
    slide.background = { color: theme.background };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.34, h: 7.5, fill: { color: theme.accent } });
    slide.addText(slideData.title || presentation.title, {
        x: 0.95, y: 1.5, w: 11.2, h: 1.6,
        fontFace: "Arial", fontSize: 34, bold: true, color: theme.title, fit: "shrink"
    });
    slide.addText(presentation.subtitle || `Tin học ${presentation.grade || "THCS"}`, {
        x: 0.98, y: 3.2, w: 9.0, h: 0.55,
        fontFace: "Arial", fontSize: 20, color: theme.accent, fit: "shrink"
    });
    slide.addText(`${presentation.book || ""}  •  ${presentation.duration || ""}`, {
        x: 0.98, y: 3.9, w: 9.0, h: 0.4,
        fontFace: "Arial", fontSize: 14, color: theme.muted
    });
    addPptxFooter(slide, pptx, index + 1, totalSlides, theme);
}

// 2. Grid 2x2 Cards Layout (Trắc nghiệm / Luyện tập)
function addQuizPptxSlide(slide, pptx, slideData, index, totalSlides, theme) {
    slide.background = { color: theme.background };
    addPptxTitleBar(slide, pptx, slideData.title, "CÂU HỎI TRẮC NGHIỆM", theme);

    // Chú ý: dùng pptx.ShapeType.roundRect
    slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.1, w: 11.7, h: 1.3,
        fill: { color: theme.accentSoft }, line: { color: theme.accent, width: 1.5 }, rectRadius: 0.1
    });
    slide.addText(slideData.interaction?.question || slideData.title, {
        x: 1.0, y: 1.2, w: 11.3, h: 1.1,
        fontFace: "Arial", fontSize: 18, bold: true, color: theme.title, align: "center", valign: "mid"
    });

    const options = slideData.interaction?.options || [];
    const positions = [
        { x: 0.8, y: 2.7 }, { x: 6.8, y: 2.7 },
        { x: 0.8, y: 4.4 }, { x: 6.8, y: 4.4 }
    ];

    options.slice(0, 4).forEach((opt, idx) => {
        const pos = positions[idx];
        slide.addShape(pptx.ShapeType.roundRect, {
            x: pos.x, y: pos.y, w: 5.7, h: 1.4,
            fill: { color: theme.white }, line: { color: theme.accent, width: 1 }, rectRadius: 0.08
        });
        slide.addText(opt, {
            x: pos.x + 0.2, y: pos.y + 0.1, w: 5.3, h: 1.2,
            fontFace: "Arial", fontSize: 15, color: theme.text, valign: "mid"
        });
    });

    addPptxFooter(slide, pptx, index + 1, totalSlides, theme);
}

// 3. Split 2 Columns Layout (So sánh)
function addComparisonPptxSlide(slide, pptx, slideData, index, totalSlides, theme) {
    slide.background = { color: theme.background };
    addPptxTitleBar(slide, pptx, slideData.title, "SO SÁNH Đối LẬP", theme);

    const mid = Math.ceil((slideData.content || []).length / 2);
    const leftItems = slideData.content.slice(0, mid);
    const rightItems = slideData.content.slice(mid);

    slide.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.2, w: 5.6, h: 5.2, fill: { color: theme.white }, line: { color: theme.accent } });
    addPptxBullets(slide, leftItems, { x: 1.0, y: 1.4, w: 5.2, h: 4.8 }, theme);

    slide.addShape(pptx.ShapeType.roundRect, { x: 6.9, y: 1.2, w: 5.6, h: 5.2, fill: { color: theme.accentSoft }, line: { color: theme.accent } });
    addPptxBullets(slide, rightItems, { x: 7.1, y: 1.4, w: 5.2, h: 4.8 }, theme);

    addPptxFooter(slide, pptx, index + 1, totalSlides, theme);
}

// 4. Timeline Steps Layout (Quy trình / Thực hành phòng máy)
function addTimelinePptxSlide(slide, pptx, slideData, index, totalSlides, theme) {
    slide.background = { color: theme.background };
    addPptxTitleBar(slide, pptx, slideData.title, "QUY TRÌNH THỰC HÀNH", theme);

    const items = (slideData.content || []).slice(0, 4);
    const boxWidth = 2.7;
    const startX = 0.8;
    const gap = 0.3;

    items.forEach((item, idx) => {
        const currentX = startX + idx * (boxWidth + gap);

        slide.addShape(pptx.ShapeType.roundRect, {
            x: currentX, y: 2.2, w: boxWidth, h: 3.8,
            fill: { color: theme.white }, line: { color: theme.accent, width: 1.5 }, rectRadius: 0.1
        });

        slide.addShape(pptx.ShapeType.oval, {
            x: currentX + 0.95, y: 1.6, w: 0.8, h: 0.8,
            fill: { color: theme.accent }, line: { color: theme.white, width: 2 }
        });
        slide.addText(`${idx + 1}`, {
            x: currentX + 0.95, y: 1.6, w: 0.8, h: 0.8,
            fontFace: "Arial", fontSize: 16, bold: true, color: theme.white, align: "center", valign: "mid"
        });

        slide.addText(item, {
            x: currentX + 0.15, y: 2.6, w: boxWidth - 0.3, h: 3.2,
            fontFace: "Arial", fontSize: 14, color: theme.text, align: "center", valign: "mid"
        });
    });

    if (slideData.sgkCitation) {
        slide.addText(`📌 Nguồn SGK: ${slideData.sgkCitation}`, {
            x: 0.8, y: 6.3, w: 11.7, h: 0.4, fontFace: "Arial", fontSize: 11, italic: true, color: theme.muted
        });
    }

    addPptxFooter(slide, pptx, index + 1, totalSlides, theme);
}

// 5. Mindmap Nodes Layout (Sơ đồ tư duy)
function addMindmapPptxSlide(slide, pptx, slideData, index, totalSlides, theme) {
    slide.background = { color: theme.background };
    addPptxTitleBar(slide, pptx, slideData.title, "SƠ ĐỒ TƯ DUY", theme);

    slide.addShape(pptx.ShapeType.oval, {
        x: 4.8, y: 3.0, w: 3.7, h: 1.8,
        fill: { color: theme.accent }, line: { color: theme.white, width: 2 }
    });
    slide.addText(slideData.title, {
        x: 4.9, y: 3.1, w: 3.5, h: 1.6,
        fontFace: "Arial", fontSize: 16, bold: true, color: theme.white, align: "center", valign: "mid"
    });

    const items = (slideData.content || []).slice(0, 4);
    const branchPositions = [
        { x: 0.8, y: 1.5 }, { x: 8.8, y: 1.5 },
        { x: 0.8, y: 4.8 }, { x: 8.8, y: 4.8 }
    ];

    items.forEach((item, idx) => {
        const pos = branchPositions[idx];
        slide.addShape(pptx.ShapeType.roundRect, {
            x: pos.x, y: pos.y, w: 3.7, h: 1.4,
            fill: { color: theme.accentSoft }, line: { color: theme.accent, width: 1 }
        });
        slide.addText(item, {
            x: pos.x + 0.1, y: pos.y + 0.1, w: 3.5, h: 1.2,
            fontFace: "Arial", fontSize: 13, color: theme.title, align: "center", valign: "mid"
        });
    });

    addPptxFooter(slide, pptx, index + 1, totalSlides, theme);
}

// 6. Big Stat Layout (Từ khóa trọng tâm)
function addBigStatPptxSlide(slide, pptx, slideData, index, totalSlides, theme) {
    slide.background = { color: theme.background };
    addPptxTitleBar(slide, pptx, slideData.title, "GHI NHỚ TRỌNG TÂM", theme);

    slide.addShape(pptx.ShapeType.roundRect, {
        x: 1.5, y: 1.5, w: 10.3, h: 4.5,
        fill: { color: theme.accentSoft }, line: { color: theme.accent, width: 2 }
    });

    const mainText = slideData.content.join("\n") || slideData.learningGoal || "";
    slide.addText(mainText, {
        x: 1.8, y: 1.8, w: 9.7, h: 3.9,
        fontFace: "Arial", fontSize: 24, bold: true, color: theme.title, align: "center", valign: "mid"
    });

    addPptxFooter(slide, pptx, index + 1, totalSlides, theme);
}

// 7. Standard Text Layout
function addStandardPptxSlide(slide, pptx, slideData, index, totalSlides, theme) {
    slide.background = { color: theme.background };
    addPptxTitleBar(slide, pptx, slideData.title, "KIẾN THỨC BÀI HỌC", theme);

    slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.2, w: 11.7, h: 5.2,
        fill: { color: theme.white }, line: { color: theme.accent, width: 1 }
    });

    addPptxBullets(slide, slideData.content, { x: 1.1, y: 1.4, w: 11.1, h: 4.6 }, theme);

    if (slideData.sgkCitation) {
        slide.addText(`📌 Nguồn SGK: ${slideData.sgkCitation}`, {
            x: 0.8, y: 6.4, w: 11.7, h: 0.3, fontFace: "Arial", fontSize: 10, italic: true, color: theme.muted
        });
    }

    addPptxFooter(slide, pptx, index + 1, totalSlides, theme);
}

// Bộ điều hướng Layout động
function renderSmartSlide(slide, pptx, presentation, slideData, index, totalSlides, theme) {
    switch (slideData.layout) {
        case "title_hero":
            addTitlePptxSlide(slide, pptx, presentation, slideData, index, totalSlides, theme);
            break;
        case "grid_2x2_cards":
            addQuizPptxSlide(slide, pptx, slideData, index, totalSlides, theme);
            break;
        case "split_2col":
            addComparisonPptxSlide(slide, pptx, slideData, index, totalSlides, theme);
            break;
        case "timeline_steps":
            addTimelinePptxSlide(slide, pptx, slideData, index, totalSlides, theme);
            break;
        case "mindmap_nodes":
            addMindmapPptxSlide(slide, pptx, slideData, index, totalSlides, theme);
            break;
        case "big_stat":
            addBigStatPptxSlide(slide, pptx, slideData, index, totalSlides, theme);
            break;
        default:
            addStandardPptxSlide(slide, pptx, slideData, index, totalSlides, theme);
    }
}

function buildSpeakerNotes(slideData) {
    const notes = [
        slideData.learningGoal ? `Mục tiêu trang: ${slideData.learningGoal}` : "",
        slideData.interaction?.question ? `Tương tác: ${slideData.interaction.question}` : "",
        slideData.interaction?.answer ? `Đáp án: ${slideData.interaction.answer}` : "",
        slideData.teacherNotes ? `Ghi chú giảng dạy: ${slideData.teacherNotes}` : ""
    ].filter(Boolean);
    return notes.join("\n\n");
}

async function exportPresentationPptx() {
    const data = typeof getCurrentPresentation === "function" ? getCurrentPresentation() : null;
    if (!data?.slides?.length) {
        alert("Chưa có bài giảng để xuất PowerPoint.");
        return;
    }

    // Tự động kiểm tra chất lượng trước khi cho xuất
    if (typeof validatePresentationFull === "function") {
        const errors = validatePresentationFull(data);
        if (errors.length > 0) {
            alert("⚠️ Chưa thể xuất file! Vui lòng khắc phục các lỗi sau:\n\n- " + errors.join("\n- "));
            return;
        }
    }

    const PptxConstructor = typeof pptxgen !== "undefined" ? pptxgen : (typeof PptxGenJS !== "undefined" ? PptxGenJS : null);
    if (!PptxConstructor) {
        alert("Chưa tải được thư viện PptxGenJS. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.");
        return;
    }

    const button = document.getElementById("btn-export-pptx");
    if (button) {
        button.disabled = true;
        button.textContent = "⏳ Đang tạo PowerPoint...";
    }

    try {
        const pptx = new PptxConstructor();
        pptx.layout = "LAYOUT_WIDE";
        pptx.author = "AI Tin THCS";
        pptx.title = data.presentation?.title || "Bài giảng";

        const theme = getPresentationTheme(data.presentation?.theme);
        const totalSlides = data.slides.length;

        data.slides.forEach((slideData, index) => {
            const slide = pptx.addSlide();
            renderSmartSlide(slide, pptx, data.presentation, slideData, index, totalSlides, theme);
            
            const notes = buildSpeakerNotes(slideData);
            if (notes && typeof slide.addNotes === "function") {
                slide.addNotes(notes);
            }
        });

        const fileName = `${sanitizePresentationFileName(data.presentation?.title)}.pptx`;
        await pptx.writeFile({ fileName });
    } catch (error) {
        console.error("PPTX export error:", error);
        alert(`Không thể xuất PowerPoint: ${error.message}`);
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "⬇️ Xuất PowerPoint";
        }
    }
}
