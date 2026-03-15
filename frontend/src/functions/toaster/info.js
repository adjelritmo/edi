import { addToast } from "@heroui/react"

const warningMessage = (message) => {

    addToast({ title: "Aviso", description: message, color: 'warning' })
    
}

export default warningMessage
