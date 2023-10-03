const { Pool } = require('pg')
const { config } = require('dotenv')

config()
 
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

const insertIntoDB = async (query, values) => {
  const response = []
  values.forEach(async (value) => {
    const res = await pool.query(query, value)
    response.push(res)
  });
  console.log(response)
}

module.exports = { insertIntoDB }