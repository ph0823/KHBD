// Hàm lưu cấu hình AI
function saveConfig() {
    const apiKey = document.getElementById('api-key').value.trim();
    const provider = document.getElementById('api-provider').value;

    if (!apiKey) {
        alert("Vui lòng nhập API Key trước khi lưu!");
        return;
    }

    // Lưu vào LocalStorage của trình duyệt
    localStorage.setItem('khbd_api_key', apiKey);
    localStorage.setItem('khbd_api_provider', provider);

    // Tạo hiệu ứng phản hồi cho người dùng (Đổi nút thành màu xanh)
    const btn = document.querySelector('button[onclick="saveConfig()"]');
    const originalText = btn.innerText;
    
    btn.innerText = "✅ Đã lưu thành công!";
    btn.style.backgroundColor = "var(--success-color)"; // Chuyển sang màu xanh lá

    // Trả lại trạng thái ban đầu sau 2 giây
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = ""; // Trả về màu CSS mặc định
    }, 2000);
}

// Tự động điền lại Key cũ khi tải lại trang web
window.onload = function() {
    const savedKey = localStorage.getItem('khbd_api_key');
    const savedProvider = localStorage.getItem('khbd_api_provider');
    
    if (savedKey) {
        document.getElementById('api-key').value = savedKey;
    }
    if (savedProvider) {
        document.getElementById('api-provider').value = savedProvider;
    }
};