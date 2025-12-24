const API_URL = 'http://localhost:8080/usuario'; // Ajuste a porta conforme seu backend Spring Boot

const form = document.getElementById('userForm');
const searchForm = document.getElementById('searchForm');
const tableBody = document.getElementById('tableBody');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const userIdInput = document.getElementById('userId');

// Submit do formulário
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = userIdInput.value;
    const userData = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value
    };

    if (userId) {
        await updateUser(userId, userData);
    } else {
        await createUser(userData);
    }
});

// Buscar usuário por email
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('searchEmail').value;
    await searchUser(email);
});

// Cancelar edição
cancelBtn.addEventListener('click', resetForm);

// Buscar usuário por email
async function searchUser(email) {
    try {
        const response = await fetch(`${API_URL}?email=${encodeURIComponent(email)}`);
        
        if (response.ok) {
            const user = await response.json();
            displayUsers([user]);
        } else {
            alert('Usuário não encontrado');
            tableBody.innerHTML = '<tr><td colspan="4">Nenhum usuário encontrado</td></tr>';
        }
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        alert('Erro ao buscar usuário');
    }
}

// Criar novo usuário
async function createUser(userData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            alert('Usuário cadastrado com sucesso!');
            resetForm();
            tableBody.innerHTML = '<tr><td colspan="4">Use a busca para visualizar usuários</td></tr>';
        } else {
            alert('Erro ao cadastrar usuário');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao cadastrar usuário');
    }
}

// Atualizar usuário
async function updateUser(id, userData) {
    try {
        const response = await fetch(`${API_URL}?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            alert('Usuário atualizado com sucesso!');
            resetForm();
            // Buscar novamente o usuário atualizado
            await searchUser(userData.email);
        } else {
            alert('Erro ao atualizar usuário');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar usuário');
    }
}

// Deletar usuário
async function deleteUser(email) {
    if (!confirm('Deseja realmente deletar este usuário?')) return;
    
    try {
        const response = await fetch(`${API_URL}?email=${encodeURIComponent(email)}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Usuário deletado com sucesso!');
            tableBody.innerHTML = '<tr><td colspan="4">Usuário deletado. Use a busca para visualizar outros usuários</td></tr>';
        } else {
            alert('Erro ao deletar usuário');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao deletar usuário');
    }
}

// Editar usuário
function editUser(user) {
    userIdInput.value = user.id;
    document.getElementById('nome').value = user.nome;
    document.getElementById('email').value = user.email;
    
    submitBtn.textContent = 'Atualizar';
    cancelBtn.style.display = 'inline-block';
    
    // Scroll para o formulário
    form.scrollIntoView({ behavior: 'smooth' });
}

// Exibir usuários na tabela
function displayUsers(users) {
    tableBody.innerHTML = '';
    
    if (!Array.isArray(users)) {
        users = [users];
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id || 'N/A'}</td>
            <td>${user.nome}</td>
            <td>${user.email}</td>
            <td class="actions">
                <button class="btn-edit" onclick='editUser(${JSON.stringify(user)})'>Editar</button>
                <button class="btn-delete" onclick="deleteUser('${user.email}')">Deletar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Resetar formulário
function resetForm() {
    form.reset();
    userIdInput.value = '';
    submitBtn.textContent = 'Cadastrar';
    cancelBtn.style.display = 'none';
}
