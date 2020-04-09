require('@tensorflow/tfjs-node')
const nsfwjs = require('nsfwjs')
const { Image, createCanvas } = require('canvas')

exports.checkImage = (url, message) => {
    var image = new Image()
    image.src = url

    image.onload = () => {
        const canvas = createCanvas(image.naturalWidth, image.naturalHeight)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight)

        nsfwjs.load().then(function(model) {
            model.classify(canvas).then(function(predictions) {
                switch(predictions[0].className){
                    case 'Hentai':
                        message.reply(`Please don't post hentai in here :(`)
                        message.delete()
                        break
                    case 'Porn':
                        message.reply(`Please don't post porn in here :(`)
                        message.delete()
                        break
                    case 'Sexy':
                        message.reply(`Please don't post sexy pics in here :(`)
                        message.delete()
                        break
                }
            })
        })
    }
}