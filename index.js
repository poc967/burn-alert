const sunscreenIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInputInput.requestEnvelope.request.intent.name === 'sunscreenIntent'
    },
    handle(handlerInput) {
        const uvDate = handler.Input.requestEnvelope.reuest.intent.slots.Date.value
        const uvLocation = handler.Input.requestEnvelope.reuest.intent.slots.Location.value
        const response = `The requested Date is ${uvDate} and the location is ${uvLocation}`
        const reprompt = 'Would you like more information?'

        return handlerInput.responseBuilder
            .speak(response + reprompt)
            .repromt(reprompt)
            .withShouldEndSession(false)
            .getResponse();
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


