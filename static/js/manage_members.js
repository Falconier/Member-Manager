document.addEventListener('DOMContentLoaded', () => {
    loadMemberDropdown();
    document.getElementById('edit_member_search').addEventListener('input', filterEditMemberDropdown);
    document.getElementById('edit_member_search').addEventListener('focus', () => filterEditMemberDropdown());
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#edit_member_search') && !e.target.closest('#edit_member_dropdown')) {
            document.getElementById('edit_member_dropdown').style.display = 'none';
        }
    });
});

let allMembers = [];
let selectedEditMemberId = null;

function loadMemberDropdown() {
    fetch('/members')
        .then(response => response.json())
        .then(members => {
            allMembers = members;
        })
        .catch(error => console.error('Error loading member dropdown:', error));
}

function filterEditMemberDropdown() {
    const searchValue = document.getElementById('edit_member_search').value.toLowerCase();
    const dropdown = document.getElementById('edit_member_dropdown');
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
                selectedEditMemberId = member.member_id;
                document.getElementById('edit_member_search').value = item.textContent;
                dropdown.style.display = 'none';
                loadMemberDetails(member.member_id);
            });
            dropdown.appendChild(item);
        });
        dropdown.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
    }
}

function loadMemberDetails(memberId) {
    const member = allMembers.find(m => m.member_id === memberId);
    if (member) {
        document.getElementById('edit_first_name').value = member.first_name;
        document.getElementById('edit_last_name').value = member.last_name;
        document.getElementById('edit_email').value = member.email || '';
        document.getElementById('edit_phone').value = member.phone || '';
        document.getElementById('edit_address').value = member.address || '';
        document.getElementById('edit_city').value = member.city || '';
        document.getElementById('edit_state').value = member.state || '';
        document.getElementById('edit_zip_code').value = member.zip_code || '';
    }
}

document.getElementById('addMemberForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const memberIdInput = document.getElementById('member_id').value;
    const member = {
        member_id: memberIdInput ? parseInt(memberIdInput) : null,
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        email: document.getElementById('email').value || null,
        phone: document.getElementById('phone').value || null,
        address: document.getElementById('address').value || null,
        city: document.getElementById('city').value || null,
        state: document.getElementById('state').value || null,
        zip_code: document.getElementById('zip_code').value || null
    };
    fetch('/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message); });
        }
        return response.json();
    })
    .then(data => {
        alert(`Member added with ID: ${data.member_id}`);
        this.reset();
        loadMemberDropdown();
    })
    .catch(error => {
        alert(`Error adding member: ${error.message}`);
        console.error('Error adding member:', error);
    });
});

document.getElementById('editMemberForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!selectedEditMemberId) {
        alert('Please select a member to edit.');
        return;
    }
    const member = {
        first_name: document.getElementById('edit_first_name').value,
        last_name: document.getElementById('edit_last_name').value,
        email: document.getElementById('edit_email').value || null,
        phone: document.getElementById('edit_phone').value || null,
        address: document.getElementById('edit_address').value || null,
        city: document.getElementById('edit_city').value || null,
        state: document.getElementById('edit_state').value || null,
        zip_code: document.getElementById('edit_zip_code').value || null
    };
    fetch(`/members/${selectedEditMemberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        this.reset();
        selectedEditMemberId = null;
        document.getElementById('edit_member_search').value = '';
        loadMemberDropdown();
    })
    .catch(error => console.error('Error updating member:', error));
});
