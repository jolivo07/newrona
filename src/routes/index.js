const { Router } = require('express')
const router = Router()
const admin = require('firebase-admin')
var serviceAccount = require("../../newrona-831b7-firebase-adminsdk-gb2e5-b37ca609bb.json");

// Conexion Firestore
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://newrona-831b7-default-rtdb.firebaseio.com/'
})

const db = admin.firestore()
// Ruta Principal
router.get("/", (req, res) => {
  res.render('home')
})


// Mostrar Gerente
router.get("/gerente/:id", (req, res) => {
  db.collection('operarios').where('GerenteID', '==', req.params.id).get().then(results =>{
    let data = results.docs.map(x => ({
      id: x.id,
      ...x.data(),
    }))
    res.render('gerente', {operarios:data, gerenteID: req.params.id})
  })
})

// Crear Gerente
router.get("/new-gerente/:id", (req, res) => {
  if (req.params.id !== '1') {
    res.render('registrar_gerente', {gerenteID: req.params.id})
  }else{
    res.render('registrar_gerente')
  }
})
router.post('/new-gerente/:id', (req, res) => {
  let newGerente = {
    nombre: req.body.Nombre,
    apellido: req.body.Apellido,
    usuario: req.body.Usuario,
    contraseña: req.body.Contraseña,
  }
  
  db.collection('gerentes').get().then(results =>{
    let data = results.docs.map(x => ({
      id: x.id,
      ...x.data(),
    }))
   
    for (let i = 0; i < data.length; i++) {
      if (data[i].usuario === newGerente.usuario) {
        res.render('registrar_gerente', {err: 'Usuario ya existente'})  
        return 
      }
    }
    for (let i = 0; i < data.length; i++) {
      if (newGerente.nombre === '' || newGerente.apellido === '' || newGerente.usuario === '' || newGerente.contraseña === '') {
        res.render('registrar_gerente', {err: 'Los campos deben estar llenos'})  
        break 
      }
      if (data[i].usuario !== newGerente.usuario ) {
        db.collection('gerentes').add(newGerente)
        db.collection('gerentes').where("usuario", "==", ""+newGerente.usuario+"").get().then(results =>{
         let data = results.docs.map(x => ({
          id: x.id,
          ...x.data(),
         }))
         data.forEach(x =>{
          console.log("PARAMETRO--->>>", req.params.id)
          if (req.params.id === '1') {
            res.redirect('/gerente/'+x.id)
          }else{
            res.redirect('/gerente/'+req.params.id)
          }
         })
        })
        return 
      }
    }
  })

})


// Login Gerente
router.post('/login-gerente', (req, res) => {
  let gerente = {
    usuario: req.body.Usuario,
    contraseña: req.body.Contraseña
  }
  db.collection('gerentes').get().then(results =>{
    let data = results.docs.map(x => ({
      id: x.id,
      ...x.data(),
    }))
    for (let i = 0; i < data.length; i++) {
      if (data[i].usuario === gerente.usuario && data[i].contraseña === gerente.contraseña ) {
        res.redirect('/gerente/'+data[i].id)  
        return 
      }
    }
    for (let i = 0; i < data.length; i++) {
      if (gerente.usuario === '' || gerente.contraseña === '') {
        res.render('home', {err: 'Completar todos los campos'}) 
        return
      }
      if (data[i].usuario !== gerente.usuario || data[i].contraseña !== gerente.contraseña) {
        
        res.render('home', {err: 'Usuario o Contraseña Incorrecta'})  
        return
      }
    }
  })
})


// Crear Operario
router.get("/new-operario/:id", (req, res) =>{
  res.render('new_operario',  {gerenteID: req.params.id})
})

router.post('/new-operario/:id', (req, res) => {
  let newOperario = {
    GerenteID: req.params.id,
    nombre: req.body.Nombre,
    cedula: req.body.Cedula,
  }
  if (newOperario.nombre === '' || newOperario.cedula === '') {
     res.render('new_operario',  {gerenteID: req.params.id, err: true})
  }else{
    db.collection('operarios').add(newOperario)
    res.redirect('/gerente/'+req.params.id)

  }

})


// Eliminar Operario
router.get('/delete-operario/:gerid/:id', (req, res) => {
  db.collection('operarios').doc(req.params.id).delete()
  res.redirect('/gerente/'+req.params.gerid)
})

module.exports = router;