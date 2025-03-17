document.addEventListener('DOMContentLoaded', () => {
    loadMembers();
});

function loadMembers() {
    fetch('/members')
        .then(response => response.json())
        .then(members => {
            const tbody = document.querySelector('#memberTable tbody');
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
                    <td><button class="btn btn-info btn-sm" onclick="viewTalents(${member.member_id})">View Talents</button></td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error loading members:', error));
}

function viewTalents(memberId) {
    fetch(`/members/${memberId}/talents`)
        .then(response => response.json())
        .then(talents => {
            const talentList = talents.map(t => `${t.category_name}: ${t.talent_name} ${t.notes ? '(' + t.notes + ')' : ''}`).join('\n');
            alert('Member Talents:\n' + (talentList || 'No talents assigned.'));
        })
        .catch(error => console.error('Error loading talents:', error));
}