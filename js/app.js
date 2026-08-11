// Hàm quản lý chuyển đổi các màn hình (Tabs)
function showSection(sectionId) {
    // 1. Ẩn tất cả các section
    document.getElementById('sec-config').style.display = 'none';
    document.getElementById('sec-create').style.display = 'none';
    
    // 2. Bỏ class active ở tất cả các nút nav (nếu có)
    const navButtons = document.querySelectorAll('nav button');
    navButtons.forEach(btn => btn.classList.remove('active'));

    // 3. Hiển thị section được yêu cầu
    document.getElementById(sectionId).style.display = 'block';

    // 4. Highlight nút nav tương ứng
    if (sectionId === 'sec-config') {
        document.getElementById('nav-config').classList.add('active');
    } else if (sectionId === 'sec-create') {
        document.getElementById('nav-create').classList.add('active');
    }
}

// Gắn sự kiện cho các nút trên thanh menu (Navigation)
document.getElementById('nav-config').addEventListener('click', () => showSection('sec-config'));
document.getElementById('nav-create').addEventListener('click', () => showSection('sec-create'));
// Nếu có nút nav-docs (Kho tài liệu), bạn có thể gắn tương tự sau này.

// Hàm lưu cấu hình AI
function saveConfig() {
    const apiKey = document.getElementById('api-key').value.trim();
    const provider = document.getElementById('api-provider').value;

    if (!apiKey) {
        alert("Vui lòng nhập API Key trước khi lưu!");
        return;
    }

    // THÊM MỚI: Kiểm tra định dạng cơ bản của API Key
    if (provider === 'gemini') {
        alert("⚠️ Cảnh báo: API Key của Google Gemini thường bắt đầu bằng chữ 'AIza'. Vui lòng kiểm tra lại!");
        // Có thể thêm return; ở đây nếu bạn muốn chặn không cho lưu
    } else if ((provider === 'openai' || provider === 'openrouter') && !apiKey.startsWith('sk-')) {
        alert("⚠️ Cảnh báo: API Key của OpenAI/OpenRouter thường bắt đầu bằng 'sk-'. Vui lòng kiểm tra lại!");
    }

    // Lưu vào LocalStorage của trình duyệt
    localStorage.setItem('khbd_api_key', apiKey);
    localStorage.setItem('khbd_api_provider', provider);

    // Tạo hiệu ứng phản hồi cho người dùng
    const btn = document.querySelector('button[onclick="saveConfig()"]');
    const originalText = btn.innerText;
    
    btn.innerText = "✅ Đã lưu! Đang chuyển trang...";
    btn.style.backgroundColor = "var(--success-color)"; 

    // Đợi 1.5 giây để người dùng đọc thông báo, sau đó tự động chuyển trang
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = ""; 
        showSection('sec-create');
    }, 1500);
}

// Chạy khi vừa load trang
window.onload = function() {
    const savedKey = localStorage.getItem('khbd_api_key');
    const savedProvider = localStorage.getItem('khbd_api_provider');
    
    if (savedKey) {
        // Điền sẵn thông tin cũ
        document.getElementById('api-key').value = savedKey;
        // Nếu đã có Key, ưu tiên hiển thị thẳng màn hình Tạo KHBD
        showSection('sec-create');
    } else {
        // Nếu chưa có Key (lần đầu sử dụng), bắt buộc ở màn hình Cấu hình
        showSection('sec-config');
    }

    if (savedProvider) {
        document.getElementById('api-provider').value = savedProvider;
    }
};