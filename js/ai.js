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
    
    NGỮ CẢNH TỪ TÀI LIỆU CỦA GIÁO VIÊN:
    ${context}
    
    YÊU CẦU ĐẦU RA:
    Trả về cấu trúc JSON chứa: lesson, objectives, equipment, activities, assessment.
    `;

    // 1. Nếu người dùng chọn GEMINI
    if (provider === 'gemini') {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: SYSTEM_PROMPT + "\n\n" + userPrompt }]
                }],
                generationConfig: {
                    responseMimeType: "application/json", // Bắt buộc AI trả về JSON chuẩn
                    temperature: 0.2
                }
            })
        });

        if (!response.ok) throw new Error("Lỗi API Gemini. Vui lòng kiểm tra lại API Key.");
        const data = await response.json();
        return JSON.parse(data.candidates[0].content.parts[0].text);
    } 
    
    // 2. Nếu người dùng chọn OPENAI hoặc OPENROUTER
    else {
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
                model: provider === 'openrouter' ? "google/gemini-pro" : "gpt-4o-mini",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userPrompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.2
            })
        });

        if (!response.ok) {
            // Đọc chi tiết lỗi từ máy chủ Google trả về
            const errorData = await response.json();
            
            // In lỗi ra màn hình Console (F12) để lập trình viên dễ theo dõi
            console.error("Chi tiết lỗi từ Google API:", errorData);
            
            // Hiển thị lỗi thực tế lên giao diện cho người dùng
            const errorMessage = errorData.error?.message || "Lỗi không xác định từ máy chủ";
            throw new Error(`Google API báo lỗi: ${errorMessage}`);
        }
        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    }
}