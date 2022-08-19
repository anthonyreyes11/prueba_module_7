//llamamos al modulo
const express = require('express');
const {nuevoUsuario,mostrarUsuario,editarUsuario,eliminarUsuario,getform,crearTransferencia,historialTransferencias,formatDate} = require('./funciones.js')
//traemos la funcion express en la constante app
const app = express();
//


//  /usuario POST: Recibe los datos de un nuevo usuario y los almacena en PostgreSQL.
app.post('/usuario', async (req, res) => {
  const datos = await getform(req)
  console.log(datos);
  let nombre = datos.nombre;
  let balance = datos.balance;
  await nuevoUsuario(nombre,balance)
  res.json({})
})
// /usuarios GET: Devuelve todos los usuarios registrados con sus balances.
app.get('/usuarios',async (req,res) =>{
  let resp = await mostrarUsuario()
  res.json(resp)

})

// /usuario PUT: Recibe los datos modificados de un usuario registrado y los actualiza.
app.put('/usuario',async (req,res) =>{
  let id = req.query.id;
  const datos = await getform(req)
  let nombre = datos.name;
  let balance = datos.balance;
  let resp= await editarUsuario(id,nombre,balance)
  res.json(resp)

})

// /usuario DELETE: Recibe el id de un usuario registrado y lo elimina.
app.delete('/usuario',async (req,res) =>{
  let id = req.query.id
  await eliminarUsuario(id)
  res.json({})
})

// /transferencia POST: Recibe los datos para realizar una nueva transferencia.
app.post('/transferencia',async (req,res)=>{
  const datos = await getform(req)
  const emisor = datos.emisor;
  const receptor = datos.receptor;
  const monto = datos.monto
  
  var date = new Date();


  await crearTransferencia(emisor,receptor,monto,formatDate(date))
  res.json({})
})
// /transferencias GET: Devuelve todas las transferencias almacenadas en la base de datos en formato de arreglo.

app.get('/transferencias',async (req,res)=>{
  let datos =await  historialTransferencias()
  res.json(datos).redirect
  
})
//Se debe ocupar una transacción SQL en la consulta a la base de datos.




//indicamos el puerto
app.listen(3000, function () {
  console.log('servidor ejecutando');
})


//indicamos la ruta
app.use(express.static('public'))