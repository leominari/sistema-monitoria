import Vue from 'vue'
import Vuex from 'vuex'
import net from "net";
const { v4: uuidv4 } = require('uuid');
import _ from 'lodash'
import moment from 'moment'
import { request } from 'http';
const mysql = require('mysql2/promise');
const bluebird = require('bluebird');

const sqlConfig = require("../config/config")



Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		server: null,
		servidorOnline: false,
		porta: null,
		host: null,
		logs: [],
		sockets: {}, //key is the ip:port
		connection: null,
		rotas: {
			'login.login': 'rota.login.login',
			'login.registro': 'rota.login.registro',
			'login.logout': 'rota.login.logout',
			'login.update': 'rota.login.update',
			'usuario.delete': 'rota.usuario.delete',
			'cliente.usuarios-ativos': 'ack.cliente.usuarios-ativos',
			'cliente.usuarios': 'rota.cliente.usuarios',
			'monitoria.registro': 'rota.monitoria.registro',
			'monitoria.delete': 'rota.monitoria.delete',
			'monitoria.listar': 'rota.monitoria.listar',
			'aluno-monitoria.inscrever': 'rota.aluno-monitoria.inscrever',
			"aluno-monitoria.delete": 'rota.aluno-monitoria.delete',
			"monitoria.listar-aluno": 'rota.monitoria.listar-aluno',
			'monitoria.listar-monitor': 'rota.monitoria.listar-monitor',

		},
		usuariosAtivos: {} //username: {host, port, usuario}
	},
	mutations: {
		set: (state, payload) => {
			Object.keys(payload).forEach(key => {
				Vue.set(state, key, payload[key]);
			});
		},
		log: (state, log) => {
			let _log = {
				timestamp: moment().format('MMMM Do YYYY, h:mm:ss a'),
				uid: uuidv4(),
				name: log.name,
				error: !!log.error,
				user: log.user || "",
				input: log.input || "",
			}
			state.logs.push(_log);
		},
		novoSocket: (state, socket) => {
			Vue.set(state.sockets, `${socket.remoteAddress}:${socket.remotePort}`, socket);
		},
		encerrarSocket: (state, socket) => {
			//deletar socket
			Vue.delete(state.sockets, `${socket.remoteAddress}:${socket.remotePort}`);

			//desautenticar
			let usuario = _.find(state.usuariosAtivos, ['porta', socket.remotePort])
			if (usuario) {//Usuario estava logado
				Vue.delete(state.usuariosAtivos, usuario.usuario.usuario);
			}
		},
		logarUsuario: (state, { socket, usuario }) => {
			Vue.set(state.usuariosAtivos, usuario, { usuario, host: socket.remoteAddress, porta: socket.remotePort });
		},
		deslogarUsuario: (state, usuario) => {
			if(state.usuariosAtivos[usuario])
				Vue.delete(state.usuariosAtivos, usuario);
		}
	},
	actions: {
		async criarBanco(context) {
			let connection;
			try{
				connection = await mysql.createPool({...sqlConfig, Promise: bluebird})
			}catch(e){
				alert("Nao foi possivel estabelecer conexao com o banco de dados!")
			}
			context.commit("set", { connection });

		},

		criarServidor(context) {
			let server = net.createServer((socket) => {

				socket.on("error", function (err) {
					console.log(err);
				});

				socket.on("data", async function (data) {
					data = data.toString("utf8");
					context.commit("log", { name: "⬇️ Recebendo data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: data });

					//assert request
					let request;
					try {
						request = JSON.parse(data)

						if (typeof (request) !== "object" || request.rota === undefined) {
							throw "Error";
						}
					} catch (e) {
						console.log("ERROR: ", data, "is not a valid input.");
						context.commit("log", { name: "Rota invalida", user: `${socket.remoteAddress}:${socket.remotePort}`, input: data, error: true });
						return;
					}

					//handle route
					try {
						let actionName = context.getters['obterFuncaoRota'](request.rota);
						if (!actionName)
							throw "";

						await context.dispatch(actionName, { request, socket, connection: context.state.connection });

					}
					catch (e) {
						console.log("ERROR: ", request.rota, " nao é suportada.");
						context.commit("log", { name: request.rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: data, error: true });
						return;
					}

				});

				socket.on("close", () => {
					try {
						context.commit("encerrarSocket", socket);
						console.log(`Conexao encerrada ${socket.remoteAddress}:${socket.remotePort}`);
						context.commit("log", { name: "Conexao encerrada", user: `${socket.remoteAddress}:${socket.remotePort}` });

						let usuarioSocket = context.getters['obterUsuarioPorSocket'](socket);
						if(usuarioSocket){
							context.commit("deslogarUsuario", usuarioSocket.usuario);
							this.dispatch("broadcastUsuarios");
						}

					} catch (error) {
						console.log("ERROR", error);
					}
				});
			});

			server.on('connection', (stream) => {
				try {
					console.log(`Nova conexao com ${stream.remoteAddress}:${stream.remotePort}`)
					context.commit("novoSocket", stream);
					context.commit("log", { name: "Nova conexao", user: `${stream.remoteAddress}:${stream.remotePort}` });
				} catch (error) {
					//this.$emit("toast", { error: true, message: error.message })
					console.log(error.message);
				}
			})

			server.on('error', error => {
				context.commit("log", { name: "Erro no servidor", input: error.message, error: true });
				if (error.code === "EADDRINUSE")
					console.log("Porta em uso")

				//this.$emit("toast", { error: true, message: "Esta porta já esta em uso" })
				else
					console.log(error.message);

				//this.$emit("toast", { error: true, message: error.message })
			})

			context.commit('set', { server });
		},
		inicializarServidor(context, payload) {
			if (context.state.server) {
				context.state.server.listen({ port: payload.porta }, () => {
					console.log("Servidor inicializado em ", payload.host, payload.porta);

					context.commit("set", { servidorOnline: true, porta: payload.porta, host: payload.host });
					context.commit("log", { name: "Server inicializado" });
				});
			}
		},
		finalizarServidor(context) {
			console.log("Encerrando servidor", context.state.server)

			for (let key in context.state.sockets) {
				let socket = context.state.sockets[key];
				socket.destroy()
			}

			context.state.server.close(() => {
				context.commit("set", { servidorOnline: false });
				context.commit("log", { name: "Server finalizado" });

			})
		},
		async broadcastUsuarios(context) {
			let usuarios = context.getters['obterUsuariosAtivos']();
			let connection = context.state.connection;
			console.log("Usuarios ativos:", Object.keys(usuarios));

			let usuarios_banco_requisicao = Object.keys(usuarios).map(async usuario => {
				return await connection.execute(`select nome, usuario, is_admin, is_monitor from usuario where usuario.usuario = ?`, [usuario]);
			})

			let usuarios_banco = await Promise.all(usuarios_banco_requisicao);

			usuarios = usuarios_banco.map(row => {
				let usuario = row[0];
				
				usuario = usuario[0]; //usa primeira coluna
				return {
					nome: usuario.nome,
					usuario: usuario.usuario,
					tipo_usuario: usuario.is_admin ? "admin" : (usuario.is_monitor ? "monitor" : "aluno"),

				}
			});

			let message = stringify({
				rota: "cliente.usuarios-ativos",
				usuarios
			})
			context.commit("log", { name: "⬆️ enviando data", user: "BROADCAST", input: usuarios, error: false });


			console.log("usuariosBroadcast:", usuarios)
			usuarios.forEach(usuario => {
				let socket = context.getters['obterSocketPorUsuario'](usuario.usuario);
				try {
					if (socket) {
						socket.write(message);
					}
				} catch (e) {
					context.commit("log", { name: "Erro ao enviar data", user: `${socket.remoteAddress}:${socket.remotePort} - ${usuario}`, input: e.message, error: true });
				}
			})

		},
		async ['rota.login.login'](context, { request, socket, connection }) {
			let { usuario, senha, rota } = request;

			try {

				const usuarioConectado = context.getters['obterUsuarioPorSocket'](socket);
				if(usuarioConectado){
					console.log("Socket ja esta autenticado!", usuarioConectado);
					throw "permissao_negada"
				}

				if (!usuario) throw ("Usuario obrigatorio");

				//Obter usuario do banco
				let [rows] = await connection.execute('SELECT u.usuario, u.senha, u.is_admin, u.is_monitor from usuario u WHERE u.usuario = ?', [usuario]).catch(e => {
					throw e
				});
				const _usuarioBanco = rows[0]
				if(!_usuarioBanco){
					throw "usuario_inexistente";
				}

				if(_usuarioBanco.senha != senha) throw "senha_incorreta"
				else if(context.getters["usuarioConectado"](usuario)) throw "permissao_negada";

				//Logar
				let resposta = stringify({
					rota,
					erro: "false",
					tipo_usuario: _usuarioBanco.is_admin ? "admin" : (_usuarioBanco.is_monitor ? "monitor" : "aluno"),
				})
				context.commit("log", { name: request.rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: "Usuario logado\n" + stringify(_usuarioBanco), error: false });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);

				context.commit("logarUsuario", { socket, usuario: _usuarioBanco.usuario });
				context.dispatch("broadcastUsuarios");

			} catch (erro) {
				let resposta = stringify({
					rota,
					erro
				});
				context.commit("log", { name: request.rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: true });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);
			}
		},
		async ['rota.login.registro'](context, { request, socket, connection }) {
			let { usuario, senha, rota, nome, is_monitor = false } = request;
			try{
				if(!usuario) throw "Usuario é obrigatorio";

				//Verificar existencia do usuario
				let [rows] = await connection.execute('SELECT u.usuario from usuario u WHERE u.usuario = ?', [usuario]);
				const usuarioExistente = !!rows.length;
				if(usuarioExistente){
					throw "usuario_indisponivel_para_cadastro";
				}

				//Permissao para acessar rota
				if(is_monitor == "true"){
					const usuarioLogado = context.getters['obterUsuarioPorSocket'](socket);
					if(!usuarioLogado || usuarioLogado.user !== "admin") throw "permissao_negada"
					//if(!usuarioLogado || !usuarioLogado.is_admin) throw "permissao_negada"
				}

				//cadastro no banco
				await connection.query('INSERT INTO usuario SET ?', {
					is_monitor,
					usuario,
					senha,
					nome
				})
				.catch((e)=>{
					console.error(e);
					throw "usuario_indisponivel_para_cadastro";
				})

				//resposta para cliente
				context.commit("log", { name: request.rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: request, error: false });
				let resposta = {
					rota,
					erro: "false"
				};
				resposta = JSON.stringify(resposta) + "\n"

				socket.write(resposta);
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });

			}catch(e){
				let error = {
					rota,
					erro: e
				}
				error = JSON.stringify(error) + "\n";
				context.commit("log", { name: request.rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: error, error: true });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: error, error: false });
				socket.write(error);
			}
		},
		['rota.login.logout'](context, { request, socket }) {
			context.commit("log", { name: request.rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: request, error: false });

			let { rota } = request;

			let usuarioLogado = context.getters['obterUsuarioPorSocket'](socket);
			if (usuarioLogado) {
				context.commit("deslogarUsuario", usuarioLogado.usuario);
				let resposta = {
					rota,
					erro: "false"
				};
				resposta = JSON.stringify(resposta) + "\n"
				context.commit("log", { name: request.rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);
				this.dispatch("broadcastUsuarios");
			} else {
				let resposta = {
					rota,
					erro: "permissao_negada"
				};
				resposta = JSON.stringify(resposta) + '\n';
				context.commit("log", { name: request.rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: true });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);
			}

		},
		async ['rota.login.update'](context, { request, socket, connection }) {

			let {rota, usuario, novo_usuario, senha, nome} = request;

			try {
				let usuarioLogado = context.getters['obterUsuarioPorSocket'](socket).usuario;
				if(!usuarioLogado) throw "permissao_negada";

				//Obter usuario logado do banco
				let [rows] = await connection.execute('SELECT u.usuario, u.is_admin, u.is_monitor from usuario u WHERE u.usuario = ?', [usuarioLogado]).catch(e => {
					console.error(e);
					throw e;
				});
				const usuarioLogadoBanco = rows[0]
				if(!usuarioLogadoBanco){
					throw "permissao_negada";
				}

				//Alterar usuario diferente é permitido apenas para administradores
				if(usuarioLogadoBanco.usuario !== usuario && !usuarioLogadoBanco.is_admin) throw "permissao_negada";
				
				//Atualizar banco
				let alteracoes = {};
				if(novo_usuario) alteracoes.usuario = novo_usuario;
				if(senha) alteracoes.senha = senha;
				if(nome) alteracoes.nome = nome;
				if(Object.keys(alteracoes).length === 0){
					throw "nenhum_campo_para_alterar";
				}

				await connection.query('UPDATE usuario u SET ? WHERE u.usuario = ?', [alteracoes, usuario])
				.catch((e)=>{
					console.error(e);
					throw "usuario_indisponivel_para_cadastro";
				})


				//Atualizar usuario logado
				if(novo_usuario){
					context.commit("deslogarUsuario", usuario);
					context.commit("logarUsuario", { socket, usuario: novo_usuario });
				}

				let resposta = stringify({
					rota: request.rota,
					erro: "false",
				});
				context.commit("log", { name: request.rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: "Usuario editado: " + JSON.stringify(alteracoes), error: false });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);
				
			} catch (erro) {
				let resposta = stringify({
					rota: request.rota,
					erro: erro
				});
				context.commit("log", { name: request.rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: true });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);
			}
		},
		async 'rota.usuario.delete'(context, { request, socket, connection }) {
			let {rota, usuario} = request;

			try {

				let usuarioLogado = context.getters['obterUsuarioPorSocket'](socket).usuario;
				if(!usuarioLogado) throw "permissao_negada";

				//Obter usuario logado do banco
				let [rows] = await connection.execute('SELECT u.usuario, u.is_admin, u.is_monitor from usuario u WHERE u.usuario = ?', [usuarioLogado]).catch(e => {
					console.error(e);
					throw e;
				});
				const usuarioLogadoBanco = rows[0]
				if(!usuarioLogadoBanco){
					throw "permissao_negada";
				}

				//Remover usuario diferente é permitido apenas para administradores
				if(usuarioLogadoBanco.usuario !== usuario && !usuarioLogadoBanco.is_admin) throw "permissao_negada";

				if(usuarioLogadoBanco.is_admin) throw "permissao_negada";
				if(usuarioLogadoBanco.is_monitor) throw "permissao_negada";


				let [response] = await connection.query('DELETE from usuario WHERE usuario.usuario = ?', [usuario])
				.catch((e)=>{
					console.error(e);
					throw "permissao_negada";
				})

				if(response.affectedRows){
					context.commit("deslogarUsuario", usuario);
					this.dispatch("broadcastUsuarios");
				}

				let resposta = stringify({
					rota: rota,
					erro: "false",
				});

				context.commit("log", { name: rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: "Usuario deletado: " + usuario, error: false });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);

			} catch (erro) {
				let resposta = stringify({
					rota: rota,
					erro: erro
				});
				context.commit("log", { name: rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: true });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);
			}
		},
		async ['rota.cliente.usuarios'](context, { request, socket, connection }) {
			let {rota} = request;
			try{
				let usuarioLogado = context.getters['obterUsuarioPorSocket'](socket).usuario;
				if(!usuarioLogado) throw "permissao_negada";

				//Obter lista de usuarios
				let [usuarios] = await connection.execute('SELECT u.usuario, u.nome, u.is_admin, u.is_monitor from usuario u', [usuarioLogado]).catch(e => {
					console.error(e);
					throw "permissao_negada";
				});

				usuarios = usuarios.map(usuario => {
					return {
					nome: usuario.nome,
					usuario: usuario.usuario,
					tipo_usuario: usuario.is_admin ? "admin" : (usuario.is_monitor ? "monitor" : "aluno")
				}});

				console.log("usuarios", usuarios)

				let resposta = stringify({
					rota: rota,
					erro: "false",
					usuarios
				});

				context.commit("log", { name: rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: stringify(usuarios), error: false });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);



			}catch(erro){
				let resposta = stringify({
					rota: rota,
					erro
				});
				context.commit("log", { name: rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: true });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);
			}
		},
		async ['rota.monitoria.registro'](context, { request, socket, connection }) {
			let {rota, nome, senha, usuario_monitor, horarios} = request;

			try{
				if(!horarios || horarios.length === 0) throw "horarios_invalidos"

				let usuarioLogado = context.getters['obterUsuarioPorSocket'](socket);
				if(!usuarioLogado) throw "permissao_negada";
				usuarioLogado = usuarioLogado.usuario;

				//Obter usuario logado do banco
				let [usuarioLogado_resposta] = await connection.execute('SELECT u.usuario, u.is_admin, u.is_monitor from usuario u WHERE u.usuario = ?', [usuarioLogado]).catch(e => {
					console.error(e);
					throw e;
				});
				const usuarioLogadoBanco = usuarioLogado_resposta[0];
				if(!usuarioLogadoBanco) throw "permissao_negada";
				if(!usuarioLogadoBanco.is_admin) throw "permissao_negada";


				//Obter monitor
				let [monitor_resposta] = await connection.execute('SELECT u.pk_usuario, u.usuario, u.is_admin, u.is_monitor from usuario u WHERE u.usuario = ?', [usuario_monitor]).catch(e => {
					console.error(e);
					throw e;
				});
				const monitorBanco = monitor_resposta[0];
				if(!monitorBanco) throw "monitor_inexistente";
				if(!monitorBanco.is_monitor) throw "usuario_nao_monitor";


				let [monitoria_resposta] = await connection.query('INSERT INTO monitoria SET ?', {
					nome,
					fk_pk_usuario: monitorBanco.pk_usuario,
					senha,
					nome
				})


				let resposta_horarios = await bluebird.promisifyAll(
					horarios.map(horario => {
						console.log({
							fk_pk_monitoria: monitoria_resposta.insertId,
							horario,
						})
						return connection.query('INSERT INTO `horario_monitoria` SET ?', {
							fk_pk_monitoria: monitoria_resposta.insertId,
							horario,
						})
					})
				)


				let resposta = stringify({
					rota: rota,
					erro: "false",
				});
				context.commit("log", { name: rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: stringify(monitoria_resposta), error: false });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);

			}catch(erro){
				let resposta = stringify({
					rota: rota,
					erro
				});
				context.commit("log", { name: rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: true });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);
			}
		},
		async ['rota.monitoria.delete'](context, { request, socket, connection }) {
			let {rota, id} = request;
			try{
				let usuarioLogado = context.getters['obterUsuarioPorSocket'](socket);
				console.log("usuario logado", usuarioLogado)
				if(!usuarioLogado) throw "permissao_negada";
				usuarioLogado = usuarioLogado.usuario;

				//Obter usuario logado do banco
				let [usuarioLogado_resposta] = await connection.execute('SELECT u.usuario, u.is_admin, u.is_monitor from usuario u WHERE u.usuario = ?', [usuarioLogado]).catch(e => {
					console.error(e);
					throw e;
				});
				const usuarioLogadoBanco = usuarioLogado_resposta[0];
				if(!usuarioLogadoBanco) throw "permissao_negada";
				if(!usuarioLogadoBanco.is_admin) throw "permissao_negada";


				//deletar horarios
				await connection.execute('DELETE FROM horario_monitoria WHERE fk_pk_monitoria = ?', [id]);

				//deletar monitoria
				await connection.execute('DELETE FROM monitoria WHERE pk_monitoria =  ?', [id]);


				let resposta = stringify({
					rota: rota,
					erro: "false",
				});
				context.commit("log", { name: rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: "monitoria deletada", error: false });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);

			}catch(erro){
				let resposta = stringify({
					rota: rota,
					erro
				});
				context.commit("log", { name: rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: true });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);
			}
		},
		async ['rota.monitoria.listar'](context, { request, socket, connection }) {
			let {rota} = request;
			try{
				let usuarioLogado = context.getters['obterUsuarioPorSocket'](socket);
				if(!usuarioLogado) throw "permissao_negada";
				usuarioLogado = usuarioLogado.usuario;


				//consultar horarios
				let sql =  `select m.nome, m.pk_monitoria as id, u.usuario as usuario_monitor, u.nome as nome_monitor from usuario u
				right join monitoria m ON m.fk_pk_usuario = u.pk_usuario
				order by id`
				let [monitorias] = await connection.execute(sql);

				let horariosPromisses = monitorias.map(async monitoria => {
					return await connection.execute(`select h.horario from horario_monitoria h where h.fk_pk_monitoria = ?`, [monitoria.id])
				});

				const horarios = await Promise.all(horariosPromisses);

				monitorias = monitorias.map((monitoria, index) => {
					return {
						...monitoria,
						horarios: horarios[index][0].map(row => row.horario),

					}
				})

				let resposta = stringify({
					rota: rota,
					erro: "false",
					monitorias
				});
				context.commit("log", { name: rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: monitorias, error: false });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);

			}catch(erro){
				let resposta = stringify({
					rota: rota,
					erro
				});
				context.commit("log", { name: rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: true });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);
			}
		},
		async ['rota.aluno-monitoria.inscrever'](context, { request, socket, connection }) {
			let {rota, id, senha, usuario_aluno} = request;

			try{
				let usuarioLogado = context.getters['obterUsuarioPorSocket'](socket);
				if(!usuarioLogado) throw "permissao_negada1";
				usuarioLogado = usuarioLogado.usuario;

				//Obter usuario logado do banco
				let [usuarioLogado_resposta] = await connection.execute('SELECT u.usuario, u.is_admin, u.is_monitor from usuario u WHERE u.usuario = ?', [usuarioLogado]).catch(e => {
					console.error(e);
					throw e;
				});
				const usuarioLogadoBanco = usuarioLogado_resposta[0];
				if(!usuarioLogadoBanco) throw "permissao_negada2";
				if(usuarioLogadoBanco.is_monitor) throw "permissao_negada3";
				if(!usuarioLogadoBanco.is_admin && usuarioLogadoBanco.usuario !== usuario_aluno) throw "permissao_negada4";


				//Obter usuario logado do banco
				let [aluno_resposta] = await connection.execute('SELECT u.pk_usuario as id, u.usuario, u.is_admin, u.is_monitor from usuario u WHERE u.usuario = ?', [usuario_aluno]).catch(e => {
					console.error(e);
					throw e;
				});
				if(!aluno_resposta || !aluno_resposta[0]) throw "usuario do aluno inexistente";
				const aluno = aluno_resposta[0];

				if(aluno.is_admin || aluno.is_monitor) throw "usuário não é aluno";

				//obtem monitoria
				let [monitoria] = await connection.execute('SELECT * from monitoria m WHERE m.pk_monitoria = ?', [id]);
				if(!monitoria || !monitoria[0]) throw "monitoria inexistente";
				monitoria = monitoria[0];

				if(monitoria.senha != senha) throw "Senha invalida";

				//verifica se aluno ja esta inscrito
				let [inscricao_existente] = await connection.execute('SELECT * from aluno_monitoria al WHERE al.fk_pk_usuario = ? AND al.fk_pk_monitoria = ?', [aluno.id, id]);
				//inscricao existe: 
				if(!!inscricao_existente.length) throw "aluno já registrado";




				let [inscricao] = await connection.query(`INSERT INTO aluno_monitoria SET ?`, {
					fk_pk_monitoria: id,
					fk_pk_usuario: aluno.id
				}).catch(e=>{
					console.log(e)
					throw e
				})

				let resposta = stringify({
					rota: rota,
					erro: "false",
				});
				context.commit("log", { name: rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: inscricao, error: false });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);
				



			}catch(erro){
				let resposta = stringify({
					rota: rota,
					erro
				});
				context.commit("log", { name: rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: true });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);
			}

		},
		async ['rota.aluno-monitoria.delete'](context, { request, socket, connection }) {
			let {rota, id, usuario_aluno} = request;
			try{
				let usuarioLogado = context.getters['obterUsuarioPorSocket'](socket);
				if(!usuarioLogado) throw "permissao_negada";
				usuarioLogado = usuarioLogado.usuario;

				//Obter usuario logado do banco
				let [usuarioLogado_resposta] = await connection.execute('SELECT u.usuario, u.is_admin, u.is_monitor from usuario u WHERE u.usuario = ?', [usuarioLogado]).catch(e => {
					console.error(e);
					throw e;
				});
				const usuarioLogadoBanco = usuarioLogado_resposta[0];
				if(!usuarioLogadoBanco) throw "permissao_negada";
				if(usuarioLogadoBanco.is_monitor) throw "permissao_negada";
				if(!usuarioLogado.is_admin && usuarioLogado.usuario !== usuario_aluno);

				//Obter aluno
				let [aluno_resposta] = await connection.execute('SELECT u.pk_usuario as id, u.usuario, u.is_admin, u.is_monitor from usuario u WHERE u.usuario = ?', [usuario_aluno]).catch(e => {
					console.error(e);
					throw e;
				});
				if(!aluno_resposta || !aluno_resposta[0]) throw "usuario do aluno inexistente";
				const aluno = aluno_resposta[0];

				//deletar horarios
				let resposta_delete = await connection.execute('DELETE FROM aluno_monitoria WHERE fk_pk_usuario = ? AND fk_pk_monitoria = ?', [aluno.id, id]);

				let resposta = stringify({
					rota: rota,
					erro: "false",
				});
				context.commit("log", { name: rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta_delete, error: false });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);

			}catch(erro){
				let resposta = stringify({
					rota: rota,
					erro
				});
				context.commit("log", { name: rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: true });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);
			}
		},
		async ['rota.monitoria.listar-monitor'](context, { request, socket, connection }) {
			let {rota, usuario_monitor} = request;
			try{
				let usuarioLogado = context.getters['obterUsuarioPorSocket'](socket);
				if(!usuarioLogado) throw "permissao_negada";
				usuarioLogado = usuarioLogado.usuario;


				//consultar horarios
				let sql =  `select m.nome, m.pk_monitoria as id, u.usuario as usuario_monitor, u.nome as nome_monitor from usuario u
				right join monitoria m ON m.fk_pk_usuario = u.pk_usuario
				where m.fk_pk_usuario = ?
				order by id`
				let [monitorias] = await connection.execute(sql, [usuario_monitor]);

				let horariosPromisses = monitorias.map(async monitoria => {
					return await connection.execute(`select h.horario from horario_monitoria h where h.fk_pk_monitoria = ?`, [monitoria.id])
				});

				const horarios = await Promise.all(horariosPromisses);

				monitorias = monitorias.map((monitoria, index) => {
					return {
						...monitoria,
						horarios: horarios[index][0].map(row => row.horario),

					}
				})

				let resposta = stringify({
					rota: rota,
					erro: "false",
					monitorias
				});
				context.commit("log", { name: rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: monitorias, error: false });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);

			}catch(erro){
				let resposta = stringify({
					rota: rota,
					erro
				});
				context.commit("log", { name: rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: true });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);
			}
		},
		async ['rota.monitoria.listar-aluno'](context, { request, socket, connection }) {
			let {rota} = request;
			try{
				let usuarioLogado = context.getters['obterUsuarioPorSocket'](socket).usuario;
				if(!usuarioLogado) throw "permissao_negada";

				//Obter lista de usuarios
				let [usuarios] = await connection.execute('SELECT u.usuario, u.nome, u.is_admin, u.is_monitor from usuario u', [usuarioLogado]).catch(e => {
					console.error(e);
					throw "permissao_negada";
				});

				usuarios = usuarios.map(usuario => {
					return {
						nome: usuario.nome,
						usuario: usuario.usuario,
						tipo_usuario: usuario.is_admin ? "admin" : (usuario.is_monitor ? "monitor" : "aluno")
					}});

				console.log("usuarios", usuarios)

				let resposta = stringify({
					rota: rota,
					erro: "false",
					usuarios
				});

				context.commit("log", { name: rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: stringify(usuarios), error: false });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);



			}catch(erro){
				let resposta = stringify({
					rota: rota,
					erro
				});
				context.commit("log", { name: rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: true });
				context.commit("log", { name: "⬆️ enviando data", user: `${socket.remoteAddress}:${socket.remotePort}`, input: resposta, error: false });
				socket.write(resposta);
			}
		},
		'ack.cliente.usuarios-ativos'(context, { request, socket }) {
			context.commit("log", { name: request.rota, user: `${socket.remoteAddress}:${socket.remotePort}`, input: request, error: false });
		}
	},
	getters: {
		estadoServidor: state => () => {

			return {
				executando: state.servidorOnline,
				host: state.host,
				porta: state.porta,
			}
		},
		bancoConectado: state => () => {
			return state.connection !== null;
		},
		obterFuncaoRota: state => (rota) => {
			return state.rotas[rota];
		},
		obterUsuario: state => usuario => {
			if (!usuario || typeof (usuario) !== "string") {
				throw "Argumento invalido para obterUsuario";
			}
			let indexUsuario = _.findIndex(state.usuarios, { usuario });
			if (indexUsuario >= 0) {
				return state.usuarios[indexUsuario]
			}
			return null;
		},
		obterUsuariosAtivos: state => () => {
			let usuarios = state.usuariosAtivos;
			return usuarios
		},
		obterSocketPorUsuario: state => usuario => {
			let _usuario = state.usuariosAtivos[usuario];
			if (!_usuario) return null;

			return state.sockets[`${_usuario.host}:${_usuario.porta}`]
		},
		obterUsuarioPorSocket: state => socket => {
			if (!socket || typeof (socket) !== "object") {
				throw "Argumento invalido para obterUsuarioPorSocket";
			}

			let usuario = _.find(state.usuariosAtivos, ['porta', socket.remotePort]);
			if (usuario)
				return usuario;
			return null;
		},
		usuarioConectado: state => usuario => {
			return !!state.usuariosAtivos[usuario]
		}
	}
})

export default store;

function stringify(obj){
	return JSON.stringify(obj) + "\n"
}