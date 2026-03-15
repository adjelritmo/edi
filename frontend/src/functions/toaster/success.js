import { addToast } from "@heroui/react"

const successMessage = (message) => {

    addToast({ title: "Sucesso", description: message, color: 'success' })

}

export default successMessage