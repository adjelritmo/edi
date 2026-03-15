import { addToast } from "@heroui/react"

const errorMessage = (message) => {

    addToast({ title: "Error", description: message, color: 'danger' })

}

export default errorMessage