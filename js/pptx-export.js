// ============================================================
// pptx-export.js - XUẤT BÀI GIẢNG THÀNH POWERPOINT
// Yêu cầu: PptxGenJS đã được nạp trong index.html
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
        x: 0.55, y: 0.17, w: 10.4, h: 0.42,
        fontFace: "Arial", fontSize: 23, bold: true,
        color: theme.white, margin: 0, breakLine: false, fit: "shrink"
    });
    slide.addText(typeLabel || "", {
        x: 11.15, y: 0.2, w: 1.55, h: 0.32,
        fontFace: "Arial", fontSize: 10, bold: true,
        color: theme.title, align: "center", valign: "mid",
        fill: { color: theme.white, transparency: 4 },
        line: { color: theme.white, transparency: 100 },
        radius: 0.08,
        margin: 0.03,
        fit: "shrink"
    });
}

function addPptxBullets(slide, items, options, theme) {
    const safeItems = (items || []).filter(Boolean).slice(0, 8);
    if (safeItems.length === 0) {
        slide.addText("Nội dung đang được giáo viên bổ sung.", {
            ...options,
            fontFace: "Arial", fontSize: 20, italic: true,
            color: theme.muted, margin: 0.08, valign: "mid"
        });
        return;
    }

    const fontSize = safeItems.length >= 7 ? 17 : safeItems.length >= 5 ? 19 : 21;
    const lineHeight = options.h / safeItems.length;
    safeItems.forEach((item, index) => {
        slide.addText(String(item), {
            x: options.x,
            y: options.y + index * lineHeight,
            w: options.w,
            h: Math.max(0.42, lineHeight - 0.03),
            fontFace: "Arial",
            fontSize,
            color: theme.text,
            bullet: { indent: 18 },
            hanging: 4,
            margin: 0.05,
            breakLine: false,
            valign: "mid",
            fit: "shrink"
        });
    });
}

function addVisualPlaceholder(slide, pptx, visual, theme) {
    slide.addShape(pptx.ShapeType.roundRect, {
        x: 8.75, y: 1.18, w: 3.95, h: 4.75,
        rectRadius: 0.08,
        line: { color: theme.accent, width: 1.5, dash: "dash" },
        fill: { color: theme.accentSoft, transparency: 12 }
    });
    slide.addText("GỢI Ý HÌNH ẢNH", {
        x: 9.15, y: 1.55, w: 3.15, h: 0.38,
        fontFace: "Arial", fontSize: 14, bold: true,
        color: theme.accent, align: "center", margin: 0
    });
    slide.addText(visual?.prompt || "Bổ sung hình minh họa phù hợp nội dung bài học.", {
        x: 9.12, y: 2.05, w: 3.2, h: 2.55,
        fontFace: "Arial", fontSize: 16,
        color: theme.text, align: "center", valign: "mid",
        margin: 0.12, fit: "shrink"
    });
    if (visual?.caption) {
        slide.addText(visual.caption, {
            x: 9.05, y: 5.12, w: 3.35, h: 0.42,
            fontFace: "Arial", fontSize: 10, italic: true,
            color: theme.muted, align: "center", margin: 0.02, fit: "shrink"
        });
    }
}

function getPptxSlideTypeLabel(type) {
    const labels = {
        title: "MỞ ĐẦU",
        objectives: "MỤC TIÊU",
        warmup: "KHỞI ĐỘNG",
        content: "KIẾN THỨC",
        activity: "HOẠT ĐỘNG",
        quiz: "CÂU HỎI NHANH",
        practice: "LUYỆN TẬP",
        application: "VẬN DỤNG",
        summary: "TÓM TẮT",
        mindmap: "SƠ ĐỒ TƯ DUY",
        message: "THÔNG ĐIỆP"
    };
    return labels[type] || "BÀI GIẢNG";
}

function addInteractionBox(slide, pptx, interaction, theme) {
    const question = interaction?.question || interaction?.instruction || "";
    if (!question) return;

    slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.75, y: 5.72, w: 7.55, h: 1.05,
        line: { color: theme.accent, width: 1.2 },
        fill: { color: theme.accentSoft, transparency: 4 }
    });
    slide.addText(question, {
        x: 1.0, y: 5.9, w: 7.05, h: 0.65,
        fontFace: "Arial", fontSize: 16, bold: true,
        color: theme.title, align: "center", valign: "mid",
        margin: 0.04, fit: "shrink"
    });
}

function addStandardPptxSlide(slide, pptx, slideData, index, totalSlides, theme) {
    slide.background = { color: theme.background };
    addPptxTitleBar(slide, pptx, slideData.title, getPptxSlideTypeLabel(slideData.type), theme);

    slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.62, y: 1.12, w: 7.95, h: 4.45,
        line: { color: theme.accent, transparency: 75, width: 1 },
        fill: { color: theme.background, transparency: 0 }
    });

    addPptxBullets(slide, slideData.content, {
        x: 0.93, y: 1.38, w: 7.35, h: 3.92
    }, theme);

    addVisualPlaceholder(slide, pptx, slideData.visual, theme);
    addInteractionBox(slide, pptx, slideData.interaction, theme);
    addPptxFooter(slide, pptx, index + 1, totalSlides, theme);
}

function addTitlePptxSlide(slide, pptx, presentation, slideData, index, totalSlides, theme) {
    slide.background = { color: theme.background };
    slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 13.333, h: 7.5,
        line: { color: theme.background, transparency: 100 },
        fill: { color: theme.background }
    });
    slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 0.34, h: 7.5,
        line: { color: theme.accent, transparency: 100 },
        fill: { color: theme.accent }
    });
    slide.addText(slideData.title || presentation.title, {
        x: 0.95, y: 1.35, w: 8.7, h: 1.55,
        fontFace: "Arial", fontSize: 34, bold: true,
        color: theme.title, margin: 0, fit: "shrink"
    });
    slide.addText(presentation.subtitle || `Tin học ${presentation.grade || "THCS"}`, {
        x: 0.98, y: 3.05, w: 7.4, h: 0.55,
        fontFace: "Arial", fontSize: 20,
        color: theme.accent, margin: 0, fit: "shrink"
    });
    slide.addText(`${presentation.book || ""}  •  ${presentation.duration || ""}`, {
        x: 0.98, y: 3.75, w: 7.4, h: 0.4,
        fontFace: "Arial", fontSize: 14,
        color: theme.muted, margin: 0
    });

    slide.addShape(pptx.ShapeType.roundRect, {
        x: 9.25, y: 1.22, w: 3.0, h: 4.35,
        line: { color: theme.accent, width: 1.6 },
        fill: { color: theme.accentSoft }
    });
    slide.addText(slideData.visual?.prompt || "Hình minh họa chủ đề bài học", {
        x: 9.58, y: 2.1, w: 2.34, h: 2.4,
        fontFace: "Arial", fontSize: 18,
        color: theme.text, align: "center", valign: "mid",
        margin: 0.06, fit: "shrink"
    });
    addPptxFooter(slide, pptx, index + 1, totalSlides, theme);
}

function addMessagePptxSlide(slide, pptx, slideData, index, totalSlides, theme) {
    slide.background = { color: theme.background };
    slide.addShape(pptx.ShapeType.roundRect, {
        x: 1.25, y: 1.18, w: 10.8, h: 4.85,
        line: { color: theme.accent, width: 2 },
        fill: { color: theme.accentSoft, transparency: 5 }
    });
    slide.addText(slideData.title || "Thông điệp", {
        x: 2.0, y: 1.68, w: 9.3, h: 0.7,
        fontFace: "Arial", fontSize: 30, bold: true,
        color: theme.title, align: "center", margin: 0, fit: "shrink"
    });
    slide.addText((slideData.content || []).join("\n"), {
        x: 2.05, y: 2.65, w: 9.2, h: 2.25,
        fontFace: "Arial", fontSize: 24,
        color: theme.text, align: "center", valign: "mid",
        margin: 0.12, breakLine: false, fit: "shrink"
    });
    addPptxFooter(slide, pptx, index + 1, totalSlides, theme);
}

function buildSpeakerNotes(slideData) {
    const notes = [
        slideData.learningGoal ? `Mục tiêu trang: ${slideData.learningGoal}` : "",
        slideData.interaction?.instruction ? `Cách tổ chức: ${slideData.interaction.instruction}` : "",
        slideData.interaction?.answer ? `Đáp án/kết quả mong đợi: ${slideData.interaction.answer}` : "",
        slideData.teacherNotes ? `Ghi chú giáo viên: ${slideData.teacherNotes}` : "",
        slideData.transition ? `Chuyển tiếp: ${slideData.transition}` : "",
        slideData.visual?.prompt ? `Gợi ý hình ảnh: ${slideData.visual.prompt}` : ""
    ].filter(Boolean);
    return notes.join("\n\n");
}

async function exportPresentationPptx() {
    const data = typeof getCurrentPresentation === "function" ? getCurrentPresentation() : null;
    if (!data?.slides?.length) {
        if (typeof showSlidesMessage === "function") {
            showSlidesMessage("Chưa có bài giảng để xuất PowerPoint.", "error");
        } else {
            alert("Chưa có bài giảng để xuất PowerPoint.");
        }
        return;
    }

    const PptxConstructor = typeof pptxgen !== "undefined"
        ? pptxgen
        : (typeof PptxGenJS !== "undefined" ? PptxGenJS : null);

    if (!PptxConstructor) {
        throw new Error("Chưa tải được thư viện PptxGenJS. Hãy kiểm tra kết nối Internet.");
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
        pptx.company = "Giáo viên THCS";
        pptx.subject = data.presentation?.overview || "Bài giảng trình chiếu";
        pptx.title = data.presentation?.title || "Bài giảng";
        pptx.lang = "vi-VN";
        pptx.theme = {
            headFontFace: "Arial",
            bodyFontFace: "Arial",
            lang: "vi-VN"
        };

        const theme = getPresentationTheme(data.presentation?.theme);
        const totalSlides = data.slides.length;

        data.slides.forEach((slideData, index) => {
            const slide = pptx.addSlide();

            if (slideData.type === "title") {
                addTitlePptxSlide(slide, pptx, data.presentation, slideData, index, totalSlides, theme);
            } else if (slideData.type === "message") {
                addMessagePptxSlide(slide, pptx, slideData, index, totalSlides, theme);
            } else {
                addStandardPptxSlide(slide, pptx, slideData, index, totalSlides, theme);
            }

            const notes = buildSpeakerNotes(slideData);
            if (notes && typeof slide.addNotes === "function") {
                slide.addNotes(notes);
            }
        });

        const fileName = `${sanitizePresentationFileName(data.presentation?.title)}.pptx`;
        await pptx.writeFile({ fileName });
        if (typeof showSlidesMessage === "function") {
            showSlidesMessage(`Đã xuất tệp ${fileName}.`, "success");
        }
    } catch (error) {
        console.error("PPTX export error:", error);
        if (typeof showSlidesMessage === "function") {
            showSlidesMessage(`Không thể xuất PowerPoint: ${error.message}`, "error");
        } else {
            alert(`Không thể xuất PowerPoint: ${error.message}`);
        }
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "⬇️ Xuất PowerPoint";
        }
    }
}
