import { Request, Response } from "express"
import { check, validationResult } from "express-validator"
import slug from "slug"
import formidable from "formidable"
import { v4 as uuid } from 'uuid'
import User from "../models/User"
import { hashPassword, checkPassword } from "../utils/auth"
import { generateJWT } from "../utils/jwt"
import { reconstructFieldPath } from "express-validator/lib/field-selection"
import cloudinary from "../config/cloudinary"

export const createAccount = async (req: Request, res: Response) => {

    const { email, password } = req.body

    // Se valida el Usuario
    const userExist = await User.findOne({ email })
    if (userExist) {
        const error = new Error('El Email ya esta registrado')
        res.status(409).json({ error: error.message })
        return
    }

    // Se valida el Handle
    const handle = slug(req.body.handle, '')
    const handleExists = await User.findOne({ handle })
    if (handleExists) {
        const error = new Error('El Handle ya esta en uso')
        res.status(409).json({ error: error.message })
        return
    }

    const user = new User(req.body)
    user.password = await hashPassword(password) // Se encripta la contraseña
    user.handle = handle // Se asigna el handle
    await user.save()
    res.status(201).send('Registro Creado Exitosamente')
}

export const login = async (req: Request, res: Response) => {

    const { email, password } = req.body

    // Se valida el Usuario
    const user = await User.findOne({ email })
    if (!user) {
        const error = new Error('El Email no esta registrado')
        res.status(404).json({ error: error.message })
        return
    }

    // Se valida la Contraseña
    const isPasswordCorrect = await checkPassword(password, user.password)
    if (!isPasswordCorrect) {
        const error = new Error('La contraseña es incorrecta')
        res.status(401).json({ error: error.message })
        return
    }

    const token = generateJWT({id: user._id})

    res.send(token)
    //res.status(200).send('Login Exitoso')
}

export const getUser = async (req: Request, res: Response) => {
    res.json(req.user)
}

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { description, links } = req.body

        const handle = slug(req.body.handle, '')
        const handleExists = await User.findOne({ handle })
        if (handleExists && handleExists.email !== req.user.email) {
            const error = new Error('El Handle ya esta en uso')
            res.status(409).json({ error: error.message })
            return
        }

        // Actualizar user
        req.user.description = description
        req.user.handle = handle
        req.user.links = links
        await req.user.save()
        res.status(200).json('Perfil actualizado correctamente')
    } catch (e) {
        const error = new Error('Error al actualizar el usuario')
        res.status(500).json({ error: error.message })
        return
    }
}

export const uploadImage = async (req: Request, res: Response) => {
    const form = formidable({ multiples: false })

    try {
        form.parse(req, (error, fields, files) => {

            cloudinary.uploader.upload(files.file[0].filepath, { public_id: uuid()}, async function(error, result) {
                if(error) {
                    const error = new Error('Error al subir la imagen')
                    res.status(500).json({ error: error.message })
                    return
                }
                if(result) {
                    // Se actualiza el campo image del usuario
                    req.user.image = result.secure_url
                    await req.user.save()
                    res.status(200).json({ image: result.secure_url })
                }
            })
        })
    } catch (e) {
        const error = new Error('Error al subir la imagen')
        res.status(500).json({ error: error.message })
        return
    }

}

export const getUserByHandle = async (req: Request, res: Response) => {
    try {
        const { handle } = req.params
        const user = await User.findOne({ handle }).select('-_id -email -password -__v')
        if (!user) {
            const error = new Error('El usuario no existe')
            res.status(404).json({ error: error.message })
            return
        }
        res.status(200).json(user)
    } catch (e) {
        const error = new Error('Hubo un Error')
        res.status(500).json({ error: error.message })
        return
    }
        
}

export const searchByHandle = async (req: Request, res: Response) => {
    try {
        const { handle } = req.body
        const userExist = await User.findOne({ handle })
        if (userExist) {
            const error = new Error('El usuario ya existe')
            res.status(409).json({ error: error.message })
            return
        }
        res.status(200).json(`${handle} esta Disponible`)
    } catch (e) {
        const error = new Error('Hubo un Error')
        res.status(500).json({ error: error.message })
        return
    }
        
}