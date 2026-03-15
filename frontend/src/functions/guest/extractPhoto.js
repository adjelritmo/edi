function getContentThumbnail(url, options = {}) {

    if (!url || typeof url !== 'string' || url.trim() === '') {

        return getDefaultThumbnail()

    }

    const config = { youtubeQuality: 'maxresdefault', vimeoQuality: 'thumbnail_large', pdfSize: 'w500', ...options }

    try {

        const cleanUrl = url.trim()

        if (isImage(cleanUrl)) {
            
            return cleanUrl

        }

        let urlObj

        try {
           
            const urlWithProtocol = cleanUrl.includes('://') ? cleanUrl : `https://${cleanUrl}`;
           
            urlObj = new URL(urlWithProtocol);
        
        } catch (e) {
            
            return getDefaultThumbnail()

        }

        const hostname = urlObj.hostname

        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {

            const thumbnail = getYouTubeThumbnail(cleanUrl, config.youtubeQuality)

            return thumbnail || getDefaultThumbnail();
        }

        else if (hostname.includes('vimeo.com')) {

            const thumbnail = getVimeoThumbnail(cleanUrl)

            return thumbnail || getDefaultThumbnail()

        }

        else if (cleanUrl.toLowerCase().includes('.pdf')) {
            
            return getPdfThumbnail(cleanUrl, config.pdfSize)
        
        }

        else if (isArticle(cleanUrl)) {
           
            return getArticleThumbnail(cleanUrl);
        
        }

        // Website genérico
        else {
            return getWebsiteThumbnail(cleanUrl);
        }

    } catch (error) {
        console.error('Erro ao obter thumbnail:', error);
        return getDefaultThumbnail();
    }
}

// Funções auxiliares atualizadas
function getYouTubeThumbnail(url, quality = 'maxresdefault') {
    try {
        const videoId = extractYouTubeId(url);
        if (!videoId) return null;

        const qualities = {
            'maxresdefault': 'maxresdefault.jpg',
            'sddefault': 'sddefault.jpg',
            'hqdefault': 'hqdefault.jpg',
            'mqdefault': 'mqdefault.jpg',
            'default': 'default.jpg'
        };

        const thumbnailName = qualities[quality] || qualities['maxresdefault'];
        return `https://img.youtube.com/vi/${videoId}/${thumbnailName}`;
    } catch (e) {
        return null;
    }
}

function getVimeoThumbnail(url) {
    try {
        const videoId = extractVimeoId(url);
        if (!videoId) return null;

        // Placeholder para Vimeo - na prática você precisaria da API
        return `https://i.vimeocdn.com/video/${videoId}_640.jpg`;
    } catch (e) {
        return null;
    }
}

function getPdfThumbnail(url, size = 'w500') {
    // Usando um serviço mais confiável para PDF
    return `https://via.placeholder.com/800x400/FF6B6B/FFFFFF?text=PDF`;
}

function getArticleThumbnail(url) {
    return `https://via.placeholder.com/800x400/4A90E2/FFFFFF?text=Artigo`;
}

function getWebsiteThumbnail(url) {
    try {
        // Usando um serviço mais confiável
        return `https://via.placeholder.com/800x400/2ECC71/FFFFFF?text=Website`;
    } catch (e) {
        return getDefaultThumbnail();
    }
}

function getDefaultThumbnail() {
    // Usando um serviço de placeholder mais confiável
    return `data:image/svg+xml;base64,${btoa(`
        <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#666666"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
                  font-family="Arial" font-size="24" fill="white">
                Thumbnail Não Disponível
            </text>
        </svg>
    `)}`;
}

// Funções de extração (mantidas iguais)
function extractYouTubeId(url) {
    try {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?#]+)/,
            /(?:youtube\.com\/embed\/)([^&?#]+)/,
            /(?:youtube\.com\/v\/)([^&?#]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) return match[1];
        }
        return null;
    } catch (e) {
        return null;
    }
}

function extractVimeoId(url) {
    try {
        const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
        return match ? match[1] : null;
    } catch (e) {
        return null;
    }
}

function isImage(url) {
    try {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
        return imageExtensions.some(ext => url.toLowerCase().includes(ext));
    } catch (e) {
        return false;
    }
}

function isArticle(url) {
    try {
        const articleDomains = ['medium.com', 'dev.to', 'blog.', 'news.', 'article'];
        return articleDomains.some(domain => url.includes(domain));
    } catch (e) {
        return false;
    }
}

export default getContentThumbnail