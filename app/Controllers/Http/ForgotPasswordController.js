'use strict'

const User = use('App/Models/User')
const Mail = use('Mail')
const crypto = require('crypto')
const to = require('await-to-js').default
const moment = require('moment')

class ForgotPasswordController {
  async store ({ request, response }) {
    const email = request.input('email')
    const [err, user] = await to(User.findByOrFail('email', email))

    if (err) {
      return response.status(err.status).send({ error: { message: 'Algo não deu certo, esse e-mail existe?' } })
    }

    user.token = crypto.randomBytes(10).toString('hex')
    user.token_created_at = new Date()

    await user.save()

    await Mail.send(['email.forgot_password'], {
      email, token: user.token, link: `${request.input('redirect_url')}/resetar_senha?token=${user.token}`
    }, message => {
      message
        .to(user.email)
        .from('matt@gonode.com', 'Matheus | GoNode')
        .subject('Recuperação de senha')
    })
  }

  async update ({ request, response }) {
    const { token, password } = request.all()
    const [err, user] = await to(User.findByOrFail('token', token))
    if (err) {
      return response.status(err.status).send({ error: { message: 'Algo deu errado ao resetar sua senha' } })
    }

    const tokenExpired = moment().subtract('2', 'days').isAfter(user.token_created_at)
    if (tokenExpired) return response.status(401).send({ error: { message: 'O token de recuperação está expirado.' } })
    user.token = null
    user.token_created_at = null
    user.password = password

    await user.save()
  }
}

module.exports = ForgotPasswordController
