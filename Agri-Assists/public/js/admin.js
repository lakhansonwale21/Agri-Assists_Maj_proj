// Admin.js - Client-Side Logic for Admin Panel

document.addEventListener('DOMContentLoaded', () => {
    // Security check: ensure user is admin
    const role = getUserRole();
    if (role !== 'admin') {
        window.location.href = '/login';
        return;
    }

    // Initialize Dashboard Data
    fetchStats();
    fetchUsers();
    fetchSettings();
    fetchMessages();

    // Logout
    document.getElementById('logoutBtnAdmin')?.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    // Form submission for editing user
    document.getElementById('editUserForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editUserId').value;
        const name = document.getElementById('editUserName').value;
        const phone = document.getElementById('editUserPhone').value;
        const city = document.getElementById('editUserCity').value;

        const res = await apiCall(`/admin/users/${id}`, 'PUT', { name, phone, city });
        if (res.success) {
            showAlert('User updated successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
            fetchUsers(); // Refresh table
        } else {
            showAlert(res.message, 'danger');
        }
    });

    // Form submission for settings
    document.getElementById('settingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const settingsData = {
            siteName: document.getElementById('siteName').value,
            contactEmail: document.getElementById('contactEmail').value,
            contactPhone: document.getElementById('contactPhone').value,
            address: document.getElementById('address').value,
            aboutUs: document.getElementById('aboutUs').value,
            allowRegistrations: document.getElementById('allowRegistrations').checked,
            maintenanceMode: document.getElementById('maintenanceMode').checked
        };

        const res = await apiCall('/admin/settings', 'PUT', settingsData);
        if (res.success) {
            showAlert('Settings saved successfully', 'success');
        } else {
            showAlert(res.message || 'Error saving settings', 'danger');
        }
    });
});

window.switchTab = function(tab) {
    // Update active nav link
    document.querySelectorAll('.sidebar-nav li a').forEach(link => link.classList.remove('active'));
    document.querySelector(`.sidebar-nav li a[onclick="switchTab('${tab}')"]`).classList.add('active');

    document.getElementById('usersView').classList.add('d-none');
    document.getElementById('settingsView').classList.add('d-none');
    if(document.getElementById('messagesView')) document.getElementById('messagesView').classList.add('d-none');

    if (tab === 'users') {
        document.getElementById('dashboardTitle').textContent = 'Dashboard Overview';
        document.getElementById('usersView').classList.remove('d-none');
    } else if (tab === 'settings') {
        document.getElementById('dashboardTitle').textContent = 'Website Settings';
        document.getElementById('settingsView').classList.remove('d-none');
    } else if (tab === 'messages') {
        document.getElementById('dashboardTitle').textContent = 'Contact Messages';
        document.getElementById('messagesView').classList.remove('d-none');
    }
};

async function fetchSettings() {
    const res = await apiCall('/admin/settings');
    if (res.success && res.settings) {
        document.getElementById('siteName').value = res.settings.siteName || '';
        document.getElementById('contactEmail').value = res.settings.contactEmail || '';
        document.getElementById('contactPhone').value = res.settings.contactPhone || '';
        document.getElementById('address').value = res.settings.address || '';
        document.getElementById('aboutUs').value = res.settings.aboutUs || '';
        document.getElementById('allowRegistrations').checked = res.settings.allowRegistrations;
        document.getElementById('maintenanceMode').checked = res.settings.maintenanceMode;
    }
}

async function fetchStats() {
    const res = await apiCall('/admin/stats');
    if (res.success) {
        document.getElementById('statFarmers').textContent = res.stats.farmers;
        document.getElementById('statShopkeepers').textContent = res.stats.shopkeepers;
    }
}

async function fetchUsers() {
    const res = await apiCall('/admin/users');
    if (res.success) {
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';
        res.users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <div class="bg-light rounded-circle p-2 me-3 text-success">
                            <i class="fas fa-user"></i>
                        </div>
                        <div>
                            <span class="fw-bold d-block text-dark">${user.name}</span>
                            <small class="text-muted">${user.phone}</small>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td><span class="badge ${user.role === 'farmer' ? 'bg-success' : 'bg-primary'} px-3 py-2 rounded-pill">${user.role.toUpperCase()}</span></td>
                <td>${user.city}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary rounded-pill px-3 me-2" onclick="openEditModal('${user._id}', '${user.name}', '${user.phone}', '${user.city}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="deleteUser('${user._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function openEditModal(id, name, phone, city) {
    document.getElementById('editUserId').value = id;
    document.getElementById('editUserName').value = name;
    document.getElementById('editUserPhone').value = phone;
    document.getElementById('editUserCity').value = city;
    
    const myModal = new bootstrap.Modal(document.getElementById('editUserModal'));
    myModal.show();
}

async function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        const res = await apiCall(`/admin/users/${id}`, 'DELETE');
        if (res.success) {
            showAlert('User deleted successfully', 'success');
            fetchUsers();
            fetchStats();
        } else {
            showAlert(res.message, 'danger');
        }
    }
}

async function fetchMessages() {
    const res = await apiCall('/admin/messages');
    if (res.success) {
        const tbody = document.querySelector('#messagesTable tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        if(res.messages.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No messages found.</td></tr>';
            return;
        }
        res.messages.forEach(msg => {
            const dateStr = new Date(msg.createdAt).toLocaleDateString();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dateStr}</td>
                <td>
                    <span class="fw-bold d-block text-dark">${msg.name}</span>
                    <a href="mailto:${msg.email}" class="small text-muted text-decoration-none">${msg.email}</a>
                </td>
                <td class="fw-semibold">${msg.subject}</td>
                <td><div style="max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${msg.message}">${msg.message}</div></td>
                <td>
                    <button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="deleteAdminMessage('${msg._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

async function deleteAdminMessage(id) {
    if (confirm('Are you sure you want to delete this message?')) {
        const res = await apiCall(`/admin/messages/${id}`, 'DELETE');
        if (res.success) {
            showAlert('Message deleted successfully', 'success');
            fetchMessages();
        } else {
            showAlert(res.message, 'danger');
        }
    }
}
