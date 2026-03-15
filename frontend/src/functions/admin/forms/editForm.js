import admin_api from "../../../server/admin"
import errorMessage from "../../toaster/error"
import successMessage from "../../toaster/success"

const editForm = async (updatedForm, forms, setForms, setIsLoading) => {

    setIsLoading(true)

    try {


        const filteredSections = updatedForm.dimensions.filter(s => s.questions && s.questions.length > 0)

          const edi_data_edit = {

            id: updatedForm.id,

            title: updatedForm.title,

            creator: updatedForm.creator,

            description: updatedForm.description,

            status: updatedForm.status,

            dimensions: filteredSections.map((dimension, dimensionIndex) => ({
                
                id: dimension.id || undefined,

                title: dimension.title,
                
                description: dimension.description,
                
                emotion: dimension.emotion,
                
                order_in_form: dimension.order_in_form || dimensionIndex,
                
                questions: dimension.questions.map((question, questionIndex) => ({
                
                    id: question.id || undefined,
                
                    text: question.text,
                
                    description: question.description || null,
                
                    type: question.type,
                
                    isRequired: question.isRequired,
                
                    helpText: question.helpText || null,
                
                    order_in_dimension: question.order_in_dimension || questionIndex,
                 
                    order_in_form: (dimensionIndex * 100) + (questionIndex + 1),
                
                    options: question.options ? question.options : null,
                
                    formId: updatedForm.id

                }))
            }))
        }

        const res = await admin_api.put(`/edit/form`, { edi_data_edit })

        if (res.status === 200) {
            
            setForms(forms.map(f => (f.id === updatedForm.id ? updatedForm : f)))
            
            successMessage("Form updated successfully!")
           
            return 200
       
        }
    
    } catch (err) {
       
        console.error("Error updating form:", err)
       
        errorMessage(err.response?.data?.message || "Failed to update form. Please try again.")
        
        return 0
   
    } finally {
       
        setIsLoading(false)
   
    }

}

export default editForm