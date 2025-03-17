document.addEventListener('DOMContentLoaded', () => {
    loadMemberDropdown();
    loadTalentColumns(); // This loads the checkboxes
    document.getElementById('member_search').addEventListener('input', filterMemberDropdown);
    document.getElementById('member_search').addEventListener('focus', () => filterMemberDropdown());
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#member_search') && !e.target.closest('#member_dropdown')) {
            document.getElementById('member_dropdown').style.display = 'none';
        }
    });
});

let allMembers = [];
let selectedMemberId = null;
let allTalents = [];
let allCategories = [];

function loadMemberDropdown() {
    fetch('/members')
        .then(response => response.json())
        .then(members => {
            allMembers = members;
        })
        .catch(error => console.error('Error loading member dropdown:', error));
}

function filterMemberDropdown() {
    const searchValue = document.getElementById('member_search').value.toLowerCase();
    const dropdown = document.getElementById('member_dropdown');
    dropdown.innerHTML = '';
    
    const filteredMembers = allMembers.filter(member => 
        `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchValue) ||
        member.member_id.toString().includes(searchValue)
    );

    if (filteredMembers.length > 0 && searchValue) {
        filteredMembers.forEach(member => {
            const item = document.createElement('a');
            item.className = 'dropdown-item';
            item.href = '#';
            item.textContent = `${member.member_id} - ${member.first_name} ${member.last_name}`;
            item.addEventListener('click', (e) => {
                e.preventDefault();
                selectedMemberId = member.member_id;
                document.getElementById('member_search').value = item.textContent;
                dropdown.style.display = 'none';
                refreshTalentCheckboxes();
                refreshTalentNotes();
            });
            dropdown.appendChild(item);
        });
        dropdown.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
    }
}

function loadTalentColumns() {
    fetch('/talent-categories')
        .then(response => response.json())
        .then(categories => {
            allCategories = categories;
            fetch('/talents')
                .then(response => response.json())
                .then(talents => {
                    allTalents = talents;
                    renderTalentColumns(); // This renders the checkboxes initially
                })
                .catch(error => console.error('Error loading talents:', error));
        })
        .catch(error => console.error('Error loading categories:', error));
}

function renderTalentColumns(memberTalents = []) {
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
                const isChecked = memberTalents.includes(talent.talent_id) ? 'checked' : '';
                div.innerHTML = `
                    <input class="form-check-input" type="checkbox" name="talent_ids" value="${talent.talent_id}" id="talent_${talent.talent_id}" ${isChecked}>
                    <label class="form-check-label" for="talent_${talent.talent_id}">${talent.talent_name}</label>
                `;
                col.appendChild(div);
            });
        }
        container.appendChild(col);
    });
}

function refreshTalentCheckboxes() {
    if (selectedMemberId) {
        fetch(`/members/${selectedMemberId}/talent-ids`)
            .then(response => response.json())
            .then(talentIds => renderTalentColumns(talentIds)) // This updates checkboxes with member talents
            .catch(error => console.error('Error loading member talents:', error));
    } else {
        renderTalentColumns(); // Reset to unchecked if no member selected
    }
}

function refreshTalentNotes() {
    if (selectedMemberId) {
        fetch(`/members/${selectedMemberId}/talents`)
            .then(response => response.json())
            .then(memberTalents => {
                const notes = memberTalents[0] ? memberTalents[0].notes : '';
                document.getElementById('notes').value = notes;
            })
            .catch(error => console.error('Error loading member notes:', error));
    }
}

document.getElementById('addTalentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const checkedTalents = Array.from(document.querySelectorAll('input[name="talent_ids"]:checked'))
        .map(input => input.value);
    if (!selectedMemberId) {
        alert('Please select a member.');
        return;
    }
    const talentData = {
        member_id: selectedMemberId,
        predefined_talent_ids: checkedTalents,
        notes: document.getElementById('notes').value || null
    };
    fetch(`/members/${selectedMemberId}/talents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(talentData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        this.reset();
        selectedMemberId = null;
        document.getElementById('member_search').value = '';
        renderTalentColumns();
    })
    .catch(error => console.error('Error updating talents:', error));
});