const { Pool } = require('pg')
const config_objet = require('./db.js')
const pool = new Pool(config_objet)
pool.connect(err => {
  if (err) {
    console.log(`error al conectar a la base de datos ${err}`);
  }
})

const formatDate = (current_datetime)=>{
  let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds();
  return formatted_date;
}

function getform(req) {
  return new Promise((resolve, reject) => {
    let string = ''
    req.on('data', function (params) {
      string += params
    })
    req.on('end', function () {
      const objeto = JSON.parse(string)
      resolve(objeto)
    })
  })
}
async function nuevoUsuario(nombre, balance) {
  const client = await pool.connect()
  await client.query(`insert into usuarios (nombre,balance) values ('${nombre}',${balance}) returning *`)
  client.release()

}
const mostrarUsuario = async () => {
  const client = await pool.connect()
  let resp = await client.query(`select * from usuarios`)
  client.release()
  return resp.rows

}
async function editarUsuario(id, nombre, balance) {
  const client = await pool.connect()
  await client.query({
    text: 'update usuarios set nombre=$1, balance=$2 where id=$3',
    values: [nombre, balance, id]
  })
  client.release()

}
async function eliminarUsuario(id) {
  try {
    const client = await pool.connect()
    await client.query(`delete from transferencia where emisor=${id} or receptor=${id}`)
    await client.query(`delete from usuarios where id=${id}`)
    client.release()
  }
  catch (error) {
    console.log(error);
  }
}
async function crearTransferencia(emisor,receptor,monto,data){
  const client = await pool.connect()
  let id_emisor = await client.query(`select id from usuarios where nombre='${emisor}'`)
  let id_receptor = await client.query(`select id from usuarios where nombre='${receptor}'`)
  await client.query(`insert into transferencias (emisor, receptor, monto,fecha) values (${id_emisor.rows[0].id},${id_receptor.rows[0].id},${monto},'${data}')`)
  client.release()

}
async function historialTransferencias(){
  const client = await pool.connect()
  const mostrarUsuarios = await  client.query({
    text: `select transferencias.id, emisores.nombre as Emisor, receptores.nombre as Receptor, Monto,fecha FROM transferencias Join usuarios as emisores on emisor=emisores.id join usuarios as receptores on receptor= receptores.id`,
     rowMode: 'array'
  })
  let datos = mostrarUsuarios.rows
  console.log(datos);
  client.release()
  return datos
}





module.exports = { nuevoUsuario, mostrarUsuario, editarUsuario, eliminarUsuario, getform,crearTransferencia,historialTransferencias,formatDate}





