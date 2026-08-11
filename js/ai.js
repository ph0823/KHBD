// ============================================================
// ai.js
// AI ENGINE - TẠO KẾ HOẠCH BÀI DẠY TIN HỌC THCS
// Gemini / OpenAI / OpenRouter
// ============================================================


// ============================================================
// 1. SYSTEM PROMPT
// ============================================================

const SYSTEM_PROMPT = `
Bạn là chuyên gia giáo dục môn Tin học THCS tại Việt Nam.

Bạn am hiểu:

- Chương trình GDPT 2018
- Môn Tin học cấp THCS
- Công văn 5512/BGDĐT-GDTrH
- Thiết kế Kế hoạch bài dạy
- Phát triển phẩm chất và năng lực
- Năng lực chung
- Năng lực Tin học
- Năng lực số
- Dạy học Tin học trong phòng máy
- Dạy học theo định hướng phát triển năng lực
- Kiểm tra đánh giá trong dạy học Tin học

============================================================
NGUYÊN TẮC BẮT BUỘC
============================================================

1. Không được tự bịa nội dung kiến thức của sách giáo khoa.

2. Ưu tiên tuyệt đối nội dung trong CONTEXT được cung cấp
   bởi giáo viên.

3. Nếu CONTEXT không đủ thông tin để xác định một nội dung,
   phải xây dựng nội dung ở mức phù hợp và không khẳng định
   đó là nội dung nguyên văn của sách giáo khoa.

4. Bám sát:
   - lớp học
   - bộ sách
   - tên bài
   - điều kiện dạy học
   - thời lượng nếu được cung cấp.

5. Nếu dạy trong phòng máy:
   - ưu tiên hoạt động thực hành;
   - học sinh trực tiếp thao tác trên máy;
   - sản phẩm phải có thể quan sát/kiểm tra được;
   - giáo viên tổ chức, hướng dẫn và hỗ trợ;
   - hạn chế biến tiết học thành tiết giảng lý thuyết.

6. KHBD phải theo định hướng Công văn 5512.

7. Phải có đầy đủ 4 hoạt động:

   Hoạt động 1: Mở đầu
   Hoạt động 2: Hình thành kiến thức
   Hoạt động 3: Luyện tập
   Hoạt động 4: Vận dụng

8. Mỗi hoạt động phải có:

   - Mục tiêu
   - Nội dung
   - Sản phẩm
   - Tổ chức thực hiện

9. Trong "Tổ chức thực hiện" phải thể hiện:

   - Chuyển giao nhiệm vụ
   - Thực hiện nhiệm vụ
   - Báo cáo/thảo luận
   - Kết luận/nhận định

10. Nội dung phải phù hợp học sinh THCS.

11. Không đưa kiến thức vượt quá mức cần thiết nếu không có
    căn cứ từ tài liệu hoặc yêu cầu của giáo viên.

12. Các nhiệm vụ học tập phải có sản phẩm cụ thể.

13. Không tạo các hoạt động mang tính hình thức.

14. Không viết các câu chung chung như:
    "Học sinh tích cực tham gia",
    "Giáo viên quan sát",
    "Học sinh hiểu bài"
    nếu không mô tả nhiệm vụ cụ thể.

15. Năng lực Tin học và năng lực số phải gắn với hoạt động
    thực tế của học sinh, không liệt kê cho có.

16. Phẩm chất phải phù hợp với nhiệm vụ học tập.

17. Đánh giá phải gắn với sản phẩm/nhiệm vụ.

18. Không trả lời bằng Markdown.

19. Chỉ trả về JSON hợp lệ theo schema được yêu cầu.
`;


// ============================================================
// 2. JSON SCHEMA
// ============================================================

const KHBD_SCHEMA = {

    type: "object",

    properties: {

        lesson: {
            type: "object",
            properties: {
                title: {
                    type: "string"
                },
                grade: {
                    type: "string"
                },
                book: {
                    type: "string"
                }
            },
            required: [
                "title",
                "grade",
                "book"
            ]
        },


        objectives: {

            type: "object",

            properties: {

                knowledge: {
                    type: "array",
                    items: {
                        type: "string"
                    }
                },

                generalCompetencies: {
                    type: "array",
                    items: {
                        type: "string"
                    }
                },

                informaticsCompetencies: {
                    type: "array",
                    items: {
                        type: "string"
                    }
                },

                digitalCompetencies: {
                    type: "array",
                    items: {
                        type: "string"
                    }
                },

                qualities: {
                    type: "array",
                    items: {
                        type: "string"
                    }
                }

            },

            required: [
                "knowledge",
                "generalCompetencies",
                "informaticsCompetencies",
                "digitalCompetencies",
                "qualities"
            ]
        },


        equipment: {
            type: "array",
            items: {
                type: "string"
            }
        },


        activities: {

            type: "array",

            minItems: 4,
            maxItems: 4,

            items: {

                type: "object",

                properties: {

                    name: {
                        type: "string"
                    },

                    objectives: {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    },

                    content: {
                        type: "string"
                    },

                    products: {
                        type: "string"
                    },

                    organization: {

                        type: "object",

                        properties: {

                            transfer: {
                                type: "string"
                            },

                            execute: {
                                type: "string"
                            },

                            report: {
                                type: "string"
                            },

                            conclude: {
                                type: "string"
                            }

                        },

                        required: [
                            "transfer",
                            "execute",
                            "report",
                            "conclude"
                        ]
                    }

                },

                required: [
                    "name",
                    "objectives",
                    "content",
                    "products",
                    "organization"
                ]
            }
        },


        assessment: {

            type: "array",

            items: {
                type: "string"
            }
        }

    },

    required: [
        "lesson",
        "objectives",
        "equipment",
        "activities",
        "assessment"
    ]
};


// ============================================================
// 3. HÀM LÀM SẠCH JSON
// ============================================================

function cleanJSON(text) {

    if (!text) {

        throw new Error(
            "AI không trả về nội dung."
        );
    }

    let cleaned = String(text).trim();


    // Loại bỏ Markdown code fence nếu có
    cleaned = cleaned
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();


    // Tìm JSON trong trường hợp AI trả thêm lời dẫn
    const firstBrace =
        cleaned.indexOf("{");

    const lastBrace =
        cleaned.lastIndexOf("}");


    if (
        firstBrace !== -1 &&
        lastBrace !== -1 &&
        lastBrace > firstBrace
    ) {

        cleaned =
            cleaned.substring(
                firstBrace,
                lastBrace + 1
            );
    }


    try {

        return JSON.parse(cleaned);

    } catch (error) {

        console.error(
            "JSON AI trả về không hợp lệ:",
            cleaned
        );

        throw new Error(
            "AI trả về JSON không hợp lệ. " +
            "Hãy thử tạo lại KHBD."
        );
    }
}


// ============================================================
// 4. LẤY API KEY
// ============================================================

function getAPIKey() {

    const apiKey =
        localStorage.getItem(
            "khbd_api_key"
        );

    if (!apiKey) {

        throw new Error(
            "Chưa cấu hình API Key. " +
            "Hãy quay lại phần Cài đặt API."
        );
    }

    return apiKey.trim();
}


// ============================================================
// 5. LẤY PROVIDER
// ============================================================

function getProvider() {

    return (
        localStorage.getItem(
            "khbd_api_provider"
        ) || "gemini"
    ).toLowerCase().trim();
}


// ============================================================
// 6. GEMINI - INTERACTIONS API
// ============================================================

async function callGemini(apiKey, prompt) {

    if (!apiKey) {

        throw new Error(
            "Chưa nhập Gemini API Key."
        );
    }


    // Model stable hiện tại
    const model =
        "gemini-3.6-flash";


    // Interactions API stable
    const endpoint =
        "https://generativelanguage.googleapis.com/v1/interactions";


    const requestBody = {

        model: model,

        input: prompt,

        system_instruction:
            SYSTEM_PROMPT,


        // Không lưu interaction trên server.
        // Phù hợp với tài liệu giáo viên.
        store: false,


        // Structured Output
        response_format: {

            type: "text",

            mime_type:
                "application/json",

            schema:
                KHBD_SCHEMA
        }

    };


    console.log(
        "Gemini request:",
        {
            model: model,
            endpoint: endpoint
        }
    );


    let response;


    try {

        response = await fetch(
            endpoint,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "x-goog-api-key":
                        apiKey
                },

                body:
                    JSON.stringify(
                        requestBody
                    )
            }
        );

    } catch (networkError) {

        console.error(
            "Gemini network error:",
            networkError
        );

        throw new Error(
            "Không thể kết nối Gemini API. " +
            "Kiểm tra Internet hoặc CORS."
        );
    }


    // Đọc response một lần
    let data;

    try {

        data =
            await response.json();

    } catch (error) {

        const rawText =
            await response.text();

        console.error(
            "Gemini raw response:",
            rawText
        );

        throw new Error(
            `Gemini API (${response.status}): ` +
            "Máy chủ trả về dữ liệu không hợp lệ."
        );
    }


    // ========================================================
    // XỬ LÝ LỖI HTTP
    // ========================================================

    if (!response.ok) {

        console.error(
            "Gemini API error:",
            data
        );


        const code =
            data?.error?.code ||
            response.status;


        const status =
            data?.error?.status ||
            "";


        const message =
            data?.error?.message ||
            "Lỗi không xác định";


        if (response.status === 401) {

            throw new Error(
                "Gemini API (401): API Key không hợp lệ " +
                "hoặc không được chấp nhận."
            );
        }


        if (response.status === 403) {

            throw new Error(
                "Gemini API (403): API Key không có " +
                "quyền sử dụng model này hoặc API chưa được bật."
            );
        }


        if (response.status === 404) {

            throw new Error(
                "Gemini API (404): Model hoặc endpoint " +
                "không tồn tại/không khả dụng cho tài khoản này. " +
                `Model: ${model}`
            );
        }


        if (response.status === 429) {

            throw new Error(
                "Gemini API (429): Đã vượt quá quota hoặc " +
                "giới hạn tốc độ. Hãy thử lại sau."
            );
        }


        throw new Error(
            `Gemini API (${code}${status ? " - " + status : ""}): ` +
            message
        );
    }


    // ========================================================
    // LẤY OUTPUT TỪ INTERACTIONS API
    // ========================================================

    let outputText = "";


    // Một số response có output_text
    if (
        typeof data.output_text === "string" &&
        data.output_text.trim()
    ) {

        outputText =
            data.output_text.trim();
    }


    // Response chuẩn Interactions API:
    // steps -> model_output -> content -> text

    if (
        !outputText &&
        Array.isArray(data.steps)
    ) {

        for (
            const step of data.steps
        ) {

            if (
                step?.type ===
                "model_output"
            ) {

                const contents =
                    step.content;


                if (
                    Array.isArray(contents)
                ) {

                    for (
                        const item
                        of contents
                    ) {

                        if (
                            item?.type ===
                            "text" &&
                            typeof item.text ===
                            "string"
                        ) {

                            outputText +=
                                item.text;
                        }
                    }
                }
            }
        }

        outputText =
            outputText.trim();
    }


    // Một số phiên bản API có outputs
    if (
        !outputText &&
        Array.isArray(data.outputs)
    ) {

        for (
            const output
            of data.outputs
        ) {

            if (
                typeof output?.text ===
                "string"
            ) {

                outputText +=
                    output.text;
            }
        }

        outputText =
            outputText.trim();
    }


    if (!outputText) {

        console.error(
            "Gemini response không chứa output:",
            data
        );

        throw new Error(
            "Gemini không trả về nội dung KHBD."
        );
    }


    console.log(
        "Gemini output:",
        outputText
    );


    return cleanJSON(
        outputText
    );
}


// ============================================================
// 7. OPENAI
// ============================================================

async function callOpenAI(
    apiKey,
    prompt
) {

    if (!apiKey) {

        throw new Error(
            "Chưa nhập OpenAI API Key."
        );
    }


    const endpoint =
        "https://api.openai.com/v1/chat/completions";


    const response =
        await fetch(
            endpoint,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${apiKey}`
                },


                body:
                    JSON.stringify({

                        model:
                            "gpt-4o-mini",

                        messages: [

                            {
                                role:
                                    "system",

                                content:
                                    SYSTEM_PROMPT
                            },

                            {
                                role:
                                    "user",

                                content:
                                    prompt
                            }

                        ],


                        response_format: {

                            type:
                                "json_object"
                        },

                        temperature:
                            0.2
                    })
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        console.error(
            "OpenAI API error:",
            data
        );


        const message =
            data?.error?.message ||
            "Lỗi không xác định";


        throw new Error(
            `OpenAI API (${response.status}): ${message}`
        );
    }


    const text =
        data
            ?.choices?.[0]
            ?.message?.content;


    if (!text) {

        throw new Error(
            "OpenAI không trả về nội dung."
        );
    }


    return cleanJSON(text);
}


// ============================================================
// 8. OPENROUTER
// ============================================================

async function callOpenRouter(
    apiKey,
    prompt
) {

    if (!apiKey) {

        throw new Error(
            "Chưa nhập OpenRouter API Key."
        );
    }


    const endpoint =
        "https://openrouter.ai/api/v1/chat/completions";


    const response =
        await fetch(
            endpoint,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${apiKey}`,

                    "HTTP-Referer":
                        window.location.origin,

                    "X-Title":
                        "AI KHBD Tin Hoc THCS"
                },


                body:
                    JSON.stringify({

                        model:
                            "google/gemini-3.6-flash",


                        messages: [

                            {
                                role:
                                    "system",

                                content:
                                    SYSTEM_PROMPT
                            },

                            {
                                role:
                                    "user",

                                content:
                                    prompt
                            }

                        ],


                        response_format: {

                            type:
                                "json_schema",

                            json_schema: {

                                name:
                                    "khbd",

                                strict:
                                    true,

                                schema:
                                    KHBD_SCHEMA
                            }
                        },


                        temperature:
                            0.2,

                        stream:
                            false
                    })
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        console.error(
            "OpenRouter API error:",
            data
        );


        const message =
            data?.error?.message ||
            "Lỗi không xác định";


        throw new Error(
            `OpenRouter API (${response.status}): ${message}`
        );
    }


    const text =
        data
            ?.choices?.[0]
            ?.message?.content;


    if (!text) {

        throw new Error(
            "OpenRouter không trả về nội dung."
        );
    }


    return cleanJSON(text);
}


// ============================================================
// 9. TẠO USER PROMPT
// ============================================================

function buildUserPrompt(
    context,
    requestData
) {

    const grade =
        requestData?.grade ||
        "";

    const book =
        requestData?.book ||
        "";

    const lessonName =
        requestData?.lessonName ||
        "";

    const condition =
        requestData?.condition ||
        "";


    const safeContext =
        context &&
        String(context).trim()
            ? String(context)
            : "Không tìm thấy tài liệu liên quan.";


    return `

============================================================
THÔNG TIN YÊU CẦU
============================================================

Môn học:
Tin học

Lớp:
${grade}

Bộ sách:
${book}

Tên bài:
${lessonName}

Điều kiện dạy học:
${condition}


============================================================
NGỮ CẢNH TỪ TÀI LIỆU GIÁO VIÊN
============================================================

${safeContext}


============================================================
NHIỆM VỤ
============================================================

Hãy tạo một Kế hoạch bài dạy hoàn chỉnh cho bài học trên.

Phải bám sát nội dung tài liệu giáo viên cung cấp.

Nếu tài liệu có thông tin về:
- mục tiêu;
- kiến thức;
- yêu cầu cần đạt;
- hoạt động học tập;
- bài tập;
- ví dụ;
- hình thức tổ chức;
- năng lực;
- phẩm chất;

thì phải ưu tiên sử dụng các thông tin đó.

Nếu điều kiện là phòng máy, hãy thiết kế các nhiệm vụ
thực hành trực tiếp trên máy tính.


============================================================
CẤU TRÚC BẮT BUỘC
============================================================

lesson
objectives
equipment
activities
assessment


============================================================
YÊU CẦU 4 HOẠT ĐỘNG
============================================================

Hoạt động 1:
Mở đầu

Hoạt động 2:
Hình thành kiến thức

Hoạt động 3:
Luyện tập

Hoạt động 4:
Vận dụng


============================================================
YÊU CẦU TỔ CHỨC HOẠT ĐỘNG
============================================================

Mỗi hoạt động phải có:

1. Mục tiêu
2. Nội dung
3. Sản phẩm
4. Tổ chức thực hiện

Trong tổ chức thực hiện phải thể hiện rõ:

- Chuyển giao nhiệm vụ
- Thực hiện nhiệm vụ
- Báo cáo/thảo luận
- Kết luận/nhận định


============================================================
YÊU CẦU VỀ NĂNG LỰC
============================================================

Không liệt kê năng lực một cách chung chung.

Năng lực phải gắn với nhiệm vụ cụ thể.

Đặc biệt chú ý:

- Năng lực chung
- Năng lực Tin học
- Năng lực số

Nếu tài liệu cung cấp mã năng lực số thì sử dụng
đúng mã được cung cấp.


============================================================
YÊU CẦU ĐÁNH GIÁ
============================================================

Đánh giá phải dựa trên sản phẩm hoặc nhiệm vụ học tập.

Ưu tiên:
- quan sát;
- hỏi đáp;
- sản phẩm thực hành;
- bài tập;
- phiếu học tập;
- thực hành trên máy;
- tự đánh giá;
- đánh giá đồng đẳng.


============================================================
YÊU CẦU CUỐI CÙNG
============================================================

Chỉ trả về JSON.

Không Markdown.

Không sử dụng:
\`\`\`json

Không thêm lời giải thích bên ngoài JSON.
`;
}


// ============================================================
// 10. HÀM CALL AI CHÍNH
// ============================================================

async function callAI(
    context,
    requestData
) {

    const apiKey =
        getAPIKey();


    const provider =
        getProvider();


    const userPrompt =
        buildUserPrompt(
            context,
            requestData
        );


    console.log(
        "AI Provider:",
        provider
    );


    console.log(
        "Request data:",
        requestData
    );


    switch (provider) {


        // ====================================================
        // GEMINI
        // ====================================================

        case "gemini":

            return await callGemini(
                apiKey,
                userPrompt
            );


        // ====================================================
        // OPENAI
        // ====================================================

        case "openai":

            return await callOpenAI(
                apiKey,
                userPrompt
            );


        // ====================================================
        // OPENROUTER
        // ====================================================

        case "openrouter":

            return await callOpenRouter(
                apiKey,
                userPrompt
            );


        // ====================================================
        // PROVIDER KHÔNG HỢP LỆ
        // ====================================================

        default:

            throw new Error(
                `Nhà cung cấp AI "${provider}" không hợp lệ.`
            );
    }
}