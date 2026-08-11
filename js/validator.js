// Quy trình Generate -> Validate -> Fix

let currentKHBD = null;

async function generateKHBD() {
    document.getElementById('loading').style.display = 'block';
    try {
        const requestData = {
            grade: document.getElementById('sel-grade').value,
            book: document.getElementById('sel-book').value,
            lessonName: document.getElementById('lesson-name').value,
            condition: document.getElementById('sel-condition').value
        };
        
        // 1. Retrieval
        const context = await searchKnowledgeBase(requestData.lessonName);
        
        // 2. Generate
        currentKHBD = await callAI(context, requestData);
        
        // 3. Validate
        const validationResults = validateKHBD(currentKHBD);
        displayValidation(validationResults);
        
    } catch (e) {
        alert("Lỗi: " + e.message);
    }
    document.getElementById('loading').style.display = 'none';
}

function validateKHBD(json) {
    let errors = [];
    if (!json.activities || json.activities.length < 4) errors.push("Thiếu hoạt động (cần đủ 4: Mở đầu, HTKT, Luyện tập, Vận dụng)");
    
    //  !json.objectives để tránh lỗi undefined
    if (!json.objectives || !json.objectives.informaticsCompetencies || json.objectives.informaticsCompetencies.length === 0) errors.push("Thiếu năng lực Tin học");
    
    // Bạn có thể thêm các rule khác tại đây
    return errors;
}

function displayValidation(errors) {
    const box = document.getElementById('validation-box');
    const list = document.getElementById('validation-list');
    box.style.display = 'block';
    list.innerHTML = '';
    
    if (errors.length === 0) {
        list.innerHTML = "<li style='color:green'>✓ Hoàn hảo. Không phát hiện lỗi.</li>";
        document.getElementById('btn-fix').style.display = 'none';
        document.getElementById('btn-export').style.display = 'block';
    } else {
        errors.forEach(err => {
            list.innerHTML += `<li style='color:red'>✗ ${err}</li>`;
        });
        document.getElementById('btn-fix').style.display = 'inline-block';
        document.getElementById('btn-export').style.display = 'none';
    }
}

// Tính năng Tự sửa lỗi (Cho AI feedback lại chính JSON bị lỗi và yêu cầu sửa)
// Tự động sửa lỗi (Đã hoàn thiện)
async function autoFix() {
    document.getElementById('loading').style.display = 'block';
    try {
        const requestData = {
            grade: document.getElementById('sel-grade').value,
            book: document.getElementById('sel-book').value,
            lessonName: document.getElementById('lesson-name').value,
            condition: document.getElementById('sel-condition').value
        };
        
        const errors = validateKHBD(currentKHBD);
        const fixPrompt = `Hệ thống phát hiện các lỗi sau trong cấu trúc KHBD: ${errors.join(", ")}. Hãy sửa lại theo đúng yêu cầu và trả về JSON chuẩn. Dữ liệu KHBD bị lỗi: ${JSON.stringify(currentKHBD)}`;
        
        currentKHBD = await callAI(fixPrompt, requestData);
        
        // Validate lại
        const validationResults = validateKHBD(currentKHBD);
        displayValidation(validationResults);
        
    } catch (e) {
        alert("Lỗi khi tự động sửa: " + e.message);
    }
    document.getElementById('loading').style.display = 'none';
}