// Biên dịch JSON thành File Word chuẩn 5512 và Form mẫu

async function exportWord() {
    if (!currentKHBD) return;

    const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } = docx;

    // Hàm hỗ trợ tạo ô trong bảng (Cell)
    const createCell = (text, isBold = false) => {
        return new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: text, bold: isBold })] })],
            width: { size: 100, type: WidthType.AUTO },
            margins: { top: 100, bottom: 100, left: 100, right: 100 }
        });
    };

    let docChildren = [
        // Tiêu đề bài học
        new Paragraph({
            children: [
                new TextRun({ text: `CHỦ ĐỀ/BÀI: ${currentKHBD.lesson.title.toUpperCase()}`, bold: true, size: 28 })
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 200 }
        }),
        new Paragraph({
            text: `Thời gian thực hiện: ${currentKHBD.lesson.duration || "2 tiết"}`,
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 400 }
        }),

        // I. MỤC TIÊU
        new Paragraph({ text: "I. MỤC TIÊU", heading: HeadingLevel.HEADING_2, bold: true }),
        
        // 1. In đậm các mục Kiến thức, Năng lực, Phẩm chất
        new Paragraph({ children: [new TextRun({ text: "1. Kiến thức:", bold: true })], spacing: { before: 100 } }),
        ...currentKHBD.objectives.knowledge.map(k => new Paragraph({ text: `- ${k}` })),
        
        new Paragraph({ children: [new TextRun({ text: "2. Năng lực:", bold: true })], spacing: { before: 100 } }),
        
        new Paragraph({ children: [new TextRun({ text: "a. Năng lực chung:", bold: true })] }), // Đổi italics thành bold
        ...currentKHBD.objectives.generalCompetencies.map(c => new Paragraph({ text: `- ${c}` })),
        
        new Paragraph({ children: [new TextRun({ text: "b. Năng lực Tin học:", bold: true })] }), // Đổi italics thành bold
        ...currentKHBD.objectives.informaticsCompetencies.map(c => new Paragraph({ text: `- ${c}` })),
        
        ...(currentKHBD.objectives.digitalCompetencies?.length > 0 ? [
            new Paragraph({ children: [new TextRun({ text: "c. Năng lực số:", bold: true })] }), // Đổi italics thành bold
            ...currentKHBD.objectives.digitalCompetencies.map(dc => new Paragraph({ text: `- ${dc.code || ""}: ${dc.expression || ""}` }))
        ] : []),
        
        ...(currentKHBD.objectives.aiCompetencies?.length > 0 ? [
            new Paragraph({ children: [new TextRun({ text: "d. Năng lực AI:", bold: true })] }), // Đổi italics thành bold
            ...currentKHBD.objectives.aiCompetencies.map(ai => new Paragraph({ text: `- ${ai.code || ""}: ${ai.expression || ""}` }))
        ] : []),

        new Paragraph({ children: [new TextRun({ text: "3. Phẩm chất:", bold: true })], spacing: { before: 100 } }),
        ...currentKHBD.objectives.qualities.map(q => new Paragraph({ text: `- ${q}` }))
    ];

    // Bảng Định hướng Năng lực số 
    if (currentKHBD.objectives.digitalCompetencies && currentKHBD.objectives.digitalCompetencies.length > 0) {
        docChildren.push(new Paragraph({ text: "4. Định hướng năng lực số:", bold: true, spacing: { before: 200, after: 100 } }));
        const digitalTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        createCell("Mã", true), createCell("Biểu hiện cụ thể", true), 
                        createCell("Hoạt động", true), createCell("Sản phẩm", true), createCell("Đánh giá", true)
                    ]
                }),
                ...currentKHBD.objectives.digitalCompetencies.map(dc => new TableRow({
                    children: [
                        createCell(dc.code || ""), createCell(dc.expression || ""), 
                        createCell(dc.activity || ""), createCell(dc.product || ""), createCell(dc.assessment || "")
                    ]
                }))
            ]
        });
        docChildren.push(digitalTable);
    }

    // Bảng Năng lực AI tích hợp
    if (currentKHBD.objectives.aiCompetencies && currentKHBD.objectives.aiCompetencies.length > 0) {
        docChildren.push(new Paragraph({ text: "5. Năng lực AI tích hợp (Quyết định 3439/QĐ-BGDĐT):", bold: true, spacing: { before: 200, after: 100 } }));
        const aiTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        createCell("Mã chỉ báo", true), createCell("Biểu hiện cụ thể của học sinh", true), 
                        createCell("Hoạt động hình thành", true), createCell("Sản phẩm minh chứng", true), createCell("Công cụ và cách đánh giá", true)
                    ]
                }),
                ...currentKHBD.objectives.aiCompetencies.map(ai => new TableRow({
                    children: [
                        createCell(ai.code || ""), createCell(ai.expression || ""), 
                        createCell(ai.activity || ""), createCell(ai.product || ""), createCell(ai.assessment || "")
                    ]
                }))
            ]
        });
        docChildren.push(aiTable);
    }

    // II. THIẾT BỊ DẠY HỌC
    docChildren.push(new Paragraph({ text: "II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU", heading: HeadingLevel.HEADING_2, bold: true, spacing: { before: 400, after: 100 } }));
    if (currentKHBD.equipment && currentKHBD.equipment.length > 0) {
        const eqTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({ children: [createCell("Đối tượng", true), createCell("Thiết bị, học liệu", true), createCell("Mục đích sử dụng", true)] }),
                ...currentKHBD.equipment.map(eq => new TableRow({
                    children: [createCell(eq.target || ""), createCell(eq.items || ""), createCell(eq.purpose || "")]
                }))
            ]
        });
        docChildren.push(eqTable);
    }

    // III. TIẾN TRÌNH DẠY HỌC
    docChildren.push(new Paragraph({ text: "III. TIẾN TRÌNH DẠY HỌC", heading: HeadingLevel.HEADING_2, bold: true, spacing: { before: 400, after: 100 } }));
    
    if (currentKHBD.periods) {
        currentKHBD.periods.forEach(period => {
            // Chỉ thêm Paragraph cho Tên Tiết học nếu bài có nhiều hơn 1 tiết
            if (currentKHBD.periods.length > 1) {
                docChildren.push(
                    new Paragraph({ 
                        children: [new TextRun({ text: period.periodName, bold: true })], 
                        spacing: { before: 300, after: 100 } 
                    })
                );
            }

            // Duyệt qua các hoạt động trong tiết
            if (period.activities) {
                period.activities.forEach((act, index) => {
                    // Chèn Paragraph tiêu đề Hoạt động 2 vào Word
                    if (act.name && act.name.includes("2.1")) {
                        docChildren.push(
                            new Paragraph({ 
                                children: [new TextRun({ text: "Hoạt động 2: Hình thành kiến thức mới", bold: true })], 
                                spacing: { before: 200, after: 100 } 
                            })
                        );
                    }
                    
                    docChildren.push(
                        // 3. In đậm tên Hoạt động
                        new Paragraph({ 
                            children: [new TextRun({ text: act.name, bold: true })], 
                            spacing: { before: 200, after: 100 } 
                        }),
                        new Paragraph({ children: [new TextRun({ text: "a) Mục tiêu: ", bold: true }), new TextRun({ text: act.objectives.join("; ") })] }),
                        new Paragraph({ children: [new TextRun({ text: "b) Nội dung: ", bold: true }), new TextRun({ text: act.content })] }),
                        new Paragraph({ children: [new TextRun({ text: "c) Sản phẩm: ", bold: true }), new TextRun({ text: act.products })] }),
                        new Paragraph({ children: [new TextRun({ text: "d) Tổ chức thực hiện:", bold: true })] }),
                        
                        // AI tự sinh ra "Bước 1:...", nên chỉ cần gắn nội dung vào Word
                        new Paragraph({ text: `- ${act.organization.transfer}`, indent: { left: 720 } }),
                        new Paragraph({ text: `- ${act.organization.execute}`, indent: { left: 720 } }),
                        new Paragraph({ text: `- ${act.organization.report}`, indent: { left: 720 } }),
                        new Paragraph({ text: `- ${act.organization.conclude}`, indent: { left: 720 }, spacing: { after: 200 } })
                    );
                });
            }
        });
    }

    // PHỤ LỤC (Phiếu học tập)
    if (currentKHBD.appendix && currentKHBD.appendix.length > 0) {
        docChildren.push(new Paragraph({ text: "PHỤ LỤC: PHIẾU HỌC TẬP VÀ ĐÁP ÁN", heading: HeadingLevel.HEADING_2, bold: true, pageBreakBefore: true }));
        currentKHBD.appendix.forEach(app => {
            // 4. In đậm tiêu đề phiếu học tập
            docChildren.push(
                new Paragraph({ 
                    children: [new TextRun({ text: app.title, bold: true })], 
                    spacing: { before: 300, after: 150 } 
                })
            );
            
            // 5. Xử lý xuống dòng cho nội dung phiếu học tập (chia tách bằng \n)
            let contentText = app.content || "";
            let lines = contentText.split('\n');
            
            lines.forEach(line => {
                if(line.trim() !== "") {
                    docChildren.push(new Paragraph({ 
                        text: line, 
                        spacing: { after: 100 } 
                    }));
                }
            });
        });
    }

    const doc = new Document({
        sections: [{ properties: {}, children: docChildren }]
    });

    Packer.toBlob(doc).then(blob => {
        // Tự động tạo tên file chuẩn có dạng: KHBD_Tin 7_Bai1 Thiet Bi Vao Ra.docx
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