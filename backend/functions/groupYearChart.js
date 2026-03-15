function contarSubmissoesPorMes(submissoes) {

    const resultado = {}

    submissoes.forEach(submissao => {

        const data = new Date(submissao.submittedAt)

        const ano = data.getFullYear()

        const mes = data.getMonth()

        if (!resultado[ano]) {

            resultado[ano] = {}

        }


        resultado[ano][mes] = (resultado[ano][mes] || 0) + 1

    })

    return resultado

}

module.exports = contarSubmissoesPorMes