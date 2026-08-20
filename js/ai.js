// ============================================================
// ai.js - AI ENGINE HOÀN CHỈNH (KHBD & SMART PRESENTATION BUILDER)
// ============================================================

// ============================================================
// 1. SYSTEM PROMPT HOẠCH ĐỊNH BÀI DẠY (KHBD)
// ============================================================

const SYSTEM_PROMPT = `
Bạn là chuyên gia giáo dục môn Tin học THCS tại Việt Nam.

Bạn am hiểu:
- Chương trình GDPT 2018 & Môn Tin học THCS
- Công văn 5512/BGDĐT-GDTrH
- Tích hợp Năng lực số và Năng lực AI (Quyết định 3439/QĐ-BGDĐT)
- Phương pháp và công cụ kiểm tra đánh giá phát triển năng lực

============================================================
NGUYÊN TẮC BẮT BUỘC
============================================================

1. Ưu tiên tuyệt đối nội dung trong CONTEXT từ giáo viên. Không tự bịa kiến thức SGK.
2. Tiến trình bài dạy gồm 4 phần trải qua 1 lần duy nhất: 
   - 1. Mở đầu
   - 2. Hình thành kiến thức mới (Tách thành Hoạt động 2.1, 2.2,...)
   - 3. Luyện tập
   - 4. Vận dụng
3. Mỗi Hoạt động phải gồm: Mục tiêu, Nội dung, Sản phẩm, Đánh giá (Phương pháp, Công cụ, Tiêu chí, Minh chứng), Tổ chức thực hiện.
4. Trong "Tổ chức thực hiện", trình bày 4 bước bắt buộc bắt đầu bằng:
   - transfer: "Bước 1: " + [Nội dung]
   - execute: "Bước 2: " + [Nội dung]
   - report: "Bước 3: " + [Nội dung]
   - conclude: "Bước 4: " + [Nội dung]
5. NĂNG LỰC AI TÍCH HỢP: 
   - Chỉ tích hợp khi bài học có nội dung phù hợp (ví dụ: thu thập dữ liệu, trí tuệ nhân tạo, xử lý hình ảnh/giọng nói, phần mềm thông minh).
   - Nếu nội dung bài học KHÔNG phù hợp tích hợp AI, hãy để mảng "aiCompetencies" là mảng rỗng [].
6. ĐÁNH GIÁ TRONG TỪNG HOẠT ĐỘNG:
   - Bắt buộc xác định rõ:
     + Phương pháp đánh giá (Quan sát, Hỏi đáp, Đánh giá qua sản phẩm, Tự đánh giá/Đánh giá đồng đẳng).
     + Công cụ đánh giá (Câu hỏi, Phiếu học tập, Bảng kiểm, Rubric, Dạng bài tập).
     + Tiêu chí đánh giá (Các chuẩn mức học sinh cần đạt).
     + Minh chứng đánh giá (Sản phẩm, câu trả lời, thao tác thực tế quan sát được).
7. PHỤ LỤC LINH HOẠT VÀ THỰC TẾ:
   - Chọn loại phụ lục phù hợp nhất từ: "worksheet", "practice_task", "observation_checklist", "rubric", "exit_ticket", "answer_key".
   - BẮT BUỘC phải có ít nhất 1 Bảng kiểm (observation_checklist) hoặc Rubric đánh giá trong phần Phụ lục.
   - Khi tạo Phiếu học tập, có dòng chấm dài (...........) cho phần tự luận/thực hành.
8. QUY TẮC MÃ CHỈ BÁO:
   - Năng lực Tin học: NLa, NLb,...
   - Năng lực số: Lớp 6-7 chứa "TC1" (vd: 1.1.TC1a); Lớp 8-9 chứa "TC2" (vd: 1.1.TC2a).
   - Năng lực AI: Dạng A1.1, B2.1, C4.1 (chỉ dùng khi có tích hợp AI).
9. Trích dẫn sơ đồ/hình ảnh SGK chính xác: "Hình [Số] - [Tên hình] (Trang [Số], SGK)".
10. Chỉ trả về định dạng JSON hợp lệ theo Schema. Không viết Markdown fence \`\`\`json.
`;

// ============================================================
// 2. JSON SCHEMA KHBD
// ============================================================

const KHBD_SCHEMA = {
    type: "object",
    properties: {
        lesson: {
            type: "object",
            properties: {
                title: { type: "string" },
                grade: { type: "string" },
                book: { type: "string" },
                duration: { type: "string" }
            },
            required: ["title", "grade", "book", "duration"]
        },
        objectives: {
            type: "object",
            properties: {
                knowledge: { type: "array", items: { type: "string" } },
                generalCompetencies: { type: "array", items: { type: "string" } },
                informaticsCompetencies: { type: "array", items: { type: "string" } },
                digitalCompetencies: { 
                    type: "array", 
                    items: { 
                        type: "object",
                        properties: { code: { type: "string" }, expression: { type: "string" }, activity: { type: "string" }, product: { type: "string" }, assessment: { type: "string" } },
                        required: ["code", "expression", "activity", "product", "assessment"]
                    } 
                },
                aiCompetencies: { 
                    type: "array", 
                    items: { 
                        type: "object",
                        properties: { code: { type: "string" }, expression: { type: "string" }, activity: { type: "string" }, product: { type: "string" }, assessment: { type: "string" } },
                        required: ["code", "expression", "activity", "product", "assessment"]
                    } 
                },
                qualities: { type: "array", items: { type: "string" } }
            },
            required: ["knowledge", "generalCompetencies", "informaticsCompetencies", "digitalCompetencies", "qualities"]
        },
        equipment: {
            type: "array",
            items: {
                type: "object",
                properties: { target: { type: "string" }, items: { type: "string" }, purpose: { type: "string" } },
                required: ["target", "items", "purpose"]
            }
        },        
        periods: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    periodName: { type: "string" },
                    activities: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" }, 
                                objectives: { type: "array", items: { type: "string" } }, 
                                content: { type: "string" }, 
                                products: { type: "string" },
                                assessment: {
                                    type: "object",
                                    properties: {
                                        method: { type: "string" },
                                        tool: { type: "string" },
                                        criteria: { type: "string" },
                                        evidence: { type: "string" }
                                    },
                                    required: ["method", "tool", "criteria", "evidence"]
                                },
                                organization: { 
                                    type: "object", 
                                    properties: { transfer: { type: "string" }, execute: { type: "string" }, report: { type: "string" }, conclude: { type: "string" } }, 
                                    required: ["transfer", "execute", "report", "conclude"] 
                                }
                            },
                            required: ["name", "objectives", "content", "products", "assessment", "organization"]
                        }
                    }
                },
                required: ["periodName", "activities"]
            }
        },
        appendix: {
            type: "array",
            items: {
                type: "object",
                properties: { 
                    type: { 
                        type: "string", 
                        enum: ["worksheet", "practice_task", "observation_checklist", "rubric", "exit_ticket", "answer_key"] 
                    },
                    title: { type: "string" }, 
                    content: { type: "string" } 
                },
                required: ["type", "title", "content"]
            }
        }
    },
    required: ["lesson", "objectives", "equipment", "periods", "appendix"]
};

// ============================================================
// 3. TIỆN ÍCH LÀM SẠCH VÀ LẤY CẤU HÌNH API
// ============================================================

function cleanJSON(text) {
    if (!text) throw new Error("AI không trả về nội dung.");
    let cleaned = String(text).trim();

    cleaned = cleaned
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    try {
        return JSON.parse(cleaned);
    } catch (error) {
        console.error("JSON AI trả về không hợp lệ:", cleaned);
        throw new Error("AI trả về JSON không hợp lệ. Hãy thử tạo lại.");
    }
}

function getAPIKey() {
    const apiKey = localStorage.getItem("khbd_api_key");
    if (!apiKey) throw new Error("Chưa cấu hình API Key. Hãy quay lại phần Cài đặt API.");
    return apiKey.trim();
}

function getProvider() {
    return (localStorage.getItem("khbd_api_provider") || "gemini").toLowerCase().trim();
}

// ============================================================
// 4. CÁC HÀM GỌI API CHO KHBD
// ============================================================

// ============================================================
// HÀM GỌI API GEMINI CHUẨN (KHÔNG BỊ LỖI CORS TRÊN TRÌNH DUYỆT)
// ============================================================
async function callGemini(apiKey, prompt) {
    
const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

    const requestBody = {
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json", // Ép AI trả về JSON chuẩn
            temperature: 0.2
        }
    };

    const response = await fetch(endpoint, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey // Truyền API Key ẩn trong Header giúp tránh lỗi CORS
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API Error (${response.status}): ${errorData?.error?.message || "Lỗi kết nối"}`);
    }

    const data = await response.json();
    // Xuất văn bản phản hồi từ Gemini
    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return cleanJSON(outputText);
}

async function callOpenAI(apiKey, prompt) {
    const endpoint = "https://api.openai.com/v1/chat/completions";
    const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.2
        })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`OpenAI API Error (${response.status}): ${data?.error?.message}`);
    return cleanJSON(data?.choices?.[0]?.message?.content);
}

async function callOpenRouter(apiKey, prompt) {
    const endpoint = "https://openrouter.ai/api/v1/chat/completions";
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "AI KHBD Tin Hoc THCS"
        },
        body: JSON.stringify({
            model: "google/gemini-3.6-flash",
            messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt }],
            response_format: { type: "json_schema", json_schema: { name: "khbd", strict: true, schema: KHBD_SCHEMA } },
            temperature: 0.2,
            stream: false
        })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`OpenRouter API Error (${response.status}): ${data?.error?.message}`);
    return cleanJSON(data?.choices?.[0]?.message?.content);
}

function buildUserPrompt(context, requestData) {
    const grade = requestData?.grade || "";
    const book = requestData?.book || "";
    const lessonName = requestData?.lessonName || "";
    const condition = requestData?.condition || "";
    const duration = requestData?.duration || "2 tiết";
    const safeContext = context && String(context).trim() ? String(context) : "Không có tài liệu tải lên.";

    return `
============================================================
THÔNG TIN BÀI HỌC
============================================================
Môn học: Tin học | Lớp: ${grade} | Bộ sách: ${book}
Tên bài: ${lessonName}
Điều kiện dạy học: ${condition}
Thời lượng: ${duration}

============================================================
TÀI LIỆU THAM KHẢO (CONTEXT)
============================================================
${safeContext}

============================================================
YÊU CẦU ĐẶC BIỆT
============================================================
1. Kiểm tra xem nội dung bài "${lessonName}" có phù hợp tích hợp AI hay không. Nếu KHÔNG phù hợp, hãy để mảng aiCompetencies rỗng [].
2. Trong MỖI hoạt động học tập, bắt buộc thiết kế đầy đủ 4 yếu tố đánh giá:
   - Phương pháp đánh giá (method)
   - Công cụ đánh giá (tool)
   - Tiêu chí đánh giá (criteria)
   - Minh chứng đánh giá (evidence)
3. Phần Phụ lục (appendix) chọn loại phù hợp trong các dạng (worksheet, practice_task, observation_checklist, rubric, exit_ticket, answer_key). Bắt buộc bao gồm ít nhất 1 Bảng kiểm (observation_checklist) hoặc Rubric chấm điểm thực hành/sản phẩm.
`;
}

async function callAI(context, requestData) {
    const apiKey = getAPIKey();
    const provider = getProvider();
    const userPrompt = buildUserPrompt(context, requestData);

    switch (provider) {
        case "gemini":
            return await callGemini(apiKey, userPrompt);
        case "openai":
            return await callOpenAI(apiKey, userPrompt);
        case "openrouter":
            return await callOpenRouter(apiKey, userPrompt);
        default:
            throw new Error(`Nhà cung cấp AI "${provider}" không hợp lệ.`);
    }
}

// ============================================================
// 5. KỊCH BẢN SƯ PHẠM & JSON SCHEMA BÀI GIẢNG TRÌNH CHIẾU HOÀN HẢO
// ============================================================

const PRESENTATION_SCHEMA = {
    type: "object",
    properties: {
        presentation: {
            type: "object",
            properties: {
                title: { type: "string" },
                subtitle: { type: "string" },
                grade: { type: "string" },
                book: { type: "string" },
                duration: { type: "string" },
                theme: { type: "string" },
                overview: { type: "string" }
            },
            required: ["title", "subtitle", "grade", "book", "duration", "theme", "overview"]
        },
        slides: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    type: {
                        type: "string",
                        enum: ["title", "objectives", "warmup", "content", "activity", "quiz", "practice", "application", "summary"]
                    },
                    layout: {
                        type: "string",
                        enum: ["title_hero", "standard_text", "split_2col", "grid_2x2_cards", "timeline_steps", "big_stat", "mindmap_nodes"]
                    },
                    title: { type: "string" },
                    minutes: { type: "number" },
                    learningGoal: { type: "string" },
                    content: { type: "array", items: { type: "string" } },
                    sgkCitation: { type: "string" },
                    interaction: {
                        type: "object",
                        properties: {
                            question: { type: "string" },
                            options: { type: "array", items: { type: "string" } },
                            answer: { type: "string" }
                        },
                        required: ["question", "options", "answer"]
                    },
                    teacherNotes: { type: "string" },
                    transition: { type: "string" }
                },
                required: ["id", "type", "layout", "title", "minutes", "learningGoal", "content", "sgkCitation", "interaction", "teacherNotes", "transition"]
            }
        }
    },
    required: ["presentation", "slides"]
};

const PRESENTATION_SYSTEM_PROMPT = `
Bạn là chuyên gia thiết kế kịch bản bài giảng trình chiếu môn Tin học THCS chuẩn GDPT 2018.

QUY TẮC TIẾN TRÌNH SƯ PHẠM BẮT BUỘC:
1. TIẾN TRÌNH SLIDE CHUẨN:
   - Slide 1: Tiêu đề bài học (type: "title", layout: "title_hero")
   - Slide 2: Mục tiêu bài học (type: "objectives", layout: "standard_text")
   - Slide 3: Mở đầu / Khởi động (type: "warmup", layout: "big_stat" hoặc "quiz")
   - Các slide Hình thành kiến thức mới (type: "content"/"activity", layout chọn phù hợp: "split_2col", "timeline_steps", "standard_text")
   - Các slide Luyện tập & Câu hỏi nhanh (type: "practice"/"quiz", layout: "grid_2x2_cards")
   - Slide Vận dụng / Mở rộng (type: "application", layout: "standard_text")
   - Slide Sơ đồ tư duy / Tổng kết (type: "summary", layout: "mindmap_nodes")

2. TRÌNH BÀY & NỘI DUNG NGUYÊN TẮC:
   - Mỗi slide chỉ trình bày TỐI ĐA 4-5 gạch đầu dòng trong mảng "content".
   - Mỗi dòng ngắn gọn, cô đọng, KHÔNG Quá 15 từ/dòng để tránh tràn chữ.
   - Khi mô tả thao tác phòng máy hay quy trình algorithm: BẮT BUỘC chọn layout "timeline_steps".
   - Khi so sánh 2 khái niệm hoặc ưu/nhược điểm: BẮT BUỘC chọn layout "split_2col".
   - Khi tạo câu hỏi trắc nghiệm: Đưa 4 lựa chọn vào "options" và ghi rõ đáp án đúng vào "answer".
   - Ghi rõ nguồn trích dẫn SGK trong trường "sgkCitation" (Ví dụ: "Hình 2.1 - Trang 14, SGK").
   - KHÔNG tạo văn bản hay khung nét đứt "Gợi ý hình ảnh" tạm bợ.
`;

function getAutomaticSlideRange(duration) {
    const durationText = String(duration || "2 tiết");
    if (durationText.startsWith("1")) return "10 đến 14";
    if (durationText.startsWith("3")) return "24 đến 30";
    return "18 đến 24";
}

function buildPresentationPrompt(context, requestData) {
    const grade = requestData?.grade || "";
    const book = requestData?.book || "";
    const lessonName = requestData?.lessonName || "";
    const duration = requestData?.duration || "2 tiết";
    const theme = requestData?.theme || "education";
    const extra = requestData?.extra || "Không có yêu cầu bổ sung.";
    const slideCount = requestData?.slideCount === "auto"
        ? `${getAutomaticSlideRange(duration)} trang`
        : `khoảng ${requestData?.slideCount || 20} trang`;
    const safeContext = String(context || "Không có dữ liệu nguồn phù hợp.").trim();

    return `
============================================================
THÔNG TIN BÀI DẠY
============================================================
Môn học: Tin học | Lớp: ${grade} | Bộ sách: ${book}
Tên bài: ${lessonName}
Thời lượng: ${duration} | Số lượng trang: ${slideCount}
Phong cách: ${theme} | Yêu cầu bổ sung: ${extra}

============================================================
CONTEXT TỪ SGK / KHBD CỦA GIÁO VIÊN
============================================================
${safeContext}

============================================================
NHIỆM VỤ
============================================================
Xây dựng kịch bản trình chiếu hoàn chỉnh theo đúng Schema và Quy tắc sư phạm.

Chỉ trả về JSON đúng schema, không Markdown.
`;
}

async function parseProviderJsonResponse(response, providerName) {
    const raw = await response.text();
    let data;
    try {
        data = raw ? JSON.parse(raw) : {};
    } catch (error) {
        console.error(`${providerName} raw response:`, raw);
        throw new Error(`${providerName} trả về dữ liệu không hợp lệ.`);
    }

    if (!response.ok) {
        const message = data?.error?.message || data?.message || "Lỗi không xác định";
        throw new Error(`${providerName} API (${response.status}): ${message}`);
    }

    return data;
}

function extractGeminiInteractionText(data) {
    if (typeof data?.output_text === "string" && data.output_text.trim()) {
        return data.output_text.trim();
    }

    let text = "";
    const collections = [data?.steps, data?.outputs];

    for (const collection of collections) {
        if (!Array.isArray(collection)) continue;
        for (const item of collection) {
            if (typeof item?.text === "string") text += item.text;
            if (Array.isArray(item?.content)) {
                for (const contentItem of item.content) {
                    if (typeof contentItem?.text === "string") text += contentItem.text;
                }
            }
        }
    }

    return text.trim();
}

async function callGeminiPresentation(apiKey, prompt) {
    // Cập nhật dòng này trong cả hàm callGemini và callGeminiPresentation
const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

    const requestBody = {
        systemInstruction: { parts: [{ text: PRESENTATION_SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2
        }
    };

    const response = await fetch(endpoint, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey // Truyền API Key ẩn trong Header
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API Error (${response.status}): ${errorData?.error?.message || "Lỗi kết nối"}`);
    }

    const data = await response.json();
    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return cleanJSON(outputText);
}

async function callOpenAIPresentation(apiKey, prompt) {
    const endpoint = "https://api.openai.com/v1/chat/completions";
    const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: PRESENTATION_SYSTEM_PROMPT }, { role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.3
        })
    });

    const data = await parseProviderJsonResponse(response, "OpenAI");
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error("OpenAI không trả về nội dung bài giảng.");
    return cleanJSON(text);
}

async function callOpenRouterPresentation(apiKey, prompt) {
    const endpoint = "https://openrouter.ai/api/v1/chat/completions";
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "AI Tin THCS - Presentation Builder"
        },
        body: JSON.stringify({
            model: "google/gemini-3.6-flash",
            messages: [{ role: "system", content: PRESENTATION_SYSTEM_PROMPT }, { role: "user", content: prompt }],
            response_format: { type: "json_schema", json_schema: { name: "lesson_presentation", strict: true, schema: PRESENTATION_SCHEMA } },
            temperature: 0.3,
            stream: false
        })
    });

    const data = await parseProviderJsonResponse(response, "OpenRouter");
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error("OpenRouter không trả về nội dung bài giảng.");
    return cleanJSON(text);
}

async function callPresentationAI(context, requestData) {
    const apiKey = getAPIKey();
    const provider = getProvider();
    const prompt = buildPresentationPrompt(context, requestData);

    switch (provider) {
        case "gemini":
            return await callGeminiPresentation(apiKey, prompt);
        case "openai":
            return await callOpenAIPresentation(apiKey, prompt);
        case "openrouter":
            return await callOpenRouterPresentation(apiKey, prompt);
        default:
            throw new Error(`Nhà cung cấp AI "${provider}" không hợp lệ.`);
    }
}