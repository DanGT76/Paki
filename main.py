from flask import Flask, render_template, request, jsonify, redirect, url_for, send_file

from flask_sqlalchemy import SQLAlchemy

from flask_login import LoginManager, UserMixin, login_user,login_required,logout_user, current_user

from werkzeug.security import generate_password_hash, check_password_hash

from livereload import Server

from datetime import datetime, date, timedelta, time

import os, random, string


app = Flask(__name__)

app.secret_key = 'admin'

# COLOCANDO O GERENCIADOR DE LOGIN NO SITE
lm = LoginManager(app)

# ISSO AQUI FAZ COM QUE QUANDO O USUARIO TENTA ACESSAR UMA PAGINA PROTEGIDA E NAO TÁ LOGADO, ELE VAI SEMPRE SER REDIRECIONADO PRA PAGINA DE LOGIN
lm.login_view = 'login'

# CRIANDO UMA FUNCAO PARA CARREGAR OS DADOS DO USUARIO QUANDO ELE TÁ LOGADO NO LOGIN MANAGER
@lm.user_loader
def carregar_usuario(id):
    usuario = banco.session.query(Usuario).filter_by(id=id).first()

    return usuario

# INICIANDO O BANCO DE DADOS E O FLASK-LOGIN 

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///banco.db'

banco = SQLAlchemy()
banco.init_app(app)


# Criando as tabelas do banco de dados e definindo como uma classe do python pq a gente usaa o sql alchemy
class Usuario(UserMixin, banco.Model):
    __tablename__ = 'usuarios' # isso cria a tabela de usuario e o que tem para baixo são os atributos

    id = banco.Column(banco.Integer, primary_key=True, autoincrement=True, unique=True)

    email = banco.Column(banco.String(120), unique=True)
    
    senha = banco.Column(banco.String())

    nome = banco.Column(banco.String(25))

    sobrenome = banco.Column(banco.String(25))
    
    tipo = banco.Column(banco.String(10), nullable=False)  

    data_nascimento = banco.Column(banco.Date, nullable=False)

    telefone = banco.Column(banco.String(20))

    genero = banco.Column(banco.String(15))

    idade = banco.Column(banco.Integer, nullable=True)  
    
    peso = banco.Column(banco.Float, nullable=True)          
    
    altura = banco.Column(banco.Float, nullable=True)
    
    doenca_cronica = banco.Column(banco.String(10), nullable=True) 
  
class Consulta(banco.Model):
    __tablename__ = 'consultas'
    
    id = banco.Column(banco.Integer, primary_key=True, autoincrement=True, unique=True)
    
    id_paciente = banco.Column(banco.Integer, banco.ForeignKey('usuarios.id'))
    
    id_nutricionista = banco.Column(banco.Integer, banco.ForeignKey('usuarios.id'))
    
    status = banco.Column(banco.String(20), nullable=False, default='pendente')

    data_hora = banco.Column(banco.DateTime, nullable=False)

    motivo = banco.Column(banco.String(400))

    relatorio = banco.Column(banco.String, nullable=True)

class Escala(banco.Model):
    __tablename__ = 'escalas_nutricionistas'
    
    id = banco.Column(banco.Integer, primary_key=True, autoincrement=True)

    dias_trabalho = banco.Column(banco.JSON, nullable=False)

    nutricionista_id = banco.Column(banco.Integer, banco.ForeignKey('usuarios.id'))

class Codigo(banco.Model):
    __tablename__ = 'codigos_ativacao'

    id = banco.Column(banco.Integer, primary_key=True, autoincrement=True)

    codigo = banco.Column(banco.String)

    status = banco.Column(banco.Boolean, default=False)

# Funcao para criar um usuario admin padrao no site
def criar_admin():
    with app.app_context():
        if not Usuario.query.filter_by(email='adminsdopaki@admin.com').first():
            
            usuario_admin = Usuario(
                email='adminsdopaki@admin.com',
                senha= generate_password_hash('admin123'),
                nome='Admin',
                sobrenome='Geral',
                tipo='admin',
                data_nascimento=date(1, 1, 1),
                genero=None,
            )

            banco.session.add(usuario_admin)
            banco.session.commit()

            print(f'Usuario admin criado com sucesso! \n Email: {usuario_admin.email} \n Senha: {usuario_admin.senha}')

# Funcao para criar um usuario nutricionista padrao no site
def criar_nutricionista():
    with app.app_context():
        if not Usuario.query.filter_by(email='nutricionista@gmail.com', tipo='nutricionista').first():
            
            usuario_nutricionista = Usuario(
                email='nutricionista@gmail.com',
                senha=generate_password_hash('nutri123'),
                nome='Nutricionista',
                sobrenome='Geral',
                tipo='nutricionista',
                data_nascimento=date(1, 1, 1),
                genero=None  
            )

            banco.session.add(usuario_nutricionista)
            banco.session.commit()
  
            dias_trabalho = ["terca", "quarta", "quinta", "sexta"]

            escala_padrao = Escala(
                nutricionista_id=usuario_nutricionista.id,
                dias_trabalho=dias_trabalho 
            )

            banco.session.add(escala_padrao)
            banco.session.commit()

            print(f'Usuário nutricionista criado com sucesso! \n Email: {usuario_nutricionista.email} \n Senha: {usuario_nutricionista.senha} \n Escala criada: {dias_trabalho}')

# Funcao para gerar codigos de ativacao para nutricionistas

def gerar_codigos():
    with app.app_context():
        existentes = {c.codigo for c in Codigo.query.all()}
        qnt_para_criar = 10 - len(existentes)

        if qnt_para_criar <= 0:
            print("Já tem códigos de ativação no banco de dados")
            return

        codigos_gerados = []  

        for _ in range(qnt_para_criar):
            while True:
                codigo_novo = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
                codigo_hash = generate_password_hash(codigo_novo)
                if codigo_hash not in existentes:
                    existentes.add(codigo_hash)
                    break

            banco.session.add(Codigo(codigo=codigo_hash))
            codigos_gerados.append(codigo_novo)  

        banco.session.commit()
        print(f"{qnt_para_criar} códigos de ativação gerados com sucesso!")
        print("Códigos de ativação gerados:", codigos_gerados)
# Adicionando uma funcao global para dizer qual o tipo de site que tá sendo carregado lá pro Jinja 
@app.context_processor
def tipo_site():
    if current_user.is_authenticated:
        return {'tipo_site': current_user.tipo}
    return {'tipo_site': 'anonimo'}

# ROTAS GERAIS DO NOSSO SITE
@app.route("/")
@login_required
def index():
    print(f"o usuario {current_user.nome} do tipo {current_user.tipo} está usando o P.A.K.I!")
    return render_template('index.html')

@app.route("/sobre")
@login_required
def sobre():
    if current_user.tipo == 'paciente' or current_user.tipo == 'nutricionista':
        return render_template('sobre.html')
    else:
        return redirect(url_for('index'))
    
@app.route("/sobremim", methods=['GET', 'PUT', 'DELETE'])
@login_required
def sobremim(): 
    if request.method == 'GET':
        return render_template('sobre-usuario.html')

    elif request.method == 'PUT':
   
        dados = request.get_json()
        if not dados:
            return jsonify({"erro": "Nenhum dado enviado"}), 400

        
        usuario = Usuario.query.get(current_user.id)
        if not usuario:
            return jsonify({"erro": "Usuário não encontrado"}), 404

        novoNome = dados.get('nome')
        novoSobrenome = dados.get('sobrenome')
        novoEmail = dados.get('email')
        novoTelefone = dados.get('telefone')
        novoGenero = dados.get('genero')
        novoIdade = dados.get('idade')
        novoPeso = dados.get('peso')
        novoAltura = dados.get('altura')
        novoDoenca = dados.get('doenca_cronica')
        novaSenha = dados.get('nova_senha')
        novaDataNascimento = dados.get('data_nascimento')

        if novoNome not in (None, ''):
            usuario.nome = novoNome
        if novoSobrenome not in (None, ''):
            usuario.sobrenome = novoSobrenome
        if novoEmail not in (None, ''):
            usuario.email = novoEmail
        if novoTelefone not in (None, ''):
            usuario.telefone = novoTelefone
        if novoGenero not in (None, ''):
            usuario.genero = novoGenero
        if novoIdade not in (None, ''):
            usuario.idade = int(novoIdade)
        if novoPeso not in (None, ''):
            usuario.peso = float(novoPeso)
        if novoAltura not in (None, ''):
            usuario.altura = float(novoAltura)
        if novoDoenca not in (None, ''):
            usuario.doenca_cronica = novoDoenca
        if novaSenha not in (None, ''):
            usuario.senha = generate_password_hash(novaSenha)
        if novaDataNascimento not in (None, ''):
            try:
                usuario.data_nascimento = datetime.strptime(novaDataNascimento, "%Y-%m-%d").date()
            except ValueError:
                return jsonify({"erro": "Formato de data inválido (use YYYY-MM-DD)"})
        if usuario.tipo == 'nutricionista':
            dias_trabalho = dados.get('dias_trabalho', [])
            escala = Escala.query.filter_by(nutricionista_id=usuario.id).first()
            if escala:
                escala.dias_trabalho = dias_trabalho
            else:
                nova_escala = Escala(nutricionista_id=usuario.id, dias_trabalho=dias_trabalho)
                banco.session.add(nova_escala)

        
        banco.session.commit()
        
        return jsonify({"sucesso": "Informações atualizadas com sucesso!"})

    elif request.method == 'DELETE':
        usuario = Usuario.query.get(current_user.id)
        if not usuario:
            return jsonify({"erro": "Usuário não encontrado"})
        
        if usuario.tipo == 'nutricionista':
            escala = Escala.query.filter_by(nutricionista_id=usuario.id).first()
            if escala:
                banco.session.delete(escala)
        
        consultas = Consulta.query.filter(
            (Consulta.id_paciente == usuario.id) | 
            (Consulta.id_nutricionista == usuario.id)
        ).all()
        for consulta in consultas:
            banco.session.delete(consulta)
        
        banco.session.delete(usuario)
        banco.session.commit()
        
        logout_user()
        
        return jsonify({"sucesso": "Conta excluída com sucesso!"})

@app.route("/contato")
@login_required
def contato():
    if current_user.tipo == 'paciente' or current_user.tipo == 'nutricionista':
        return render_template('contato.html')
    else:
        return redirect(url_for('index'))

@app.route("/funcionalidades", methods=['GET'])
@login_required
def funcionalidades():
    return render_template('funcionalidades.html')

# ROTAS DE LOGIN, LOGOUT E CADASTRO
@app.route('/cadastro', methods=['GET', 'POST'])
def cadastro():
    if request.method == 'GET':
        return render_template('cadastro.html')

    elif request.method == 'POST':
        dados = request.get_json()
        if not dados:
            return jsonify({"erro": "Nenhum dado de usuário enviado"})

        nome = dados.get('nome').lower().strip()
        sobrenome = dados.get('sobrenome').lower().strip()
        email = dados.get('email').lower().strip()
        senha = dados.get('senha')
        tipo = dados.get('tipo_usuario').lower().strip()
        
        data_nascimento_str = dados.get('data_nascimento')
        telefone = dados.get('telefone').strip()
        genero = dados.get('genero').lower().strip()
        idade = dados.get('idade')
        peso = dados.get('peso')
        altura = dados.get('altura')
        doenca_cronica = dados.get('doenca_cronica')
               
        data_nascimento = datetime.strptime(data_nascimento_str, "%Y-%m-%d").date()

        if Usuario.query.filter_by(email=email).first():
            return jsonify({"erro": "O usuário já existe!"})

        if tipo == 'nutricionista':
            codigo_ativacao = dados.get('codigo_ativacao', '').strip()
            
            codigos = Codigo.query.filter_by(status=False).all()
            codigo_valido = None
            
            for codigo in codigos:
                if check_password_hash(codigo.codigo, codigo_ativacao):
                    codigo_valido = codigo
                    break
            
            if not codigo_valido:
                return jsonify({"erro": "Código de ativação inválido"})
            
            codigo_valido.status = True

        
        novo_usuario = Usuario(
            email=email,
            senha=generate_password_hash(senha),
            nome=nome,
            sobrenome=sobrenome,
            tipo=tipo,
            data_nascimento=data_nascimento,
            telefone=telefone,
            genero=genero,
            idade=int(idade),
            peso=float(peso),
            altura=float(altura),
            doenca_cronica=doenca_cronica
        )

        banco.session.add(novo_usuario)
        banco.session.commit()
      
        # colocando a escala de trabalho do nutricionista       
        if tipo == 'nutricionista': 
            dias_trabalho = dados.get('dias_trabalho', [])
            
            if dias_trabalho:
                nova_escala = Escala(
                    nutricionista_id=novo_usuario.id,
                    dias_trabalho=dias_trabalho
                )
                banco.session.add(nova_escala)
                banco.session.commit()

        login_user(novo_usuario)
        
        return jsonify({"sucesso": "Usuário cadastrado com sucesso"})

@app.route("/login", methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        if current_user.is_anonymous: #Vendo se o usuario nao está logado
            return render_template('login.html')
        else : #Se ele ja estiver logado já redireciona para a pagina inicial
            return redirect(url_for('index'))
    
    elif request.method == 'POST':
        dados = request.get_json()
        if not dados:
            return jsonify({"erro": "Nenhum dado de usuário enviado"})

        email = dados.get('email')
        senha = dados.get('senha')

        usuario = Usuario.query.filter_by(email=email).first()

        if usuario and check_password_hash(usuario.senha, senha): #Se o usuario existir e o hash dele tiver certo faz o login no site
            login_user(usuario)
            return  jsonify({"sucesso": "Usuário logado com sucesso!"})

        else: #Se nao retorna um JSON com erro 
            return jsonify({"erro": "E-mail ou senha incorretos!"})

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))


@app.route("/consulta")
@login_required
def consulta():
    if current_user.tipo == 'paciente' or current_user.tipo == 'nutricionista':
        return render_template('consulta.html')
    else:
        return redirect(url_for('index'))

@app.route("/consulta/minhasconsultas", methods=['GET', 'POST', 'PUT', 'DELETE'])
@login_required
def minhas_consultas():
    if request.method == 'GET':
        return render_template('func-minha-consulta.html')

    elif request.method == 'POST':
        dados = request.get_json()
        id_consulta = dados.get('id_consulta')

        consultaExiste = Consulta.query.get(id_consulta)
        if not consultaExiste:
            return jsonify({"erro": "Consulta não encontrada"})

        if current_user.id != consultaExiste.id_paciente and current_user.id != consultaExiste.id_nutricionista:
            return jsonify({"erro": "Você não tem permissão para acessar esta consulta"})

        consulta = {
            "id": consultaExiste.id,
            "id_nutricionista": consultaExiste.id_nutricionista,
            "id_paciente": consultaExiste.id_paciente,
            "status": consultaExiste.status,
            "data_hora": consultaExiste.data_hora.strftime("%Y-%m-%d %H:%M"),
            "motivo": consultaExiste.motivo
        }
        return jsonify(consulta)

    elif request.method == 'DELETE':
        dados = request.get_json()
        id_consulta = dados.get('id_consulta')
        consulta = Consulta.query.get(id_consulta)
        
        if not consulta:
            return jsonify({"erro": "Consulta não encontrada"})
        if current_user.id != consulta.id_paciente and current_user.id != consulta.id_nutricionista:
            return jsonify({"erro": "Você não tem permissão para cancelar esta consulta"})
        banco.session.delete(consulta)
        banco.session.commit()
        return jsonify({"sucesso": f"Consulta cancelada com sucesso!"})

@app.route("/consulta/agendar", methods=['GET', 'POST'])
@login_required
def agendar_consulta():
    if current_user.tipo != 'paciente':
        return redirect(url_for('index'))

    if request.method == 'GET':
        return render_template('func-agendar-consulta.html')

    elif request.method == 'POST':
        dados = request.get_json()
        data_hora_dicio = dados.get('data_hora')
        dia_str, horarios = list(data_hora_dicio.items())[0]
        horario_str = horarios[0]
        hora, minuto = map(int, horario_str.split(':'))
        data_hora = datetime.combine(datetime.strptime(dia_str, "%Y-%m-%d").date(), time(hora, minuto))

        id_nutricionista = int(dados.get('id_nutricionista'))


        id_paciente = current_user.id

        consulta_existente = Consulta.query.filter_by(
            id_nutricionista=id_nutricionista,
            data_hora=data_hora
        ).first()
        if consulta_existente:
            return jsonify({"erro": "Horário já ocupado"})

        consulta_pendente = Consulta.query.filter_by(
            id_paciente=id_paciente,
            status='pendente'
        ).first()
        if consulta_pendente:
            return jsonify({"erro": "Você pode ter no máximo uma consulta pendente!"})
        
        nova_consulta = Consulta(
            id_paciente=id_paciente,
            id_nutricionista=id_nutricionista,
            data_hora=data_hora,
            motivo=dados.get('motivo'),
            status='pendente'
        )
        banco.session.add(nova_consulta)
        banco.session.commit()
        return jsonify({"sucesso": "Consulta agendada com sucesso"})

@app.route("/consulta/atender/<int:id_consulta>", methods=['GET', 'PUT'])
@login_required
def atender_consulta(id_consulta):
    if current_user.tipo == 'nutricionista':
        consulta = Consulta.query.get(id_consulta)

        if not consulta:
            return jsonify({"erro": "Consulta não encontrada"})
        
        if consulta.status == 'concluida' and request.method == 'GET':
            return redirect(url_for('minhas_consultas'))
            
        if consulta.id_nutricionista != current_user.id:
            return redirect(url_for('index'))
        
        if request.method == 'GET':
            return render_template("func-atender-consulta.html")
        elif request.method == 'PUT':
            dados = request.get_json()
            novo_status = dados.get('status')

            consulta = Consulta.query.get(id_consulta)
            if not consulta:
                return jsonify({"erro": "Consulta não encontrada"})

            consulta.status = novo_status
            banco.session.commit()

            return jsonify({"sucesso": f"Consulta {id_consulta} concluida!"})
    else:
        return redirect(url_for('index'))

@app.route("/gerenciarusuarios", methods=['GET', 'DELETE'])
@login_required
def gerenciarusuarios():
    if current_user.tipo == 'admin':
        if request.method == 'GET':
            return render_template('func-gerenciar-usuarios.html')
        
        elif request.method == 'DELETE':
            dados = request.get_json()
            if not dados or 'id' not in dados:
                return jsonify({"erro": "ID do usuário não fornecido"})

            usuario = Usuario.query.get(dados['id'])
            if not usuario:
                return jsonify({"erro": "Usuário não encontrado"})

        
            if usuario.id == current_user.id:
                return jsonify({"erro": "Você não pode excluir a si mesmo"})

            if usuario.tipo == 'nutricionista':
                escala = Escala.query.filter_by(nutricionista_id=usuario.id).first()
                if escala:
                    banco.session.delete(escala)    
                    banco.session.commit()
            
            banco.session.delete(usuario)
            banco.session.commit()
            return jsonify({"sucesso": f"Usuário {usuario.nome} excluído com sucesso!"})
    else:
        return redirect(url_for('index'))


# MINI APIS DO NOSSO SITE PARA FAZER BUSCAR DADOS NO SERVIDOR DO FLASK

# Mini api que a gente usa para validar dados de cadastro
@app.route('/api/validarcadastro', methods=['POST'])
def validarcadastro():
    dados = request.get_json()
    if not dados:
        return jsonify({"erro": "Nenhum dado fornecido!"})

    
    email = dados.get('email')
    codigo_ativacao = dados.get('codigo_ativacao')

    validos = {}

    if email:
        usuario = Usuario.query.filter_by(email=email).first()
        if usuario:
            validos["email"] = True 
        else:
            validos ["email"] = False

    if codigo_ativacao:
        codigos = Codigo.query.filter_by(status=False).all()
        valido = False
        for codigo in codigos:
            if check_password_hash(codigo.codigo, codigo_ativacao):
                valido = True
                break
        validos["codigo_ativacao"] = valido    
    return jsonify(validos)

# Mini api que a gente usa para retornar os dias e horarios disponiveis para consulta nos 14 dias, e os nutricionistas disponiveis para um dia e hora específico

@app.route('/api/verhorarios', methods=['GET', 'POST'])
def apihorarios():
    def verhorarios(qnt_dias = 24):  
        hoje = datetime.now().date()
        horarios_disponiveis = {}
        
        print(f'Hoje é {hoje}') 

        nutricionistas = Usuario.query.filter_by(tipo='nutricionista').all()

        dias_uteis_processados = 0
        dias_a_frente = 0

        while dias_uteis_processados < qnt_dias:
            dia = hoje + timedelta(days=dias_a_frente)
            dias_a_frente += 1

            if dia.weekday() >= 5:
                continue 

            nome_dia = ["segunda", "terca", "quarta", "quinta", "sexta", "sábado", "domingo"][dia.weekday()]
            dia_str = dia.strftime('%Y-%m-%d')

            # Colocando a hora que a clinica abre e a hora que ela fecha no dia
            abre = datetime.combine(dia, time(7, 0))
            fecha = datetime.combine(dia, time(21, 0))

            while abre <= fecha - timedelta(hours=1, minutes=15):
                # Esse if serve pra tirar os horários que já passaram
                if abre > datetime.now():
                    for nutricionista in nutricionistas:
                        escala_nutri = Escala.query.filter_by(nutricionista_id=nutricionista.id).first()
                        
                        # Verificando se o nutricionista tem escala e se o dia está na sua escala
                        if escala_nutri and nome_dia in escala_nutri.dias_trabalho:
                            dia_ocupado = Consulta.query.filter_by(
                                id_nutricionista = nutricionista.id,
                                data_hora = abre
                            ).first()
                            
                            # Se o horário nao tiver marcado ele entra para a lista
                            if not dia_ocupado:
                                horarios_disponiveis.setdefault(dia_str, []).append(abre.strftime("%H:%M"))
                                break 
            
                abre += timedelta(hours = 1, minutes = 15)
            
            dias_uteis_processados += 1
            
        return horarios_disponiveis

    def vernutricionistas(dados):
        if not dados or 'data_hora' not in dados:
            return []

    
        dia_str, horarios = list(dados['data_hora'].items())[0]
        horario_str = horarios[0]

        dia = datetime.strptime(dia_str, "%Y-%m-%d").date()
        hora, minuto = map(int, horario_str.split(':'))
        dt = datetime.combine(dia, time(hora, minuto))

        nome_dia = ["segunda", "terca", "quarta", "quinta", "sexta", "sábado", "domingo"][dia.weekday()]

        nutricionistas = Usuario.query.filter_by(tipo='nutricionista').all()
        disponiveis = []

        for nutricionista in nutricionistas:
            escala = Escala.query.filter_by(nutricionista_id=nutricionista.id).first()
            if escala and nome_dia in escala.dias_trabalho:
                consulta_ocupada = Consulta.query.filter_by(
                    id_nutricionista=nutricionista.id,
                    data_hora=dt
                ).first()
                if not consulta_ocupada:
                    disponiveis.append({
                        "id": nutricionista.id,
                        "nome": nutricionista.nome,
                        "sobrenome": nutricionista.sobrenome
                    })
        return disponiveis

    if request.method == 'GET':
        return jsonify(verhorarios())
        
    elif request.method == 'POST':
        dados = request.get_json()
        return jsonify(vernutricionistas(dados))

@app.route('/api/consulta/minhasconsultas/<int:id_usuario>', methods=['GET'])
def apiminhasconsultas(id_usuario):
    if id_usuario == current_user.id:
        consultas = Consulta.query.filter((Consulta.id_paciente==id_usuario) | (Consulta.id_nutricionista==id_usuario)).order_by(Consulta.data_hora.desc()).all()

        listaConsultas = []

        for c in consultas:
            
            if c.id_paciente == id_usuario or c.id_nutricionista == id_usuario:
                listaConsultas.append({
                    "id": c.id,
                    "id_paciente": c.id_paciente,
                    "id_nutricionista": c.id_nutricionista,
                    "status": c.status,
                    "data_hora": c.data_hora.strftime("%Y-%m-%d %H:%M"),
                    "motivo": c.motivo
                })

        return jsonify(listaConsultas)
    else:
        return redirect(url_for('index'))
# Mini api que a gente usa para ver os dados do usuario que tá logado
@app.route('/api/usuarioatual')
@login_required 
def usuarioatual():
    dados_usuario = {
        "id": current_user.id,
        "email": current_user.email,
        "nome": current_user.nome,
        "sobrenome": current_user.sobrenome,
        "tipo": current_user.tipo,
        "data_nascimento": current_user.data_nascimento.strftime("%Y-%m-%d") if current_user.data_nascimento else None,
        "telefone": current_user.telefone,
        "genero": current_user.genero,
        "idade": current_user.idade,
        "peso": current_user.peso,
        "altura": current_user.altura,
        "doenca_cronica": current_user.doenca_cronica
    }
    if current_user.tipo == 'nutricionista':
        escala = Escala.query.filter_by(nutricionista_id=current_user.id).first()
        dados_usuario["dias_trabalho"] = escala.dias_trabalho if escala else []
    return jsonify(dados_usuario)


# Mini api para retornar dados dos usuários do sistema em json
@app.route("/api/gerenciarusuarios", methods = ['GET'])
@login_required
def gerenciarusuariosapi():
    if current_user.tipo == 'admin':
        tabelaUsuarios = Usuario.query.all()
        usuarios = []
        for usuario in tabelaUsuarios:
            usuarios.append({
               "id": usuario.id,
                "email": usuario.email,
                "nome": usuario.nome,
                "sobrenome": usuario.sobrenome,
                "tipo": usuario.tipo,
                "data_nascimento": usuario.data_nascimento.strftime("%Y-%m-%d") if usuario.data_nascimento else None,
                "telefone": usuario.telefone,
                "genero": usuario.genero,
                "idade": usuario.idade,
                "peso": usuario.peso,
                "altura": usuario.altura,
                "doenca_cronica": usuario.doenca_cronica
            })
        return jsonify(usuarios)
    else: 
        return redirect(url_for('index'))
# Mini api para retornar dados de um usuario em específico em JSON
@app.route("/api/usuario/<int:id_usuario>", methods=['GET'])
@login_required
def gerenciarusuario(id_usuario):

    usuario = Usuario.query.get(id_usuario)
    if not usuario:
        return jsonify({"erro": "Usuário não encontrado"})
    
    permitido = False

    if current_user.tipo == 'admin':
        permitido = True
    elif current_user.id == usuario.id:
        permitido = True
    elif current_user.tipo == 'paciente' and usuario.tipo == 'nutricionista':
        permitido = True
    elif current_user.tipo == 'nutricionista' and usuario.tipo == 'paciente':
        consulta = Consulta.query.filter_by(id_paciente=usuario.id, id_nutricionista=current_user.id).first()
        if consulta:
            permitido = True

    if not permitido:
        return redirect(url_for('index'))

    dados_usuario = {
        "id": usuario.id,
        "nome": usuario.nome,
        "sobrenome": usuario.sobrenome,
        "data_nascimento": usuario.data_nascimento.strftime("%Y-%m-%d"),
        "tipo": usuario.tipo,
        "telefone": usuario.telefone,
        "genero": usuario.genero,
        "idade": usuario.idade,
        "peso": usuario.peso,
        "altura": usuario.altura,
        "doenca_cronica": usuario.doenca_cronica
    }

    return jsonify(dados_usuario)

# Mini api para salvar e baixar os relatorios de cada consulta
UPLOAD_FOLDER = 'static/relatorios'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'pdf'

@app.route('/consulta/adicionar_pdf/<int:id_consulta>', methods=['POST'])
@login_required
def adicionar_pdf(id_consulta):
    consulta = Consulta.query.get(id_consulta)
    if not consulta:
        return jsonify({"erro": "Consulta não encontrada"})

    
    if current_user.id != consulta.id_nutricionista:
        return jsonify({"erro": "Você não tem permissão para enviar PDF nesta consulta"})

    if 'pdf' not in request.files:
        return jsonify({"erro": "Nenhum relatorio enviado"})

    file = request.files['pdf']
    if file.filename == '':
        return jsonify({"erro": "Nenhum relatorio enviado"})
    if not allowed_file(file.filename):
        return jsonify({"erro": "Arquivo inválido!"})

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    filename = f"consulta_{id_consulta}.pdf"
    caminho = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(caminho)

    consulta.relatorio = filename
    banco.session.commit()
    return jsonify({"sucesso": "PDF enviado com sucesso!"})

@app.route('/consulta/baixar_pdf/<int:id_consulta>')
@login_required
def baixar_pdf(id_consulta):
    consulta = Consulta.query.get(id_consulta)
    if not consulta or not consulta.relatorio:
        return jsonify({"erro": "PDF não encontrado"})

    if current_user.id != consulta.id_paciente and current_user.id != consulta.id_nutricionista:
        return jsonify({"erro": "Você não tem permissão para baixar este PDF"})

    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], consulta.relatorio))

# CODIGOS PARA RODAR O SERVIDOR DO FLASK
if __name__ == '__main__':
    with app.app_context(): # isso aqui cria o banco de dados
        banco.create_all()
        criar_admin() # isso aqui cria o usuario admin sempre que o servidor for iniciado caso ele nao exista
        #criar_nutricionista() # isso aqui cria um nutricionista padrao
        gerar_codigos() # isso aqui cria codigo de ativação no servidor

        app.debug = True # isso aqui ativa o modo debug do flask

    server = Server(app.wsgi_app) # isso aqui atualiza automaticamente o servidor quandoa gente altera algo nele
    server.watch('templates/')
    server.watch('static/')
    server.serve(port=5000, host="127.0.0.1", debug=True)