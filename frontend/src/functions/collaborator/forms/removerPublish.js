import collaborator_api from "../../../server/collaborator"

import errorMessage from "../../toaster/error"

import successMessage from "../../toaster/success"

const removePublishToCenter = async (edi_publication) => {

    try {

        const response = await collaborator_api.delete(`/remove/puplish/form/to/center/${edi_publication.id}/${edi_publication.centerId}`)

        if (response.status === 200) {

           
            successMessage("Form was edited and published to your center´s members")

            return 200

        } else {

            errorMessage("Error when trying edit publication form to your center´s members")

            return 0

        }

    } catch (error) {

        console.error("Error", error)

        errorMessage("Error when trying to publish form")

        return []
    }
}

export default removePublishToCenter