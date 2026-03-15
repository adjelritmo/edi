import admin_api from "../../../server/admin"
import errorMessage from "../../toaster/error"
import successMessage from "../../toaster/success"


const editCenter = async (dataToEdit, centers, setCenters) => {

    console.log(dataToEdit, centers)

    if (!dataToEdit?.id || !centers) {
        errorMessage("Invalid input parameters")
        return 0
    }

    try {
        const response = await admin_api.put(`/edit/a/center/${dataToEdit.id}`, {
            name: dataToEdit.name,
            code: dataToEdit.code,
            address: dataToEdit.address,
            email: dataToEdit.email,
            country: dataToEdit.country,
            city: dataToEdit.city,
            research_area: dataToEdit.research_area,
        })

        if (response.status === 200) {
            // Update the existing center in the state
            setCenters(centers.map((center) => center.id === dataToEdit.id ? { ...center, ...dataToEdit } : center))
            successMessage("Center was updated successfully")
            return 200
        }

        errorMessage("Unexpected response from server")
        return 0
    } catch (error) {
        errorMessage(`Failed to update center: ${error.message}`)
        console.error("Edit center error:", error)
        return 0
    }
}

export default editCenter