// ============================================================
// ai.js - AI ENGINE HOÀN CHỈNH (KHBD & SMART PRESENTATION BUILDER)
// Đã được tối ưu hóa theo nguyên tắc DRY
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
   - Chỉ tích hợp khi bài học có nội dung phù hợp. Nếu KHÔNG, để mảng "aiCompetencies" rỗng [].
6. ĐÁNH GIÁ TRONG TỪNG HOẠT ĐỘNG:
   - Bắt buộc xác định rõ Phương pháp, Công cụ, Tiêu chí, Minh chứng.
7. PHỤ LỤC LINH HOẠT VÀ THỰC TẾ:
   - BẮT BUỘC phải có ít nhất 1 Bảng kiểm (observation_checklist) hoặc Rubric đánh giá trong phần Phụ lục.
8. QUY TẮC MÃ CHỈ BÁO:
   - Năng lực Tin học: NLa, NLb,...
   - Năng lực số: Lớp 6-7 chứa "TC1"; Lớp 8-9 chứa "TC2".
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
                title: { type: "string" }, grade: { type: "string" },
                book: { type: "string" }, duration: { type: "string" }
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
                    type: "array", items: { 
                        type: "object",
                        properties: { code: { type: "string" }, expression: { type: "string" }, activity: { type: "string" }, product: { type: "string" }, assessment: { type: "string" } },
                        required: ["code", "expression", "activity", "product", "assessment"]
                    } 
                },
                aiCompetencies: { 
                    type: "array", items: { 
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
            type: "array", items: {
                type: "object",
                properties: { target: { type: "string" }, items: { type: "string" }, purpose: { type: "string" } },
                required: ["target", "items", "purpose"]
            }
        },        
        periods: {
            type: "array", items: {
                type: "object",
                properties: {
                    periodName: { type: "string" },
                    activities: {
                        type: "array", items: {
                            type: "object",
                            properties: {
                                name: { type: "string" }, objectives: { type: "array", items: { type: "string" } }, 
                                content: { type: "string" }, products: { type: "string" },
                                assessment: {
                                    type: "object",
                                    properties: { method: { type: "string" }, tool: { type: "string" }, criteria: { type: "string" }, evidence: { type: "string" } },
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
            type: "array", items: {
                type: "object",
                properties: { 
                    type: { type: "string", enum: ["worksheet", "practice_task", "observation_checklist", "rubric", "exit_ticket", "answer_key"] },
                    title: { type: "string" }, content: { type: "string" } 
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
    let cleaned = String(text).trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
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

async function parseProviderJsonResponse(response, providerName) {
    const raw = await response.text();
    let data;
    try {
        data = raw ? JSON.parse(raw) : {};
    } catch (error) {
        throw new Error(`${providerName} trả về dữ liệu không hợp lệ.`);
    }
    if (!response.ok) {
        const message = data?.error?.message || data?.message || "Lỗi không xác định";
        throw new Error(`${providerName} API (${response.status}): ${message}`);
    }
    return data;
}

// ============================================================
// 4. HÀM LÕI GỌI API GEMINI (DRY)
// ============================================================
async function fetchGeminiAPI(apiKey, prompt, systemInstructionText, schema) {
    // Đã cập nhật endpoint thành gemini-3.6-flash theo đúng chuẩn mới
    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";
    
    const requestBody = {
        systemInstruction: { parts: [{ text: systemInstructionText }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.2
        }
    };

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "x-goog-api-key": apiKey 
            },
            body: JSON.stringify(requestBody)
        });

        // Hàm parseProviderJsonResponse sẽ đảm bảo bắt lỗi nếu HTTP status không ok
        const data = await parseProviderJsonResponse(response, "Gemini");
        
        // Trích xuất nội dung văn bản từ cấu trúc JSON trả về của Gemini
        const outputText = data?.candidates?.[0]?.content?.parts?.map(part => part?.text || "").join("").trim() || "";
        
        if (!outputText) {
            const reason = data?.promptFeedback?.blockReason || data?.candidates?.[0]?.finishReason || "Không xác định";
            throw new Error(`Gemini không trả về nội dung. Nguyên nhân: ${reason}`);
        }
        
        // Làm sạch và ép kiểu về JSON an toàn
        return cleanJSON(outputText);
    } catch (error) {
        console.error("Lỗi kết nối Gemini:", error);
        throw new Error(error.message || "Không thể kết nối Gemini API.");
    }
}

// ============================================================
// 5. CÁC HÀM GỌI API CHO KHBD
// ============================================================
async function callGemini(apiKey, prompt) {
    return await fetchGeminiAPI(apiKey, prompt, SYSTEM_PROMPT, KHBD_SCHEMA);
}

async function callOpenRouter(apiKey, prompt) {
    const endpoint = "[https://openrouter.ai/api/v1/chat/completions](https://openrouter.ai/api/v1/chat/completions)";
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "AI KHBD Tin Hoc THCS"
        },
        body: JSON.stringify({
            model: "google/gemini-1.5-flash",
            messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt }],
            response_format: { type: "json_schema", json_schema: { name: "khbd", strict: true, schema: KHBD_SCHEMA } },
            temperature: 0.2
        })
    });
    const data = await parseProviderJsonResponse(response, "OpenRouter");
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
Môn học: Tin học | Lớp: ${grade} | Bộ sách: ${book} | Tên bài: ${lessonName}
Điều kiện dạy học: ${condition} | Thời lượng: ${duration}

============================================================
TÀI LIỆU THAM KHẢO (CONTEXT)
============================================================
${safeContext}

============================================================
YÊU CẦU ĐẶC BIỆT
============================================================
1. Kiểm tra tích hợp AI. Nếu KHÔNG phù hợp, mảng aiCompetencies rỗng [].
2. Bắt buộc có đủ 4 yếu tố đánh giá (method, tool, criteria, evidence).
3. Bắt buộc có ít nhất 1 Bảng kiểm hoặc Rubric chấm điểm trong phụ lục.
`;
}

async function callAI(context, requestData) {
    const apiKey = getAPIKey();
    const provider = getProvider();
    const userPrompt = buildUserPrompt(context, requestData);

    switch (provider) {
        case "gemini": return await callGemini(apiKey, userPrompt);
        case "openrouter": return await callOpenRouter(apiKey, userPrompt);
        default: throw new Error(`Nhà cung cấp AI "${provider}" không hợp lệ.`);
    }
}

// ============================================================
// 6. KỊCH BẢN SƯ PHẠM & JSON SCHEMA BÀI GIẢNG TRÌNH CHIẾU
// ============================================================
const PRESENTATION_SCHEMA = {
    type: "object",
    properties: {
        presentation: {
            type: "object",
            properties: {
                title: { type: "string" }, subtitle: { type: "string" },
                grade: { type: "string" }, book: { type: "string" },
                duration: { type: "string" }, theme: { type: "string" }, overview: { type: "string" }
            },
            required: ["title", "subtitle", "grade", "book", "duration", "theme", "overview"]
        },
        slides: {
            type: "array", items: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    type: { type: "string", enum: ["title", "objectives", "warmup", "content", "activity", "quiz", "practice", "application", "summary"] },
                    layout: { type: "string", enum: ["title_hero", "standard_text", "split_2col", "grid_2x2_cards", "timeline_steps", "big_stat", "mindmap_nodes"] },
                    title: { type: "string" }, minutes: { type: "number" },
                    learningGoal: { type: "string" }, content: { type: "array", items: { type: "string" } },
                    sgkCitation: { type: "string" },
                    interaction: {
                        type: "object",
                        properties: { question: { type: "string" }, options: { type: "array", items: { type: "string" } }, answer: { type: "string" } },
                        required: ["question", "options", "answer"]
                    },
                    teacherNotes: { type: "string" }, transition: { type: "string" }
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
1. Tiến trình slide chuẩn từ Tiêu đề -> Mục tiêu -> Khởi động -> Kiến thức mới -> Luyện tập -> Vận dụng -> Tổng kết.
2. TRÌNH BÀY: Tối đa 4-5 ý/slide, mỗi dòng < 15 từ.
3. Ghi rõ nguồn trích dẫn SGK trong "sgkCitation".
`;

function getAutomaticSlideRange(duration) {
    const durationText = String(duration || "2 tiết");
    if (durationText.startsWith("1")) return "10 đến 14";
    if (durationText.startsWith("3")) return "24 đến 30";
    return "18 đến 24";
}

function buildPresentationPrompt(context, requestData) {
    const slideCount = requestData?.slideCount === "auto" ? `${getAutomaticSlideRange(requestData?.duration)} trang` : `khoảng ${requestData?.slideCount || 20} trang`;
    return `
============================================================
THÔNG TIN BÀI DẠY
============================================================
Môn học: Tin học | Lớp: ${requestData?.grade || ""} | Bộ sách: ${requestData?.book || ""}
Tên bài: ${requestData?.lessonName || ""} | Thời lượng: ${requestData?.duration || "2 tiết"} 
Số lượng trang: ${slideCount} | Phong cách: ${requestData?.theme || "education"}

============================================================
CONTEXT TỪ SGK / KHBD CỦA GIÁO VIÊN
============================================================
${String(context || "Không có dữ liệu nguồn phù hợp.").trim()}

Xây dựng kịch bản trình chiếu hoàn chỉnh theo đúng Schema. Chỉ trả về JSON, không Markdown.
`;
}

// ============================================================
// 7. CÁC HÀM GỌI API CHO BÀI GIẢNG TRÌNH CHIẾU
// ============================================================
async function callGeminiPresentation(apiKey, prompt) {
    return await fetchGeminiAPI(apiKey, prompt, PRESENTATION_SYSTEM_PROMPT, PRESENTATION_SCHEMA);
}

async function callOpenAIPresentation(apiKey, prompt) {
    const endpoint = "[https://api.openai.com/v1/chat/completions](https://api.openai.com/v1/chat/completions)";
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
    return cleanJSON(data?.choices?.[0]?.message?.content);
}

async function callOpenRouterPresentation(apiKey, prompt) {
    const endpoint = "[https://openrouter.ai/api/v1/chat/completions](https://openrouter.ai/api/v1/chat/completions)";
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "AI Tin THCS - Presentation Builder"
        },
        body: JSON.stringify({
            model: "google/gemini-1.5-flash",
            messages: [{ role: "system", content: PRESENTATION_SYSTEM_PROMPT }, { role: "user", content: prompt }],
            response_format: { type: "json_schema", json_schema: { name: "lesson_presentation", strict: true, schema: PRESENTATION_SCHEMA } },
            temperature: 0.3
        })
    });
    const data = await parseProviderJsonResponse(response, "OpenRouter");
    return cleanJSON(data?.choices?.[0]?.message?.content);
}

async function callPresentationAI(context, requestData) {
    const apiKey = getAPIKey();
    const provider = getProvider();
    const prompt = buildPresentationPrompt(context, requestData);

    switch (provider) {
        case "gemini": return await callGeminiPresentation(apiKey, prompt);
        case "openai": return await callOpenAIPresentation(apiKey, prompt);
        case "openrouter": return await callOpenRouterPresentation(apiKey, prompt);
        default: throw new Error(`Nhà cung cấp AI "${provider}" không hợp lệ.`);
    }
}