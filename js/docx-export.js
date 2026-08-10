// Biên dịch JSON thành File Word chuẩn 5512

async function exportWord() {
    if (!currentKHBD) return;

    const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell } = docx;

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: `KẾ HOẠCH BÀI DẠY: ${currentKHBD.lesson.title.toUpperCase()}`,
                    heading: HeadingLevel.HEADING_1,
                    alignment: docx.AlignmentType.CENTER,
                }),
                new Paragraph({ text: "I. MỤC TIÊU", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "1. Về kiến thức:", bold: true }),
                ...currentKHBD.objectives.knowledge.map(k => new Paragraph({ text: `- ${k}`, bullet: { level: 0 } })),
                
                new Paragraph({ text: "2. Về năng lực:", bold: true }),
                ...currentKHBD.objectives.informaticsCompetencies.map(c => 
                    new Paragraph({ text: `- Năng lực Tin học (${c.code}): ${c.description}`, bullet: { level: 0 } })
                ),

                new Paragraph({ text: "II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU", heading: HeadingLevel.HEADING_2 }),
                ...currentKHBD.equipment.map(e => new Paragraph({ text: `- ${e}`, bullet: { level: 0 } })),

                new Paragraph({ text: "III. TIẾN TRÌNH DẠY HỌC", heading: HeadingLevel.HEADING_2 }),
                // Duyệt qua 4 hoạt động
                ...currentKHBD.activities.flatMap((act, index) => [
                    new Paragraph({ text: `Hoạt động ${index + 1}: ${act.name}`, heading: HeadingLevel.HEADING_3 }),
                    new Paragraph({ text: `a) Mục tiêu: ${act.objectives.join(", ")}` }),
                    new Paragraph({ text: `b) Nội dung: ${act.content}` }),
                    new Paragraph({ text: `c) Sản phẩm: ${act.products}` }),
                    new Paragraph({ text: `d) Tổ chức thực hiện:`, bold: true }),
                    new Paragraph({ text: `- Chuyển giao: ${act.organization.transfer}` }),
                    new Paragraph({ text: `- Thực hiện: ${act.organization.execute}` }),
                    new Paragraph({ text: `- Báo cáo: ${act.organization.report}` }),
                    new Paragraph({ text: `- Kết luận: ${act.organization.conclude}` })
                ])
            ],
        }]
    });

    Packer.toBlob(doc).then(blob => {
        saveAs(blob, `KHBD_TinHoc_${currentKHBD.lesson.title}.docx`);
    });
}