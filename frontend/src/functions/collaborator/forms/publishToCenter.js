import collaborator_api from "../../../server/collaborator"
import errorMessage from "../../toaster/error"
import successMessage from "../../toaster/success"

const publishToCenter = async (edi_publication, selectedForm, setForms) => {

    try {

        const response = await collaborator_api.post('/puplish/form/to/center', { edi_publication })

        if (response.status === 200) {

            const publications = []

            publications.push({ ...edi_publication, id: response.data.publishId, centerId: response.data.centerId })

            successMessage("Form was published to your center´s members")

            setForms(prevForms => prevForms.map(form => form.id === selectedForm.id ? { ...form, publications: publications } : form))

            return response.data

        } else {

            errorMessage("Error when trying publish form to your center´s members")

            return []

        }

    } catch (error) {

        console.error("Error in:", error)

        errorMessage("Error when trying to publish form")

        return []
    }
}

export default publishToCenter