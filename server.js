//llamamos al modulo
const express = require('express');
const { nuevoUsuario, mostrarUsuario, editarUsuario, eliminarUsuario, getform, crearTransferencia, historialTransferencias, formatDate } = require('./funciones.js')
//traemos la funcion express en la constante app
const app = express();

// para manejo de archivos estáticos
//indicamos la ruta
app.use(express.static('public'))
//app.use(express.urlencoded()) // para recibir datos de formulario POST
app.use(express.urlencoded({ extended: true }));


//  /usuario POST: Recibe los datos de un nuevo usuario y los almacena en PostgreSQL.
app.post('/usuario', async (req, res) => {
  const datos = await getform(req)
  //console.log(datos);
  let nombre = datos.nombre;
  let balance = datos.balance;
  try {
    await nuevoUsuario(nombre, balance)
  } catch (error) {
    res.statusCode = 400
    return res.json({ error: error })
  }
  res.json({})
})


// /usuarios GET: Devuelve todos los usuarios registrados con sus balances.
app.get('/usuarios', async (req, res) => {
  let resp;
  try {
    resp = await mostrarUsuario()
  } catch (error) {
    console.log(error)
  }
    res.json(resp)
})

// /usuario PUT: Recibe los datos modificados de un usuario registrado y los actualiza.
app.put('/usuario', async (req, res) => {
  let id = req.query.id;
  const datos = await getform(req)
  try {
    let nombre = datos.name;
    let balance = datos.balance;
    await editarUsuario(id, nombre, balance)
  } catch (error) {
    console.log(error)
  }
  res.json({})
})

// /usuario DELETE: Recibe el id de un usuario registrado y lo elimina.
app.delete('/usuario', async (req, res) => {
  let id = req.query.id
  try {
    await eliminarUsuario(id)
  } catch (error) {
    console.log(error)
  }
  res.json({})
})

// /transferencia POST: Recibe los datos para realizar una nueva transferencia.
app.post('/transferencia', async (req, res) => {
  const datos = await getform(req)
  const emisor = datos.emisor;
  const receptor = datos.receptor;
  const monto = datos.monto

  var date = new Date();

  try {
    await crearTransferencia(emisor, receptor, monto, formatDate(date))
  } catch (error) {
    console.log(error)
  }
  res.json({})
})

// /transferencias GET: Devuelve todas las transferencias almacenadas en la base de datos en formato de arreglo.

app.get('/transferencias', async (req, res) => {
  let datos;
  try {
    datos = await historialTransferencias()
  } catch (error) {
    console.log(error)
  }
  res.json(datos)
})




app.get('*', (req, res) => {
  res.statusCode = 404
  res.send('Ruta no implementada')
})

//indicamos el puerto
app.listen(3000, function () {
  console.log('servidor ejecutando');
});



