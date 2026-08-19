// ============================================================
// canva-integration.js - TỰ ĐỘNG XUẤT ĐÚNG ĐỊNH DẠNG VÀ ĐẨY DỮ LIỆU SANG CANVA AI
// ============================================================

/**
 * 1. Xuất tệp CSV tương thích hoàn toàn với Canva "Tạo hàng loạt" (Bulk Create)
 */
function exportCanvaBulkCSV() {
    const data = typeof getCurrentPresentation === "function" ? getCurrentPresentation() : null;
    if (!data?.slides?.length) {
        alert("Chưa có bài giảng để đẩy sang Canva.");
        return;
    }

    // Tiêu đề các biến khớp với khung Placeholder thiết kế của Canva
    let csvContent = "\uFEFFSlide_Number,Slide_Title,Slide_Content,Question,Options,Answer,Visual_Prompt\n";

    data.slides.forEach((slide, index) => {
        const slideNum = index + 1;
        const title = `"${(slide.title || "").replace(/"/g, '""')}"`;
        const content = `"${(slide.content || []).join(" | ").replace(/"/g, '""')}"`;
        const question = `"${(slide.interaction?.question || "").replace(/"/g, '""')}"`;
        const options = `"${(slide.interaction?.options || []).join(" | ").replace(/"/g, '""')}"`;
        const answer = `"${(slide.interaction?.answer || "").replace(/"/g, '""')}"`;
        const visual = `"${(slide.visual?.prompt || "").replace(/"/g, '""')}"`;

        csvContent += `${slideNum},${title},${content},${question},${options},${answer},${visual}\n`;
    });

    // Tải tệp CSV về máy
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const fileName = `Canva_Bulk_${sanitizePresentationFileName(data.presentation?.title)}.csv`;
    saveAs(blob, fileName);

    // Mở ngay công cụ Canva AI Presentation
    openCanvaAIPresentation();
}

/**
 * 2. Tự động mở Canva AI Magic Design cho Bài giảng
 */
function openCanvaAIPresentation() {
    // URL trực tiếp mở trình tạo bài giảng tự động của Canva
    const canvaIntentUrl = "[https://www.canva.com/create/presentations/](https://www.canva.com/create/presentations/)";
    window.open(canvaIntentUrl, "_blank");
}