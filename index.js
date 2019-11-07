const Alexa = require('ask-sdk-core')
const axios = require('axios')

function getUvIndex(location) {
    const apikey = process.env.DarkSky_API_KEY

    return axios.get(`https://api.darksky.net/forecast/${apikey}/${location}?exclude=minutely,hourly,daily`).then((response) => {
        return response.data.currently.uvIndex
    })
}

const sunscreenIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInputInput.requestEnvelope.request.intent.name === 'sunscreenIntent'
    },
    handle(handlerInput) {
        const uvDate = handler.Input.requestEnvelope.reuest.intent.slots.Date.value
        const uvLocation = handler.Input.requestEnvelope.reuest.intent.slots.Location.value
        const reprompt = 'Would you like more information?'

        return getUvIndex(uvDate, uvLocation).then((uvIndex) => {
            const speechText = `The current UV Index is ${uvIndex}`

            return handlerInput.esponseBuilder
                .speak(speechText)
                .reprompt(reprompt)
                .withShouldEndSession(false)
                .getResponse();
        })
    }
}

const errorHandler = {
    canHandle() {
        return true
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Can you repeat that?')
            .reprompt('Can you repeat that?')
            .withShouldEndSession(false)
            .getResponse()
    },
}

const builder = Alexa.SkillBuilders.custom()

exports.handler = builder
    .addRequestHandlers(sunscreenIntentHandler)
    .addErrorHandlers(errorHandler)
    .lambda()


