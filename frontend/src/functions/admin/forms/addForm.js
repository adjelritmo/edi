import admin_api from "../../../server/admin"

import errorMessage from "../../toaster/error"

import successMessage from "../../toaster/success"

const addForm = async (newform, forms, setForms, setIsLoading) => {

    setIsLoading(true)

    try {
       
        const filteredDimensions = newform.dimensions.filter(section => section.questions && section.questions.length > 0)

        const form = await admin_api.post('/create/new/form', {

            title: newform.title,

            description: newform.description,

            status: newform.status,

            dimensions: filteredDimensions.map((dimension, dimensionIndex) => ({

                title: dimension.title,

                description: dimension.description,

                emotion: dimension.emotion,

                order_in_form: dimension.order_in_form,

                questions: dimension.questions.map((question, questionIndex) => ({

                    text: question.text,

                    description: question.description || null,

                    type: question.type,

                    isRequired: question.isRequired,

                    helpText: question.helpText || null,

                    order_in_dimension: question.order_in_dimension,

                    order_in_form: (dimensionIndex * 100) + (questionIndex + 1),

                    options: question.options ? question.options : null

                }))
            }))
        })

        if (form.status === 200) {
            
            setForms([...forms, { ...newform, id: form.data.formId, creatorId: form.data.creatorId, creator:  form.data.creator }])

            successMessage('Form was added successfully!')

            return 200
        }

    } catch (error) {

        console.log('Error creating form:', error)

        errorMessage(error.response?.data?.message || 'Failed to save form. Please try again.')

        return 0

    } finally {

        setIsLoading(false)

    }
}

export default addForm