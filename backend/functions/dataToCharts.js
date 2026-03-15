/*
const getChartData = (user_submissions, center_submissions, global_submissions) => {

    try {
        // Função para extrair ano de uma data (assumindo que as submissões têm um campo date)
        const getYear = (submission) => {
            // Adapte esta lógica conforme o formato da data nas suas submissões
            if (submission.submittedAt) {
                return new Date(submission.submittedAt).getFullYear();
            }
            return null;
        };

        // Função para agrupar submissões por ano
        const groupByYear = (submissions) => {
            if (!submissions || submissions.length === 0) {
                return {};
            }

            return submissions.reduce((acc, submission) => {
                const year = getYear(submission);
                if (!year) return acc;

                if (!acc[year]) {
                    acc[year] = [];
                }
                acc[year].push(submission);
                return acc;
            }, {});
        };

        // Função para calcular médias de um array de submissões
        const aggregateSubmissions = (submissions) => {
            if (!submissions || submissions.length === 0) {
                return {
                    leadership: 0,
                    innovation: 0,
                    collaboration: 0,
                    engagement: 0,
                    skills: 0,
                    motivation: 0,
                    others: 0
                };
            }

            const sums = submissions.reduce((acc, submission) => {
                return {
                    leadership: acc.leadership + (submission.leadership || 0),
                    innovation: acc.innovation + (submission.innovation || 0),
                    collaboration: acc.collaboration + (submission.collaboration || 0),
                    engagement: acc.engagement + (submission.engagement || 0),
                    skills: acc.skills + (submission.skills || 0),
                    motivation: acc.motivation + (submission.motivation || 0),
                    others: acc.others + (submission.others || 0)
                };
            }, {
                leadership: 0,
                innovation: 0,
                collaboration: 0,
                engagement: 0,
                skills: 0,
                motivation: 0,
                others: 0
            });

            const count = submissions.length;
            return {
                leadership: sums.leadership / count,
                innovation: sums.innovation / count,
                collaboration: sums.collaboration / count,
                engagement: sums.engagement / count,
                skills: sums.skills / count,
                motivation: sums.motivation / count,
                others: sums.others / count
            };
        };

        // Função para calcular a média das submissões do usuário por ano
        const aggregateUserSubmissions = (submissions) => {
            if (!submissions || submissions.length === 0) {
                return {
                    leadership: 0,
                    innovation: 0,
                    collaboration: 0,
                    engagement: 0,
                    skills: 0,
                    motivation: 0,
                    others: 0
                };
            }

            const sums = submissions.reduce((acc, submission) => {
                return {
                    leadership: acc.leadership + (submission.leadership || 0),
                    innovation: acc.innovation + (submission.innovation || 0),
                    collaboration: acc.collaboration + (submission.collaboration || 0),
                    engagement: acc.engagement + (submission.engagement || 0),
                    skills: acc.skills + (submission.skills || 0),
                    motivation: acc.motivation + (submission.motivation || 0),
                    others: acc.others + (submission.others || 0)
                };
            }, {
                leadership: 0,
                innovation: 0,
                collaboration: 0,
                engagement: 0,
                skills: 0,
                motivation: 0,
                others: 0
            });

            const count = submissions.length;
            return {
                leadership: sums.leadership / count,
                innovation: sums.innovation / count,
                collaboration: sums.collaboration / count,
                engagement: sums.engagement / count,
                skills: sums.skills / count,
                motivation: sums.motivation / count,
                others: sums.others / count
            };
        };

        // Função para determinar o status baseado na comparação apenas com o centro
        const getStatus = (userValue, centerValue) => {
            if (userValue > centerValue) {
                return 'above_center';
            } else if (userValue < centerValue) {
                return 'below_center';
            } else {
                return 'equal_to_center';
            }
        };

        // Agrupar todas as submissões por ano
        const userByYear = groupByYear(user_submissions);
        const centerByYear = groupByYear(center_submissions);
        const globalByYear = groupByYear(global_submissions);

        // Obter todos os anos únicos presentes nas submissões
        const allYears = new Set([
            ...Object.keys(userByYear),
            ...Object.keys(centerByYear),
            ...Object.keys(globalByYear)
        ]);

        // Lista de dimensões
        const dimensions = [
            'leadership',
            'innovation',
            'collaboration',
            'engagement',
            'skills',
            'motivation',
            'others'
        ];

        // Para cada ano, processar os dados
        const result = {};

        allYears.forEach(year => {
            // Agregar dados do usuário para o ano específico
            const userAggregated = aggregateUserSubmissions(userByYear[year] || []);
            
            // Agregar dados do centro para o ano específico
            const centerAggregated = aggregateSubmissions(centerByYear[year] || []);
            
            // Agregar dados globais para o ano específico
            const globalAggregated = aggregateSubmissions(globalByYear[year] || []);

            // Criar array com os dados formatados para este ano
            const yearData = dimensions.map(dimension => {
                const userValue = userAggregated[dimension];
                const centerValue = centerAggregated[dimension];
                const globalValue = globalAggregated[dimension];
                
                return {
                    dimension: dimension,
                    user: parseFloat(userValue).toFixed(2),
                    center: parseFloat(centerValue).toFixed(2),
                    global: parseFloat(globalValue).toFixed(2),
                    status: getStatus(userValue, centerValue)
                };
            });

            result[year] = yearData;
        });

        return result;

    } catch (error) {
        console.error('Erro ao agregar submissões:', error);
        return {};
    }
};

module.exports = getChartData;
*/

const getChartData = (user_submissions, center_submissions, global_submissions) => {

    try {
        // Função para extrair ano de uma data
        const getYear = (submission) => {
            if (submission.submittedAt) {
                return new Date(submission.submittedAt).getFullYear();
            }
            return null;
        };

        // Função para agrupar submissões por ano
        const groupByYear = (submissions) => {
            if (!submissions || submissions.length === 0) {
                return {};
            }

            return submissions.reduce((acc, submission) => {
                const year = getYear(submission);
                if (!year) return acc;

                if (!acc[year]) {
                    acc[year] = [];
                }
                acc[year].push(submission);
                return acc;
            }, {});
        };

        // Função para extrair todas as dimensões únicas de um array de submissões
        const getAllDimensions = (submissions) => {
            const dimensionsSet = new Set();
            
            submissions.forEach(sub => {
                if (sub.dimensionsValues && typeof sub.dimensionsValues === 'object') {
                    Object.keys(sub.dimensionsValues).forEach(key => dimensionsSet.add(key));
                }
            });
            
            return Array.from(dimensionsSet);
        };

        // Função para extrair valor de uma dimensão
        const getDimensionValue = (submission, dimensionKey) => {
            if (!submission) return 0;

            if (submission.dimensionsValues && submission.dimensionsValues[dimensionKey] !== undefined) {
                return parseFloat(submission.dimensionsValues[dimensionKey]) || 0;
            }

            return 0;
        };

        // Função para calcular médias de um array de submissões (dinâmico)
        const aggregateSubmissions = (submissions, dimensions) => {
            if (!submissions || submissions.length === 0 || dimensions.length === 0) {
                return dimensions.reduce((acc, key) => {
                    acc[key] = 0;
                    return acc;
                }, {});
            }

            const sums = submissions.reduce((acc, submission) => {
                dimensions.forEach(key => {
                    acc[key] += getDimensionValue(submission, key);
                });
                return acc;
            }, dimensions.reduce((acc, key) => {
                acc[key] = 0;
                return acc;
            }, {}));

            const count = submissions.length;
            return dimensions.reduce((acc, key) => {
                acc[key] = sums[key] / count;
                return acc;
            }, {});
        };

        // Função para determinar o status baseado na comparação com o centro
        const getStatus = (userValue, centerValue) => {
            if (userValue > centerValue) {
                return 'above_center';
            } else if (userValue < centerValue) {
                return 'below_center';
            } else {
                return 'equal_to_center';
            }
        };

        // Coletar todas as dimensões disponíveis em todas as submissões
        const allSubmissions = [
            ...(user_submissions || []),
            ...(center_submissions || []),
            ...(global_submissions || [])
        ];
        
        const dimensions = getAllDimensions(allSubmissions);

        // Se não houver dimensões, retornar objeto vazio
        if (dimensions.length === 0) {
            return {};
        }

        // Agrupar todas as submissões por ano
        const userByYear = groupByYear(user_submissions);
        const centerByYear = groupByYear(center_submissions);
        const globalByYear = groupByYear(global_submissions);

        // Obter todos os anos únicos presentes nas submissões
        const allYears = new Set([
            ...Object.keys(userByYear),
            ...Object.keys(centerByYear),
            ...Object.keys(globalByYear)
        ]);

        // Para cada ano, processar os dados
        const result = {};

        allYears.forEach(year => {
            // Agregar dados do usuário para o ano específico
            const userAggregated = aggregateSubmissions(userByYear[year] || [], dimensions);
            
            // Agregar dados do centro para o ano específico
            const centerAggregated = aggregateSubmissions(centerByYear[year] || [], dimensions);
            
            // Agregar dados globais para o ano específico
            const globalAggregated = aggregateSubmissions(globalByYear[year] || [], dimensions);

            // Criar array com os dados formatados para este ano
            const yearData = dimensions.map(dimension => {
                const userValue = userAggregated[dimension];
                const centerValue = centerAggregated[dimension];
                const globalValue = globalAggregated[dimension];
                
                return {
                    dimension: dimension,
                    user: parseFloat(userValue).toFixed(2),
                    center: parseFloat(centerValue).toFixed(2),
                    global: parseFloat(globalValue).toFixed(2),
                    status: getStatus(userValue, centerValue)
                };
            });

            result[year] = yearData;
        });

        return result;

    } catch (error) {
        console.error('Erro ao agregar submissões:', error);
        return {};
    }
};

module.exports = getChartData;