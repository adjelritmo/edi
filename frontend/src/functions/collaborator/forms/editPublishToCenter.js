import collaborator_api from "../../../server/collaborator"

import errorMessage from "../../toaster/error"

import successMessage from "../../toaster/success"

const editPublishToCenter = async (edi_publication, selectedForm, setForms) => {

    try {

        const response = await collaborator_api.put('/edit/puplish/form/to/center', { edi_publication })

        if (response.status === 200) {

            const publications = []

            publications.push(edi_publication)

            successMessage("Form was edited and published to your center´s members")

            setForms(prevForms => prevForms.map(form => form.id === selectedForm.id ? { ...form, publications: publications } : form))

            return response.data

        } else {

            errorMessage("Error when trying edit publication form to your center´s members")

            return []

        }

    } catch (error) {

        console.error("Error:", error)

        errorMessage("Error when trying to publish form")

        return []
    }
}

export default editPublishToCenter