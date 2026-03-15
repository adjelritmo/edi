import admin_api from "../../../server/admin"
import errorMessage from "../../toaster/error"
import successMessage from "../../toaster/success"

const addCenter = async (newcenter, centers, setCenters) => {

    try {

        const center = await admin_api.post('/add/new/center', { newcenter })

        if (center.status === 200) {
            setCenters([...centers, {...newcenter, id: center.data}])
            successMessage('center was added')

            return 200
        }

    } catch (error) {

        errorMessage('An error occured when trying add a new center')

         return 0
    }
}

export default addCenter