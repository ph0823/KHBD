let currentKHBD = null;

// ==========================================
// HỆ THỐNG ĐẾM THỜI GIAN (TIMER)
// ==========================================
let timerInterval = null;
let secondsCounter = 0;

function startTimer() {
    // 1. Dọn dẹp bộ đếm cũ nếu có
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // 2. Reset thời gian về 0
    secondsCounter = 0;
    const initialTimerEl = document.getElementById('timer');
    if (initialTimerEl) {
        initialTimerEl.innerText = "00:00";
    }
    
    // 3. Khởi động bộ đếm mới
    timerInterval = setInterval(() => {
        secondsCounter++;
        let m = Math.floor(secondsCounter / 60).toString().padStart(2, '0');
        let s = (secondsCounter % 60).toString().padStart(2, '0');
        
        // BÍ QUYẾT: Tìm lại element mỗi giây để đảm bảo không bị mất kết nối DOM
        const currentTimerEl = document.getElementById('timer');
        if (currentTimerEl) {
            currentTimerEl.innerText = `${m}:${s}`;
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// ==========================================
// TẠO KẾ HOẠCH BÀI DẠY
// ==========================================
async function generateKHBD() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('validation-box').style.display = 'none';
    
    // 1. Khóa nút bấm để ngăn click nhiều lần
    const btnGen = document.getElementById('btn-generate');
    btnGen.disabled = true;
    btnGen.innerText = "⏳ Đang xử lý...";
    
    startTimer(); // Bắt đầu đếm giờ
    
    try {
        const requestData = {
            grade: document.getElementById('sel-grade').value,
            book: document.getElementById('sel-book').value,
            lessonName: document.getElementById('lesson-name').value,
            condition: document.getElementById('sel-condition').value,
            duration: document.getElementById('lesson-duration').value // bắt thời lượng
        };
        
        // 1. Retrieval (Tìm kiếm tài liệu)
        const context = await searchKnowledgeBase(requestData.lessonName);
        
        // 2. Generate (Gọi AI)
        currentKHBD = await callAI(context, requestData);
        
        // 3. Validate (Kiểm tra)
        const validationResults = validateKHBD(currentKHBD);
        displayValidation(validationResults);
        
    } catch (e) {
        alert("Lỗi: " + e.message);
    } finally {
        stopTimer(); // Dừng đếm giờ dù thành công hay thất bại
        document.getElementById('loading').style.display = 'none';
        
        // 2. Mở khóa nút bấm sau khi hoàn tất
        btnGen.disabled = false;
        btnGen.innerText = "🤖 Phân tích & Tạo KHBD";
    }
}

// ==========================================
// TỰ ĐỘNG SỬA LỖI BẰNG AI
// ==========================================
async function autoFix() {
    document.getElementById('loading').style.display = 'block';
    startTimer(); // Bắt đầu đếm giờ lại

    try {
        const requestData = {
            grade: document.getElementById('sel-grade').value,
            book: document.getElementById('sel-book').value,
            lessonName: document.getElementById('lesson-name').value,
            condition: document.getElementById('sel-condition').value,
            duration: document.getElementById('lesson-duration').value // bắt thời lượng
        };
        
        const errors = validateKHBD(currentKHBD);
        const fixPrompt = `Hệ thống phát hiện các lỗi sau trong cấu trúc KHBD: ${errors.join(", ")}. Hãy sửa lại theo đúng yêu cầu và trả về JSON chuẩn. Dữ liệu KHBD bị lỗi: ${JSON.stringify(currentKHBD)}`;
        
        currentKHBD = await callAI(fixPrompt, requestData);
        
        const validationResults = validateKHBD(currentKHBD);
        displayValidation(validationResults);
        
    } catch (e) {
        alert("Lỗi khi tự động sửa: " + e.message);
    } finally {
        stopTimer();
        document.getElementById('loading').style.display = 'none';
    }
}

// ==========================================
// KIỂM TRA CHẤT LƯỢNG (VALIDATOR)
// ==========================================
function validateKHBD(json) {
    let errors = [];
    // CẬP NHẬT: Kiểm tra mảng periods thay vì activities
    if (!json.periods || json.periods.length === 0) {
        errors.push("Thiếu phần tiến trình dạy học (các tiết học).");
    }
    if (!json.objectives || !json.objectives.informaticsCompetencies || json.objectives.informaticsCompetencies.length === 0) {
        errors.push("Thiếu năng lực Tin học");
    }
    if (!json.equipment || json.equipment.length === 0 || typeof json.equipment[0] === 'string') {
        errors.push("Bảng Thiết bị dạy học và Học liệu chưa đúng định dạng chia cột (Đối tượng, Thiết bị, Mục đích)");
    }
    if (!json.appendix || json.appendix.length === 0) {
        errors.push("Thiếu phần Phụ lục (Phiếu học tập và Đáp án) ở cuối bài");
    }
    return errors;
}

function displayValidation(errors) {
    const box = document.getElementById('validation-box');
    const list = document.getElementById('validation-list');
    box.style.display = 'block';
    list.innerHTML = '';
    
    if (errors.length === 0) {
        list.innerHTML = "<li style='color:green; margin-bottom: 10px;'>✓ KHBD đã đạt chuẩn. Hãy xem trước nội dung bên dưới trước khi tải về.</li>";
        document.getElementById('btn-fix').style.display = 'none';
        
        // Gọi hàm hiển thị Bản xem trước
        renderPreview(currentKHBD);
        
        document.getElementById('btn-export').style.display = 'block';
    } else {
        errors.forEach(err => {
            list.innerHTML += `<li style='color:red'>✗ ${err}</li>`;
        });
        document.getElementById('btn-fix').style.display = 'inline-block';
        document.getElementById('btn-export').style.display = 'none';
        document.getElementById('preview-box').style.display = 'none'; // Ẩn xem trước nếu có lỗi
    }
}

// ==========================================
// TÍNH NĂNG XEM TRƯỚC (PREVIEW)
// ==========================================
function renderPreview(json) {
    const previewBox = document.getElementById('preview-box');
    if (!json) {
        previewBox.style.display = 'none';
        return;
    }

    try {
        let html = `<h2 style="text-align: center; color: var(--primary-color);">${(json.lesson?.title || "Chưa có tên bài").toUpperCase()}</h2>`;
        html += `<p style="text-align: center; font-style: italic;">Thời gian thực hiện: ${json.lesson?.duration || "2 tiết"}</p>`;
        
        // I. MỤC TIÊU
        html += `<h3>I. MỤC TIÊU</h3>`;
        html += `<p><strong>1. Kiến thức:</strong></p><ul>`;
        (json.objectives?.knowledge || []).forEach(k => html += `<li>${k}</li>`);
        html += `</ul>`;
        
        html += `<p><strong>2. Năng lực:</strong></p>`;
        html += `<p><em>a. Năng lực chung:</em></p><ul>`;
        (json.objectives?.generalCompetencies || []).forEach(c => html += `<li>${c}</li>`);
        html += `</ul><p><em>b. Năng lực Tin học:</em></p><ul>`;
        (json.objectives?.informaticsCompetencies || []).forEach(c => html += `<li>${c}</li>`);
        html += `</ul>`;
        // c. Năng lực số 
        if (json.objectives?.digitalCompetencies && json.objectives.digitalCompetencies.length > 0) {
            html += `<p><em>c. Năng lực số:</em></p><ul>`;
            json.objectives.digitalCompetencies.forEach(dc => {
                html += `<li><strong>${dc?.code || ""}</strong>: ${dc?.expression || ""}</li>`;
            });
            html += `</ul>`;
        }
        
        // d. Năng lực AI 
        if (json.objectives?.aiCompetencies && json.objectives.aiCompetencies.length > 0) {
            html += `<p><em>d. Năng lực AI:</em></p><ul>`;
            json.objectives.aiCompetencies.forEach(ai => {
                html += `<li><strong>${ai?.code || ""}</strong>: ${ai?.expression || ""}</li>`;
            });
            html += `</ul>`;
        }

        html += `<p><strong>3. Phẩm chất:</strong></p><ul>`;
        (json.objectives?.qualities || []).forEach(q => html += `<li>${q}</li>`);
        html += `</ul>`;

        // VẼ BẢNG NĂNG LỰC SỐ
        if (json.objectives?.digitalCompetencies && json.objectives.digitalCompetencies.length > 0) {
            html += `<p><strong>4. Định hướng năng lực số:</strong></p>`;
            html += `<table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;" border="1" cellpadding="5">`;
            html += `<tr style="background-color: #f3f4f6;"><th>Mã chỉ báo</th><th>Biểu hiện cụ thể</th><th>Hoạt động</th><th>Sản phẩm minh chứng</th><th>Công cụ & Đánh giá</th></tr>`;
            json.objectives.digitalCompetencies.forEach(dc => {
                html += `<tr><td>${dc?.code || ""}</td><td>${dc?.expression || ""}</td><td>${dc?.activity || ""}</td><td>${dc?.product || ""}</td><td>${dc?.assessment || ""}</td></tr>`;
            });
            html += `</table>`;
        }

        // VẼ BẢNG NĂNG LỰC AI
        if (json.objectives?.aiCompetencies && json.objectives.aiCompetencies.length > 0) {
            html += `<p><strong>5. Năng lực AI tích hợp:</strong></p>`;
            html += `<table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;" border="1" cellpadding="5">`;
            html += `<tr style="background-color: #f3f4f6;"><th>Mã chỉ báo</th><th>Biểu hiện cụ thể</th><th>Hoạt động</th><th>Sản phẩm minh chứng</th><th>Công cụ & Đánh giá</th></tr>`;
            json.objectives.aiCompetencies.forEach(ai => {
                html += `<tr><td>${ai?.code || ""}</td><td>${ai?.expression || ""}</td><td>${ai?.activity || ""}</td><td>${ai?.product || ""}</td><td>${ai?.assessment || ""}</td></tr>`;
            });
            html += `</table>`;
        }

       
        // II. THIẾT BỊ DẠY HỌC
        html += `<h3>II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h3>`;
        if (json.equipment && json.equipment.length > 0) {
            html += `<table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;" border="1" cellpadding="5">`;
            html += `<tr style="background-color: #f3f4f6;"><th>Đối tượng</th><th>Thiết bị, học liệu</th><th>Mục đích sử dụng</th></tr>`;
            json.equipment.forEach(eq => {
                html += `<tr><td>${eq?.target || ""}</td><td>${eq?.items || ""}</td><td>${eq?.purpose || ""}</td></tr>`;
            });
            html += `</table>`;
        }

        // III. TIẾN TRÌNH DẠY HỌC
        html += `<h3>III. TIẾN TRÌNH DẠY HỌC</h3>`;
        (json.periods || []).forEach(period => {
            // In ra tên Tiết học
            html += `<h3 style="color: var(--danger-color); margin-top: 20px; border-bottom: 2px solid var(--danger-color); padding-bottom: 5px;">${period.periodName}</h3>`;
            
            // Lặp qua các hoạt động bên trong tiết học đó
            (period.activities || []).forEach((act, index) => {
                html += `<h4 style="color: var(--primary-color); margin-top: 15px;">${act?.name || "Chưa có tên"}</h4>`;
                html += `<p><strong>a) Mục tiêu:</strong> ${(act?.objectives || []).join("; ")}</p>`;
                html += `<p><strong>b) Nội dung:</strong> ${act?.content || ""}</p>`;
                html += `<p><strong>c) Sản phẩm:</strong> ${act?.products || ""}</p>`;
                html += `<p><strong>d) Tổ chức thực hiện:</strong></p><ul>`;
                html += `<li>- ${act?.organization?.transfer || ""}</li>`;
                html += `<li>- ${act?.organization?.execute || ""}</li>`;
                html += `<li>- ${act?.organization?.report || ""}</li>`;
                html += `<li>- ${act?.organization?.conclude || ""}</li>`;
                html += `</ul>`;
            });
        });

        // PHỤ LỤC
        if (json.appendix && json.appendix.length > 0) {
            html += `<h3>PHỤ LỤC: PHIẾU HỌC TẬP VÀ ĐÁP ÁN</h3>`;
            json.appendix.forEach(app => {
                html += `<h4>${app?.title || ""}</h4>`;
                let content = app?.content || "";
                html += `<p>${content.replace(/\n/g, '<br>')}</p>`; // Thay thế \n thành thẻ xuống dòng HTML
            });
        }

        previewBox.innerHTML = html;
        previewBox.style.display = 'block';
        
    } catch (error) {
        console.error("Lỗi khi render Preview:", error);
        previewBox.innerHTML = `<p style="color: var(--danger-color); font-weight: bold;">⚠️ Không thể hiển thị bản xem trước do lỗi định dạng từ AI. Tuy nhiên, bạn vẫn có thể nhấn nút Xuất File Word để tải về.</p>`;
        previewBox.style.display = 'block';
    }
}
