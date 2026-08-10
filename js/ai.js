// Prompt Engineering & API Call

const SYSTEM_PROMPT = `Bạn là chuyên gia sư phạm Tin học, am hiểu Chương trình GDPT 2018 và cấu trúc Kế hoạch bài dạy theo Công văn 5512.
Nhiệm vụ: Tạo KHBD dạng JSON.
Tuyệt đối KHÔNG BỊA kiến thức. Bám sát Context (Sách giáo khoa) được cung cấp.
Bắt buộc trả về đúng định dạng JSON, không có markdown markdown block (\`\`\`json).`;

async function callAI(context, requestData) {
    const apiKey = localStorage.getItem('khbd_api_key');
    const provider = localStorage.getItem('khbd_api_provider');
    
    const userPrompt = `
    Yêu cầu: Tạo KHBD môn Tin học
    - Lớp: ${requestData.grade}
    - Bộ sách: ${requestData.book}
    - Bài học: ${requestData.lessonName}
    - Điều kiện: ${requestData.condition}
    
    NGỮ CẢNH TỪ SÁCH GIÁO KHOA / TÀI LIỆU CỦA GIÁO VIÊN:
    ${context}
    
    YÊU CẦU ĐẦU RA:
    Trả về cấu trúc JSON chứa: lesson, objectives(knowledge, generalCompetencies, informaticsCompetencies, qualities), equipment, activities(đúng 4 hoạt động: Mở đầu, Hình thành kiến thức, Luyện tập, Vận dụng, mỗi hoạt động có mục tiêu, nội dung, sản phẩm, tổ chức thực hiện [chuyển giao, thực hiện, báo cáo, kết luận]), assessment.
    `;

    const endpoint = provider === 'openrouter' 
        ? "https://openrouter.ai/api/v1/chat/completions" 
        : "https://api.openai.com/v1/chat/completions";
        
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: provider === 'openrouter' ? "google/gemini-pro" : "gpt-4o-mini", // Ví dụ
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2 // Giảm ảo giác
        })
    });

    if (!response.ok) throw new Error("Lỗi API AI");
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}