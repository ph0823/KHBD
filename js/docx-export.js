// Biên dịch JSON thành File Word chuẩn 5512 và Form mẫu


// Đã cập nhật Cỡ chữ 12pt & In đậm tiêu đề Phụ lục
// ============================================================

async function exportWord() {
    if (!currentKHBD) return;

    const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } = docx;

    // Font size chuẩn: 12pt = 24 (half-points trong docx JS)
    const FONT_NAME = "Times New Roman";
    const FONT_SIZE_BODY = 24; // 12pt
    const FONT_SIZE_TITLE = 30; // 15pt

    // Hàm hỗ trợ tạo ô trong Bảng với cỡ chữ 12pt
    const createCell = (text, isBold = false) => {
        return new TableCell({
            children: [new Paragraph({
                children: [new TextRun({ text: String(text || ""), bold: isBold, size: FONT_SIZE_BODY, font: FONT_NAME })],
                spacing: { before: 60, after: 60, line: 276 }
            })],
            width: { size: 100, type: WidthType.AUTO },
            margins: { top: 100, bottom: 100, left: 120, right: 120 }
        });
    };

    let docChildren = [
        // Tiêu đề bài học
        new Paragraph({
            children: [
                new TextRun({ text: `CHỦ ĐỀ/BÀI: ${currentKHBD.lesson.title.toUpperCase()}`, bold: true, size: FONT_SIZE_TITLE, font: FONT_NAME })
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 150 }
        }),
        new Paragraph({
            children: [
                new TextRun({ text: `Thời gian thực hiện: ${currentKHBD.lesson.duration || "2 tiết"}`, italics: true, size: FONT_SIZE_BODY, font: FONT_NAME })
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 300 }
        }),

        // I. MỤC TIÊU
        new Paragraph({ children: [new TextRun({ text: "I. MỤC TIÊU", bold: true, size: 26, font: FONT_NAME })], spacing: { before: 200, after: 100 } }),
        
        new Paragraph({ children: [new TextRun({ text: "1. Kiến thức:", bold: true, size: FONT_SIZE_BODY, font: FONT_NAME })], spacing: { before: 80 } }),
        ...(currentKHBD.objectives.knowledge || []).map(k => new Paragraph({ children: [new TextRun({ text: `- ${k}`, size: FONT_SIZE_BODY, font: FONT_NAME })] })),
        
        new Paragraph({ children: [new TextRun({ text: "2. Năng lực:", bold: true, size: FONT_SIZE_BODY, font: FONT_NAME })], spacing: { before: 120 } }),
        
        new Paragraph({ children: [new TextRun({ text: "a) Năng lực chung:", bold: true, size: FONT_SIZE_BODY, font: FONT_NAME })] }),
        ...(currentKHBD.objectives.generalCompetencies || []).map(c => new Paragraph({ children: [new TextRun({ text: `- ${c}`, size: FONT_SIZE_BODY, font: FONT_NAME })] })),
        
        new Paragraph({ children: [new TextRun({ text: "b) Năng lực Tin học:", bold: true, size: FONT_SIZE_BODY, font: FONT_NAME })] }),
        ...(currentKHBD.objectives.informaticsCompetencies || []).map(c => new Paragraph({ children: [new TextRun({ text: `- ${c}`, size: FONT_SIZE_BODY, font: FONT_NAME })] })),
        
        ...(currentKHBD.objectives.digitalCompetencies?.length > 0 ? [
            new Paragraph({ children: [new TextRun({ text: "c) Năng lực số:", bold: true, size: FONT_SIZE_BODY, font: FONT_NAME })] }),
            ...currentKHBD.objectives.digitalCompetencies.map(dc => new Paragraph({ children: [new TextRun({ text: `- ${dc.code || ""}: ${dc.expression || ""}`, size: FONT_SIZE_BODY, font: FONT_NAME })] }))
        ] : []),
        
        ...(currentKHBD.objectives.aiCompetencies?.length > 0 ? [
            new Paragraph({ children: [new TextRun({ text: "d) Năng lực AI:", bold: true, size: FONT_SIZE_BODY, font: FONT_NAME })] }),
            ...currentKHBD.objectives.aiCompetencies.map(ai => new Paragraph({ children: [new TextRun({ text: `- ${ai.code || ""}: ${ai.expression || ""}`, size: FONT_SIZE_BODY, font: FONT_NAME })] }))
        ] : []),

        new Paragraph({ children: [new TextRun({ text: "3. Phẩm chất:", bold: true, size: FONT_SIZE_BODY, font: FONT_NAME })], spacing: { before: 120 } }),
        ...(currentKHBD.objectives.qualities || []).map(q => new Paragraph({ children: [new TextRun({ text: `- ${q}`, size: FONT_SIZE_BODY, font: FONT_NAME })] }))
    ];

    // Bảng Định hướng Năng lực số 
    if (currentKHBD.objectives.digitalCompetencies?.length > 0) {
        docChildren.push(new Paragraph({ children: [new TextRun({ text: "4. Định hướng năng lực số:", bold: true, size: FONT_SIZE_BODY, font: FONT_NAME })], spacing: { before: 200, after: 100 } }));
        docChildren.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({ children: [createCell("Mã", true), createCell("Biểu hiện cụ thể", true), createCell("Hoạt động", true), createCell("Sản phẩm", true), createCell("Đánh giá", true)] }),
                ...currentKHBD.objectives.digitalCompetencies.map(dc => new TableRow({
                    children: [createCell(dc.code), createCell(dc.expression), createCell(dc.activity), createCell(dc.product), createCell(dc.assessment)]
                }))
            ]
        }));
    }

    // Bảng Năng lực AI
    if (currentKHBD.objectives.aiCompetencies?.length > 0) {
        docChildren.push(new Paragraph({ children: [new TextRun({ text: "5. Năng lực AI tích hợp (Quyết định 3439/QĐ-BGDĐT):", bold: true, size: FONT_SIZE_BODY, font: FONT_NAME })], spacing: { before: 200, after: 100 } }));
        docChildren.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({ children: [createCell("Mã chỉ báo", true), createCell("Biểu hiện cụ thể", true), createCell("Hoạt động hình thành", true), createCell("Sản phẩm minh chứng", true), createCell("Đánh giá", true)] }),
                ...currentKHBD.objectives.aiCompetencies.map(ai => new TableRow({
                    children: [createCell(ai.code), createCell(ai.expression), createCell(ai.activity), createCell(ai.product), createCell(ai.assessment)]
                }))
            ]
        }));
    }

    // II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
    docChildren.push(new Paragraph({ children: [new TextRun({ text: "II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU", bold: true, size: 26, font: FONT_NAME })], spacing: { before: 300, after: 100 } }));
    if (currentKHBD.equipment?.length > 0) {
        docChildren.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({ children: [createCell("Đối tượng", true), createCell("Thiết bị, học liệu", true), createCell("Mục đích sử dụng", true)] }),
                ...currentKHBD.equipment.map(eq => new TableRow({
                    children: [createCell(eq.target), createCell(eq.items), createCell(eq.purpose)]
                }))
            ]
        }));
    }

    // III. TIẾN TRÌNH DẠY HỌC
    docChildren.push(new Paragraph({ children: [new TextRun({ text: "III. TIẾN TRÌNH DẠY HỌC", bold: true, size: 26, font: FONT_NAME })], spacing: { before: 300, after: 100 } }));
    
    if (currentKHBD.periods) {
        currentKHBD.periods.forEach(period => {
            if (currentKHBD.periods.length > 1) {
                docChildren.push(new Paragraph({ 
                    children: [new TextRun({ text: period.periodName, bold: true, size: FONT_SIZE_BODY, font: FONT_NAME })], 
                    spacing: { before: 200, after: 100 } 
                }));
            }

            if (period.activities) {
                period.activities.forEach((act) => {
                    if (act.name && act.name.includes("2.1")) {
                        docChildren.push(new Paragraph({ 
                            children: [new TextRun({ text: "Hoạt động 2: Hình thành kiến thức mới", bold: true, size: FONT_SIZE_BODY, font: FONT_NAME })], 
                            spacing: { before: 200, after: 100 } 
                        }));
                    }
                    
                    docChildren.push(
                        new Paragraph({ children: [new TextRun({ text: act.name, bold: true, size: FONT_SIZE_BODY, font: FONT_NAME })], spacing: { before: 150, after: 80 } }),
                        new Paragraph({ children: [new TextRun({ text: "a) Mục tiêu: ", bold: true, size: FONT_SIZE_BODY, font: FONT_NAME }), new TextRun({ text: (act.objectives || []).join("; "), size: FONT_SIZE_BODY, font: FONT_NAME })] }),
                        new Paragraph({ children: [new TextRun({ text: "b) Nội dung: ", bold: true, size: FONT_SIZE_BODY, font: FONT_NAME }), new TextRun({ text: act.content || "", size: FONT_SIZE_BODY, font: FONT_NAME })] }),
                        new Paragraph({ children: [new TextRun({ text: "c) Sản phẩm: ", bold: true, size: FONT_SIZE_BODY, font: FONT_NAME }), new TextRun({ text: act.products || "", size: FONT_SIZE_BODY, font: FONT_NAME })] }),
                        new Paragraph({ children: [new TextRun({ text: "d) Tổ chức thực hiện:", bold: true, size: FONT_SIZE_BODY, font: FONT_NAME })] }),
                        
                        new Paragraph({ children: [new TextRun({ text: `- ${act.organization?.transfer || ""}`, size: FONT_SIZE_BODY, font: FONT_NAME })], indent: { left: 360 } }),
                        new Paragraph({ children: [new TextRun({ text: `- ${act.organization?.execute || ""}`, size: FONT_SIZE_BODY, font: FONT_NAME })], indent: { left: 360 } }),
                        new Paragraph({ children: [new TextRun({ text: `- ${act.organization?.report || ""}`, size: FONT_SIZE_BODY, font: FONT_NAME })], indent: { left: 360 } }),
                        new Paragraph({ children: [new TextRun({ text: `- ${act.organization?.conclude || ""}`, size: FONT_SIZE_BODY, font: FONT_NAME })], indent: { left: 360 }, spacing: { after: 150 } })
                    );
                });
            }
        });
    }

    // PHỤ LỤC (Xử lý cỡ chữ 12pt, In đậm mục lớn và giữ các dòng chấm)
    if (currentKHBD.appendix?.length > 0) {
        docChildren.push(new Paragraph({ 
            children: [new TextRun({ text: "PHỤ LỤC: PHIẾU HỌC TẬP VÀ ĐÁP ÁN", bold: true, size: 26, font: FONT_NAME })], 
            pageBreakBefore: true, spacing: { before: 200, after: 150 } 
        }));

        currentKHBD.appendix.forEach(app => {
            docChildren.push(new Paragraph({ 
                children: [new TextRun({ text: app.title, bold: true, size: FONT_SIZE_BODY, font: FONT_NAME })], 
                spacing: { before: 200, after: 100 } 
            }));
            
            let contentText = app.content || "";
            let lines = contentText.split('\n');
            
            lines.forEach(line => {
                let trimmed = line.trim();
                if(trimmed !== "") {
                    // Tự động kiểm tra tiêu đề mục lớn để IN ĐẬM (PHẦN I, PHẦN II, PHẦN III, HƯỚNG DẪN CHẤM...)
                    let isSectionHeader = /^(PHẦN\s+[I|V|X]+|HƯỚNG\s+DẪN\s+CHẤM|ĐÁP\s+ÁN)/i.test(trimmed);

                    docChildren.push(new Paragraph({ 
                        children: [new TextRun({ text: trimmed, bold: isSectionHeader, size: FONT_SIZE_BODY, font: FONT_NAME })], 
                        spacing: { after: 80 } 
                    }));
                }
            });
        });
    }

    const doc = new Document({ sections: [{ children: docChildren }] });

    Packer.toBlob(doc).then(blob => {
        const fileName = getStandardFileName(currentKHBD.lesson);
        saveAs(blob, fileName);
    });
}

// Hàm xử lý loại bỏ dấu tiếng Việt và chuẩn hóa tên file xuất
function getStandardFileName(lesson) {
    // 1. Trích xuất số lớp (Ví dụ: "7", "Lớp 7" -> "7")
    const gradeNum = (lesson.grade || "7").replace(/[^0-9]/g, '') || "7";
    
    // 2. Bỏ dấu tiếng Việt và các ký tự đặc biệt (dấu hai chấm, gạch ngang...)
    let cleanTitle = (lesson.title || "Bai Hoc")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d").replace(/Đ/g, "D")
        .replace(/[^a-zA-Z0-9\s]/g, " ") // Thay thế ký tự đặc biệt bằng khoảng trắng
        .trim();

    // 3. Viết hoa chữ cái đầu mỗi từ và xóa khoảng trắng thừa
    cleanTitle = cleanTitle
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");

    // 4. Viết liền dạng "Bai 1" -> "Bai1"
    cleanTitle = cleanTitle.replace(/Bai\s+(\d+)/i, "Bai$1");

    return `KHBD_Tin ${gradeNum}_${cleanTitle}.docx`;
}