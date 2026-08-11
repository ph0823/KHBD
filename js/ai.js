// ======================================================
// AI ENGINE - KHBD TIN HỌC THCS
// Gemini / OpenAI / OpenRouter
// ======================================================

const SYSTEM_PROMPT = `
Bạn là chuyên gia sư phạm Tin học THCS, am hiểu:

- Chương trình GDPT 2018
- Môn Tin học THCS
- Công văn 5512/BGDĐT-GDTrH
- Thiết kế Kế hoạch bài dạy
- Năng lực chung
- Năng lực Tin học
- Năng lực số
- Dạy học phát triển phẩm chất và năng lực

NHIỆM VỤ:
Tạo Kế hoạch bài dạy môn Tin học THCS dựa trên thông tin
và tài liệu được giáo viên cung cấp.

NGUYÊN TẮC QUAN TRỌNG:

1. Tuyệt đối không bịa kiến thức từ sách giáo khoa.
2. Ưu tiên tuyệt đối nội dung trong CONTEXT được cung cấp.
3. Nếu CONTEXT không có thông tin cần thiết, phải ghi rõ
   thay vì tự tạo nội dung không có căn cứ.
4. Bám sát lớp học, bộ sách và tên bài.
5. Thiết kế phù hợp với điều kiện lớp học.
6. Nếu là phòng máy thì ưu tiên hoạt động thực hành trên máy.
7. KHBD phải có đủ 4 hoạt động:
   - Hoạt động 1: Mở đầu
   - Hoạt động 2: Hình thành kiến thức
   - Hoạt động 3: Luyện tập
   - Hoạt động 4: Vận dụng
8. Các hoạt động phải có mục tiêu, nội dung, sản phẩm
   và tổ chức thực hiện.
9. Không trả về Markdown.
10. Chỉ trả về JSON hợp lệ.
`;


// ======================================================
// HÀM CHUẨN HÓA JSON
// ======================================================

function cleanJSON(text) {

    if (!text) {
        throw new Error("AI không trả về nội dung.");
    }

    let cleaned = text.trim();

    // Loại bỏ markdown code fence nếu AI vẫn trả về
    cleaned = cleaned
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    // Tìm phần JSON đầu tiên nếu AI thêm lời giải thích
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    try {
        return JSON.parse(cleaned);
    } catch (error) {

        console.error("JSON AI trả về không hợp lệ:", cleaned);

        throw new Error(
            "AI trả về JSON không hợp lệ. Hãy thử tạo lại KHBD."
        );
    }
}


// ======================================================
// GEMINI
// ======================================================

async function callGemini(apiKey, prompt) {

    if (!apiKey) {
        throw new Error("Chưa nhập Gemini API Key.");
    }

    const model = "gemini-2.5-flash";

    const endpoint =
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const response = await fetch(endpoint, {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
        },

        body: JSON.stringify({

            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],

            generationConfig: {

                temperature: 0.2,

                responseMimeType: "application/json"

            }

        })

    });

    const data = await response.json();

    if (!response.ok) {

        console.error("Gemini API error:", data);

        const code = data?.error?.code || response.status;

        const message =
            data?.error?.message ||
            "Không xác định";

        throw new Error(
            `Gemini API (${code}): ${message}`
        );
    }

    const text =
        data?.candidates?.[0]?.content?.parts
            ?.map(p => p.text || "")
            .join("");

    if (!text) {

        console.error("Gemini response:", data);

        throw new Error(
            "Gemini không trả về nội dung."
        );
    }

    return cleanJSON(text);
}


// ======================================================
// OPENAI
// ======================================================

async function callOpenAI(apiKey, prompt) {

    if (!apiKey) {
        throw new Error("Chưa nhập OpenAI API Key.");
    }

    const endpoint =
        "https://api.openai.com/v1/chat/completions";

    const response = await fetch(endpoint, {

        method: "POST",

        headers: {

            "Content-Type": "application/json",

            "Authorization":
                `Bearer ${apiKey}`

        },

        body: JSON.stringify({

            model: "gpt-4o-mini",

            messages: [

                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },

                {
                    role: "user",
                    content: prompt
                }

            ],

            response_format: {
                type: "json_object"
            },

            temperature: 0.2

        })

    });

    const data = await response.json();

    if (!response.ok) {

        console.error("OpenAI API error:", data);

        throw new Error(
            `OpenAI API (${response.status}): ` +
            (data?.error?.message || "Lỗi không xác định")
        );
    }

    const text =
        data?.choices?.[0]?.message?.content;

    if (!text) {
        throw new Error(
            "OpenAI không trả về nội dung."
        );
    }

    return cleanJSON(text);
}


// ======================================================
// OPENROUTER
// ======================================================

async function callOpenRouter(apiKey, prompt) {

    if (!apiKey) {
        throw new Error("Chưa nhập OpenRouter API Key.");
    }

    const endpoint =
        "https://openrouter.ai/api/v1/chat/completions";

    const response = await fetch(endpoint, {

        method: "POST",

        headers: {

            "Content-Type": "application/json",

            "Authorization":
                `Bearer ${apiKey}`,

            "HTTP-Referer":
                window.location.origin,

            "X-Title":
                "AI KHBD Tin Hoc THCS"

        },

        body: JSON.stringify({

            // Có thể thay model này bằng model bạn muốn
            model: "google/gemini-2.5-flash",

            messages: [

                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },

                {
                    role: "user",
                    content: prompt
                }

            ],

            temperature: 0.2,

            response_format: {
                type: "json_object"
            }

        })

    });

    const data = await response.json();

    if (!response.ok) {

        console.error(
            "OpenRouter API error:",
            data
        );

        throw new Error(
            `OpenRouter API (${response.status}): ` +
            (data?.error?.message || "Lỗi không xác định")
        );
    }

    const text =
        data?.choices?.[0]?.message?.content;

    if (!text) {
        throw new Error(
            "OpenRouter không trả về nội dung."
        );
    }

    return cleanJSON(text);
}


// ======================================================
// HÀM CHÍNH
// ======================================================

async function callAI(context, requestData) {

    const apiKey =
        localStorage.getItem("khbd_api_key");

    const provider =
        localStorage.getItem("khbd_api_provider");

    if (!apiKey) {

        throw new Error(
            "Chưa cấu hình API Key. " +
            "Hãy vào Cài đặt API."
        );
    }

    const safeContext =
        context ||
        "Không tìm thấy tài liệu cụ thể trong kho tài liệu.";

    const userPrompt = `

YÊU CẦU TẠO KẾ HOẠCH BÀI DẠY

Lớp:
${requestData.grade}

Bộ sách:
${requestData.book}

Tên bài:
${requestData.lessonName}

Điều kiện lớp học:
${requestData.condition}


==================================================
NGỮ CẢNH TỪ TÀI LIỆU GIÁO VIÊN
==================================================

${safeContext}


==================================================
YÊU CẦU
==================================================

Hãy tạo KHBD theo Công văn 5512.

JSON phải có cấu trúc:

{
    "lesson": {
        "title": "...",
        "grade": "...",
        "book": "..."
    },

    "objectives": {
        "knowledge": [],
        "generalCompetencies": [],
        "informaticsCompetencies": [],
        "digitalCompetencies": [],
        "qualities": []
    },

    "equipment": [],

    "activities": [
        {
            "name": "...",
            "objectives": [],
            "content": "...",
            "products": "...",
            "organization": {
                "transfer": "...",
                "execute": "...",
                "report": "...",
                "conclude": "..."
            }
        }
    ],

    "assessment": []
}

Bắt buộc có đúng 4 hoạt động.

Không thêm Markdown.
Chỉ trả về JSON.
`;

    const fullPrompt =
        SYSTEM_PROMPT +
        "\n\n" +
        userPrompt;


    switch (provider) {

        case "gemini":

            return await callGemini(
                apiKey,
                fullPrompt
            );


        case "openai":

            return await callOpenAI(
                apiKey,
                fullPrompt
            );


        case "openrouter":

            return await callOpenRouter(
                apiKey,
                fullPrompt
            );


        default:

            throw new Error(
                "Nhà cung cấp AI không hợp lệ."
            );
    }
}