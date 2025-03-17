document.addEventListener('DOMContentLoaded', () => {
    loadTalentColumns();
    document.getElementById('talentSearchForm').addEventListener('submit', searchMembersByTalents);
    document.getElementById('printButton').addEventListener('click', () => window.print());
    // Hide filter summary and print button initially
    document.getElementById('filterSummary').style.display = 'none';
    document.getElementById('printButton').style.display = 'none';
});

let allTalents = [];
let allCategories = [];

function loadTalentColumns() {
    fetch('/talent-categories')
        .then(response => response.json())
        .then(categories => {
            allCategories = categories;
            fetch('/talents')
                .then(response => response.json())
                .then(talents => {
                    allTalents = talents;
                    renderTalentColumns();
                })
                .catch(error => console.error('Error loading talents:', error));
        })
        .catch(error => console.error('Error loading categories:', error));
}

function renderTalentColumns() {
    const container = document.getElementById('talentColumns');
    container.innerHTML = '';
    const colWidth = 4; // 3 columns
    allCategories.forEach(category => {
        const col = document.createElement('div');
        col.className = `col-md-${colWidth} mb-3`;
        col.innerHTML = `<h5>${category.category_name}</h5>`;
        const talentsInCategory = allTalents.filter(talent => talent.category_id === category.category_id);
        if (talentsInCategory.length === 0) {
            col.innerHTML += '<p>No talents available.</p>';
        } else {
            talentsInCategory.forEach(talent => {
                const div = document.createElement('div');
                div.className = 'form-check';
                div.innerHTML = `
                    <input class="form-check-input" type="checkbox" name="talent_ids" value="${talent.talent_id}" id="talent_${talent.talent_id}">
                    <label class="form-check-label" for="talent_${talent.talent_id}">${talent.talent_name}</label>
                `;
                col.appendChild(div);
            });
        }
        container.appendChild(col);
    });
}

function searchMembersByTalents(e) {
    e.preventDefault();
    const selectedTalents = Array.from(document.querySelectorAll('input[name="talent_ids"]:checked'))
        .map(input => parseInt(input.value));
    
    if (selectedTalents.length === 0) {
        alert('Please select at least one talent to filter by.');
        return;
    }

    const talentNames = allTalents
        .filter(talent => selectedTalents.includes(talent.talent_id))
        .map(talent => talent.talent_name)
        .join(', ');
    
    fetch('/members/by-talents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ talent_ids: selectedTalents })
    })
    .then(response => response.json())
    .then(members => {
        const tbody = document.querySelector('#resultsTable tbody');
        tbody.innerHTML = '';
        members.forEach(member => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${member.member_id}</td>
                <td>${member.first_name} ${member.last_name}</td>
                <td>${member.email || ''}</td>
                <td>${member.phone || ''}</td>
                <td>${member.address || ''}</td>
                <td>${member.city || ''}</td>
                <td>${member.state || ''}</td>
                <td>${member.zip_code || ''}</td>
            `;
            tbody.appendChild(row);
        });

        // Show filter summary and print button
        document.getElementById('selectedTalents').textContent = talentNames;
        document.getElementById('filterSummary').style.display = 'block';
        document.getElementById('printButton').style.display = 'inline-block';
    })
    .catch(error => console.error('Error fetching members:', error));
}
