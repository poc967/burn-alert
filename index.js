const Alexa = require('ask-sdk-core')
const axios = require('axios')

// Powered by DarkSky API
// https://darksky.net/poweredby/

async function getUvIndex(location) {
    const apikey = process.env.DarkSky_API_KEY

    return await axios.get(`https://api.darksky.net/forecast/${apikey}/${location}?exclude=minutely,hourly,daily`).then((response) => {
        return response.data.currently.uvIndex
    })
}


// Powered by Mapquest Geocode API
// https://developer.mapquest.com/documentation/geocoding-api/address/get/

async function getDecimalLocation(Location) {
    const apikey = process.env.MapQuest_API_KEY

    return await axios.get(`http://www.mapquestapi.com/geocoding/v1/address?key=${apikey}&location=${Location}&maxResults=1`).then((response) => {
        const lat = response.data.results[0].locations[0].latLng.lat
        const lng = response.data.results[0].locations[0].latLng.lng

        return `${lat},${lng}`
    })
}

// https://www.epa.gov/sunsafety/uv-index-scale-0
// UV safety information sourced from United States EPA website

function getRiskText(uvIndex) {
    switch (uvIndex) {
        case 0:
        case 1:
        case 2:
            return 'Low danger from UV levels for the average person. No sunscreen required'
        case 3:
        case 4:
        case 5:
            return 'Moderate risk of harm from current UV levels. Be sure to apply sunscreen especially if you plan on being outside around midday.'
        case 6:
        case 7:
            return 'High risk of harm from current UV levels. Sunscreen should be applied to prevent burns. If possible, avoid sun exposure between ten oclock and four oclock.'
        case 8:
        case 9:
        case 10:
            return 'Very high risk of harm from UV exposure. Burns can occur quickly unless sunscreen is applied every twp hours and unprotected sun is avoided between ten oclock and four oclock.'
        case 11:
            return 'Extreme risk of burns from UV exposure. Unprotected skin and eyes can burn in minutes.'
        default:
            return 'Please try again.'
    }
}

const sunscreenIntentHandler = {
    canHandle(handlerInput) {
        const {
            request
        } = handlerInput.requestEnvelope

        return request.type === 'IntentRequest' && request.intent.name === 'sunscreenIntent'
    },
    async handle(handlerInput) {
        const uvLocation = await getDecimalLocation(handlerInput.requestEnvelope.request.intent.slots.Location.value)
        const reprompt = 'Would you like more information?'

        const uvIndex = await getUvIndex(uvLocation)
        const speechText = `The current UV Index is ${uvIndex}. `
        const riskText = getRiskText(uvIndex)

        return handlerInput.responseBuilder
            .speak(speechText + riskText)
            .reprompt(reprompt)
            .withShouldEndSession(false)
            .getResponse();
    }
}

const fallbackIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent'
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('I am not sure I understood you. Do you want to know about current risk from sunburns?')
            .reprompt('Want to know if you need sunscreen?')
            .withShouldEndSession(false)
            .getResponse()
    }
}

const cancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
                handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent')
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Stay cool!')
            .withShouldEndSession(true)
            .getResponse()
    }
}

const helpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent'
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak("Burn Alert helps you plan your day without worrying about wether or not you will be at risk of sunburns from UV rays. Try asking 'Do I need sunscreen?' and provide your location for up-to-date data.")
            .reprompt("Burn Alert helps you plan your day without worrying about wether or not you will be at risk of sunburns from UV rays. Try asking 'Do I need sunscreen?' and provide your location for up-to-date data.")
            .withShouldEndSession(false)
            .getResponse()
    }
}

const launchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak("Welcome to Burn Alert! Try asking how strong the sun is in Boston.")
            .reprompt('Want to know how strong the sun is today?')
            .withShouldEndSession(false)
            .getResponse()
    }
}

const sessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest'
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak("Bye!")
            .withShouldEndSession(true)
            .getResponse()
    }
}

const ErrorHandler = {
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
    .addRequestHandlers(
        sunscreenIntentHandler,
        fallbackIntentHandler,
        cancelAndStopIntentHandler,
        helpIntentHandler,
        launchRequestHandler,
        sessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda()