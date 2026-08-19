// ============================================================
// canva-integration.js - SỬA LỖI MỞ URL CANVA VÀ XUẤT CSV TẠO HÀNG LOẠT
// ============================================================

/**
 * 1. Mở chính xác giao diện thiết kế bài giảng của Canva[cite: 26]
 */
function openCanvaAIPresentation() {
    // Sửa URL mở trực tiếp mẫu Presentation trên Canva[cite: 26]
    const canvaDirectUrl = "https://www.canva.com/presentations/templates/";
    window.open(canvaDirectUrl, "_blank");
}

/**
 * 2. Tự động đóng gói nội dung slide thành CSV tương thích với Canva Bulk Create
 */
function exportCanvaBulkCSV() {
    const data = typeof getCurrentPresentation === "function" ? getCurrentPresentation() : null;
    if (!data?.slides?.length) {
        alert("Chưa có bài giảng để xuất sang Canva.");
        return;
    }

    // Tiêu đề cột dùng cho Canva Bulk Create
    let csvContent = "\uFEFFSlide_Number,Slide_Title,Slide_Content,Question,Options,Answer,SGK_Source\n";

    data.slides.forEach((slide, index) => {
        const slideNum = index + 1;
        const title = `"${(slide.title || "").replace(/"/g, '""')}"`;
        const content = `"${(slide.content || []).join(" | ").replace(/"/g, '""')}"`;
        const question = `"${(slide.interaction?.question || "").replace(/"/g, '""')}"`;
        const options = `"${(slide.interaction?.options || []).join(" | ").replace(/"/g, '""')}"`;
        const answer = `"${(slide.interaction?.answer || "").replace(/"/g, '""')}"`;
        const citation = `"${(slide.sgkCitation || "").replace(/"/g, '""')}"`;

        csvContent += `${slideNum},${title},${content},${question},${options},${answer},${citation}\n`;
    });

    // Tạo file CSV và tải về máy
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const fileName = `Canva_Data_${sanitizePresentationFileName(data.presentation?.title)}.csv`;
    saveAs(blob, fileName);

    // Mở trang Canva
    openCanvaAIPresentation();
}