'use strict'

const File = use('App/Models/File')
const Helpers = use('Helpers')
const to = require('await-to-js').default

class FileController {
  async show ({ params, response }) {
    const [err, file] = await to(File.findByOrFail('file', params.id))
    if (err) {
      return response.status(err.status).send({ error: { message: 'Houve um problema ao obter a imagem' } })
    }
    if (!file) {
      return response.status(404).send({ error: { message: 'Não existe imagem com o nome indicado' } })
    }
    await response.download(Helpers.tmpPath(`uploads/${file.file}`))
  }

  async store ({ request, response }) {
    try {
      if (!request.file('file')) return

      const upload = request.file('file', { size: '2mb' })
      const fileName = `${Date.now()}.${upload.subtype}`

      await upload.move(Helpers.tmpPath('uploads'), {
        name: fileName
      })

      if (!upload.moved()) {
        throw upload.error()
      }

      const file = await File.create({
        file: fileName,
        name: upload.clientName,
        type: upload.type,
        subtype: upload.subtype
      })
      return file
    } catch (err) {
      return response.status(err.status).send({ error: { message: 'Erro no upload de arquivo' } })
    }
  }
}

module.exports = FileController
