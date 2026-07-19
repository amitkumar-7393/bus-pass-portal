
let passes = JSON.parse(localStorage.getItem("busPasses")) || [];
function openAdminModal() {
    document.getElementById("adminModal").style.display = "flex";
}
function closeAdminModal() {
    document.getElementById("adminModal").style.display = "none";
}

function togglePassVisibility() {
    const pswd = document.getElementById("adminPassword");
    const icon = document.getElementById("togglePassword");
    if (pswd.type === "password") {
        pswd.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        pswd.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    }
}

function verifyAdmin() {
    if (document.getElementById("adminPassword").value === "admin123") {
        sessionStorage.setItem("isAdmin", "true");
        window.location.href = "view.html";
    } else {
        alert("Access Denied: Invalid Password");
    }
}
const form = document.getElementById("passForm");
if (form) {
    form.addEventListener("submit", e => {
        e.preventDefault();
        const studentData = {
            name: document.getElementById("name").value,
            roll: document.getElementById("roll").value,
            course: document.getElementById("course").value,
            route: document.getElementById("route").value,
            id: Date.now()
        };
        passes.push(studentData);
        localStorage.setItem("busPasses", JSON.stringify(passes));
        
        document.getElementById("successModal").style.display = "flex";
        form.reset();
    });
}

/* Admin Dashboard Table & Search */
const tableBody = document.getElementById("passTableBody");
if (tableBody) {
    if (sessionStorage.getItem("isAdmin") !== "true") {
        window.location.href = "index.html";
    }
    renderTable(passes);
}

function renderTable(data) {
    if(!tableBody) return;
    tableBody.innerHTML = "";
    
    if(data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px;">No records found</td></tr>`;
        return;
    }

    data.forEach((p) => {
        const originalIndex = passes.indexOf(p);
        tableBody.innerHTML += `
        <tr>
            <td>${p.name}</td>
            <td>${p.roll}</td>
            <td>${p.course}</td>
            <td>${p.route}</td>
            <td class="action-cell">
                <button class="dl-btn" onclick="downloadIndividualPass(${originalIndex})">
                    <i class="fas fa-qrcode"></i> QR Pass
                </button>
                <button class="del-btn" onclick="deletePass(${originalIndex})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>`;
    });
}

function searchTable() {
    const term = document.getElementById("searchInput").value.toLowerCase();
    const filtered = passes.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.roll.toLowerCase().includes(term) ||
        p.course.toLowerCase().includes(term)
    );
    renderTable(filtered);
}

/* QR Generation & PDF Download */
function downloadIndividualPass(index) {
    const p = passes[index];
    const tempDiv = document.createElement("div");
    tempDiv.className = "pdf-export-card";
    
    tempDiv.innerHTML = `
        <div style="padding: 30px; border: 8px solid #3a7bd5; text-align: center; font-family: sans-serif; background: white; width: 350px;">
            <h1 style="color: #3a7bd5; margin: 0; font-size: 24px;">STUDENT BUS PASS</h1>
            <p style="margin-bottom: 20px; font-weight: bold; color: #555;">Official Identity Document</p>
            <div id="tempQr" style="display: flex; justify-content: center; margin: 20px 0;"></div>
            <div style="text-align: left; display: block; border-top: 2px solid #eee; padding-top: 15px;">
                <p><strong>Name:</strong> ${p.name}</p>
                <p><strong>Roll No:</strong> ${p.roll}</p>
                <p><strong>Course:</strong> ${p.course}</p>
                <p><strong>Route:</strong> ${p.route}</p>
            </div>
            <p style="font-size: 10px; color: #888; margin-top: 15px;">Valid for Academic Year 2025-26</p>
        </div>
    `;
    document.body.appendChild(tempDiv);
    
    // QR data includes Name, Roll, and Course
    const qrData = `Name: ${p.name} | Roll: ${p.roll} | Course: ${p.course} | Route: ${p.route}`;
    new QRCode(document.getElementById("tempQr"), { text: qrData, width: 160, height: 160 });

    setTimeout(() => {
        html2pdf().from(tempDiv).save(`${p.name}_BusPass.pdf`);
        setTimeout(() => document.body.removeChild(tempDiv), 500);
    }, 600);
}

function deletePass(i) {
    if(confirm("Permanently delete this student record?")) {
        passes.splice(i, 1);
        localStorage.setItem("busPasses", JSON.stringify(passes));
        renderTable(passes);
    }
}

function clearAllData() {
    if(confirm("Are you sure? This will delete the entire student database!")) {
        localStorage.removeItem("busPasses");
        passes = [];
        renderTable(passes);
    }
}

