// Hàm quản lý chuyển đổi các màn hình (Tabs)
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

document.getElementById('nav-config').addEventListener('click', () => showSection('sec-config'));
document.getElementById('nav-create').addEventListener('click', () => showSection('sec-create'));

// kiểm tra tính hợp lệ của API Key
async function verifyApiKey(provider, apiKey) {
    try {
        if (provider === 'gemini') {
            // Gửi một request cực nhỏ (chỉ 1 chữ "hi") đến Gemini
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
            });
            return res.ok;
        } else if (provider === 'openai') {
            // Kiểm tra bằng cách lấy danh sách model của OpenAI
            const res = await fetch('https://api.openai.com/v1/models', {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            return res.ok;
        } else if (provider === 'openrouter') {
            // Kiểm tra bằng auth endpoint của OpenRouter
            const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            return res.ok;
        }
    } catch (e) {
        console.error("Lỗi mạng khi kiểm tra API:", e);
        return false;
    }
    return false;
}

// Hàm lưu cấu hình AI (Thêm await và logic kiểm tra)
async function saveConfig() {
    const apiKey = document.getElementById('api-key').value.trim();
    const provider = document.getElementById('api-provider').value;

    if (!apiKey) {
        alert("Vui lòng nhập API Key trước khi lưu!");
        return;
    }

    const btn = document.querySelector('button[onclick="saveConfig()"]');
    const originalText = btn.innerText;
    
    // 1. Hiển thị trạng thái đang kiểm tra (Khóa nút bấm)
    btn.innerText = "⏳ Đang kiểm tra kết nối...";
    btn.style.backgroundColor = "var(--text-muted)"; // Chuyển màu xám
    btn.disabled = true;

    // 2. Gọi hàm xác thực
    const isValid = await verifyApiKey(provider, apiKey);

    // 3. Xử lý kết quả
    if (!isValid) {
        alert("❌ API Key không hợp lệ, đã hết hạn, hoặc không có kết nối mạng. Vui lòng kiểm tra lại!");
        // Trả lại trạng thái nút
        btn.innerText = originalText;
        btn.style.backgroundColor = ""; 
        btn.disabled = false;
        return; // Dừng lại, không cho phép lưu
    }

    // 4. Nếu hợp lệ -> Lưu vào LocalStorage
    localStorage.setItem('khbd_api_key', apiKey);
    localStorage.setItem('khbd_api_provider', provider);

    // 5. Hiển thị thành công và chuyển trang
    btn.innerText = "✅ Key hợp lệ! Đang chuyển trang...";
    btn.style.backgroundColor = "var(--success-color)";

    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = ""; 
        btn.disabled = false;
        showSection('sec-create');
    }, 1500);
}

// Chạy khi vừa load trang
window.onload = function() {
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