let companies = [];
let prixReferentiel = 0;

function addRow() {
    let tbody = document.getElementById("tbody");

    let row = document.createElement("tr");

    row.innerHTML = `
        <td><input class="company" type="text" placeholder="Nom société"></td>
        <td><input class="before" type="number" value="0"></td>
        <td><input class="after" type="number" value="0"></td>
    `;

    tbody.appendChild(row);
}

function calculate() {

    companies = [];

    let rows = document.querySelectorAll("#tbody tr");

    rows.forEach(row => {
        let name = row.querySelector(".company").value.trim();
        let before = parseFloat(row.querySelector(".before").value) || 0;
        let after = parseFloat(row.querySelector(".after").value) || 0;

        if (name !== "") {
            companies.push({ name, before, after });
        }
    });

    let adminPrice = parseFloat(document.getElementById("adminPrice").value) || 0;

    if (companies.length === 0) return;

    let nature = document.getElementById("nature").value;
    let etudiants = document.getElementById("etudiants").value;

    // 📊 prix référentiel الأولي
    let total = companies.reduce((sum, c) => sum + c.after, 0);
    let moyenne = total / companies.length;
    prixReferentiel = (moyenne + adminPrice) / 2;

    // 🚫 الإقصاء
    let filtered = companies.filter(c => {

        let p = c.after;

        if (nature === "travaux") {
            return !(p > prixReferentiel * 1.20 || p < prixReferentiel * 0.80);
        }

        if (nature === "fourniture") {
            return !(p > prixReferentiel * 1.20 || p < prixReferentiel * 0.75);
        }

        if (nature === "service") {

            if (etudiants === "non") {
                return !(p > prixReferentiel * 1.20 || p < prixReferentiel * 0.80);
            }

            if (etudiants === "oui") {
                return true; // ما كاينش إقصاء
            }
        }

        return true;
    });

    if (filtered.length === 0) {
        document.getElementById("result").innerHTML =
            "<h3>❌ Aucune entreprise retenue</h3>";
        return;
    }

    // 📌 prix référentiel النهائي
    let total2 = filtered.reduce((sum, c) => sum + c.after, 0);
    prixReferentiel = (total2 / filtered.length + adminPrice) / 2;

    // 🔽 الترتيب حسب الأقرب
    let sorted = filtered.map(c => ({
        ...c,
        gap: Math.abs(c.after - prixReferentiel)
    }));

    sorted.sort((a, b) => a.gap - b.gap);

    // 📊 العرض
    let html = `
        <h3>📊 Prix Référentiel: ${prixReferentiel.toFixed(2)} DH</h3>
        <table border="1" width="100%" style="margin-top:10px;">
            <tr>
                <th>Rang</th>
                <th>Entreprise</th>
                <th>Avant</th>
                <th>Après</th>
            </tr>
    `;

    sorted.forEach((c, i) => {
        html += `
            <tr>
                <td>${i + 1}</td>
                <td>${c.name}</td>
                <td>${c.before}</td>
                <td>${c.after}</td>
            </tr>
        `;
    });

    html += "</table>";

    document.getElementById("result").innerHTML = html;
}


// 🔽 إظهار / إخفاء service option
const nature = document.getElementById("nature");
const etudiantsDiv = document.getElementById("etudiantsDiv");
const etudiants = document.getElementById("etudiants");

nature.addEventListener("change", function () {

    if (this.value === "service") {
        etudiantsDiv.style.display = "block";
    } else {
        etudiantsDiv.style.display = "none";
    }

    // إعادة الحساب مباشرة بدون مسح الجدول
    if (document.querySelectorAll("#tbody tr").length > 0) {
        calculate();
    }
});

// إعادة الحساب عند تغيير Oui / Non
etudiants.addEventListener("change", function () {

    if (document.querySelectorAll("#tbody tr").length > 0) {
        calculate();
    }
});