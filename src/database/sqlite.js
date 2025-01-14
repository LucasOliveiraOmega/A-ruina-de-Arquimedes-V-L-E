import express from 'express'
import sqlite3 from 'sqlite3'
import cors from 'cors'

const app = express()

// Usando o middleware CORS
app.use(cors())

// Usando o middleware para analisar JSON
app.use(express.json())

// Abrindo o banco de dados
const db = new sqlite3.Database('./src/database/database.sqlite', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados', err.message)
  } else {
    console.log('Conectado ao banco de dados SQLite')
  }
})

// Criando as tabelas (caso ainda não existam)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS JOGADOR (
        ID_JOGADOR INTEGER PRIMARY KEY AUTOINCREMENT,
        POSICAO_X_Y TEXT,
        VIDA INTEGER
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS ITENS (
        ID_ITEM INTEGER PRIMARY KEY AUTOINCREMENT,
        QUANTIDADE INTEGER,
        NOME TEXT,
        TIPO TEXT
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS INVENTARIO (
        ID_DIALOGO INTEGER PRIMARY KEY AUTOINCREMENT,
        ID_JOGADOR INTEGER,
        ID_ITEM INTEGER,
        QUANTIDADE INTEGER,
        FOREIGN KEY (ID_JOGADOR) REFERENCES JOGADOR(ID_JOGADOR),
        FOREIGN KEY (ID_ITEM) REFERENCES ITENS(ID_ITEM)
    )
  `)
})

// Endpoint para obter dados do jogador
app.get('/api/player', (req, res) => {
  db.get("SELECT * FROM JOGADOR LIMIT 1", [], (err, row) => {
    if (err) {
      res.status(500).send('Erro ao obter jogador')
    } else if (row) {
      // Se o jogador já existe, retorna os dados
      res.json(row)
    } else {
      // Se não existir jogador, cria um novo
      const posicaoInicial = '0,0' // Posição inicial do jogador
      const vidaInicial = 100 // Vida inicial do jogador

      db.run(`
        INSERT INTO JOGADOR (POSICAO_X_Y, VIDA) 
        VALUES (?, ?)`,
        [posicaoInicial, vidaInicial],
        function (err) {
          if (err) {
            res.status(500).send('Erro ao criar jogador')
          } else {
            res.json({
              id: this.lastID,
              posicao: posicaoInicial,
              vida: vidaInicial
            })
          }
        }
      )
    }
  })
})

// Iniciar o servidor
app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001')
})
