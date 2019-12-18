'use strict'

const User = use('App/Models/User')
const Database = use('Database')

class UserController {
  async store ({ request }) {
    const { permissions, roles, ...data } = request.only(['username', 'email', 'password', 'permissions', 'roles'])
    const addresses = request.input('addresses')

    const trx = await Database.beginTransaction()

    const user = await User.create(data, trx)
    await user.addresses().createMany(addresses, trx)

    if (roles) {
      await user.roles().sync(roles)
    }
    if (permissions) {
      await user.permissions().attach(permissions)
    }

    await trx.commit()

    await user.loadMany(['roles', 'permissions', 'addresses'])

    return user
  }

  async update ({ request, params }) {
    const { permissions, roles, ...data } = request.only(['username', 'email', 'password', 'permissions', 'roles'])
    const addresses = request.input('addresses')
    const trx = await Database.beginTransaction()

    const user = await User.findOrFail(params.id)
    user.merge(data)

    if (addresses) {
      await user.addresses().createMany(addresses, trx)
    }

    if (roles) {
      await user.roles().sync(roles)
    }
    if (permissions) {
      await user.permissions().sync(permissions)
    }

    await trx.commit()

    await user.loadMany(['roles', 'permissions', 'addresses'])

    return user
  }
}

module.exports = UserController
