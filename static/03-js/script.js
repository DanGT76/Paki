/* ============================= */
/* FUNÇÕES DO SISTEMA DE LOGIN E CADASTRO DE USUARIOS*/
/* ============================= */

/*Sistema validador de dados durante o cadastro*/
function senhasBatem(senha1, senha2) {
  return senha1 === senha2;
}


document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById("formCadastro");

    if (formCadastro) /* Verificando se o formulario de cadastro existe na página*/ {
        const inputEmail = formCadastro.querySelector("#email");
        const inputTipo = formCadastro.querySelector('#tipo-usuario');
        const inputSenha = formCadastro.querySelector('#senha')
        const inputConfirmar = formCadastro.querySelector('#confirmar_senha')
        const btnCadastrar = formCadastro.querySelector('#btn-cadastrar');

        inputSenha.addEventListener("input", () => {
            const inputConfirmar = formCadastro.querySelector('#confirmar_senha')
            let bate = senhasBatem(inputSenha.value,inputConfirmar.value)
            
            
            if (bate === false) { 
                inputConfirmar.style.borderColor = "red";
                let aviso_senha = document.getElementById("aviso-senha");
                if (!aviso_senha) {
                    const aviso = document.createElement("p");
                    aviso.id = "aviso-senha";
                    aviso.style.color = "red";
                    aviso.textContent = "As senhas não conferem";
                    inputConfirmar.parentNode.appendChild(aviso);

                    btnCadastrar.disabled = true;
                    btnCadastrar.style.opacity = "0.6";
                }
            } else {
                inputConfirmar.style.borderColor = "";
                const aviso = document.getElementById("aviso-senha");
                if (aviso) aviso.remove();
                
                btnCadastrar.disabled = false;
                btnCadastrar.style.opacity = "1";
            }
        })
        
        inputConfirmar.addEventListener("input", () => {
            let bate = senhasBatem(inputSenha.value, inputConfirmar.value)
            
            if (bate === false) { 
                inputConfirmar.style.borderColor = "red";
                let aviso_senha = document.getElementById("aviso-senha");
                if (!aviso_senha) {
                    const aviso = document.createElement("p");
                    aviso.id = "aviso-senha";
                    aviso.style.color = "red";
                    aviso.textContent = "As senhas não conferem";
                    inputConfirmar.parentNode.appendChild(aviso);
                    btnCadastrar.disabled = true;
                    btnCadastrar.style.opacity = "0.6";
                }
            } else {
                inputConfirmar.style.borderColor = "";
                const aviso = document.getElementById("aviso-senha");
                if (aviso) aviso.remove();
                btnCadastrar.disabled = false;
                btnCadastrar.style.opacity = "1";
            }
        })
        
        inputTipo.addEventListener("change", () => {
            let tipoSelecionado = inputTipo.value
            let grupoTipo = inputTipo.closest(".grupo-formulario");
            
            const inputCodigo = document.querySelector("#grupo-codigo-ativacao");
            
            const inputEscala = document.querySelector('#grupo-dias-trabalho')
            
            if (inputCodigo) inputCodigo.remove();

            if (inputEscala) inputEscala.remove()

            if (tipoSelecionado === "nutricionista") {
                
                /* Criando um input pro codigo de ativacao */
                const divGrupo = document.createElement("div");
                divGrupo.classList.add("grupo-formulario");
                divGrupo.id = "grupo-codigo-ativacao"; 

                const labelCodigo = document.createElement("label");
                labelCodigo.setAttribute("for", "codigo_ativacao");
                labelCodigo.textContent = "Número do seu código de ativação:";

    
                const inputCodigo = document.createElement("input");
                inputCodigo.type = "text";
                inputCodigo.name = "codigo_ativacao";
                inputCodigo.id = "codigo_ativacao";
                inputCodigo.required = true;
                inputCodigo.placeholder = "Digite o código de ativação";
                inputCodigo.maxLength = 8

                /*Colocando a label e o input do codigo dentro da div*/
                divGrupo.appendChild(labelCodigo);
                divGrupo.appendChild(inputCodigo)

                inputCodigo.addEventListener("input", () => {
                    let codigo_ativacao = inputCodigo.value.trim().toUpperCase();

                    fetch('/api/validarcadastro', { 
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ codigo_ativacao })
                    })
                    .then(res => res.json())
                    .then(dados => {
                        console.log(dados);

                        if (dados.codigo_ativacao === false) { 
                            inputCodigo.style.borderColor = "red";
                            let aviso_codigo = document.getElementById("aviso-codigo");
                            if (!aviso_codigo) {
                                const aviso = document.createElement("p");
                                aviso.id = "aviso-codigo";
                                aviso.style.color = "red";
                                aviso.textContent = "Código inválido ou já utilizado!";
                                inputCodigo.parentNode.appendChild(aviso);
                            }
                        } else {
                            inputCodigo.style.borderColor = "";
                            const aviso = document.getElementById("aviso-codigo");
                            if (aviso) aviso.remove();
                        }
                    })
                });


                /* Colocando a div logo depois do tipo de usuario*/
                grupoTipo.parentNode.insertBefore(divGrupo, grupoTipo.nextSibling);


                /* criando input para inserir a escala de dias do nutricionista*/
                const grupo_formulario = document.createElement("div");
                grupo_formulario.classList.add("grupo-formulario");
                grupo_formulario.id = "grupo-dias-trabalho";
        
                const label = document.createElement("label");
                label.textContent = "Selecione os dias que você trabalha na clinica:";
                grupo_formulario.appendChild(label);

                const diasSemana = ["segunda","terca","quarta","quinta","sexta"];
                const container_opcoes = document.createElement("div");
                diasSemana.forEach(dia => {
                    const label_dia = document.createElement("label");

                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.name = "dias_trabalho";
                    checkbox.value = dia;

                    label_dia.appendChild(checkbox);

                    const texto = document.createTextNode(dia.charAt(0).toUpperCase() + dia.slice(1));
                    
                    label_dia.appendChild(texto);

                    container_opcoes.appendChild(label_dia);
                });

        grupo_formulario.appendChild(label);
        grupo_formulario.appendChild(container_opcoes);
        grupoTipo.parentNode.insertBefore(grupo_formulario, grupoTipo.nextSibling);

            }
        });

        inputEmail.addEventListener("input", () => { /*Verificando se o e-mail já existe sempre que sai do campo*/
            let email = inputEmail.value.trim();

            fetch('/api/validarcadastro', { /*Vendo se o email existe naquela api do banco de dados*/
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            })
            .then(res => res.json())
            .then(dados => {

            console.log(dados)
            
            if (dados.email === true) /* Se o email existe faz isso no input e no formulario*/ {
                inputEmail.style.borderColor = "red";
                let aviso_email = document.getElementById("aviso-email") /*Vendo se já existe alguma mensagem de erro*/;
                    if (!aviso_email)/* se nao existir uma mensagem de erro no input ele cria uma*/{
                        aviso = document.createElement("p");
                        aviso.id = "aviso-email";
                        aviso.style.color = "red";
                        aviso.textContent = "Este e-mail já existe!";
                        inputEmail.parentNode.appendChild(aviso);
                        
                      
                    }
            } else /* Se o e-mail nao existir no banco ele tira os erros do input*/ {
                inputEmail.style.borderColor = "";
                const aviso = document.getElementById("aviso-email");
                if (aviso) aviso.remove();
            }
            });
        });
    }
});

/*Funcao para cadastrar usuario*/
document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('formCadastro');

    if (formCadastro) {
        formCadastro.addEventListener('submit', async (event) => {
            event.preventDefault(); 

            const dados = {
                nome: document.getElementById('nome').value,

                sobrenome: document.getElementById('sobrenome').value,
                
                email: document.getElementById('email').value,
                
                senha: document.getElementById('senha').value,
                
                tipo_usuario: document.getElementById('tipo-usuario').value,
                
                data_nascimento: document.getElementById('data_nascimento').value,
                
                telefone: document.getElementById('telefone').value,
                
                genero: document.getElementById('genero').value,
                
                idade: document.getElementById('idade').value,
                
                peso: document.getElementById('peso').value,
                
                altura: document.getElementById('altura').value,
                
                doenca_cronica: document.getElementById('doenca_cronica').value,
            };

            console.log(dados)
           
            if (dados.tipo_usuario === 'nutricionista') {
                const codigo_ativacao = document.getElementById('codigo_ativacao');
                if (codigo_ativacao) dados.codigo_ativacao = codigo_ativacao.value.trim().toUpperCase();

                const checkboxes = document.querySelectorAll('#grupo-dias-trabalho input[type="checkbox"]:checked');
                dados.dias_trabalho = Array.from(checkboxes).map(dia => dia.value);

                console.log(codigo_ativacao)
            }

            try {
                const resposta = await fetch('/cadastro', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dados)
                });

                const resultado = await resposta.json();

                if (resultado.sucesso) {
                    window.location.href = '/';
                } else {
                    mensagem_popup('Erro ao cadastrar o usuário!', 'erro')
                }
            } catch (error) {
               console.error('Erro ao cadastrar:', error);
               mensagem_popup('Erro ao cadastrar o usuário!', 'erro')
            }
        });
    }
});

/*Funcao para logar o usuario*/
document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('formLogin');

    if (formLogin) {
        formLogin.addEventListener('submit', async (event) => {
            event.preventDefault(); 
            const dados = {     
                email: document.getElementById('email').value,
                
                senha: document.getElementById('senha').value,
            };

            console.log(dados)

            try {
                const resposta = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dados)
                });

                const resultado = await resposta.json();

                if (resultado.sucesso) {
                    window.location.href = '/';
                } else {
                    mensagem_popup(`${resultado.erro}`, 'erro')
                }
            } catch (error) {
               mensagem_popup('Erro ao logar o usuário!', 'erro')
            }
        });
    }
});


/* ============================= */
/* FUNÇÕES DE CONSULTA LADO PACIENTE*/
/* ============================= */

/*Esse é o objeto que vai salvar as informacoes da nova consulta, e depois vai ser mandado pro Flask*/
let novaConsulta = {
    data_hora: {},
    motivo: "",
    id_nutricionista: ""
}

/*Sistema do slider das perguntas de consulta paciente*/
document.addEventListener('DOMContentLoaded', () => {
    const containerSlider = document.querySelector(".container-slider");
    const sliderPerguntas = document.querySelector(".slider-perguntas");
    const btnVoltar = document.querySelector(".container-slider .controles-slider #voltar-slider");
    const btnAvancar = document.querySelector(".container-slider .controles-slider #avancar-slider");
    const perguntas = document.querySelectorAll(".slider-perguntas .pergunta");
    const controles_slider = document.querySelector(".container-slider .controles-slider")

    if (containerSlider){
        let perguntaAtual = 0;
        const qntPerguntas = perguntas.length;


        if (perguntaAtual == 0){
            btnVoltar.style.display = "none"
            controles_slider.style.justifyContent = "flex-end"
        }

        
        function transicaoPergunta() {

            let movimento = perguntaAtual * -100;
            sliderPerguntas.style.transform = `translateX(${movimento}%)`;  
        }

        btnAvancar.addEventListener("click", () =>{ 
                if ((perguntaAtual + 1) < qntPerguntas){
                    if (validarPergunta(perguntaAtual)== false) return /* Validando se a pergunta tá preenchida corretamente*/
                    perguntaAtual += 1;
                    btnVoltar.style.display = "block"
                    controles_slider.style.justifyContent = "space-between"
                    transicaoPergunta()
                }

        if ((perguntaAtual + 1) >= qntPerguntas){
            btnAvancar.style.display = "none"
      

            async function resumoConsulta(){
                if (document.querySelector('#pergunta-resumo button')){
                    document.querySelector('#pergunta-resumo button').remove()
                }
                const botaoagendar = document.createElement('button')
                const resumoConsulta = document.querySelector('#pergunta-resumo')
                const nomeTexto = resumoConsulta.querySelector('#nome')
                const idTexto = resumoConsulta.querySelector('#id_medico')
                const dataTexto = resumoConsulta.querySelector('#data')
                const horaTexto = resumoConsulta.querySelector('#hora')
                const motivo = resumoConsulta.querySelector('#motivo')

                const data = Object.keys(novaConsulta.data_hora)[0];
                const hora = novaConsulta.data_hora[data][0];

                motivo.textContent = `${novaConsulta.motivo}`

                const idNutricionista = novaConsulta.id_nutricionista;
                const resNutri = await fetch(`/api/usuario/${idNutricionista}`);
                const nutricionista = await resNutri.json();
                nomeTexto.textContent = `${nutricionista.nome} ${nutricionista.sobrenome}`
                idTexto.textContent = nutricionista.id
                
                dataTexto.textContent = data;
                horaTexto.textContent = hora;

                botaoagendar.textContent = 'Confirmar consulta'
                botaoagendar.addEventListener('click', agendarConsulta);
                

                resumoConsulta.appendChild(botaoagendar)
                

                console.log(novaConsulta.data_hora); 
                console.log(novaConsulta.id_nutricionista);

            }
            
            resumoConsulta()
        }
        console.log (`quantidade pergunta ${qntPerguntas}`)
        console.log(`Proxima ${perguntaAtual + 1}`)
        console.log(`Pergunta Atual ${perguntaAtual}`)
        })

        btnVoltar.addEventListener("click", () =>{
            if ((perguntaAtual - 1) >= 0){
                perguntaAtual -= 1;
                btnAvancar.style.display = "block"
            }
            if ((perguntaAtual - 1) < 0 ){
                btnVoltar.style.display = "none"
                controles_slider.style.justifyContent = "flex-end"
            }

            transicaoPergunta();
            console.log(`Pergunta Atual ${perguntaAtual}`)
        })

    function validarPergunta(perguntaAtual) {
            /* Validação da pergunta de horário*/
            if (perguntaAtual === 0) {
                const horarios = Object.values(novaConsulta.data_hora).flat();
        
                if (horarios.length !== 1) {
                    mensagem_popup("Por favor, selecione uma data e horário válidos", "erro");
                    return false;
                }
                return true;
            }

            /*Validação da pergunta de nutricionista*/
            if (perguntaAtual === 1) {
                if (!novaConsulta.id_nutricionista) {
                    mensagem_popup("Por favor, selecione um nutricionista.", "erro");
                    return false;
                }
                return true;
            }

            // Pergunta 2: Motivo da consulta
            if (perguntaAtual === 2) {
                const textarea = document.querySelector("#pergunta-motivo textarea");
                if (!textarea || !textarea.value.trim()) {
                    mensagem_popup("Por favor, insira um motivo válido.", "erro");
                    return false;
                } else {
                    novaConsulta.motivo = textarea.value.trim();
                }
                return true;
            }
            return true;
        }

    }
    
});

/*Funcao para pegar datas e horarios disponiveis do nosso backend e listar no calendario */
document.addEventListener('DOMContentLoaded', async () => {
    const perguntaData = document.querySelector('.slider-perguntas #pergunta-data')

    if (perguntaData){

        async function definirPacienteAtual() {
            const resposta = await fetch('/api/usuarioatual', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            
            const dadosUsuario = await resposta.json();
    
            novaConsulta.id_paciente = dadosUsuario.id;

            console.log('ID do paciente definido:', novaConsulta.id_paciente);
        }

        definirPacienteAtual()
        /*Pegando o JSON com os dias e horarios disponiveis na API do flas para definir mes atual, ano atual e os horarios disponíveis*/
        
        let dadosHorarios = {}
        let mesAtual
        let anoAtual

        async function carregarHorarios() { 
            const resposta = await fetch('/api/verhorarios', { 
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const dados = await resposta.json(); 
            dadosHorarios = dados; 

            const datas = Object.keys(dadosHorarios); 
            if (datas.length > 0) {
                const [ano, mes] = datas[0].split('-').map(Number);
                mesAtual = mes;
                anoAtual = ano;
            }

            console.log(dadosHorarios, mesAtual, anoAtual)
        }
        
        await carregarHorarios();

        const diasCalendario = document.querySelectorAll('.dias-calendario .data');
        const nomeMes = document.querySelector('.nome-mes');
        const btnProximoMes = document.querySelector('.mes #avancar');
        const btnMesAnterior = document.querySelector('.mes #voltar');
        const listaHorarios = document.querySelector('.lista-horarios');
        
        
        /* Funcao para marcar os dias disponíveis no calendario e adicionar event listeners neles para chamar a funcao de listar os horarios*/    
        function configurarCalendario(dadosHorarios) {
            const nomeMeses = [
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];

            nomeMes.textContent = `${nomeMeses[mesAtual - 1]} de ${anoAtual}`

            diasCalendario.forEach(dia => {
                dia.classList.remove('disponivel', 'selecionado');
                
                const diaAtual = String(dia.textContent).padStart(2, '0');
                const mesAtualStr = String(mesAtual).padStart(2, '0');
                const dataString = `${anoAtual}-${mesAtualStr}-${diaAtual}`
                
                if (dadosHorarios[dataString]) {
                    dia.classList.add('disponivel');
                    console.log(dataString)

                    dia.addEventListener('click', (event) => {
                        
                        event.preventDefault()
                        diasCalendario.forEach(dia => dia.classList.remove('selecionado'));
                        dia.classList.add('selecionado');
                        listarhorarios(dataString);

                        novaConsulta.data_hora = {}
                        novaConsulta.data_hora[dataString] = []
                        
                        console.log(novaConsulta)
                        
                    });
                }
            });

            btnProximoMes.onclick = (e) => {
                e.preventDefault();
                const datasDoProximoMes = Object.keys(dadosHorarios).filter(d => {
                    const [ano, mes] = d.split('-').map(Number);
                    return (ano > anoAtual) || (ano === anoAtual && mes > mesAtual);
                });
                if (datasDoProximoMes.length) {
                    const [ano, mes] = datasDoProximoMes[0].split('-').map(Number);
                    anoAtual = ano;
                    mesAtual = mes;
                    configurarCalendario(dadosHorarios);
                }
            };
            
            btnMesAnterior.addEventListener('click', (event) => {
            event.preventDefault();
            const datas = Object.keys(dadosHorarios);
            const prevData = datas.reverse().find(d => Number(d.split('-')[1]) < mesAtual);
            if (prevData) {
                const [ano, mes] = prevData.split('-').map(Number);
                mesAtual = mes;
                anoAtual = ano;
                configurarCalendario(dadosHorarios);
            }
            });
        }
        
        configurarCalendario(dadosHorarios);
    
        /*Funcao para ficar listando os horários disponiveis de acordo com o dia selecionado no front-end*/
        function listarhorarios(dataString) {
            listaHorarios.innerHTML = '';
            
            const horarios = dadosHorarios[dataString];
        
            console.log(`Horários para ${dataString}`)
            if (horarios.length === 0) {
                listaHorarios.textContent = 'Nenhum horário disponível neste dia.';
                return;
            }

            horarios.forEach(hora => {
                const label = document.createElement('label');
                label.classList.add('horario-label');

                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'horario';
                input.value = hora;

                const span = document.createElement('span');
                span.textContent = hora;

                label.appendChild(input);
                label.appendChild(span);
                listaHorarios.appendChild(label);

                input.addEventListener('click', () => {
                    novaConsulta.data_hora[dataString] = [hora];
                    console.log('novaConsulta atualizada:', novaConsulta);
                    listarmedicos()
                });
            });
        }

        /*Funcao para listar os medicos disponíveis para o dia e hora selecionado*/

        function listarmedicos() {
            console.log('Listando Nutricionistas');

            fetch("/api/verhorarios", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({data_hora: novaConsulta.data_hora})
            })
            .then(response => response.json())
            .then(dados => {
                console.log("Nutricionistas disponiveis:", dados);

                const listaMedicos = document.querySelector('.lista-medicos');
                listaMedicos.innerHTML = '';

                dados.forEach(medico => {
                    const li = document.createElement('li');
                    const label = document.createElement('label');
                    const input = document.createElement('input');
                    const iconenutri = document.createElement('div');
                    const descricao = document.createElement('div');
                    const nome = document.createElement('h1');

                    label.classList.add('cartao-medico');

                    iconenutri.classList.add('icone-medico');
                    iconenutri.innerHTML = '<i class="fa-solid fa-user-doctor" style="color: #63E6BE;"></i>';

                    descricao.classList.add('descricao-med');
                    
                    nome.textContent = `${medico.nome.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')} ${medico.sobrenome.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}`;

                    descricao.appendChild(nome);

                    input.type = 'radio';
                    input.name = 'medico';
                    input.value = medico.id;

                    input.addEventListener('change', () => {
                        if (input.checked) {
                            novaConsulta.id_nutricionista = medico.id;
                            console.log('Médico selecionado:', medico);
                            console.log('Nova Consulta até o momento:', novaConsulta)
                            const cartoesnutricionistas = document.querySelectorAll('.lista-medicos label')

                            cartoesnutricionistas.forEach(cartao => cartao.classList.remove('selecionado'));

                            label.classList.add('selecionado')
                        }
                    });

                    label.appendChild(iconenutri);
                    label.appendChild(descricao);
                    label.appendChild(input);

                    li.appendChild(label);
                    listaMedicos.appendChild(li);
                });
            });
        }


        const inputMotivo = document.querySelector('#pergunta-motivo textarea')
                
        
        inputMotivo.addEventListener('input', adicionarMotivo)
        function adicionarMotivo(){
            const motivo = inputMotivo.value
        
            novaConsulta.motivo = motivo

            console.log(novaConsulta)
        }
    } 
});

/*Funcao para enviar a consulta em si  para o backend*/
async function agendarConsulta(event) {
    event.preventDefault();
    
    try {
        const resposta = await fetch('/consulta/agendar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novaConsulta)
        });

        const dados = await resposta.json(); 

        if (dados.sucesso) {
          
            window.location.href = '/consulta/minhasconsultas';
        } else if (dados.erro) {
           
            mensagem_popup(`${dados.erro}`, 'erro'); 
        }

    } catch (erro) {
        mensagem_popup('Erro ao agendar a consulta', 'erro')
    }
}


/*Funcao para cancelar uma consulta*/

async function cancelarConsulta(event, id_consulta) {
    event.preventDefault
   
    const dados = await fetch('/consulta/minhasconsultas', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_consulta: id_consulta })
    })

    const resposta = await dados.json()
  

    if (resposta.sucesso) {
        mensagem_popup('Consulta cancelada com sucesso', 'alerta')
        setTimeout(() => {
            location.reload();
        }, 2000);
    
    } else {
        mensagem_popup('Erro ao cancelar a consulta!', 'erro')
    }
}

/* ============================= */
/* FUNÇÕES DE MINHAS CONSULTAS PARA PACIENTE E NUTRICIONISTA*/
/* ============================= */

/*Funcao para listar consultas do nutricionista e do paciente */

document.addEventListener('DOMContentLoaded', () => {
    const tabelaConsultas = document.getElementById('tabela-consultas')
    if (tabelaConsultas){
        const mensagemSem = document. querySelector('.container-msg-sem')
        if (mensagemSem) mensagemSem.remove()

        const tbody = tabelaConsultas.querySelector('tbody')
        configurarFiltros(tabela = 'consultas')
    
        async function listarconsultas(){
        configurarPesquisa('consultas')
         tbody.innerHTML = ''
         const listaCards = document.getElementById('lista-consultas-cards');
         if (listaCards) listaCards.innerHTML = '';
        
         const dados_usuario = await fetch(`/api/usuarioatual`)
         const usuario = await dados_usuario.json()
         const dados_consultas = await fetch(`/api/consulta/minhasconsultas/${usuario.id}`)
         const consultas = await dados_consultas.json()
         
         const mensagemSem = document. querySelector('.container-msg-sem')
         if (mensagemSem) mensagemSem.remove()
         
         if (consultas.length <= 0){
            tabelaConsultas.style.display = 'none'
            mensagem_sem(false, 'Você não tem consultas agendadas ou pendentes ainda!', document.querySelector('.container-tabela-gerencia'))
         }
         console.log("Consultas encontradas:", consultas)


        for (const consulta of consultas) {
            
            const tr = document.createElement('tr');
            const status = document.createElement('td');
            const data = document.createElement('td');
            const acoes = document.createElement('td');

            acoes.classList.add('acoes-tabela')

            /*Criando a tabela*/
            if (usuario.tipo === 'paciente') {

                const idNutricionista = consulta.id_nutricionista;
                const resNutri = await fetch(`/api/usuario/${idNutricionista}`);
                const nutricionista = await resNutri.json();

                const nomeNutricionista = document.createElement('td');
                nomeNutricionista.textContent = `${nutricionista.nome.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')} ${nutricionista.sobrenome.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}`;

                status.textContent = consulta.status.toUpperCase();
                status.classList.add('status')
                data.textContent = consulta.data_hora;

                const btnVisulizar = document.createElement('button');
                const btnCancelar = document.createElement('button');

                if (consulta.status === 'concluida') {
                    status.classList.add('status-ativo');
                    btnVisulizar.textContent = '👁️';
                    btnVisulizar.classList.add('botao-acao', 'botao-visualizar')

                    /*Função para baixar o relatorio PDF da consulta*/
                    btnVisulizar.addEventListener('click', async () => {
                        try {
                            const res = await fetch(`/consulta/baixar_pdf/${consulta.id}`);
                            if (!res.ok) return mensagem_popup('Erro ao baixar PDF.', 'erro');

                            const blob = await res.blob();
                            const url = URL.createObjectURL(blob);
                            const a = Object.assign(document.createElement('a'), {
                                href: url,
                                download: `relatorio_consulta_${consulta.id}.pdf`
                            });
                            a.click();
                            URL.revokeObjectURL(url);
                        } catch {
                            mensagem_popup('Erro ao baixar PDF.', 'erro');
                        }
                    });
                    acoes.appendChild(btnVisulizar);

                }
                if (consulta.status === 'pendente') {
                    status.classList.add('status-inativo');
                    btnCancelar.textContent = '🚫';
                    btnCancelar.classList.add('botao-acao', 'botao-excluir')
                    btnCancelar.addEventListener('click', (event) => cancelarConsulta(event, consulta.id))

                    acoes.appendChild(btnCancelar);
                }

                tr.appendChild(nomeNutricionista);
                tr.appendChild(status);
                tr.appendChild(data);
                tr.appendChild(acoes);
                tbody.appendChild(tr);

            } else if (usuario.tipo === 'nutricionista') {
                const idPaciente = consulta.id_paciente;
                const resPaciente = await fetch(`/api/usuario/${idPaciente}`);
                const paciente = await resPaciente.json();

                const nomePaciente = document.createElement('td');
                nomePaciente.textContent =`${paciente.nome.charAt(0).toUpperCase() + paciente.nome.slice(1).toLowerCase()} ` + `${paciente.sobrenome.charAt(0).toUpperCase() + paciente.sobrenome.slice(1).toLowerCase()}`;


                status.textContent = consulta.status.toUpperCase();
                status.classList.add('status')
                data.textContent = consulta.data_hora;

                const btnVisulizar = document.createElement('button');  
                const btnCancelar = document.createElement('button');   
                const btnAtender = document.createElement('button')

                if (consulta.status === 'concluida') {
                    status.classList.add('status-ativo');
                    btnVisulizar.classList.add('botao-acao')
                    btnVisulizar.textContent = '👁️';
                    btnVisulizar.classList.add('botao-visualizar')
                    acoes.appendChild(btnVisulizar);

                    btnVisulizar.addEventListener('click', async () => {
                        try {
                            const res = await fetch(`/consulta/baixar_pdf/${consulta.id}`);
                            if (!res.ok) return mensagem_popup('Erro ao baixar PDF.', 'erro');

                            const blob = await res.blob();
                            const url = URL.createObjectURL(blob);
                            const a = Object.assign(document.createElement('a'), {
                                href: url,
                                download: `relatorio_consulta_${consulta.id}.pdf`
                            });
                            a.click();
                            URL.revokeObjectURL(url);
                        } catch {
                            mensagem_popup('Erro ao baixar PDF.', 'erro');
                        }
                    });
                }
                if (consulta.status === 'pendente') {
                    status.classList.add('status-inativo');
                    btnAtender.classList.add('botao-acao')
                    btnCancelar.classList.add('botao-acao')
                    
                    btnCancelar.textContent = '🚫';
                    btnAtender.textContent = '📝'

                    btnCancelar.classList.add('botao-acao', 'botao-excluir')
                    btnAtender.classList.add('botao-acao', 'botao-editar')

                    btnCancelar.addEventListener('click', (event) => cancelarConsulta(event, consulta.id))

                    btnAtender.addEventListener('click', () => {
                        atenderConsulta(consulta.id);
                    });
                   
                    acoes.appendChild(btnCancelar)
                    acoes.appendChild(btnAtender)
                }

                tr.appendChild(nomePaciente);
                tr.appendChild(status);
                tr.appendChild(data);
                tr.appendChild(acoes);
                tbody.appendChild(tr);

                
            }

            /*Criando os cards*/
            if (window.innerWidth < 1150) {
                console.log('cards')    
            
                const card = document.createElement('div');
                const cardHeader = document.createElement('div');
                const cardDetalhes = document.createElement('div');
                const cardAcoes = document.createElement('div');
            
                
                if (usuario.tipo == 'nutricionista') {
                    const listaCards = document.getElementById('lista-consultas-cards');

                    const idPaciente = consulta.id_paciente;
                    const resPaciente = await fetch(`/api/usuario/${idPaciente}`);
                    const paciente = await resPaciente.json();
                    const infosNutricionista = document.createElement('div');
                
                    const nomePaciente = document.createElement('h3');
                    const tipoPaciente = document.createElement('div');

                    nomePaciente.textContent = `${paciente.nome.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ')} ` + `${paciente.sobrenome.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ')}`

                    tipoPaciente.textContent = paciente.tipo.charAt(0).toUpperCase() + paciente.tipo.slice(1).toLowerCase();
                  
                    infosNutricionista.appendChild(tipoPaciente);
                    infosNutricionista.appendChild(nomePaciente);
                    

                    
                    cardHeader.appendChild(infosNutricionista);
                    
             
                    const detalheData = document.createElement('div');
                    const labelData = document.createElement('span');
                    const valorData = document.createElement('span');

                    labelData.textContent = 'Data';
                    valorData.textContent = consulta.data_hora;

                    detalheData.classList.add('card-detalhe');
                    labelData.classList.add('card-label');
                    valorData.classList.add('card-valor');

                    detalheData.appendChild(labelData);
                    detalheData.appendChild(valorData);
                    cardDetalhes.appendChild(detalheData);
                    
                    tipoPaciente.classList.add('card-tipo');
                
              
                    const detalheStatus = document.createElement('div');
                    const labelStatus = document.createElement('span');
                    const valorStatus = document.createElement('span');

                    labelStatus.textContent = 'Status';
                    valorStatus.textContent = consulta.status.toUpperCase();

                    detalheStatus.classList.add('card-detalhe');
                    labelStatus.classList.add('card-label');

                    detalheStatus.appendChild(labelStatus);
                    detalheStatus.appendChild(valorStatus);
                    cardDetalhes.appendChild(detalheStatus);

                    if (consulta.status == 'pendente'){
                        valorStatus.classList.add('status','status-inativo')
                        const botaoCancelar = document.createElement('button');
                        botaoCancelar.textContent = '🚫 Cancelar';
                        botaoCancelar.classList.add('card-botao', 'botao-excluir');
                        botaoCancelar.addEventListener('click', (event) => cancelarConsulta(event, consulta.id))

                        const botaoAtender = document.createElement('button');
                        botaoAtender.textContent = '📝 Atender';
                        botaoAtender.classList.add('card-botao', 'botao-editar');
                        botaoAtender.addEventListener('click', () => atenderConsulta(consulta.id));


                        botaoAtender.addEventListener('click', () => {
                            atenderConsulta(consulta.id);
                        });
                        
                        cardAcoes.appendChild(botaoCancelar);
                        cardAcoes.appendChild(botaoAtender)
                    }  else if (consulta.status == 'concluida'){
                        valorStatus.classList.add('status','status-ativo')
                        
                        const botaoVisualizar = document.createElement('button');
                        botaoVisualizar.textContent = '👁️ Visualizar Relatório';
                        botaoVisualizar.classList.add('card-botao', 'botao-visualizar');


                        botaoVisualizar.addEventListener('click', async () => {
                            try {
                                const res = await fetch(`/consulta/baixar_pdf/${consulta.id}`);
                                if (!res.ok) return mensagem_popup('Erro ao baixar PDF.', 'erro');

                                const blob = await res.blob();
                                const url = URL.createObjectURL(blob);
                                const a = Object.assign(document.createElement('a'), {
                                    href: url,
                                    download: `relatorio_consulta_${consulta.id}.pdf`
                                });
                                a.click();
                                URL.revokeObjectURL(url);
                            } catch {
                                mensagem_popup('Erro ao baixar PDF.', 'erro');
                            }
                        });
                        
                        cardAcoes.appendChild(botaoVisualizar)
                    }
                   

              
                    tipoPaciente.classList.add('card-tipo');
                    card.classList.add('card-tabela');
                    cardHeader.classList.add('card-header');
                    cardDetalhes.classList.add('card-detalhes');
                    infosNutricionista.classList.add('card-info');
                    cardAcoes.classList.add('card-acoes');

                   
                    card.appendChild(cardHeader);
                    card.appendChild(cardDetalhes);
                    card.appendChild(cardAcoes);
                    listaCards.appendChild(card);
                }  if (usuario.tipo == 'paciente') {
                    const listaCards = document.getElementById('lista-consultas-cards');

                    const idNutricionista = consulta.id_nutricionista;
                    const resNutricionista = await fetch(`/api/usuario/${idNutricionista}`);
                    const nutricionista = await resNutricionista.json();

              
    
                    const infosNutricionista = document.createElement('div');

                
                    const nomeNutricionista= document.createElement('h3');
                    const tipoNutricionista = document.createElement('div');

                    nomeNutricionista.textContent = `${nutricionista.nome.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')} ${nutricionista.sobrenome.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}`;
                    
                    tipoNutricionista.textContent = nutricionista.tipo.charAt(0).toUpperCase() + nutricionista.tipo.slice(1).toLowerCase();
                  
                    infosNutricionista.appendChild(tipoNutricionista);
                    infosNutricionista.appendChild(nomeNutricionista);
                    

                    
                    cardHeader.appendChild(infosNutricionista);
                    
             
                    const detalheData = document.createElement('div');
                    const labelData = document.createElement('span');
                    const valorData = document.createElement('span');

                    labelData.textContent = 'Data';
                    valorData.textContent = consulta.data_hora;

                    detalheData.classList.add('card-detalhe');
                    labelData.classList.add('card-label');
                    valorData.classList.add('card-valor');

                    detalheData.appendChild(labelData);
                    detalheData.appendChild(valorData);
                    cardDetalhes.appendChild(detalheData);
                    
                    tipoNutricionista.classList.add('card-tipo');
                
              
                    const detalheStatus = document.createElement('div');
                    const labelStatus = document.createElement('span');
                    const valorStatus = document.createElement('span');

                    labelStatus.textContent = 'Status';
                    valorStatus.textContent = consulta.status.toUpperCase();

                    detalheStatus.classList.add('card-detalhe');
                    labelStatus.classList.add('card-label');

                    detalheStatus.appendChild(labelStatus);
                    detalheStatus.appendChild(valorStatus);
                    cardDetalhes.appendChild(detalheStatus);

                    if (consulta.status == 'pendente'){
                        valorStatus.classList.add('status','status-inativo')
                        const botaoCancelar = document.createElement('button');
                        botaoCancelar.textContent = '🚫 Cancelar';
                        botaoCancelar.classList.add('card-botao', 'botao-excluir');
                        botaoCancelar.addEventListener('click', (event) => cancelarConsulta(event, consulta.id));
                        
                        cardAcoes.appendChild(botaoCancelar);
                      
                    }  else if (consulta.status == 'concluida'){
                        valorStatus.classList.add('status','status-ativo')
                        
                        const botaoVisualizar = document.createElement('button');
                        botaoVisualizar.textContent = '👁️ Visualizar Relatório';
                        botaoVisualizar.classList.add('card-botao', 'botao-visualizar');


                        botaoVisualizar.addEventListener('click', async () => {
                            try {
                                const res = await fetch(`/consulta/baixar_pdf/${consulta.id}`);
                                if (!res.ok) return mensagem_popup('Erro ao baixar PDF.', 'erro');

                                const blob = await res.blob();
                                const url = URL.createObjectURL(blob);
                                const a = Object.assign(document.createElement('a'), {
                                    href: url,
                                    download: `relatorio_consulta_${consulta.id}.pdf`
                                });
                                a.click();
                                URL.revokeObjectURL(url);
                            } catch {
                                mensagem_popup('Erro ao baixar PDF.', 'erro');
                            }
                        });
                        
                        cardAcoes.appendChild(botaoVisualizar)
                    }
              
                    tipoNutricionista.classList.add('card-tipo');
                    card.classList.add('card-tabela');
                    cardHeader.classList.add('card-header');
                    cardDetalhes.classList.add('card-detalhes');
                    infosNutricionista.classList.add('card-info');
                    cardAcoes.classList.add('card-acoes');
                   
                    card.appendChild(cardHeader);
                    card.appendChild(cardDetalhes);
                    card.appendChild(cardAcoes);
                    listaCards.appendChild(card);
                }

            }
        }

        }

        function atenderConsulta(id){
            window.location.href = window.location.href = `/consulta/atender/${id}`
        }

        window.addEventListener('resize', () => {
     
            clearTimeout(window.resizeTimeout);
    
            window.resizeTimeout = setTimeout(() => {
                listarconsultas();
            }, 200)
        })
        listarconsultas()    
    }

});

document.addEventListener('DOMContentLoaded', () => {
    const detalheconsulta = document.querySelector('.container-detalhe-consulta')
    if (detalheconsulta){
        carregarDetalhes();
    }
})

/*Funcao para carregar os detalhes da consulta só pro nutricionista*/
async function carregarDetalhes() {
    const id_consulta = window.location.pathname.split('/').pop();

    const dadosNutricionista = await fetch(`/api/usuarioatual`)
    const nutricionista = await dadosNutricionista.json()

    const id_nutricionista = nutricionista.id

    const dadosConsultas = await fetch(`/api/consulta/minhasconsultas/${id_nutricionista}`);
    const consultas = await dadosConsultas.json()

    const consulta = consultas.find(c => c.id === Number(id_consulta))

    const dadosPaciente = await fetch(`/api/usuario/${consulta.id_paciente}`)
    const paciente = await dadosPaciente.json()
    
    const motivo = document.getElementById('motivo')
    const data_hora = document.querySelector ('#data-hora')

    const nome = document.querySelector('#nome')
    const sobrenome = document.querySelector('#sobrenome')
    const genero = document.querySelector('#genero')
    const idade = document.querySelector('#idade')
    const peso = document.querySelector('#peso')
    const altura = document.querySelector('#altura')
    const doenca_cronica = document.querySelector('#doenca-cronica')

    data_hora.textContent = consulta.data_hora
    motivo.textContent = consulta.motivo
    
    sobrenome.textContent = paciente.sobrenome[0].toUpperCase() + paciente.sobrenome.slice(1)
    nome.textContent = paciente.nome[0].toUpperCase() + paciente.nome.slice(1)
    idade.textContent = paciente.idade
    peso.textContent = `${paciente.peso} Kg`
    altura.textContent = `${paciente.altura}M`
    doenca_cronica.textContent = paciente.doenca_cronica[0].toUpperCase() + paciente.doenca_cronica.slice(1);


    genero.textContent = paciente.genero[0].toUpperCase() + paciente.genero.slice(1);

    const btngroup = document.querySelector('.acoes-consulta .btn-group')
    const btnConcluir = document.createElement('button')
    
    btnConcluir.textContent = 'Concluir Consulta'
    btnConcluir.addEventListener('click', () => concluirConsulta(consulta.id));
    btngroup.appendChild(btnConcluir)

    console.log(paciente)
    console.log(consulta)
    
}

/*Funcao para concluir a consulta*/

function selecionarPDF() {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf'; 
        input.onchange = () => {
            const file = input.files[0];

            if (!file) {
                mensagem_popup('Nenhum arquivo selecionado.', 'erro');
                resolve(null);
                return;
            }

            if (file.type !== 'application/pdf') {
                mensagem_popup('O arquivo precisa ser um PDF.', 'erro');
                resolve(null);
                return;
            }

            resolve(file); 
        };
        input.click();
    });
}

async function concluirConsulta(id) {
    try {
        const pdf = await selecionarPDF();
        if (!pdf) return;

        const formData = new FormData();
        formData.append('pdf', pdf);

        const uploadResponse = await fetch(`/consulta/adicionar_pdf/${id}`, {
            method: 'POST',
            body: formData
        });
        const uploadData = await uploadResponse.json();

        if (uploadData.erro) {
            mensagem_popup('Erro ao enviar o PDF', 'erro');
            return;
        }

        const resposta = await fetch(`/consulta/atender/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'concluida' })
        });
        
        if (resposta.sucesso){
            window.location.href = '/consulta/minhasconsultas'
        }
        
        

    } catch (error) {
        mensagem_popup('Erro ao concluir consulta', 'erro');
    }
}

/* Função para carregar informações na página sobre-usuario e alterar dados*/
document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.container-perfil-usuario')) {
        carregardadosUsuario()
    }
});


function carregardadosUsuario(){
    fetch('/api/usuarioatual')
        .then(response => response.json())
        .then(usuario => {
            
            const nomeHeader = document.getElementById('nome-usuario')
            const tipoHeader = document.getElementById('tipo-usuario')
            const emailHeader = document.getElementById('email-usuario')

           

            const inputNome = document.getElementById('nome');

            const inputSobrenome = document.getElementById('sobrenome');
            
            const inputNascimento = document.getElementById('data_nascimento')

            const inputIdade = document.getElementById('idade')

            const inputPeso = document.getElementById('peso');

            const inputAltura = document.getElementById('altura')

            const inputDoenca = document.getElementById('doenca_cronica')

            const inputTelefone = document.getElementById('telefone')

            const inputGenero = document.getElementById('genero')

            const inputEmail = document.getElementById('email')

            const inputSenha = document.getElementById('nova_senha')

            const inputConfirmar = document.getElementById('confirmar_senha')

            const formulario = document.querySelector('.formulario-seguranca')

            const botaoEnviar = formulario.querySelector('.botao-salvar-conta') 

            if (usuario.tipo == 'nutricionista'){
                if (!formulario.querySelector('.grupo-dias')) {
                    const diasSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta']
                    
                    const grupo = document.createElement('div')
                    grupo.classList.add('grupo-formulario')
                    
                    const labelTitulo = document.createElement('label')
                    labelTitulo.textContent = 'Altere sua escala de trabalho:'
                    
                    const grupoDias = document.createElement('div')
                    grupoDias.classList.add('grupo-dias')

                    grupo.appendChild(labelTitulo)
        
                    diasSemana.forEach(dia => {
                        const input = document.createElement('input');
                    
                        input.type = 'checkbox';
                        input.name = 'dias';
                        input.value = dia;
                        input.id = `dia-${dia}`;
                        
                        if (usuario.dias_trabalho && usuario.dias_trabalho.includes(dia)) {
                            input.checked = true;
                        }
                        const label = document.createElement('label');
                        label.setAttribute('for', input.id);
                        label.textContent = dia.charAt(0).toUpperCase() + dia.slice(1)

                        label.appendChild(input)
                        grupoDias.appendChild(label)                   
                    });
                    
                    const botao = formulario.querySelector('button'); 
                    formulario.insertBefore(grupo, botao); 
                    grupo.appendChild(grupoDias)
                   
                }
            }
            
            inputSenha.addEventListener("input", () => {
            const inputConfirmar = formSeguranca.querySelector('#confirmar_senha')
            let bate = senhasBatem(inputSenha.value,inputConfirmar.value)
            
            if (bate === false) { 
                inputConfirmar.style.borderColor = "red";
                let aviso_senha = document.getElementById("aviso-senha");
                if (!aviso_senha) {
                    const aviso = document.createElement("p");
                    aviso.id = "aviso-senha";
                    aviso.style.color = "red";
                    aviso.textContent = "As senhas não conferem";
                    inputConfirmar.parentNode.appendChild(aviso);

                    botaoEnviar.disabled = true;
                    botaoEnviar.style.opacity = "0.6";
                }
            } else {
                inputConfirmar.style.borderColor = "";
                const aviso = document.getElementById("aviso-senha");
                if (aviso) aviso.remove();
                
                botaoEnviar.disabled = false;
                botaoEnviar.style.opacity = "1";
            }
            })
            
            inputConfirmar.addEventListener("input", () => {
                let bate = senhasBatem(inputSenha.value, inputConfirmar.value)
                
                if (bate === false) { 
                    inputConfirmar.style.borderColor = "red";
                    let aviso_senha = document.getElementById("aviso-senha");
                    if (!aviso_senha) {
                        const aviso = document.createElement("p");
                        aviso.id = "aviso-senha";
                        aviso.style.color = "red";
                        aviso.textContent = "As senhas não conferem";
                        inputConfirmar.parentNode.appendChild(aviso);

                        botaoEnviar.disabled = true;
                        botaoEnviar.style.opacity = "0.6";
                    }
                } else {
                    inputConfirmar.style.borderColor = "";
                    const aviso = document.getElementById("aviso-senha");
                    if (aviso) aviso.remove();

                    botaoEnviar.disabled = false;
                    botaoEnviar.style.opacity = "1";
                }
            })
            inputNome.value = usuario.nome
            inputSobrenome.value = usuario.sobrenome
            inputNascimento.value = usuario.data_nascimento
            inputIdade.value = usuario.idade
            inputAltura.value = usuario.altura
            inputPeso.value = usuario.peso
            inputDoenca.value = usuario.doenca_cronica
            inputTelefone.value = usuario.telefone
            inputGenero.value = usuario.genero

            inputEmail.value = usuario.email

            nomeHeader.textContent = `${usuario.nome.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} ${usuario.sobrenome.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`

            tipoHeader.textContent = usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1).toLowerCase()

            emailHeader.textContent = usuario.email
        })
        .catch(erro => mensagem_popup('Erro ao buscar as informações', 'erro'));

    
    const formDadosPessoais = document.querySelector('.formulario-perfil');
    if (formDadosPessoais) {
        formDadosPessoais.addEventListener('submit', function (event) {
            event.preventDefault(); 
            const dadosForm= new FormData(formDadosPessoais);
            const dados = Object.fromEntries(dadosForm.entries());


            console.log("Dados enviados:", dados);
            
            fetch('/sobremim', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados)
            })
            .then(response => response.json())
            .then(resultado => {
                mensagem_popup('Suas informações foram atualizadas', 'alerta')
            })
            .catch(erro => {
                console.error('Erro ao atualizar:', erro);
                mensagem_popup('Ocorreu um erro ao atualizar suas informações!', 'erro')
            });
        });
    }

    const formSeguranca = document.querySelector('.formulario-seguranca')
    if(formSeguranca){
        formSeguranca.addEventListener('submit', function (event) {
            event.preventDefault()
            const dadosForm= new FormData(formSeguranca)
            const dados = Object.fromEntries(dadosForm.entries())

            const diasCheckbox = formSeguranca.querySelectorAll('input[name="dias"]:checked')
            const dias_trabalho = Array.from(diasCheckbox).map(cb => cb.value)
            
            dados.dias_trabalho = dias_trabalho
            console.log("Dados enviados:", dados);
            
            fetch('/sobremim', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados)
            })
            .then(response => response.json())
            .then(resultado => {
                mensagem_popup('Suas informações foram atualizadas', 'alerta')
            })
            .catch(erro => {
                console.error('Erro ao atualizar:', erro);
                mensagem_popup('Ocorreu um erro ao atualizar suas informações!', 'erro')
            });
        });
    }
}

/* FUNÇÃO PARA MUDAR ABA NO PERFIL DO USUÁRIO */
function mudarAba(abaId) {
    
    const todasAbas = document.querySelectorAll('.aba');
    todasAbas.forEach(aba => {
        aba.classList.remove('ativa');
    });

    const todosConteudos = document.querySelectorAll('.aba-conteudo');
    todosConteudos.forEach(conteudo => {
        conteudo.classList.remove('ativa');
    });

    const abaClicada = document.querySelector(`.aba[onclick="mudarAba('${abaId}')"]`);
    if (abaClicada) {
        abaClicada.classList.add('ativa');
    }

    const conteudoAba = document.getElementById(`aba-${abaId}`);
    if (conteudoAba) {
        conteudoAba.classList.add('ativa');
    }
    carregardadosUsuario()
}

/* FUNÇÃO PARA CONFIGURAR ABAS DINAMICAMENTE */
function configurarAbasPerfil() {
    const tipoUsuario = obterTipoUsuario();
    const abasContainer = document.querySelector('.abas-perfil');
    
    if (!abasContainer) return;
    
    const abasPermitidas = {
        'paciente': [
            { id: 'dados', texto: 'Dados Pessoais' },
            { id: 'seguranca', texto: 'Segurança' },
            { id: 'excluir', texto: 'Excluir Minha Conta' }
        ],
        'nutricionista': [
            { id: 'dados', texto: 'Dados Pessoais' },
            { id: 'seguranca', texto: 'Segurança' },
            { id: 'excluir', texto: 'Excluir Minha Conta' }
        ],
        'admin': [
            { id: 'dados', texto: 'Dados Pessoais' },
            { id: 'seguranca', texto: 'Segurança' }
        ]
    };
    
    abasContainer.innerHTML = '';
    
    const abasDoUsuario = abasPermitidas[tipoUsuario] || abasPermitidas['paciente'];
    
    abasDoUsuario.forEach((aba, index) => {
        const botaoAba = document.createElement('button');
        botaoAba.className = `aba ${index === 0 ? 'ativa' : ''}`;
        botaoAba.setAttribute('onclick', `mudarAba('${aba.id}')`);
        botaoAba.textContent = aba.texto;
        abasContainer.appendChild(botaoAba);
    });
    
    const todosConteudos = document.querySelectorAll('.aba-conteudo');
    todosConteudos.forEach(conteudo => {
        conteudo.classList.remove('ativa');
    });
    
    const primeiroConteudo = document.getElementById(`aba-${abasDoUsuario[0].id}`);
    if (primeiroConteudo) {
        primeiroConteudo.classList.add('ativa');
    }
}

/* Função para excluir a conta */
document.addEventListener('DOMContentLoaded', function() {
    
    const botaoExcluir = document.querySelector('.botao-excluir-conta');

    if (botaoExcluir) {
        botaoExcluir.addEventListener('click', (event) => {
            event.preventDefault()
            if (confirm("Tem certeza que quer excluir sua conta? Esta ação não pode ser desfeita!")) {
                fetch('/sobremim', {
                    method: 'DELETE'
                })
                .then(res => res.json())
                .then(dados => {
                    if (dados.sucesso) {
                        window.location.href = '/login';
                    } else {
                        mensagem_popup('Erro ao excluir a conta!', 'erro');
                    }
                });
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.container-perfil-usuario') ) {
        configurarAbasPerfil()
    }
});

/* FUNÇÃO PARA OBTER O TIPO DE USUÁRIO */
function obterTipoUsuario() {
    if (typeof usuarioTipo !== 'undefined') {
        return usuarioTipo;
    }
    
    const tipoElement = document.getElementById('tipo-usuario-atual');
    if (tipoElement) {
        return tipoElement.value;
    }
    
    const tipoTexto = document.querySelector('.tipo-usuario');
    if (tipoTexto) {
        const texto = tipoTexto.textContent.toLowerCase();
        if (texto.includes('paciente')) return 'paciente';
        if (texto.includes('nutricionista')) return 'nutricionista';
        if (texto.includes('admin')) return 'admin';
    }
    
    return 'paciente'; 
}


/* FUNÇÕES DO GERENCIAR USUÁRIOS */
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('tabela-usuarios')) {
        carregarUsuarios();
        configurarPesquisa('usuarios');
    }
});

async function carregarUsuarios() {
    try {
        const resposta = await fetch('/api/gerenciarusuarios');
        const usuarios = await resposta.json();
        
        preenchertabelaUsuarios(usuarios);
    } catch (erro) {
        console.error('Erro ao carregar usuários:', erro);
        mensagem_popup('Erro ao carregar lista de usuários!', 'erro');
    }
}

/* Função para preencher a tabela com usuarios*/
function preenchertabelaUsuarios(usuarios) {
    configurarFiltros(tabela = 'usuarios')
    const mensagemSem = document. querySelector('.container-msg-sem')
    if (mensagemSem) mensagemSem.remove()
    
    const tbody = document.querySelector('#corpo-tabela-usuarios')
    const listaCards = document.getElementById('lista-usuarios-cards')
    
    listaCards.innerHTML = ''
    tbody.innerHTML = ''
    usuarios.forEach(usuario => {
        const linha = document.createElement('tr');
        
        const nome = document.createElement('td')

        const email = document.createElement('td')
        
        const tipo = document.createElement('td')

        const status = document.createElement('td')

        const id = document.createElement('td')

        const acoes = document.createElement('td')

        const btn_excluir = document.createElement('button')

        

        nome.textContent = usuario.nome
        email.textContent = usuario.email

        id.textContent = usuario.id
        
        status.textContent = 'Ativo'
        status.classList.add('status-ativo')

        btn_excluir.textContent = 'Banir 🚫'
        btn_excluir.classList.add('botao-acao')
        btn_excluir.classList.add('botao-excluir')
        btn_excluir.addEventListener('click', () => excluirUsuario(usuario.id, usuario.nome));

        acoes.appendChild(btn_excluir)

        let badgeTipo = document.createElement('span');

        if (usuario.tipo == 'nutricionista'){
            badgeTipo.textContent = 'Nutricionista'
            badgeTipo.classList.add('badge-tipo')
             badgeTipo.classList.add('badge-nutricionista')
            tipo.appendChild(badgeTipo)
        } else if (usuario.tipo == 'paciente'){
            badgeTipo.textContent = 'Paciente'
            badgeTipo.classList.add('badge-tipo')
             badgeTipo.classList.add('badge-paciente')
            tipo.appendChild(badgeTipo)
        } else if (usuario.tipo == 'admin'){
            badgeTipo.textContent = 'Administrador'
            badgeTipo.classList.add('badge-tipo')
             badgeTipo.classList.add('badge-admin')
            tipo.appendChild(badgeTipo)
        } 

        linha.appendChild(nome)
        linha.appendChild(id)
        linha.appendChild(email)
        linha.appendChild(tipo)
        linha.appendChild(status)
        linha.appendChild(acoes)

        tbody.appendChild(linha);

        
        /*Criando cards para mobile*/
   
        if (window.innerWidth < 1150) {

            const card = document.createElement('div');
            const cardHeader = document.createElement('div');
            const cardDetalhes = document.createElement('div');
            const cardAcoes = document.createElement('div');
            
         
            const nomeUsuario = document.createElement('h3');
            const tipoUsuario = document.createElement('div');
            const infosUsuario = document.createElement('div');

         
            nomeUsuario.textContent = usuario.nome;
            tipoUsuario.textContent = usuario.tipo;

         
            infosUsuario.appendChild(nomeUsuario);
            infosUsuario.appendChild(tipoUsuario);
            cardHeader.appendChild(infosUsuario);

            
            const detalheEmail = document.createElement('div');
            const labelEmail = document.createElement('span');
            const email = document.createElement('span');
            
     
            labelEmail.textContent = 'Email';
            email.textContent = usuario.email;

     
            detalheEmail.classList.add('card-detalhe');
            labelEmail.classList.add('card-label');
            email.classList.add('card-valor');
            
          
            detalheEmail.appendChild(labelEmail);
            detalheEmail.appendChild(email);
            cardDetalhes.appendChild(detalheEmail);
        
            const detalheTipo = document.createElement('div');
            const labelTipo = document.createElement('span');
            const valorTipo = document.createElement('span');

     
            labelTipo.textContent = 'Tipo';
            valorTipo.textContent = usuario.tipo;

           
            detalheTipo.classList.add('card-detalhe');
            labelTipo.classList.add('card-label');
       
            valorTipo.classList.add('card-badge', `badge-${usuario.tipo}`); 

            detalheTipo.appendChild(labelTipo);
            detalheTipo.appendChild(valorTipo);
            cardDetalhes.appendChild(detalheTipo);
            
         
            const detalheStatus = document.createElement('div');
            const labelStatus = document.createElement('span');
            const valorStatus = document.createElement('span');

            const statusText = 'Ativo'; 
            valorStatus.textContent = statusText;
            labelStatus.textContent = 'Status';
            
          
            detalheStatus.classList.add('card-detalhe');
            labelStatus.classList.add('card-label');
            valorStatus.classList.add('card-valor', `status-${statusText.toLowerCase()}`); 

          
            detalheStatus.appendChild(labelStatus);
            detalheStatus.appendChild(valorStatus);
            cardDetalhes.appendChild(detalheStatus);
            
           
           
            const botaoExcluir = document.createElement('button');
            
      
            botaoExcluir.textContent = '🚫 Banir';
            
            
            botaoExcluir.classList.add('card-botao', 'excluir');
            
            botaoExcluir.setAttribute('onclick', `excluirUsuario(${usuario.id}, '${usuario.nome}')`);
        
     
            cardAcoes.appendChild(botaoExcluir);
       
            tipoUsuario.classList.add('card-tipo');
            card.classList.add('card-tabela');
            cardHeader.classList.add('card-header');
            cardDetalhes.classList.add('card-detalhes');
            infosUsuario.classList.add('card-info'); 
            cardAcoes.classList.add('card-acoes'); 
            
     
            card.appendChild(cardHeader);
            card.appendChild(cardDetalhes);
            card.appendChild(cardAcoes);
            
        
            listaCards.appendChild(card);
        }
    });

}


window.addEventListener('resize', () => {
    if (document.getElementById('tabela-usuarios')){
        carregarUsuarios(); 
    }
})

function configurarFiltros(tabela) {

    if (tabela== 'usuarios'){
        const containerFiltros = document.querySelector('.filtros-tabela');

        const filtrosExistentes = document.querySelectorAll('.filtro-botao')

        if (filtrosExistentes.length > 0){
            return
        }
        
        const todos = document.createElement('button')
        const pacientes = document.createElement('button')
        const nutricionistas = document.createElement('button')
        const administradores = document.createElement('button')

        todos.classList.add('filtro-botao')
        todos.classList.add('ativo')
        pacientes.classList.add('filtro-botao');
        nutricionistas.classList.add('filtro-botao');
        administradores.classList.add('filtro-botao');

        
        todos.textContent = 'Todos'
        todos.addEventListener('click', () => filtrarTabela('todos', 'usuarios'));

        pacientes.textContent = 'Pacientes'
        pacientes.addEventListener('click', () => filtrarTabela('paciente', 'usuarios'));

        nutricionistas.textContent = 'Nutricionistas'
        nutricionistas.addEventListener('click', () => filtrarTabela('nutricionista', 'usuarios'));
        
        administradores.textContent = 'Administradores'
        administradores.addEventListener('click', () => filtrarTabela('administrador', 'usuarios'));


        containerFiltros.appendChild(nutricionistas)
        containerFiltros.appendChild(administradores)
        containerFiltros.appendChild(pacientes)
        containerFiltros.appendChild(todos)
        botoesFiltro = document.querySelectorAll('.filtro-botao')
        
        botoesFiltro.forEach(botao => {
            botao.addEventListener('click', function() {
                botoesFiltro.forEach(b => b.classList.remove('ativo'));
                this.classList.add('ativo');
                
            });
        });
    } else if (tabela == 'consultas'){
        const containerFiltros = document.querySelector('.filtros-tabela')

        const filtrosExistentes = document.querySelectorAll('.filtro-botao')

        if (filtrosExistentes.length > 0){
            return
        }
        
        const todas = document.createElement('button')
        const concluidas = document.createElement('button')
        const pendentes = document.createElement('button')

        todas.classList.add('filtro-botao')
        todas.classList.add('ativo')
        concluidas.classList.add('filtro-botao')
        pendentes.classList.add('filtro-botao')
  
        todas.textContent = 'Todas'
        todas.addEventListener('click', () => filtrarTabela('todas', 'consultas'))

        pendentes.textContent = 'Pendentes'
        pendentes.addEventListener('click', () => filtrarTabela('pendentes', 'consultas'))

        concluidas.textContent = 'Conluídas'
        concluidas.addEventListener('click', () => filtrarTabela('concluidas', 'consultas'))

        containerFiltros.appendChild(todas)
        containerFiltros.appendChild(pendentes)
        containerFiltros.appendChild(concluidas)
        botoesFiltro = document.querySelectorAll('.filtro-botao')
        
        botoesFiltro.forEach(botao => {
            botao.addEventListener('click', function() {
                botoesFiltro.forEach(b => b.classList.remove('ativo'))
                this.classList.add('ativo')
                
            });
        });
    }
}

function filtrarTabela(filtro, tabela) {
    const mensagemSem = document. querySelector('.container-msg-sem')

    if (mensagemSem) mensagemSem.remove()

    if (tabela == 'usuarios'){
        const linhas = document.querySelectorAll('#tabela-usuarios tbody tr');
        let encontrado = false
        
        linhas.forEach(linha => {
            tipo = linha.querySelector(".badge-tipo").textContent.toLocaleLowerCase()
            const cards = document.querySelectorAll('.cards-tabela .card-tabela')
            
            if (filtro === 'todos') {
                linha.style.display = '';
                if (linhas.length > 0) {
                    encontrado = 'true'
                }
            } else if (filtro === 'nutricionista' && tipo === 'nutricionista') {
                linha.style.display = '';
                encontrado = true
            } else if (filtro === 'paciente' && tipo === 'paciente') {
                linha.style.display = '';
                encontrado = true
            } else if (filtro === 'administrador' && tipo === 'administrador') {
                linha.style.display = '';
                encontrado = true
            } else {
                linha.style.display = 'none';
            }

            if (cards){
            cards.forEach( card => {
                tipo = card.querySelector('.card-tabela .card-tipo').textContent.toLowerCase()
                console.log(filtro)
                if(filtro == 'todos'){
                    card.style.display = 'block'
                    if (cards.length > 0) {
                        encontrado = 'true'
                    }   
                } else if (filtro == 'administrador' && tipo === 'admin'){
                    card.style.display = 'block'
                    encontrado = true
                } else if (filtro == 'paciente' && tipo === 'paciente'){
                    card.style.display = 'block'
                    encontrado = true
                } else if (filtro == 'nutricionista' && tipo === 'nutricionista'){
                    card.style.display = 'block'
                    encontrado = true
                } else {
                    card.style.display = 'none'
                }
                
            })
        }
        })

        if (encontrado === false){
            let containerTabela = document.getElementById('tabela-usuarios')
            
            containerTabela.style.display = 'none'
            
            mensagem_sem(encontrado, 'Nenhum usuário encontrado!', document.querySelector('.container-tabela-gerencia'))
        } else {
            let containerTabela = document.getElementById('tabela-usuarios')
            
            containerTabela.style.display = ''
        }

       
    } else if (tabela == 'consultas'){
        const consultas = document.querySelectorAll('#tabela-consultas tbody tr')
        const cards = document.querySelectorAll('.cards-tabela .card-tabela')

        let encontrado = false

        consultas.forEach(consulta => {
            const status = consulta.querySelector('.status').textContent.toLowerCase()

            if(filtro == 'todas'){
                consulta.style.display = ''
                if (consultas.length > 0) {
                    encontrado = true
                }
            } else if (filtro == 'concluidas' && status === 'concluida'){
                consulta.style.display = ''
                encontrado = true
            } else if (filtro == 'pendentes' && status === 'pendente'){
                consulta.style.display = ''
                encontrado = true
            } else {
                consulta.style.display = 'none'
            }
        })
    
        if (cards){
            cards.forEach( card => {
                statusCard = card.querySelector('.card-tabela .status').textContent.toLowerCase()

                if(filtro == 'todas'){
                    card.style.display = 'block'
                    if (card.length > 0) {
                        encontrado = true
                    }

                } else if (filtro == 'concluidas' && statusCard === 'concluida'){
                    card.style.display = 'block'
                    encontrado = true
                } else if (filtro == 'pendentes' && statusCard === 'pendente'){
                    card.style.display = 'block'
                    encontrado = true
                } else {
                    card.style.display = 'none'
                }
                
            })
        }
        if (encontrado === false){
            let containerTabela = document.getElementById('tabela-consultas')
    
            containerTabela.style.display = 'none'
            
            mensagem_sem(encontrado, 'Nenhuma consulta encontrada!', document.querySelector('.container-tabela-gerencia'))
        } else {
            let containerTabela = document.getElementById('tabela-consultas')
            
            containerTabela.style.display = ''
        }
    }
        
}

function configurarPesquisa(tabela) {
    const inputPesquisa = document.querySelector('.barra-pesquisa input');
    const botaoPesquisa = document.querySelector('.botao-pesquisa');
    
    function pesquisar() {
        const termo = inputPesquisa.value.toLowerCase()
        const cards = document.querySelectorAll('.card-tabela')
        const mensagemErro = document.querySelector('.container-msg-sem')
        const filtros = document.querySelector('.filtros-tabela')
        
        let containerTabela

        
        filtros.style.display = ''

        if (mensagemErro) {
            mensagemErro.remove()
        }
        
        let linhas
        let encontrado = false

        if (tabela == 'usuarios'){
            linhas = document.querySelectorAll('#tabela-usuarios tbody tr')
            containerTabela = document.getElementById('tabela-usuarios')
            containerTabela.style.display = ''

        } else if (tabela == 'consultas'){
            linhas = document.querySelectorAll('#tabela-consultas tbody tr')
            containerTabela = document.getElementById('tabela-consultas')
            containerTabela.style.display = ''
        }

       
        linhas.forEach(linha => {
            const textoLinha = linha.textContent.toLowerCase();

            if(textoLinha.includes(termo)) {
                linha.style.display = ''
                encontrado = true
                
            } else {
                linha.style.display = 'none'
                
            }
        });

        cards.forEach(card => {
            const textoCard = card.textContent.toLowerCase()
            
            if(textoCard.includes(termo)) {
                card.style.display = ''
                encontrado = true
                
            } else {
                card.style.display = 'none'
                
            }
        })

        if (encontrado == false  && tabela == 'usuarios'){
            mensagem_sem(encontrado, 'Nenhum usuário encontrado!', document.querySelector('.container-tabela-gerencia'))

            containerTabela.style.display = 'none'
            filtros.style.display = 'none'


        } else if (encontrado == true && tabela == 'usuarios'){
            const mensagemErro = document.querySelector('.container-msg-sem')
            if (mensagemErro) mensagemErro.remove()   
        }     

        if (encontrado == false && tabela == 'consultas'){
            mensagem_sem(encontrado, 'Nenhuma consulta encontrada!', document.querySelector('.container-tabela-gerencia'))

            filtros.style.display = 'none'
            containerTabela.style.display = 'none'
        }

       
    }
    
    inputPesquisa.addEventListener('input', pesquisar);
    botaoPesquisa.addEventListener('click', pesquisar);
}

async function excluirUsuario(id, nome) {
    if (confirm(`Tem certeza que deseja banir o usuário "${nome}"? Esta ação não pode ser desfeita.`)) {
        try {
            const resposta = await fetch(`/gerenciarusuarios`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: id })
            });

            const resultado = await resposta.json();
            
            if (resultado.sucesso) {
                mensagem_popup(`Usuário ${nome} banido com sucesso!`, 'confirmacao');
                carregarUsuarios();
            } else {
                mensagem_popup(resultado.erro, 'erro');
            }
        } catch (erro) {
            console.error('Erro ao excluir usuário:', 'erro');
            mensagem_popup('Erro ao excluir usuário!', 'erro');
        }
    }
}

/* ============================= */
/* FUNCÕES DO SITE EM GERAL*/
/* ============================= */

/*Sistemas do menu mobile*/

/* Função para sempre exibir o menu no pc e ocultar inicialmente no mobile (para evitar bugs entre mudar do mobile para o pc)*/
function transicao_menu() { 
const nav = document.querySelector('.menu_nav')
    if (nav){
        if (window.innerWidth > 1151) {
        nav.style.display = 'block'
        } else{
            nav.style.display = 'none'
        };
    };
}
    

window.addEventListener("load", transicao_menu);
window.addEventListener("resize", transicao_menu);


/*Função para exibir menu mobile*/
const btn_mobile = document.getElementById("botao-menu-mobile");

if (btn_mobile) {
    document.getElementById("botao-menu-mobile").addEventListener("click",function(){
    const nav = document.querySelector('.menu_nav')

    if (nav.style.display == 'none'){
    nav.style.display = 'block'
    } else{
    nav.style.display = 'none'
    };
    });

}

/*Função de Exibir uma mensagem popup na tela*/
function mensagem_popup(texto, tipo){
    let container_mensagem = document.createElement("div")
    let mensagem = document.createElement("div");
    let imagem = document.createElement("img");
    let h1 = document.createElement("h1");
    let p = document.createElement ("p");

    if (document.querySelector(".container-mensagem-popup")) return;

    if(tipo === 'erro'){
        imagem.src = "/static/imagens/icones animados/erro.gif"
        h1.textContent = "Erro!"

    } else if (tipo === 'alerta'){
        imagem.src = "/static/imagens/icones animados/alerta.gif"
        h1.textContent = "Alerta!"

    } else if (tipo === 'confirmacao'){
        imagem.src = "/static/imagens/icones animados/alerta.gif"
    }; 

    p.textContent = texto

    mensagem.appendChild(imagem);
    mensagem.appendChild(h1);
    mensagem.appendChild(p);
    mensagem.classList.add("mensagem-popup");

    container_mensagem.appendChild(mensagem)
    container_mensagem.classList.add("container-mensagem-popup")

    document.body.appendChild(container_mensagem)  
    
    setTimeout(() => { 
        container_mensagem.remove(); }, 2000
    );

}

/*Função para exibir uma mensagem de na encontrado*/


function mensagem_sem(encontrado, mensagem, container) {

    const mensagemErro = document.querySelector('.container-msg-sem')

    if (mensagemErro) {
        mensagemErro.remove()
    }

    if (encontrado === false){
        let containerErro = document.createElement('div')
        let msg = document.createElement('div')
        let icone = document.createElement('div')
        let h1 = document.createElement('h1')

        icone.innerHTML = '<i class="fa-solid fa-face-frown-open" style="color: #63E6BE;"></i>'
        icone.classList.add('icone')
        h1.textContent = mensagem
    

        containerErro.classList.add('container-msg-sem')
        msg.classList.add('msg-sem')
        msg.appendChild(icone)
        msg.appendChild(h1)

        containerErro.appendChild(msg)
        container.appendChild(containerErro)

    } else if (encontrado == true) {
        const containerErro = document.querySelector('.container-msg-sem-produto')
        if (containerErro) mensagemErro.remove()

    }
}

/*Sistema de mudar tema*/
const botao_tema = document.getElementById("botao-tema");

if (botao_tema) {
    
    document.getElementById('botao-tema').addEventListener("click", function(){
    let tema_salvo = localStorage.getItem('tema-salvo') || 'claro';
    if (tema_salvo === 'escuro'){
        localStorage.setItem('tema-salvo','claro');
        aplicar_tema();

        botao_tema.textContent = "🌙";
        botao_tema.style.background = "#160000ce";

        mensagem_popup(`Tema alterado para claro!`, "alerta");
        
    } else {
        localStorage.setItem('tema-salvo','escuro');
        aplicar_tema();

        botao_tema.textContent = "☀️";
        botao_tema.style.background = "#03697eff";

        mensagem_popup(`Tema alterado para escuro!`, "alerta");
    } 

});
}
/*Função para aplicar o tema*/
function aplicar_tema(){
    let tema_salvo = localStorage.getItem("tema-salvo");

    if (tema_salvo === "escuro") {
        document.body.classList.add("escuro");
    
    } else {
        document.body.classList.remove("escuro");
    }
}

aplicar_tema(); /*Chamando a função sempre que o site carregar*/

/*SISTEMAS DA LOJA (que provavelmente vão ser removidos)*/

/*Função de pesquisa de produtos*/

const searchbarLoja = document.querySelector('#searchbar-produtos input');

if (searchbarLoja) {
    searchbarLoja.addEventListener("input", pesquisar_produtos);
}

function pesquisar_produtos() {
    let input = document.querySelector('#searchbar-produtos input').value.toLowerCase();
    let produtos = document.querySelectorAll('.cartao_produto');
    let listaProdutos = document.querySelector('.conteudo_pagina_loja');
    let produtoEncontrado = false;
    let mensagemErro = document.querySelector('.container-msg-sem-produto')
    const containerLoja = document.querySelector('.container_pagina_loja');

    produtos.forEach(produto => {
        let nomeProduto = produto.querySelector('.cartao_produto_descricao h1').textContent.toLowerCase();
        let descricaoProduto = produto.querySelector('.cartao_produto_descricao h2').textContent.toLowerCase();
        if(nomeProduto.includes(input) || descricaoProduto.includes(input)) {
            produto.style.display = '';
            produtoEncontrado = true;
            
        } else {
            produto.style.display = 'none';
        }
    });

    if (mensagemErro) {
            mensagemErro.remove();
    };
    if (produtoEncontrado === false) {

        containerMsg = document.createElement('div');
        msg = document.createElement('div');
        icone = document.createElement('div');
        h1 = document.createElement('h1');
        h2 = document.createElement('h2');

        icone.innerHTML = '<i class="fa-solid fa-face-frown-open" style="color: #63E6BE;"></i>';
        icone.classList.add('icone');
        h1.textContent = "Que pena, não encontramos nenhum produto com esse nome ou descrição.";   
        h2.textContent = "Mas faremos o possível para adicionar esse produto em nosso estoque o mais rápido possível!";
        
        
        containerMsg.classList.add('container-msg-sem-produto');
        msg.classList.add('msg-sem-produto');
        msg.appendChild(icone);
        msg.appendChild(h1);
        msg.appendChild(h2);

        containerMsg.appendChild(msg);
        containerLoja.appendChild(containerMsg);
    };
};