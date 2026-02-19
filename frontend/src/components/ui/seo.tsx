/**
 * SEO Component
 * Управление мета-тегами и OpenGraph для страниц
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product' | 'profile';
    keywords?: string[];
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    // Дополнительные поля для товаров/офферов
    price?: number;
    currency?: string;
    availability?: 'in_stock' | 'out_of_stock' | 'preorder';
    // Локализация
    locale?: string;
    // Twitter Card
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    twitterSite?: string;
    twitterCreator?: string;
}

const DEFAULT_SEO = {
    siteName: 'KindPlate',
    defaultTitle: 'KindPlate',
    defaultDescription: 'KindPlate помогает ресторанам и магазинам реализовывать непроданные блюда и готовые продукты со скидкой. Экономьте и помогайте планете.',
    defaultImage: '/logo192.png',
    baseUrl: import.meta.env.VITE_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://app-kindplate.ru'),
    locale: 'ru_RU',
    twitterSite: '@kindplate',
};

export function SEO({
    title,
    description = DEFAULT_SEO.defaultDescription,
    image = DEFAULT_SEO.defaultImage,
    url,
    type = 'website',
    keywords = [],
    author,
    publishedTime,
    modifiedTime,
    price,
    currency = 'RUB',
    availability,
    locale = DEFAULT_SEO.locale,
    twitterCard = 'summary_large_image',
    twitterSite = DEFAULT_SEO.twitterSite,
    twitterCreator,
}: SEOProps) {
    // Формируем полный title с именем сайта
    const fullTitle = title 
        ? `${title} | ${DEFAULT_SEO.siteName}` 
        : DEFAULT_SEO.defaultTitle;

    // Формируем полный URL
    const fullUrl = url 
        ? `${DEFAULT_SEO.baseUrl}${url}` 
        : DEFAULT_SEO.baseUrl;

    // Формируем полный URL изображения
    const fullImage = image.startsWith('http') 
        ? image 
        : `${DEFAULT_SEO.baseUrl}${image}`;

    // Формируем keywords строку
    const keywordsString = keywords.length > 0 
        ? keywords.join(', ') 
        : 'еда, скидки, экономия, спасение еды, короткий срок годности';

    return (
        <Helmet>
            {/* Базовые мета-теги */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywordsString} />
            {author && <meta name="author" content={author} />}

            {/* Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title ? `${title} | ${DEFAULT_SEO.siteName}` : DEFAULT_SEO.defaultTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:site_name" content={DEFAULT_SEO.siteName} />
            <meta property="og:locale" content={locale} />

            {/* Open Graph - Article */}
            {type === 'article' && publishedTime && (
                <meta property="article:published_time" content={publishedTime} />
            )}
            {type === 'article' && modifiedTime && (
                <meta property="article:modified_time" content={modifiedTime} />
            )}
            {type === 'article' && author && (
                <meta property="article:author" content={author} />
            )}

            {/* Open Graph - Product */}
            {type === 'product' && price && (
                <>
                    <meta property="product:price:amount" content={price.toString()} />
                    <meta property="product:price:currency" content={currency} />
                </>
            )}
            {type === 'product' && availability && (
                <meta property="product:availability" content={availability} />
            )}

            {/* Twitter Card */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:site" content={twitterSite} />
            {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}
            <meta name="twitter:title" content={title || DEFAULT_SEO.defaultTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImage} />

            {/* Canonical URL */}
            <link rel="canonical" href={fullUrl} />

            {/* Дополнительные теги */}
            <meta name="robots" content="index, follow" />
            <meta name="googlebot" content="index, follow" />
            <meta name="format-detection" content="telephone=no" />
        </Helmet>
    );
}

/**
 * SEO для главной страницы
 */
export function HomePageSEO() {
    return (
        <SEO
            url="/"
            keywords={[
                'готовая еда со скидкой',
                'спасти еду',
                'экономия на еде',
                'КиндПлейт',
                'Санкт-Петербург',
            ]}
        />
    );
}

/**
 * SEO для страницы продавца/бизнеса
 */
export function BusinessPageSEO({
    name,
    address,
    description,
    image,
    rating,
}: {
    name: string;
    address: string;
    description?: string;
    image?: string;
    rating?: number;
}) {
    const title = `${name} - KindPlate`;
    const desc = description || `${name} на KindPlate. ${address}. ${rating ? `Рейтинг: ${rating.toFixed(1)} ⭐` : ''}`;

    return (
        <SEO
            title={name}
            description={desc}
            image={image}
            url={`/vendors/${name}`}
            type="profile"
            keywords={[name, address, 'готовая еда', 'скидки', 'Санкт-Петербург']}
        />
    );
}

/**
 * SEO для страницы оффера
 */
export function OfferPageSEO({
    title: offerTitle,
    description,
    image,
    price,
    originalPrice,
    businessName,
    available,
}: {
    title: string;
    description?: string;
    image?: string;
    price: number;
    originalPrice: number;
    businessName: string;
    available: boolean;
}) {
    const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    const title = `${offerTitle} - скидка ${discount}%`;
    const desc = description || `${offerTitle} от ${businessName}. Цена ${price}₽ вместо ${originalPrice}₽ (-${discount}%). ${available ? 'В наличии' : 'Распродано'}`;

    return (
        <SEO
            title={title}
            description={desc}
            image={image}
            url={`/offers/${offerTitle}`}
            type="product"
            price={price}
            currency="RUB"
            availability={available ? 'in_stock' : 'out_of_stock'}
            keywords={[offerTitle, businessName, 'готовая еда', 'скидка', `${discount}%`]}
        />
    );
}

/**
 * SEO для легальных страниц
 */
export function LegalPageSEO({ title, description }: { title: string; description?: string }) {
    return (
        <SEO
            title={title}
            description={description}
            url={`/legal/${title.toLowerCase()}`}
            type="article"
        />
    );
}

/**
 * Structured Data (JSON-LD) для офферов
 */
export function OfferStructuredData({
    name,
    description,
    image,
    price,
    originalPrice,
    currency = 'RUB',
    available,
    businessName,
    businessAddress,
    rating,
    reviewCount,
}: {
    name: string;
    description?: string;
    image?: string;
    price: number;
    originalPrice: number;
    currency?: string;
    available: boolean;
    businessName: string;
    businessAddress: string;
    rating?: number;
    reviewCount?: number;
}) {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description: description || name,
        image: image || DEFAULT_SEO.defaultImage,
        offers: {
            '@type': 'Offer',
            price: price.toString(),
            priceCurrency: currency,
            availability: available
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'LocalBusiness',
                name: businessName,
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: businessAddress,
                    addressLocality: 'Санкт-Петербург',
                    addressCountry: 'RU',
                },
            },
        },
    };

    // Добавляем рейтинг если есть
    if (rating && reviewCount) {
        (structuredData as any).aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: rating.toString(),
            reviewCount: reviewCount.toString(),
        };
    }

    return (
        <Helmet>
            <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        </Helmet>
    );
}

/**
 * Structured Data (JSON-LD) для бизнеса
 */
export function BusinessStructuredData({
    name,
    address,
    phone,
    email,
    image,
    rating,
    reviewCount,
    priceRange = '₽₽',
}: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    image?: string;
    rating?: number;
    reviewCount?: number;
    priceRange?: string;
}) {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name,
        image: image || DEFAULT_SEO.defaultImage,
        address: {
            '@type': 'PostalAddress',
            streetAddress: address,
            addressLocality: 'Санкт-Петербург',
            addressCountry: 'RU',
        },
        priceRange,
    };

    // Добавляем контакты если есть
    if (phone) {
        (structuredData as any).telephone = phone;
    }
    if (email) {
        (structuredData as any).email = email;
    }

    // Добавляем рейтинг если есть
    if (rating && reviewCount) {
        (structuredData as any).aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: rating.toString(),
            reviewCount: reviewCount.toString(),
        };
    }

    return (
        <Helmet>
            <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        </Helmet>
    );
}

