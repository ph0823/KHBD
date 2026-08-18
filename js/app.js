// ==========================================
// DỮ LIỆU BÀI HỌC THEO TỪNG KHỐI LỚP
// ==========================================
const LESSONS_DATA = {
  "6": [
    "Bài 1. Thông tin và dữ liệu",
    "Bài 2. Xử lí thông tin",
    "Bài 3. Thông tin trong máy tính",
    "Bài 4. Mạng máy tính",
    "Bài 5. Internet",
    "Bài 6. World Wide Web và thư điện tử",
    "Bài 7. Tìm kiếm thông tin trên Internet",
    "Bài 8. Thư điện tử",
    "Bài 9. An toàn thông tin trên Internet",
    "Bài 10. Quyền riêng tư trong thế giới số",
    "Bài 11. Ứng xử văn hóa và tôn trọng bản quyền trên môi trường số",
    "Bài 12. Soạn thảo văn bản cơ bản",
    "Bài 13. Định dạng văn bản",
    "Bài 14. Thực hành tổng hợp soạn thảo văn bản",
    "Bài 15. Thuật toán",
    "Bài 16. Biểu diễn thuật toán bằng sơ đồ khối",
    "Bài 17. Chương trình máy tính và ngôn ngữ lập trình",
    "Bài 18. Nghề nghiệp trong lĩnh vực Tin học"
  ],
  "7": [
    "Bài 1. Thiết bị vào - ra",
    "Bài 2. Phần mềm máy tính",
    "Bài 3. Quản lí dữ liệu trong máy tính",
    "Bài 4. Mạng xã hội và một số kênh trao đổi thông tin trên Internet",
    "Bài 5. Ứng xử trên mạng",
    "Bài 6. Làm quen với phần mềm bảng tính",
    "Bài 7. Tính toán tự động trên bảng tính",
    "Bài 8. Công cụ hỗ trợ tính toán",
    "Bài 9. Trình bày bảng tính",
    "Bài 10. Hoàn thiện bảng tính",
    "Bài 11. Tạo bài trình chiếu",
    "Bài 12. Định dạng đối tượng trên trang chiếu",
    "Bài 13. Thực hành tổng hợp"
  ],
  "8": [
    "Bài 1. Sử dụng thiết bị điện an toàn",
    "Bài 2. Thông tin trong môi trường số",
    "Bài 3. Khai thác thông tin số",
    "Bài 4. Đạo đức và văn hóa trong sử dụng công nghệ số",
    "Bài 5. Sử dụng bảng tính để giải quyết bài toán thực tiễn",
    "Bài 6. Sắp xếp và lọc dữ liệu",
    "Bài 7. Trực quan hóa dữ liệu",
    "Bài 8. Làm quen với lập trình trực quan",
    "Bài 9. Cấu trúc rẽ nhánh",
    "Bài 10. Cấu trúc lặp",
    "Bài 11. Danh sách",
    "Bài 12. Dự án lập trình"
  ],
  "9": [
    "Bài 1. Thế giới kĩ thuật số",
    "Bài 2. Thông tin trong giải quyết vấn đề",
    "Bài 3. Thực hành: Đánh giá chất lượng thông tin",
    "Bài 4. Một số vấn đề pháp lí về sử dụng dịch vụ Internet",
    "Bài 5. Tìm hiểu phần mềm mô phỏng",
    "Bài 6. Thực hành khám phá phần mềm mô phỏng",
    "Bài 7. Trình bày thông tin trong trao đổi và hợp tác",
    "Bài 8. Thiết kế sản phẩm số",
    "Bài 9. Giới thiệu về trí tuệ nhân tạo",
    "Bài 10. AI trong khoa học",
    "Bài 11. AI với cuộc sống",
    "Bài 12. Dự án ứng dụng AI"
  ]
};

// ==========================================
// HÀM CẬP NHẬT DANH SÁCH BÀI DẠY
// ==========================================
function updateLessonOptions() {
    const selectedGrade = document.getElementById('sel-grade').value;
    const lessonSelect = document.getElementById('lesson-name');
    
    // Lấy danh sách bài tương ứng với lớp được chọn
    const lessons = LESSONS_DATA[selectedGrade] || [];
    
    // Đổ danh sách <option> vào thẻ select
    lessonSelect.innerHTML = lessons
        .map(lesson => `<option value="${lesson}">${lesson}</option>`)
        .join('');
}

// ==========================================
// ĐIỀU HƯỚNG GIAO DIỆN (TABS)
// ==========================================
function showSection(sectionId) {
    document.getElementById('sec-config').style.display = 'none';
    document.getElementById('sec-create').style.display = 'none';
    
    const navButtons = document.querySelectorAll('nav button');
    navButtons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(sectionId).style.display = 'block';

    if (sectionId === 'sec-config') {
        document.getElementById('nav-config').classList.add('active');
    } else if (sectionId === 'sec-create') {
        document.getElementById('nav-create').classList.add('active');
    }
}

// Gắn sự kiện chuyển tab
document.getElementById('nav-config').addEventListener('click', () => showSection('sec-config'));
document.getElementById('nav-create').addEventListener('click', () => showSection('sec-create'));

// GẮN SỰ KIỆN: Thay đổi Lớp -> Tự động đổi danh sách Bài dạy
document.getElementById('sel-grade').addEventListener('change', updateLessonOptions);

// ==========================================
// LƯU CẤU HÌNH API
// ==========================================
function saveConfig() {
    const apiKey = document.getElementById('api-key').value.trim();
    const provider = document.getElementById('api-provider').value;

    if (!apiKey) {
        alert("Vui lòng nhập API Key trước khi lưu!");
        return;
    }

    if ((provider === 'openai' || provider === 'openrouter') && !apiKey.startsWith('sk-')) {
        alert("⚠️ Cảnh báo: API Key của OpenAI/OpenRouter thường bắt đầu bằng 'sk-'. Vui lòng kiểm tra lại!");
    }

    localStorage.setItem('khbd_api_key', apiKey);
    localStorage.setItem('khbd_api_provider', provider);

    const btn = document.querySelector('button[onclick="saveConfig()"]');
    const originalText = btn.innerText;
    
    btn.innerText = "✅ Đã lưu! Đang chuyển trang...";
    btn.style.backgroundColor = "var(--success-color)"; 

    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = ""; 
        showSection('sec-create');
    }, 1500);
}

// ==========================================
// KHỞI TẠO TRANG (WINDOW ONLOAD)
// ==========================================
window.onload = function() {
    // 1. Nạp danh sách bài học lần đầu cho Lớp mặc định
    updateLessonOptions();

    // 2. Kiểm tra API Key đã lưu
    const savedKey = localStorage.getItem('khbd_api_key');
    const savedProvider = localStorage.getItem('khbd_api_provider');
    
    if (savedKey) {
        document.getElementById('api-key').value = savedKey;
        showSection('sec-create');
    } else {
        showSection('sec-config');
    }

    if (savedProvider) {
        document.getElementById('api-provider').value = savedProvider;
    }
};
