const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant
const Comment = db.Comment
const Favorite = db.Favorite

const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
    signUpPage: (req, res) => {
        return res.render('signup')
    },

    signUp: (req, res) => {
        // confirm password
        if (req.body.passwordCheck !== req.body.password) {
            req.flash('error_messages', 'Your password and confirmation password do not match！')
            return res.redirect('/signup')
        } else {
            // confirm unique user
            User.findOne({ where: { email: req.body.email } }).then(user => {
                if (user) {
                    req.flash('error_messages', 'Email already existed！')
                    return res.redirect('/signup')
                } else {
                    User.create({
                        name: req.body.name,
                        email: req.body.email,
                        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
                    }).then(user => {
                        req.flash('success_messages', 'Registration successful！')
                        return res.redirect('/signin')
                    })
                }
            })
        }
    },
    signInPage: (req, res) => {
        return res.render('signin')
    },

    signIn: (req, res) => {
        req.flash('success_messages', 'Login successful！')
        res.redirect('/restaurants')
    },

    logout: (req, res) => {
        req.flash('success_messages', 'Logout successful！')
        req.logout()
        res.redirect('/signin')
    },
    getUser: (req, res) => {
        return User.findByPk(req.params.id, {
            include: [
                { model: Comment, include: Restaurant }
            ]
        }).then(user => {
            return res.render('users/profile', { profile: user.toJSON() })
        })
    },
    editUser: (req, res) => {
        return User.findByPk(req.params.id).then(user => {
            return res.render('users/edit', { user: user.toJSON() })
        })
    },
    putUser: (req, res) => {
        if (Number(req.params.id) !== Number(req.user.id)) {
            return res.redirect(`/users/${req.params.id}`)
        }
        const { file } = req
        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID)
            imgur.upload(file.path, (err, img) => {
                return User.findByPk(req.params.id)
                    .then((user) => {
                        user.update({
                            name: req.body.name,
                            image: img.data.link
                        }).then((user) => {
                            res.redirect(`/users/${req.params.id}`)
                        })
                    })
            })
        } else {
            return User.findByPk(req.params.id)
                .then((user) => {
                    user.update({
                        name: req.body.name
                    }).then((user) => {
                        res.redirect(`/users/${req.params.id}`)
                    })
                })
        }
    },
    addFavorite: (req, res) => {
        return Favorite.create({
            UserId: req.user.id,
            RestaurantId: req.params.restaurantId
        })
            .then((restaurant) => {
                return res.redirect('back')
            })
    },
    removeFavorite: (req, res) => {
        return Favorite.findOne({
            where: {
                UserId: req.user.id,
                RestaurantId: req.params.restaurantId
            }
        })
            .then((favorite) => {
                favorite.destroy()
                    .then((restaurant) => {
                        return res.redirect('back')
                    })
            })
    }
}

module.exports = userController