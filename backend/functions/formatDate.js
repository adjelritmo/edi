const formatDate = (date) => {
   
    if (!date) 
        return 'N/A'
    
    return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

module.exports = formatDate