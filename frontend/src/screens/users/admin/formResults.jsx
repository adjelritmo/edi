import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Card,
    CardBody,
    Button,
    Spinner,
    Chip,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Accordion,
    AccordionItem,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Image
} from "@heroui/react";
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Trophy,
    Star,
    Users,
    Building2,
    Award,
    CheckCircle2,
    BarChart3,
    Calendar,
    FileText,
    Medal,
    Download,
    FileSpreadsheet,
    FileJson,
    ChevronDown,
    AlertTriangle,
    AlertCircle,
    TrendingDown,
    MapPin,
    Target,
    ThumbsUp,
    Info,
    TrendingDown as TrendingDownIcon,
    LayoutGrid,
    Activity,
    X,
    FileDown
} from 'lucide-react'
import getFormResults from "../../../functions/admin/forms/getFormResults";
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const FormResultPage = () => {

    const navigate = useNavigate()

    const location = useLocation();

    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [reportData, setReportData] = useState(null);
    
    // Estados para o modal de pré-visualização do PDF
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

    const reportRef = useRef(null);
    const previewReportRef = useRef(null);

    // Get form from state
    const form = location?.state?.form || null;

    // Buscar dados da API
    useEffect(() => {
        const fetchData = async () => {
            if (!form?.id) {
                setIsLoading(false);
                return;
            }

            const response = await getFormResults(form.id, setIsLoading);

            // Verificar se temos dados na estrutura correta
            if (response?.success && response.data?.table) {
                const processedData = processApiData(response.data.table);
                setReportData(processedData);
            }
        };

        fetchData();
    }, [form?.id]);

    // Processar dados da API
    const processApiData = (apiData) => {
        const centers = apiData.centers || [];
        const dimensions = apiData.availableDimensions || [];
        const statistics = apiData.statistics || {};
        const bestCenter = apiData.bestCenter || null;

        // Get icon and color for each dimension dynamically
        const getDimensionConfig = (dim, index) => {
            const icons = [Building2, Users, Award, Activity, Star, Target, BarChart3, CheckCircle2];
            const colors = ['blue', 'green', 'purple', 'amber', 'pink', 'cyan', 'orange', 'red'];

            return {
                key: dim,
                label: dim.charAt(0).toUpperCase() + dim.slice(1),
                icon: icons[index % icons.length],
                color: colors[index % colors.length]
            };
        };

        const dimensionConfigs = dimensions.map((dim, idx) => getDimensionConfig(dim, idx));

        // Build dynamic columns
        const dynamicColumns = [
            { name: "RANK", uid: "posicao", align: "start" },
            { name: "CENTER", uid: "nome", align: "start" },
            { name: "REGION", uid: "regiao", align: "start" },
            ...dimensionConfigs.map(dim => ({
                name: dim.label.toUpperCase().slice(0, 4),
                uid: dim.key,
                align: "center",
                fullLabel: dim.label
            })),
            { name: "TOTAL", uid: "total", align: "center" },
        ];

        return {
            title: form.title || "Evaluation Report",
            description: apiData.description || "",
            generatedAt: form.createdAt || new Date().toISOString(),
            statistics,
            bestCenter,
            centers,
            dimensions: dimensionConfigs,
            columns: dynamicColumns,
            availableDimensions: dimensions,
            insights: apiData.insights || [],
            rawData: apiData
        };
    };

    // Get rankings for each dimension dynamically
    const getDimensionRankings = useMemo(() => {
        if (!reportData) return [];

        return reportData.dimensions.map(dim => {
            const sorted = [...reportData.centers].sort((a, b) => (b[dim.key] || 0) - (a[dim.key] || 0));
            const leader = sorted[0];
            const second = sorted[1];
            const third = sorted[2];
            const average = sorted.length > 0
                ? (sorted.reduce((sum, c) => sum + (c[dim.key] || 0), 0) / sorted.length).toFixed(1)
                : 0;

            return {
                ...dim,
                leader,
                second,
                third,
                average,
                allCenters: sorted
            };
        });
    }, [reportData]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMedalIcon = (posicao) => {
        switch (posicao) {
            case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 2: return <Medal className="h-5 w-5 text-gray-400" />;
            case 3: return <Medal className="h-5 w-5 text-amber-700" />;
            default: return null;
        }
    };

    const getStatusColor = (posicao) => {
        switch (posicao) {
            case 1: return "warning";
            case 2: return "default";
            case 3: return "primary";
            default: return "default";
        }
    };

    // Export functions
    const exportToCSV = () => {
        setIsExporting(true);
        try {
            const headers = ['Rank', 'Center', 'Region', ...reportData.dimensions.map(d => d.label), 'Total', 'Attention Required'];

            const csvData = reportData.centers.map(centro => [
                centro.posicao,
                centro.nome,
                centro.regiao,
                ...reportData.dimensions.map(dim => centro[dim.key] || 0),
                centro.total,
                centro.alertaEspecial ? 'YES' : 'NO'
            ]);

            const csvContent = [
                headers.join(','),
                ...csvData.map(row => row.join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `centers_report_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting CSV:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const exportToJSON = () => {
        setIsExporting(true);
        try {
            const jsonData = JSON.stringify(reportData.rawData || reportData, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `centers_report_${new Date().toISOString().split('T')[0]}.json`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting JSON:', error);
        } finally {
            setIsExporting(false);
        }
    };

    // Gerar pré-visualização do PDF usando html-to-image
    const generatePreview = async () => {
        if (!reportRef.current) {
            alert('Error: Report content not found');
            return;
        }

        setIsGeneratingPreview(true);
        
        try {
            const dataUrl = await toPng(reportRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                quality: 0.95
            });
            
            setPreviewImage(dataUrl);
            setIsPreviewModalOpen(true);
        } catch (error) {
            console.error('Error generating preview:', error);
            alert('Error generating preview. Please try again.');
        } finally {
            setIsGeneratingPreview(false);
        }
    };

    // Exportar para PDF a partir da pré-visualização
    const confirmExportPDF = async () => {
        if (!previewImage) return;
        
        setIsExporting(true);
        
        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Criar imagem temporária para obter dimensões
            const img = new Image();
            img.src = previewImage;
            
            await new Promise((resolve) => {
                img.onload = resolve;
            });

            const imgWidth = img.width;
            const imgHeight = img.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

            const width = imgWidth * ratio;
            const height = imgHeight * ratio;

            // Adicionar primeira página
            pdf.addImage(previewImage, 'PNG', 0, 0, width, height);

            // Se o conteúdo for maior que uma página, adicionar mais páginas
            let heightLeft = height - pdfHeight;
            let page = 1;

            while (heightLeft > 0) {
                pdf.addPage();
                pdf.addImage(previewImage, 'PNG', 0, -pdfHeight * page, width, height);
                heightLeft -= pdfHeight;
                page++;
            }

            // Nome do ficheiro
            const fileName = form?.title
                ? `report_${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`
                : 'report_centers';

            pdf.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
            
            // Fechar modal após exportação
            setIsPreviewModalOpen(false);
            setPreviewImage(null);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    // Fechar modal e limpar estado
    const closePreviewModal = () => {
        setIsPreviewModalOpen(false);
        setPreviewImage(null);
    };

    // Dynamic table cell renderer
    const renderCell = useCallback((centro, columnKey) => {
        const cellValue = centro[columnKey];

        switch (columnKey) {
            case "posicao":
                return (
                    <div className="flex items-center gap-2">
                        {getMedalIcon(centro.posicao)}
                        <Chip size="sm" variant="flat" color={getStatusColor(centro.posicao)}>
                            #{centro.posicao}
                        </Chip>
                        {centro.alertaEspecial && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                    </div>
                );
            case "nome":
                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <p className={`text-sm ${centro.posicao === 1 ? 'font-bold text-cyan-600' : ''}`}>
                                {centro.nome}
                            </p>
                            {centro.critico && (
                                <Chip size="sm" color="danger" variant="flat">CRITICAL</Chip>
                            )}
                            {centro.alertaEspecial && !centro.critico && (
                                <Chip size="sm" color="warning" variant="flat">ATTENTION</Chip>
                            )}
                        </div>
                    </div>
                );
            case "regiao":
                return (
                    <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <Chip size="sm" variant="flat" color="default">
                            {centro.regiao}
                        </Chip>
                    </div>
                );
            case "total":
                const isBelowAverage = cellValue < (reportData?.statistics?.mediaGeral || 0);
                return (
                    <div className="flex justify-center">
                        <Chip
                            size="sm"
                            variant="solid"
                            color={isBelowAverage ? "danger" : "secondary"}
                            classNames={{
                                base: isBelowAverage ? "bg-red-500 text-white" : "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white"
                            }}
                        >
                            {cellValue}
                        </Chip>
                    </div>
                );
            default:
                // Check if it's a dimension column
                if (reportData?.dimensions?.some(d => d.key === columnKey)) {
                    return (
                        <div className="flex justify-center">
                            <Chip
                                size="sm"
                                variant="flat"
                                color={
                                    cellValue >= 90 ? "success" :
                                        cellValue >= 80 ? "primary" :
                                            cellValue >= 70 ? "warning" : "danger"
                                }
                            >
                                {cellValue || 0}
                            </Chip>
                        </div>
                    );
                }
                return cellValue;
        }
    }, [reportData]);

    // Separate centers that need attention
    const centrosAtencao = useMemo(() =>
        reportData?.centers?.filter(c => c.alertaEspecial) || [],
        [reportData?.centers]);

    // Estados de loading e vazio
    if (!form) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No form selected. Please select a form first.</p>
                    <Button onPress={() => navigate('/forms')}>Go to Forms</Button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50 flex items-center justify-center">
                <div className="text-center">
                    <Spinner size="lg" className="mb-4" />
                    <p className="text-gray-600">Loading report data...</p>
                </div>
            </div>
        );
    }

    if (!reportData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50 flex items-center justify-center">
                <div className="text-center">
                    <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No data available for this form.</p>
                    <Button onPress={() => navigate(-1)}>Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50 py-4 sm:py-8">
                <div ref={reportRef} className="max-w-5xl mx-auto px-3 pt-10 sm:px-4 lg:px-6">

                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-2 sm:mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                            <div className="flex items-center justfy-start gap-2">
                                <Button isIconOnly variant="flat" onPress={() => navigate(-1, { replace: true })} className="font-semibold w-fit">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <h1 className="text-5xl md:text-6xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">Form Results</h1>
                            </div>

                            <Dropdown>
                                <DropdownTrigger>
                                    <Button color="primary" variant="flat" startContent={<Download className="h-4 w-4" />} endContent={<ChevronDown className="h-4 w-4" />} isLoading={isExporting} className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white">
                                        Export Report
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Export options">
                                    <DropdownItem key="csv" startContent={<FileSpreadsheet className="h-4 w-4" />} onPress={exportToCSV}>
                                        Export as CSV
                                    </DropdownItem>
                                    <DropdownItem key="json" startContent={<FileJson className="h-4 w-4" />} onPress={exportToJSON}>
                                        Export as JSON
                                    </DropdownItem>
                                    <DropdownItem key="pdf" startContent={<FileText className="h-4 w-4" />} onPress={generatePreview}>
                                        Export as PDF
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>

                        <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl p-6 sm:p-8 text-white shadow">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="h-6 w-6" />
                                <h1 className="text-2xl sm:text-3xl font-bold">{reportData.title}</h1>
                            </div>
                            <p className="text-cyan-50 text-sm sm:text-base mb-4">{reportData.description}</p>
                            <div className="flex items-center gap-2 text-sm text-cyan-100">
                                <Calendar className="h-4 w-4" />
                                <span>Report generated on: {formatDate(reportData.generatedAt)}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Statistics Cards */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
                        <Card className="border-0 shadow bg-white">
                            <CardBody className="p-4 text-center">
                                <div className="inline-flex gap-2 items-center p-3 bg-cyan-100 rounded-full mb-3">
                                    <Users className="h-6 w-6 text-cyan-600" />
                                    <div className="text-sm font-bold text-gray-600">Total Responses</div>
                                </div>
                                <div className="text-2xl font-bold text-cyan-600 mb-1">{reportData.statistics.totalRespostas}</div>

                            </CardBody>
                        </Card>

                        <Card className="border-0 shadow bg-white">
                            <CardBody className="p-4 text-center">
                                <div className="inline-flex p-3 gap-2 items-center bg-emerald-100 rounded-full mb-3">
                                    <Building2 className="h-6 w-6 text-emerald-600" />
                                    <div className="text-sm font-bold text-gray-600">Centers Evaluated</div>
                                </div>
                                <div className="text-2xl font-bold text-emerald-600 mb-1">{reportData.statistics.totalCentros}</div>

                            </CardBody>
                        </Card>

                        <Card className="border-0 shadow bg-white">
                            <CardBody className="p-4 text-center">
                                <div className="inline-flex p-3 gap-2 items-center bg-purple-100 rounded-full mb-3">
                                    <Star className="h-6 w-6 text-purple-600" />
                                    <div className="text-sm font-bold text-gray-600">Global Average</div>
                                </div>
                                <div className="text-2xl font-bold text-purple-600 mb-1">{reportData.statistics.mediaGeral}</div>

                            </CardBody>
                        </Card>

                        <Card className="border-0 shadow bg-white">
                            <CardBody className="p-4 text-center">
                                <div className="inline-flex p-3 gap-2 items-center bg-orange-100 rounded-full mb-3">
                                    <LayoutGrid className="h-6 w-6 text-orange-600" />
                                    <div className="text-sm font-bold text-gray-600">Dimensions Evaluated</div>
                                </div>
                                <div className="text-2xl font-bold text-orange-600 mb-1">{reportData.dimensions.length}</div>

                            </CardBody>
                        </Card>
                    </motion.div>

                    {/* Best Center Section */}
                    {reportData.bestCenter && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mb-2">
                            <Card className="border-0 shadow bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                <CardBody className="p-4">
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <Trophy className="h-6 w-6" />
                                        Featured Center of the Period
                                    </h2>

                                    <div className="flex flex-col md:flex-row gap-2 items-start">
                                        <div className="flex-shrink-0">
                                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                                <Award className="h-12 w-12 text-white" />
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold mb-2">{reportData.bestCenter.nome}</h3>
                                            <p className="text-lg mb-3 text-white/90 flex items-center gap-2">
                                                <Star className="h-5 w-5" />
                                                Score: {reportData.bestCenter.pontuacao} / 100
                                            </p>

                                            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                                                <p className="font-medium mb-2 flex items-center gap-2">
                                                    <Award className="h-4 w-4" />
                                                    Reason for achievement:
                                                </p>
                                                <p className="text-sm text-white/90 leading-relaxed">
                                                    {reportData.bestCenter.motivo}
                                                </p>
                                            </div>

                                            {/* Dynamic criteria grid */}
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1 mt-4">
                                                {Object.entries(reportData.bestCenter.criterios).map(([key, value]) => (
                                                    <div key={key} className="bg-white/10 rounded p-2 text-center rounded-lg shadow">
                                                        <div className="text-xs uppercase opacity-75">{key}</div>
                                                        <div className="font-bold">{value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </motion.div>
                    )}

                    {/* Dimensions Analysis Sections */}
                    <div className="space-y-6 mb-2">
                        {getDimensionRankings.map((dim, index) => (
                            <motion.div key={dim.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 + (index * 0.1) }}>
                                <Card className="border-0 shadow bg-white">
                                    <CardBody className="p-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className={`p-2 bg-${dim.color}-100 rounded-lg`}>
                                                <dim.icon className={`h-6 w-6 text-${dim.color}-600`} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{dim.label}</h3>
                                                <p className="text-sm text-gray-500">Category average: {dim.average} points</p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                            <p className="text-gray-700 leading-relaxed">
                                                Regarding <span className="font-semibold">{dim.label}</span>, the <span className="font-bold text-cyan-600">{dim.leader?.nome}</span> achieved a score of <span className="font-bold">{dim.leader?.[dim.key]}</span>, leading the ranking.
                                                {dim.second && <> Following in second place is the <span className="font-semibold">{dim.second.nome}</span> with <span className="font-semibold">{dim.second[dim.key]}</span> points</>}
                                                {dim.third && <>, and in third place, the <span className="font-semibold">{dim.third.nome}</span> with <span className="font-semibold">{dim.third[dim.key]}</span> points</>}.
                                            </p>
                                        </div>

                                        {/* Top 3 Podium */}
                                        <div className="grid grid-cols-3 gap-2">
                                            {[dim.leader, dim.second, dim.third].filter(Boolean).map((center, idx) => (
                                                <div key={center.id} className={`p-3 rounded-lg border-2 ${idx === 0 ? 'border-yellow-400 bg-yellow-50' : idx === 1 ? 'border-gray-300 bg-gray-50' : 'border-amber-600 bg-amber-50'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {idx === 0 && <Trophy className="h-4 w-4 text-yellow-600" />}
                                                        {idx === 1 && <Medal className="h-4 w-4 text-gray-500" />}
                                                        {idx === 2 && <Medal className="h-4 w-4 text-amber-700" />}
                                                        <span className="font-bold text-sm">#{idx + 1}</span>
                                                    </div>
                                                    <p className="text-xs font-medium text-gray-900 mb-1 truncate">{center.nome}</p>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-500">{dim.label}</span>
                                                        <span className={`font-bold ${idx === 0 ? 'text-yellow-700' : idx === 1 ? 'text-gray-700' : 'text-amber-800'}`}>{center[dim.key]}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Expandable full ranking */}
                                        <Accordion className="mt-4">
                                            <AccordionItem title={<span className="text-sm font-medium">View complete {dim.label.toLowerCase()} ranking</span>} className="text-sm">
                                                <div className="space-y-2 mt-2">
                                                    {dim.allCenters.map((center, idx) => (
                                                        <div key={center.id} className={`flex items-center justify-between p-2 rounded ${idx < 3 ? 'bg-gray-100' : 'bg-white border'}`}>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`font-bold w-6 ${idx === 0 ? 'text-yellow-600' : idx === 1 ? 'text-gray-500' : idx === 2 ? 'text-amber-700' : 'text-gray-400'}`}>#{idx + 1}</span>
                                                                <span className="text-sm font-medium">{center.nome}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {center.alertaEspecial && <TrendingDownIcon className="h-4 w-4 text-red-500" />}
                                                                <Chip size="sm" color={center[dim.key] >= 90 ? "success" : center[dim.key] >= 80 ? "primary" : "warning"} variant="flat">
                                                                    {center[dim.key] || 0}
                                                                </Chip>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionItem>
                                        </Accordion>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Ranking Table */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }} className="mb-2">
                        <Card className="border-0 shadow bg-white">
                            <CardBody className="p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-cyan-600" />
                                    Complete Ranking Table
                                </h3>

                                <Table aria-label="Ranking of evaluated centers" classNames={{ wrapper: "p-0 shadow" }}>
                                    <TableHeader columns={reportData.columns}>
                                        {(column) => (
                                            <TableColumn key={column.uid} align={column.align} className="text-xs font-semibold">
                                                {column.name}
                                            </TableColumn>
                                        )}
                                    </TableHeader>
                                    <TableBody items={reportData.centers}>
                                        {(item) => (
                                            <TableRow key={item.id}>
                                                {(columnKey) => (
                                                    <TableCell>{renderCell(item, columnKey)}</TableCell>
                                                )}
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>

                                <div className="flex justify-end mt-4">
                                    <p className="text-xs text-gray-500">Total of {reportData.centers.length} centers evaluated</p>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>

                    {/* Centers Requiring Special Attention */}
                    {centrosAtencao.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }} className="mb-2">
                            <Card className="border-0 shadow bg-white border-l-4 border-l-red-500">
                                <CardBody className="p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <AlertTriangle className="h-6 w-6 text-red-500" />
                                        <h3 className="text-lg font-semibold text-gray-900">Centers Requiring Special Attention</h3>
                                        <Chip color="danger" size="sm">{centrosAtencao.length}</Chip>
                                    </div>

                                    <Accordion variant="splitted">
                                        {centrosAtencao.map((centro) => (
                                            <AccordionItem key={centro.id} aria-label={`${centro.nome} details`}
                                                title={
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-red-600">#{centro.posicao}</span>
                                                        <span className="font-medium">{centro.nome}</span>
                                                        {centro.critico && <Chip size="sm" color="danger" variant="flat">CRITICAL</Chip>}
                                                        <Chip size="sm" color="danger" variant="flat">{centro.total} pts</Chip>
                                                    </div>
                                                }
                                                subtitle={
                                                    <span className="text-sm text-gray-500 flex items-center gap-2">
                                                        <MapPin className="h-3 w-3" />
                                                        {centro.regiao} • Below average by {(reportData.statistics.mediaGeral - centro.total).toFixed(1)} points
                                                    </span>
                                                }
                                                className="bg-red-50 shadow"
                                            >
                                                <div className="space-y-4 py-2">
                                                    <div className="bg-red-100 border border-red-200 rounded-lg p-4 flex gap-2">
                                                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="font-semibold text-red-800 mb-1">Attention Required</p>
                                                            <p className="text-sm text-red-700">{centro.atencao}</p>
                                                        </div>
                                                    </div>

                                                    {/* Dynamic metrics grid */}
                                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1">
                                                        {reportData.dimensions.map((dim) => (
                                                            <div key={dim.key} className="text-center p-2 bg-white rounded-lg shadow">
                                                                <div className="text-xs text-gray-500 mb-1">{dim.label.toUpperCase()}</div>
                                                                <div className={`font-bold ${(centro[dim.key] || 0) < 70 ? 'text-red-600' : (centro[dim.key] || 0) < 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                                    {centro[dim.key] || 0}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {centro.pontosFortes && centro.pontosFortes.length > 0 && (
                                                        <div className="flex items-start gap-2">
                                                            <ThumbsUp className="h-4 w-4 text-green-600 mt-0.5" />
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-700">Strong points: </span>
                                                                <span className="text-sm text-gray-600">{centro.pontosFortes.join(", ")}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {centro.pontosMelhoria && centro.pontosMelhoria.length > 0 && (
                                                        <div className="flex items-start gap-2">
                                                            <Target className="h-4 w-4 text-orange-600 mt-0.5" />
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-700">Priority improvements: </span>
                                                                <span className="text-sm text-gray-600">{centro.pontosMelhoria.join(", ")}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </CardBody>
                            </Card>
                        </motion.div>
                    )}

                </div>
            </div>

            {/* Modal de Pré-visualização do PDF */}
            <Modal 
                isOpen={isPreviewModalOpen} 
                onClose={closePreviewModal}
                size="5xl"
                scrollBehavior="inside"
                backdrop="blur"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-cyan-600" />
                                    <span>PDF Preview</span>
                                </div>
                                <p className="text-sm text-gray-500 font-normal">
                                    Review the report before downloading
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                {isGeneratingPreview ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Spinner size="lg" className="mb-4" />
                                        <p className="text-gray-600">Generating preview...</p>
                                    </div>
                                ) : previewImage ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-lg max-h-[600px] overflow-y-auto">
                                            <Image
                                                src={previewImage}
                                                alt="PDF Preview"
                                                className="w-full h-auto"
                                            />
                                        </div>
                                        <p className="text-sm text-gray-500 text-center">
                                            This is how your PDF will look. Click "Download PDF" to save it.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        Failed to generate preview
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button 
                                    variant="flat" 
                                    onPress={onClose}
                                    startContent={<X className="h-4 w-4" />}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={confirmExportPDF}
                                    isLoading={isExporting}
                                    startContent={<FileDown className="h-4 w-4" />}
                                    className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white"
                                >
                                    Download PDF
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};

export default FormResultPage;