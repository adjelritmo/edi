import user_api from "../../../server/user"

import errorMessage from "../../toaster/error"

import successMessage from "../../toaster/success"




const submitFormResponse = async (formResponse, setIsSubmitting) => {

    setIsSubmitting(true)

    try {

        const edi_submition = {

            formId: formResponse.formId,

            answers: formResponse.responses,

            timeSpent: formResponse.timeSpent

        }

        const response = await user_api.post('/submit/form/response', { edi_submition })

        if (response.status === 201) {

            successMessage('Form submitted successfully!')

            return 200
        }

    } catch (error) {

        console.log(error)

        errorMessage('Failed to submit form. Please try again.')

        return 0

    } finally {

        setIsSubmitting(false)

    }
}

export default submitFormResponse