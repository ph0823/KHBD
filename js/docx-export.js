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
        
        new Paragraph({ text: "1. Kiến thức:", bold: true }),
        ...currentKHBD.objectives.knowledge.map(k => new Paragraph({ text: `- ${k}` })),
        
        new Paragraph({ text: "2. Năng lực:", bold: true }),
        new Paragraph({ text: "a. Năng lực chung:", italics: true }),
        ...currentKHBD.objectives.generalCompetencies.map(c => new Paragraph({ text: `- ${c}` })),
        new Paragraph({ text: "b. Năng lực Tin học:", italics: true }),
        ...currentKHBD.objectives.informaticsCompetencies.map(c => new Paragraph({ text: `- ${c}` })),
        
        new Paragraph({ text: "3. Phẩm chất:", bold: true }),
        ...currentKHBD.objectives.qualities.map(q => new Paragraph({ text: `- ${q}` }))
    ];

    // Bảng Định hướng Năng lực số (nếu có)
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
    
    currentKHBD.activities.forEach((act, index) => {
        docChildren.push(
            new Paragraph({ text: `Hoạt động ${index + 1}: ${act.name}`, bold: true, spacing: { before: 200, after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: "a) Mục tiêu: ", bold: true }), new TextRun({ text: act.objectives.join("; ") })] }),
            new Paragraph({ children: [new TextRun({ text: "b) Nội dung: ", bold: true }), new TextRun({ text: act.content })] }),
            new Paragraph({ children: [new TextRun({ text: "c) Sản phẩm: ", bold: true }), new TextRun({ text: act.products })] }),
            new Paragraph({ children: [new TextRun({ text: "d) Tổ chức thực hiện:", bold: true })] }),
            new Paragraph({ text: `- Bước 1 (Chuyển giao): ${act.organization.transfer}`, indent: { left: 720 } }),
            new Paragraph({ text: `- Bước 2 (Thực hiện): ${act.organization.execute}`, indent: { left: 720 } }),
            new Paragraph({ text: `- Bước 3 (Báo cáo): ${act.organization.report}`, indent: { left: 720 } }),
            new Paragraph({ text: `- Bước 4 (Kết luận): ${act.organization.conclude}`, indent: { left: 720 }, spacing: { after: 200 } })
        );
    });

    // PHỤ LỤC (Phiếu học tập)
    if (currentKHBD.appendix && currentKHBD.appendix.length > 0) {
        docChildren.push(new Paragraph({ text: "PHỤ LỤC: PHIẾU HỌC TẬP VÀ ĐÁP ÁN", heading: HeadingLevel.HEADING_2, bold: true, pageBreakBefore: true }));
        currentKHBD.appendix.forEach(app => {
            docChildren.push(
                new Paragraph({ text: app.title, bold: true, spacing: { before: 200, after: 100 } }),
                new Paragraph({ text: app.content, spacing: { after: 200 } })
            );
        });
    }

    const doc = new Document({
        sections: [{ properties: {}, children: docChildren }]
    });

    Packer.toBlob(doc).then(blob => {
        saveAs(blob, `KHBD_TinHoc_${currentKHBD.lesson.title}.docx`);
    });
}