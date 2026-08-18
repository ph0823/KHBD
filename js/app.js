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
    "Bài 6. Mạng thông tin toàn cầu",
    "Bài 7. Tìm kiếm thông tin trên Internet",
    "Bài 8. Thư điện tử",
    "Bài 9. An toàn thông tin trên Internet",
    "Bài 10. Sơ đồ tư duy",
    "Bài 11. Định dạng văn bản",
    "Bài 12. Trình bày thông tin ở dạng bảng",
    "Bài 13. Thực hành: Tìm kiếm và thay thế",
    "Bài 14. Thực hành tổng hợp: Hoàn thiện sổ lưu niệm",
    "Bài 15. Thuật toán",
    "Bài 16. Các cấu trúc điều khiển",
    "Bài 17. Chương trình máy tính"
  ],
  "7": [
    "Bài 1. Thiết bị vào – ra",
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
    "Bài 13. Thực hành tổng hợp: Hoàn thiện bài trình chiếu",
    "Bài 14. Thuật toán tìm kiếm tuần tự",
    "Bài 15. Thuật toán tìm kiếm nhị phân",
    "Bài 16. Thuật toán sắp xếp"
  ],
  "8": [
    "Bài 1. Lược sử công cụ tính toán",
    "Bài 2. Thông tin trong môi trường số",
    "Bài 3. Thực hành: Khai thác thông tin số",
    "Bài 4. Đạo đức và văn hoá trong sử dụng công nghệ kĩ thuật số",
    "Bài 5. Sử dụng bảng tính giải quyết bài toán thực tế",
    "Bài 6. Sắp xếp và lọc dữ liệu",
    "Bài 7. Trực quan hoá dữ liệu",
    "Bài 8a. Làm việc với danh sách dạng liệt kê và hình ảnh trong văn bản",
    "Bài 9a. Tạo đầu trang, chân trang cho văn bản",
    "Bài 10a. Định dạng nâng cao cho trang chiếu",
    "Bài 11a. Sử dụng bản mẫu tạo bài trình chiếu",
    "Bài 8b. Phần mềm chỉnh sửa ảnh",
    "Bài 9b. Thay đổi khung hình, kích thước ảnh",
    "Bài 10b. Thêm văn bản, tạo hiệu ứng cho ảnh",
    "Bài 11b. Thực hành tổng hợp",
    "Bài 12. Từ thuật toán đến chương trình",
    "Bài 13. Biểu diễn dữ liệu",
    "Bài 14. Cấu trúc điều khiển",
    "Bài 15. Gỡ lỗi",
    "Bài 16. Tin học với nghề nghiệp"
  ],
  "9": [
    "Bài 1. Thế giới kĩ thuật số",
    "Bài 2. Thông tin trong giải quyết vấn đề",
    "Bài 3. Thực hành: Đánh giá chất lượng thông tin",
    "Bài 4. Một số vấn đề pháp lí về sử dụng dịch vụ Internet",
    "Bài 5. Tìm hiểu phần mềm mô phỏng",
    "Bài 6. Thực hành: Khai thác phần mềm mô phỏng",
    "Bài 7. Trình bày thông tin trong trao đổi và hợp tác",
    "Bài 8. Thực hành: Sử dụng công cụ trực quan trình bày thông tin trong trao đổi và hợp tác",
    "Bài 9a. Sử dụng công cụ xác thực dữ liệu",
    "Bài 10a. Sử dụng hàm COUNTIF",
    "Bài 11a. Sử dụng hàm SUMIF",
    "Bài 12a. Sử dụng hàm IF",
    "Bài 13a. Hoàn thiện bảng tính quản lí tài chính gia đình",
    "Bài 9b. Các chức năng chính của phần mềm làm video",
    "Bài 10b. Chuẩn bị dữ liệu và dựng video",
    "Bài 11b. Thực hành: Dựng video theo kịch bản",
    "Bài 12b. Hoàn thành việc dựng video",
    "Bài 13b. Biên tập và xuất video",
    "Bài 14. Giải quyết vấn đề",
    "Bài 15. Bài toán tin học",
    "Bài 16. Thực hành: Lập chương trình máy tính",
    "Bài 17. Tin học và thế giới nghề nghiệp"
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
    // 1. Ẩn tất cả các màn hình
    document.getElementById('sec-config').style.display = 'none';
    document.getElementById('sec-create').style.display = 'none';
    document.getElementById('sec-docs').style.display = 'none'; // Thêm màn hình kho tài liệu
    
    // 2. Bỏ highlight ở tất cả nút nav
    const navButtons = document.querySelectorAll('nav button');
    navButtons.forEach(btn => btn.classList.remove('active'));

    // 3. Hiển thị màn hình được chọn
    const targetSec = document.getElementById(sectionId);
    if (targetSec) targetSec.style.display = 'block';

    // 4. Highlight nút nav tương ứng
    if (sectionId === 'sec-config') {
        document.getElementById('nav-config').classList.add('active');
    } else if (sectionId === 'sec-create') {
        document.getElementById('nav-create').classList.add('active');
    } else if (sectionId === 'sec-docs') {
        document.getElementById('nav-docs').classList.add('active');
        // Khi mở kho tài liệu, tự động hiển thị danh sách các file đã lưu
        if (typeof renderDocList === 'function') renderDocList();
    }
}

// Gắn sự kiện click cho nút nav Kho tài liệu
document.getElementById('nav-docs').addEventListener('click', () => showSection('sec-docs'));

// Sự kiện khi người dùng chọn file từ máy tính
document.getElementById('file-input').addEventListener('change', function(e) {
    const files = e.target.files;
    const infoText = document.getElementById('selected-files-text');
    const btnProcess = document.getElementById('btn-process-file');
    
    if (files.length > 0) {
        infoText.innerText = `Đã chọn ${files.length} file: ` + Array.from(files).map(f => f.name).join(', ');
        btnProcess.style.display = 'inline-block';
    } else {
        infoText.innerText = 'Chưa chọn file nào';
        btnProcess.style.display = 'none';
    }
});

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
