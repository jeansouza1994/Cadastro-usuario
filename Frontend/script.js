const URL_API = 'http://localhost:8080/usuario';

const elementos = {
    formulario: document.getElementById('userForm'),
    formularioBusca: document.getElementById('searchForm'),
    corpoTabela: document.getElementById('tableBody'),
    btnEnviar: document.getElementById('submitBtn'),
    btnCancelar: document.getElementById('cancelBtn'),
    campoId: document.getElementById('userId'),
    campoNome: document.getElementById('nome'),
    campoEmail: document.getElementById('email'),
    campoBuscaEmail: document.getElementById('searchEmail')
};

// Utilitários
const exibirMensagem = (msg, tipo = 'info') => alert(msg);

const requisicao = async (url, opcoes = {}) => {
    try {
        return await fetch(url, opcoes);
    } catch (erro) {
        console.error('Erro na requisição:', erro);
        throw erro;
    }
};

const obterDadosFormulario = () => ({
    nome: elementos.campoNome.value.trim(),
    email: elementos.campoEmail.value.trim()
});

// Eventos
elementos.formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = elementos.campoId.value;
    const dados = obterDadosFormulario();
    
    id ? await atualizarUsuario(id, dados) : await criarUsuario(dados);
});

elementos.formularioBusca.addEventListener('submit', async (e) => {
    e.preventDefault();
    await buscarUsuario(elementos.campoBuscaEmail.value.trim());
});

elementos.btnCancelar.addEventListener('click', resetarFormulario);

// Buscar usuário
async function buscarUsuario(email) {
    try {
        const resposta = await requisicao(`${URL_API}?email=${encodeURIComponent(email)}`);
        
        if (resposta.ok) {
            exibirUsuarios([await resposta.json()]);
        } else {
            exibirMensagem('Usuário não encontrado');
            exibirMensagemTabela('Nenhum usuário encontrado');
        }
    } catch (erro) {
        exibirMensagem('Erro ao buscar usuário');
    }
}

// Criar usuário
async function criarUsuario(dados) {
    try {
        const resposta = await requisicao(URL_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        
        if (resposta.ok) {
            exibirMensagem('Usuário cadastrado com sucesso!');
            resetarFormulario();
            exibirMensagemTabela('Use a busca para visualizar usuários');
        } else {
            exibirMensagem('Erro ao cadastrar usuário');
        }
    } catch (erro) {
        exibirMensagem('Erro ao cadastrar usuário');
    }
}

// Atualizar usuário
async function atualizarUsuario(id, dados) {
    try {
        const resposta = await requisicao(`${URL_API}?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        
        if (resposta.ok) {
            exibirMensagem('Usuário atualizado com sucesso!');
            resetarFormulario();
            await buscarUsuario(dados.email);
        } else {
            exibirMensagem('Erro ao atualizar usuário');
        }
    } catch (erro) {
        exibirMensagem('Erro ao atualizar usuário');
    }
}

// Deletar usuário
async function deletarUsuario(email) {
    if (!confirm('Deseja realmente deletar este usuário?')) return;
    
    try {
        const resposta = await requisicao(`${URL_API}?email=${encodeURIComponent(email)}`, {
            method: 'DELETE'
        });
        
        if (resposta.ok) {
            exibirMensagem('Usuário deletado com sucesso!');
            exibirMensagemTabela('Usuário deletado. Use a busca para visualizar outros');
        } else {
            exibirMensagem('Erro ao deletar usuário');
        }
    } catch (erro) {
        exibirMensagem('Erro ao deletar usuário');
    }
}

// Editar usuário
function editarUsuario(usuario) {
    elementos.campoId.value = usuario.id;
    elementos.campoNome.value = usuario.nome;
    elementos.campoEmail.value = usuario.email;
    elementos.btnEnviar.textContent = 'Atualizar';
    elementos.btnCancelar.style.display = 'inline-block';
    elementos.formulario.scrollIntoView({ behavior: 'smooth' });
}

// Exibir mensagem na tabela
const exibirMensagemTabela = (mensagem) => {
    elementos.corpoTabela.innerHTML = `<tr><td colspan="4">${mensagem}</td></tr>`;
};

// Exibir usuários
function exibirUsuarios(usuarios) {
    elementos.corpoTabela.innerHTML = (Array.isArray(usuarios) ? usuarios : [usuarios])
        .map(u => `
            <tr>
                <td>${u.id || 'N/A'}</td>
                <td>${u.nome}</td>
                <td>${u.email}</td>
                <td class="actions">
                    <button class="btn-edit" onclick='editarUsuario(${JSON.stringify(u)})'>Editar</button>
                    <button class="btn-delete" onclick="deletarUsuario('${u.email}')">Deletar</button>
                </td>
            </tr>
        `).join('');
}

// Resetar formulário
function resetarFormulario() {
    elementos.formulario.reset();
    elementos.campoId.value = '';
    elementos.btnEnviar.textContent = 'Cadastrar';
    elementos.btnCancelar.style.display = 'none';
}
