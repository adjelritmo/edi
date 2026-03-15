import React, { useState, useEffect } from 'react'

import { Card, CardBody, Button, Chip, Divider, Modal, ModalContent, useDisclosure, Input, Textarea, Select, SelectItem, Checkbox, RadioGroup, Radio, Accordion, AccordionItem } from "@heroui/react"

import { ArrowLeft, Eye, Download, Share2, BarChart3, Calendar, User, FileText, CheckCircle, Clock, Users, TrendingUp, MessageCircle, CheckSquare, List, Type, Star, FolderOpen } from "lucide-react"

import { useParams, useNavigate, useLocation } from 'react-router-dom'

import getForm from "../../../functions/admin/forms/getForm"

const FormView = () => {

    const { formId } = useParams()

    const location = useLocation()

    const navigate = useNavigate()

    const [form, setForm] = useState(location?.state?.form || null)

    const [loading, setLoading] = useState(true)

    const [responses, setResponses] = useState([])

    const [selectedResponse, setSelectedResponse] = useState(null)

    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    useEffect(() => {

        if (formId && !form) {

            loadForm()

            loadResponses()

        } else {

            setLoading(false)

        }

    }, [formId, form])

    const loadForm = async () => {

        try {

            await getForm(formId, setForm, setLoading)

        } catch (error) {

            console.error('Error loading form:', error)

        } finally {

            setLoading(false)

        }
    }

    const loadResponses = async () => {

    }

    const statusColorMap = {
        active: "success",
        paused: "warning",
        draft: "default",
        archived: "danger"
    }

    const statusIconMap = {
        active: CheckCircle,
        paused: Clock,
        draft: FileText,
        archived: FileText
    }

    const questionTypeIcons = {
        text: Type,
        textarea: MessageCircle,
        radio: CheckCircle,
        checkbox: CheckSquare,
        dropdown: List,
        date: Calendar,
        rating: Star
    }

    const getTotalQuestions = () => {
        if (!form?.dimensions) return 0
        return form.dimensions.reduce((total, dimension) => {
            const questionsCount = dimension.questions?.length || 0
            return total + questionsCount
        }, 0)
    }

    const getDimensionsWithQuestions = () => {
        if (!form?.dimensions) return []
        return form.dimensions.filter(dimension =>
            dimension.questions && dimension.questions.length > 0
        )
    }

    const getTotalResponses = () => {
        return form?.submissions?.length || 0
    }

    const getCompletionRate = () => {
        const totalQuestions = getTotalQuestions()
        const completedResponses = responses.filter(r => r.status === 'completed').length
        return totalQuestions > 0 ? (completedResponses / responses.length) * 100 : 0
    }

    const exportResponses = () => {
        // Simular exportação
        console.log('Exporting responses...')
    }

    const shareForm = () => {
        const formUrl = `${window.location.origin}/forms/${formId}/fill`
        navigator.clipboard.writeText(formUrl)
        alert('Link do formulário copiado para a área de transferência!')
    }

    const viewResponse = (response) => {
        setSelectedResponse(response)
        onOpen()
    }

    /* ---------- helper para parsear options ---------- */
    const parseOptions = (raw) => {
        if (!raw) return [];

        let temp = raw;

        // Des-escapa até virar array ou falhar
        while (typeof temp === 'string') {
            try {
                const parsed = JSON.parse(temp);
                if (parsed === temp) break; // evita loop infinito
                temp = parsed;
            } catch {
                break;
            }
            if (Array.isArray(temp)) break;
        }

        return Array.isArray(temp) ? temp.filter(Boolean) : [];
    };

    const getQuestionOptions = (question) => {
        if (!question.options) return []

        try {
            // Se já é array, retorna diretamente
            if (Array.isArray(question.options)) {
                return question.options.filter(opt => opt !== null && opt !== undefined)
            }

            // Se é string, usa a função parseOptions
            if (typeof question.options === 'string') {
                return parseOptions(question.options)
            }

            return [];
        } catch (error) {
            console.error('Error parsing question options:', error)
            console.log('Raw options:', question.options)
            return []
        }
    }

    const getQuestionSettings = (question) => {
        if (!question.settings) return {
            min: question.min || 1,
            max: question.max || 5,
            minLabel: question.minLabel || 'Poor',
            maxLabel: question.maxLabel || 'Excellent',
            allowOther: question.allowOther || false
        }

        try {
            // Se settings for uma string JSON, faz parse
            if (typeof question.settings === 'string') {
                return JSON.parse(question.settings) || {}
            }
            // Se já for um objeto, retorna diretamente
            if (typeof question.settings === 'object') {
                return question.settings
            }
            // Se for outro tipo, retorna objeto vazio
            return {}
        } catch (error) {
            console.error('Error parsing question settings:', error)
            console.log('Raw settings:', question.settings)
            return {}
        }
    }

    const renderQuestionPreview = (question) => {
        const QuestionIcon = questionTypeIcons[question.type] || FileText
        const options = getQuestionOptions(question)
        const settings = getQuestionSettings(question)

        console.log(`Question ${question.text}:`, {
            type: question.type,
            options: options,
            settings: settings
        })

        switch (question.type) {
            case 'text':
                return (
                    <Input
                        placeholder={question.helpText || question.placeholder || "Resposta de texto..."}
                        variant="bordered"
                        isDisabled
                    />
                )
            case 'textarea':
                return (
                    <Textarea
                        placeholder={question.helpText || question.placeholder || "Resposta longa..."}
                        variant="bordered"
                        isDisabled
                        minRows={3}
                    />
                )
            case 'dropdown':
                return (
                    <Select
                        placeholder="Selecione uma opção"
                        variant="bordered"
                        isDisabled
                    >
                        {options.map((option, index) => (
                            <SelectItem key={index} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </Select>
                )
            case 'radio':
                return (
                    <div className="space-y-3">
                        <RadioGroup isDisabled className="flex flex-col gap-3">
                            {options.map((option, index) => (
                                <Radio key={index} value={option} className="items-start">
                                    <div className="flex flex-col">
                                        <span className="text-gray-900">{option}</span>
                                    </div>
                                </Radio>
                            ))}
                        </RadioGroup>
                        {settings.allowOther && (
                            <div className="flex items-center gap-2 mt-2 p-2 border border-dashed border-gray-300 rounded-lg">
                                <Radio value="other" isDisabled />
                                <span className="text-gray-700 mr-2">Outro:</span>
                                <Input placeholder="Especifique" variant="bordered" size="sm" isDisabled />
                            </div>
                        )}
                    </div>
                )
            case 'checkbox':
                return (
                    <div className="space-y-3">
                        {options.map((option, index) => (
                            <Checkbox key={index} isDisabled className="items-start">
                                <div className="flex flex-col">
                                    <span className="text-gray-900">{option}</span>
                                </div>
                            </Checkbox>
                        ))}
                        {settings.allowOther && (
                            <div className="flex items-center gap-2 mt-2 p-2 border border-dashed border-gray-300 rounded-lg">
                                <Checkbox isDisabled />
                                <span className="text-gray-700 mr-2">Outro:</span>
                                <Input placeholder="Especifique" variant="bordered" size="sm" isDisabled />
                            </div>
                        )}
                    </div>
                )
            case 'date':
                return (
                    <Input type="date" variant="bordered" isDisabled />
                )
            case 'rating':
                const { min = 1, max = 5, minLabel = "Mínimo", maxLabel = "Máximo" } = settings
                return (
                    <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 p-6 rounded-xl border border-cyan-200">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-cyan-700">{minLabel}</span>
                            <div className="flex gap-2">
                                {Array.from({ length: max - min + 1 }, (_, i) => {
                                    const value = i + min
                                    return (
                                        <Button
                                            key={i}
                                            variant="flat"
                                            color="primary"
                                            size="lg"
                                            className="min-w-12 h-12 font-bold"
                                            isDisabled
                                        >
                                            {value}
                                        </Button>
                                    )
                                })}
                            </div>
                            <span className="text-sm font-semibold text-cyan-700">{maxLabel}</span>
                        </div>
                    </div>
                )
            default:
                return (
                    <div className="text-gray-500 italic">
                        Tipo de pergunta não suportado: {question.type}
                    </div>
                )
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg font-medium">Carregando formulário...</p>
                    <p className="text-gray-500 text-sm mt-2">Isso pode levar alguns segundos</p>
                </div>
            </div>
        )
    }

    if (!form) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="p-4 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                        <FileText className="h-10 w-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Formulário não encontrado</h2>
                    <p className="text-gray-600 mb-6">O formulário que você está procurando não existe ou foi removido.</p>
                    <Button color="primary" onPress={() => navigate(-1)} className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold">
                        Voltar para Formulários
                    </Button>
                </div>
            </div>
        )
    }

    const StatusIcon = statusIconMap[form.status]

    const dimensionsWithQuestions = getDimensionsWithQuestions()

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="">
                <div className="bg-gradient-to-br from-cyan-500/5 via-emerald-500/5 to-transparent lg:pt-20 pb-26 mb-8">
                    <div className='w-full max-w-5xl mx-auto'>
                        <Accordion>
                            <AccordionItem
                                startContent={
                                    <div className="flex items-center gap-2">
                                        <Button isIconOnly variant="light" onPress={() => navigate(-1)} className="bg-white shadow border border-gray-200 hover:shadow transition-all duration-200">
                                            <ArrowLeft className="h-5 w-5" />
                                        </Button>
                                        <div className="flex items-center gap-2">
                                            <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl shadow">
                                                <FileText className="h-8 w-8 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                }
                                classNames={{
                                    title: 'text-5xl md:text-6xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent',
                                    content: 'text-gray-600 text-lg text-justify'
                                }}
                                key="1"
                                aria-label="Accordion 1"
                                subtitle="Press to expand form description"
                                title={form.title}
                            >
                                {form.description}
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>

                {
                    /**
                     *  <div className="flex justify-end mt-4 mb-4 flex-wrap gap-3">
                        <Button
                            variant="flat"
                            size='lg'
                            startContent={<Share2 className="h-4 w-4" />}
                            onPress={shareForm}
                            className="bg-white border border-gray-200 shadow hover:shadow transition-all duration-200 font-semibold"
                        >
                            Compartilhar
                        </Button>
                        <Button
                            variant="flat"
                            size='lg'
                            startContent={<Download className="h-4 w-4" />}
                            onPress={exportResponses}
                            className="bg-white border border-gray-200 shadow hover:shadow transition-all duration-200 font-semibold"
                        >
                            Exportar
                        </Button>
                        <Button
                            color="primary"
                            size='lg'
                            startContent={<BarChart3 className="h-4 w-4" />}
                            onPress={() => navigate(`/admin/forms/${formId}/analytics`)}
                            className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold shadow hover:shadow transition-all duration-200"
                        >
                            Análises
                        </Button>
                    </div>
    
                     */
                }
                {/* Stats Cards */}
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-8 -mt-20">
                    <Card className="shadow bg-gradient-to-br from-white to-blue-50/50 border border-blue-200 shadow rounded-2xl hover:shadow transition-all duration-300">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">{getTotalResponses()}</p>
                                    <p className="text-sm text-gray-600 font-medium">Total de Respostas</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="shadow bg-gradient-to-br from-white to-cyan-50/50 border border-cyan-200 shadow rounded-2xl hover:shadow transition-all duration-300">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {getTotalQuestions()}
                                    </p>
                                    <p className="text-sm text-gray-600 font-medium">Perguntas</p>
                                </div>
                                <div className="p-3 bg-cyan-100 rounded-xl">
                                    <FileText className="h-6 w-6 text-cyan-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>


                    <Card className="shadow bg-gradient-to-br from-white to-purple-50/50 border border-purple-200 shadow rounded-2xl hover:shadow transition-all duration-300">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Chip
                                        variant="flat"
                                        color={statusColorMap[form.status]}
                                        startContent={StatusIcon && <StatusIcon className="h-4 w-4" />}
                                        className="text-lg font-semibold px-3 py-2"
                                    >
                                        {form.status === 'active' ? 'Ativo' :
                                            form.status === 'paused' ? 'Pausado' :
                                                form.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                                    </Chip>
                                    <p className="text-sm text-gray-600 font-medium mt-2">Status</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <Calendar className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-2">
                    {/* Preview do Formulário */}
                    <div className="lg:col-span-2">
                        <Card className="bg-white border-0 shadow rounded-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 p-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Eye className="h-6 w-6" />
                                    Prévia do Formulário
                                </h2>
                                <p className="text-white/90 mt-2">Visualize como os respondentes veem seu formulário</p>
                            </div>
                            <CardBody className="p-8">
                                <div className="space-y-8">
                                    {dimensionsWithQuestions.length > 0 ? (
                                        dimensionsWithQuestions.map((dimension, dimensionIndex) => (
                                            <div key={dimension.id || dimensionIndex} className="space-y-6">
                                                {/* Cabeçalho da Dimensão */}
                                                <Card className="bg-gradient-to-r from-cyan-50 to-emerald-50 border-cyan-200 shadow">
                                                    <CardBody className="p-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-cyan-100 rounded-lg">
                                                                <FolderOpen className="h-5 w-5 text-cyan-600" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl font-bold text-cyan-900">
                                                                    {dimension.title}
                                                                </h3>
                                                                {dimension.description && (
                                                                    <p className="text-cyan-700 mt-1">
                                                                        {dimension.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardBody>
                                                </Card>

                                                {/* Perguntas da Dimensão */}
                                                <div className="space-y-6">
                                                    {dimension.questions?.map((question, questionIndex) => {

                                                        const QuestionIcon = questionTypeIcons[question.type] || FileText

                                                        const options = getQuestionOptions(question)

                                                        return (
                                                            <div key={question.id || questionIndex} className="border border-gray-200 rounded-xl p-6 transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <div className="flex items-start gap-3 flex-1">
                                                                        <div className="p-2 bg-cyan-100 rounded-lg mt-1">
                                                                            <QuestionIcon className="h-4 w-4 text-cyan-600" />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                                                {dimensionIndex + 1}.{questionIndex + 1}. {question.text || question.question}
                                                                            </h3>
                                                                            {question.description && (
                                                                                <p className="text-gray-500 mt-2 leading-relaxed">
                                                                                    {question.description}
                                                                                </p>
                                                                            )}
                                                                            {question.helpText && (
                                                                                <p className="text-sm text-cyan-600 mt-1 italic">
                                                                                    {question.helpText}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        {(question.isRequired || question.required) && (
                                                                            <Chip size="sm" color="danger" variant="flat">
                                                                                Obrigatório
                                                                            </Chip>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {renderQuestionPreview(question)}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="p-4 bg-gray-100 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                                                <FileText className="h-10 w-10 text-gray-400" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                Nenhuma pergunta encontrada
                                            </h3>
                                            <p className="text-gray-600">
                                                Este formulário não possui perguntas cadastradas.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {dimensionsWithQuestions.length > 0 && (
                                    <>
                                        <Divider className="my-8" />

                                        <div className="text-center">
                                            <Button
                                                color="primary"
                                                onPress={() => navigate(`/edi/user/forms-responses`, { state: { form: form } })}
                                                className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold text-lg px-8 py-6 shadow hover:shadow transition-all duration-300"
                                                size="lg"
                                            >
                                                Preencher Formulário
                                            </Button>
                                            <p className="text-gray-500 text-sm mt-3">
                                                Abre em uma nova janela para preenchimento
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardBody>
                        </Card>
                    </div>

                    {/* Lista de Respostas */}
                    <div className="lg:col-span-1">
                        <Card className="bg-white border-0 shadow rounded-2xl overflow-hidden sticky top-6">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Users className="h-6 w-6" />
                                    Respostas ({form?.submissions?.length || 0})
                                </h2>
                                <p className="text-white/90 mt-2">Últimas 5 respostas recebidas</p>
                            </div>
                            <CardBody className="p-6">
                                <div className="space-y-1">
                                    {form?.submissions?.slice(0, 5).reverse().map((response, index) => (
                                        <div
                                            key={response.id}
                                            className="border border-gray-200 rounded-xl p-4 hover:border-cyan-300 hover:shadow transition-all duration-300 bg-white group"
                                            onClick={() => viewResponse(response)}
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 group-hover:text-cyan-700 transition-colors">
                                                        {`${response?.user?.firstName} ${response?.user?.surname}`}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {response?.user?.email}
                                                    </p>
                                                </div>
                                                <div className="p-2 text-white font-bold bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full">
                                                    {response?.point}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">{new Date(response?.submittedAt).toLocaleDateString('pt-PT')}</span>
                                            </div>
                                        </div>
                                    ))}

                                    {
                                        /**
                                         *  {form?.submissions?.length || 0 === 0 && (
                                            <div className="text-center py-8">
                                                <div className="p-4 bg-gray-100 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                                    <FileText className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <p className="text-gray-600 font-medium">Nenhuma resposta ainda</p>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    Compartilhe o formulário para coletar respostas
                                                </p>
                                                <Button
                                                    variant="flat"
                                                    onPress={shareForm}
                                                    className="mt-4 font-semibold"
                                                >
                                                    Compartilhar Agora
                                                </Button>
                                            </div>
                                        )}
                                         */
                                    }
                                </div>

                                {form?.submissions?.length || 0 > 0 && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <Button
                                            variant="light"
                                            className="w-full font-semibold"
                                            onPress={() => navigate(`responses`, { state: { form: form } })}
                                        >
                                            Ver Todas as Respostas
                                        </Button>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FormView