const { Pool } = require('pg')
const config_objet = require('./db.js')
const pool = new Pool(config_objet)
pool.connect(err => {
  if (err) {
    console.log(`error al conectar a la base de datos ${err}`);
  }
})

const formatDate = (current_datetime) => {
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
  const client = await pool.connect()
  await client.query(`delete from transferencias where emisor=${id} or receptor=${id} returning *`)
  await client.query(`delete from usuarios where id=${id}returning *`)
  client.release()
}

async function crearTransferencia(emisor, receptor, monto, data) {
  const client = await pool.connect()

  //seleccionamos datos del emisor
  let info_e = await client.query(`select id,balance from usuarios where nombre='${emisor}'`)
  let data_emisor = info_e.rows[0]
  let id_emisor=data_emisor.id
  let balance_emisor = data_emisor.balance


  //seleccionamos datos del receptor
  let info_r = await client.query(`select id,balance from usuarios where nombre='${receptor}'`)
  let data_receptor = info_r.rows[0]
  let id_receptor=data_receptor.id
  let balance_receptor = data_receptor.balance

  if (balance_emisor < monto){
    return
  }
  if (balance_emisor < 0) {
    return
  }
  if (balance_emisor < 0) {
    return
  }

  //se debe actualizar el monto del balance del emisor(se debe restar)
  const resta = parseInt(balance_emisor) - monto
  const suma = parseInt(balance_receptor) + parseInt(monto)
  const montoActualizarEmisor =  await client.query(`update usuarios set balance=${resta} where id=${id_emisor}`)
  //se debe actualizar el monto de balance del receptor(se debe sumar)
  const montoActualizarReceptor=  await client.query(`update usuarios set balance=${suma} where id=${id_receptor}`)

  await client.query(`insert into transferencias (emisor, receptor, monto,fecha) values (${id_emisor},${id_receptor},${monto},'${data}')`)
  client.release()
}
async function historialTransferencias() {
  const client = await pool.connect()
  let datos;

  const mostrarUsuarios = await client.query({
    text: `SELECT fecha, emisores.nombre as Emisor, receptores.nombre as Receptor, Monto FROM transferencias
    JOIN usuarios as emisores ON emisor=emisores.id
    join usuarios as receptores on receptor= receptores.id`,
    rowMode: 'array'
  })
  datos = mostrarUsuarios.rows
  
  //console.log(datos);
  client.release()
  return datos
}





module.exports = { nuevoUsuario, mostrarUsuario, editarUsuario, eliminarUsuario, getform, crearTransferencia, historialTransferencias, formatDate }





