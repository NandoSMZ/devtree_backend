import { Router } from 'express';
import { body } from 'express-validator';
import { createAccount, getUser, getUserByHandle, login, searchByHandle, updateProfile, uploadImage } from './handlers';
import { handleInputErrors } from './middleware/validation';
import { authenticate } from './middleware/auth';

const router = Router();

//** Autenticacion y Registro */
// Registrar Usuario
router.post('/auth/register', 
    body('handle')
        .notEmpty()
        .withMessage('El handle es requerido'),
    body('name')
        .notEmpty()
        .withMessage('El nombre es requerido'),
    body('email')
        .isEmail()
        .withMessage('Email no valido'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),
    handleInputErrors,
    createAccount);

// Autenticar Usuario
router.post('/auth/login', 
    body('email')
        .isEmail()
        .withMessage('Email no valido'),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es requerida'),
    handleInputErrors,
    login
    );

// Obtener Usuario autenticado
router.get('/user', authenticate, getUser)

// Actualizar Usuario
router.patch('/user', 
    body('handle')
        .notEmpty()
        .withMessage('El handle no puede ir vacio'),
    body('description')
        .notEmpty()
        .withMessage('La descripcion no puede ir vacia'),
    handleInputErrors,
    authenticate, 
    updateProfile)

//Subir Imagen de Perfil
router.post('/user/image', authenticate, uploadImage)

// Pagina de Usuario Publica
router.get('/:handle', getUserByHandle)

//Buscar un usuario
router.post('/search',
    body('handle')
        .notEmpty()
        .withMessage('El handle no puede ir vacio'),
    handleInputErrors,
    searchByHandle)

export default router;